const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { segredo, tempoExpiracao } = require("../config/autenticacaoConfig");

const registrar = async (req, res) => {
    const { nome, email, senha, tipo, plano, nivel } = req.body;

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

        await pool.query(
            `INSERT INTO Usuario (nome, email, senha, tipo, plano, nivel, uuid_plano) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                nome,
                email,
                senhaCriptografada,
                tipo,
                planoSelecionado,
                nivel,
                uuid_plano,
            ]
        );

        res.status(201).json({ mensagem: "Usuário registrado com sucesso." });
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
        const { rows } = await pool.query(
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

        const tempoExpiracaoMs = converterExpiracaoParaMs(tempoExpiracao);

        const token = jwt.sign(
            {
                uuid_usuario: usuario.uuid_usuario,
                nome: usuario.nome,
                email: usuario.email,
                tipo: usuario.tipo,
            },
            segredo,
            { expiresIn: tempoExpiracao }
        );

        res.json({
            token,
            expiresIn: tempoExpiracaoMs,
            usuario: {
                uuid_usuario: usuario.uuid_usuario,
                nome: usuario.nome,
                email: usuario.email,
                tipo: usuario.tipo,
            },
        });
    } catch (error) {
        res.status(500).json({ erro: "Erro ao fazer login." });
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
    } catch (error) {
        console.error("Erro ao redefinir senha:", error.message);
        res.status(500).json({ erro: "Erro ao redefinir senha." });
    }
};

module.exports = { registrar, login, redefinirSenha };
