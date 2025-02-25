const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { segredo, tempoExpiracao } = require("../config/autenticacaoConfig");

const registrar = async (req, res) => {
    const { nome, email, senha, tipo, plano, nivel, descricao, foto, interesses} = req.body;
    const client = await pool.connect();
    try {
        const { rows: usuarioExistente } = await pool.query(
            "SELECT * FROM Usuario WHERE email = $1",
            [email]
        );

        if (usuarioExistente.length > 0) {
            return res.status(400).json({ erro: "E-mail já cadastrado." });
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const planoSelecionado = plano || "Free";
        const { rows: planoRows } = await pool.query(
            "SELECT uuid_plano FROM Plano WHERE nome = $1",
            [planoSelecionado]
        );

        if (planoRows.length === 0) {
            return res.status(400).json({ erro: "Plano inválido." });
        }

        const uuid_plano = planoRows[0].uuid_plano;

        await client.query("BEGIN");

        const user = await client.query(
            `INSERT INTO Usuario (nome, email, foto, descricao, senha, tipo, plano, nivel, uuid_plano) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [
                nome,
                email,
                foto,
                descricao,
                senhaCriptografada,
                tipo,
                planoSelecionado,
                nivel,
                uuid_plano,
            ]
        );

        const result = user.rows[0];

        if (Array.isArray(interesses) && interesses.length > 0) {
            const insertInteresseQuery = `
                INSERT INTO Usuario_Interesse (uuid_usuario, uuid_interesse) 
                VALUES ($1, $2)
            `;

            for (const uuid_interesse of interesses) {
                await client.query(insertInteresseQuery, [
                    result.uuid_usuario,
                    uuid_interesse,
                ]);
            }
        }

        await client.query("COMMIT");

        res.status(201).json(result);
    } catch (error) {
        console.error("Erro ao registrar usuário:", error);
        res.status(500).json({ erro: "Erro ao registrar usuário." });
    }
};

const converterExpiracaoParaMs = (expiracao) => {
    if (typeof expiracao === "string" && expiracao.endsWith("d")) {
        return parseInt(expiracao) * 24 * 60 * 60 * 1000;
    } else if (typeof expiracao === "string" && expiracao.endsWith("h")) {
        return parseInt(expiracao) * 60 * 60 * 1000;
    } else if (typeof expiracao === "string" && expiracao.endsWith("m")) {
        return parseInt(expiracao) * 60 * 1000;
    } else if (typeof expiracao === "string" && expiracao.endsWith("s")) {
        return parseInt(expiracao) * 1000;
    }
    return parseInt(expiracao) || 0;
};

const login = async (req, res) => {
    const { email, senha } = req.body;

    try {
        let { rows } = await pool.query(
            "SELECT * FROM Usuario WHERE email = $1",
            [email]
        );

        if (rows.length === 0) {
            return res
                .status(401)
                .json({ erro: "Usuário ou senha incorretos." });
        }

        const usuario = rows[0];

        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

        if (!senhaCorreta) {
            return res
                .status(401)
                .json({ erro: "Usuário ou senha incorretos." });
        }
        
        const result = await pool.query(
            "SELECT u.uuid_interesse, i.nome FROM usuario_interesse u INNER JOIN interesse i ON i.uuid_interesse = u.uuid_interesse WHERE u.uuid_usuario = $1",
            [usuario.uuid_usuario]
        );

        const tempoExpiracaoMs = converterExpiracaoParaMs(tempoExpiracao);

        const token = jwt.sign(
            {
                uuid_usuario: usuario.uuid_usuario,
                nome: usuario.nome,
                email: usuario.email,
                tipo: usuario.tipo,
            },
            segredo,
            { expiresIn: '24h' }
        );

        const decoded = jwt.decode(token);

        res.json({
            token,
            exp: decoded.exp,
            usuario: {
                uuid_usuario: usuario.uuid_usuario,
                nome: usuario.nome,
                email: usuario.email,
                tipo: usuario.tipo,
                foto: usuario.foto,
                descricao: usuario.descricao,
                interesses: result.rows
            },
        });
    } catch (error) {
        res.status(500).json({ erro: "Erro ao fazer login."+error.message });
    }
};

const redefinirSenha = async (req, res) => {
    const { email, nova_senha } = req.body;

    try {
        const { rows } = await pool.query(
            "SELECT uuid_usuario FROM Usuario WHERE email = $1",
            [email]
        );

        if (rows.length === 0) {
            return res.status(404).json({ erro: "Usuário não encontrado." });
        }

        const uuid_usuario = rows[0].uuid_usuario;
        const senhaCriptografada = await bcrypt.hash(nova_senha, 10);

        await pool.query(
            "UPDATE Usuario SET senha = $1 WHERE uuid_usuario = $2",
            [senhaCriptografada, uuid_usuario]
        );

        res.status(200).json({ mensagem: "Senha redefinida com sucesso." });
    } 
    catch (error) {
        console.error("Erro ao redefinir senha:", error.message);
        res.status(500).json({ erro: "Erro ao redefinir senha." });
    }
};

module.exports = { registrar, login, redefinirSenha };
