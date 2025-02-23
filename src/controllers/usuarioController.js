const pool = require("../config/db");

const createUsuario = async (req, res) => {
    const { nome, email, senha, foto, descricao, tipo, plano, nivel } = req.body;
    let planoSelecionado = plano || "Free";

    try {
        
        const planoResult = await pool.query(
            "SELECT uuid_plano FROM Plano WHERE nome = $1",
            [planoSelecionado]
        );
        const usuarioUnico = await pool.query(
            "SELECT email FROM Usuario WHERE email = $1",
            [email]
        );

        if (usuarioUnico.rows.length > 0) {
            return res.status(422).json({
                error: "Já existe um usuário cadastrado com esse e-mail.",
            });
        }

        if (planoResult.rows.length === 0) {
            return res.status(400).json({ error: "Plano inexistente." });
        }

        const uuid_plano = planoResult.rows[0].uuid_plano;

        const result = await pool.query(
            "INSERT INTO Usuario (nome, email, senha, tipo, plano, nivel, uuid_plano) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
            [nome, email, senha, tipo, planoSelecionado, nivel, uuid_plano]
        );
        

        res.status(201).json(result.rows[0]);
    } 
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao criar usuário" });
    }
};

const getUsuarios = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM Usuario");
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao buscar usuários." });
    }
};

const getUsuarioByUuid = async (req, res) => {
    const { uuid } = req.params;

    try {
        const result = await pool.query(
            "SELECT * FROM Usuario WHERE uuid_usuario = $1",
            [uuid]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao obter usuário" });
    }
};

const getLivrosByUsuario = async (req, res) => {
    const { usuarioUuid } = req.params;

    try {
        const result = await pool.query(
            `
      SELECT 
        l.uuid_livro, 
        l.nome, 
        l.capa, 
        l.uuid_usuario,
        COALESCE(JSON_AGG(
          JSON_BUILD_OBJECT('uuid_genero', g.uuid_genero, 'nome', g.nome)
        ) FILTER (WHERE g.uuid_genero IS NOT NULL), '[]') AS generos
      FROM Livro l
      LEFT JOIN Livro_Genero lg ON l.uuid_livro = lg.uuid_livro
      LEFT JOIN Genero g ON lg.uuid_genero = g.uuid_genero
      WHERE l.uuid_usuario = $1
      GROUP BY l.uuid_livro
    `,
            [usuarioUuid]
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao listar livros" });
    }
};

const updateUsuario = async (req, res) => {
    const { uuid } = req.params;
    const { nome, email, senha, tipo, plano, nivel } = req.body;

    try {
        const resultPlano = await pool.query(
            "SELECT uuid_plano FROM Plano WHERE nome = $1",
            [plano]
        );

        if (resultPlano.rows.length === 0) {
            return res.status(404).json({ error: "Plano não encontrado" });
        }

        const uuid_plano = resultPlano.rows[0].uuid_plano;

        const result = await pool.query(
            "UPDATE Usuario SET nome = $1, email = $2, senha = $3, tipo = $4, plano = $5, nivel = $6, uuid_plano = $7 WHERE uuid_usuario = $8 RETURNING *",
            [nome, email, senha, tipo, plano, nivel, uuid_plano, uuid]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao atualizar usuário" });
    }
};

const deleteUsuario = async (req, res) => {
    const { uuid } = req.params;

    try {
        const result = await pool.query(
            "DELETE FROM Usuario WHERE uuid_usuario = $1 RETURNING *",
            [uuid]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }

        res.json({ message: "Usuário excluído com sucesso" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao excluir usuário" });
    }
};

module.exports = {
    createUsuario,
    getUsuarios,
    getUsuarioByUuid,
    getLivrosByUsuario,
    updateUsuario,
    deleteUsuario,
};
