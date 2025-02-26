const pool = require("../config/db");

const addComentario = async (req, res) => {
    const { uuid_livro, uuid_usuario, comentario } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO Comentario (uuid_livro, uuid_usuario, comentario) VALUES ($1, $2, $3) RETURNING *",
            [uuid_livro, uuid_usuario, comentario]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao adicionar comentário." });
    }
};

const getComentariosByCapitulo = async (req, res) => {
    const { uuid_usuario, uuid_livro } = req.query;

    try {
        const result = await pool.query(
            // "SELECT * FROM Comentario WHERE uuid_livro = $1 AND uuid_usuario = $2 ORDER BY DATA_CRIACAO DESC",
            // "SELECT * FROM Comentario WHERE uuid_livro = $1 ORDER BY DATA_CRIACAO DESC",
            `
            SELECT 
                C.*,
                U.NOME AS USUARIO,
                U.FOTO
            FROM COMENTARIO C
            INNER JOIN USUARIO U ON U.UUID_USUARIO = C.UUID_USUARIO
            WHERE C.UUID_LIVRO = $1
            ORDER BY C.DATA_CRIACAO DESC
            `
            // [uuid_livro, uuid_usuario]
            [uuid_livro]
        );
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao buscar comentários." });
    }
};

module.exports = {
    addComentario,
    getComentariosByCapitulo,
};
