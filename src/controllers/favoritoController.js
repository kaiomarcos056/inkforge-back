const pool = require("../config/db");

// Adicionar um favorito
const addFavorito = async (req, res) => {
    const { uuid_usuario, uuid_livro } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO Favorito (uuid_usuario, uuid_livro) VALUES ($1, $2) RETURNING *",
            [uuid_usuario, uuid_livro]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao adicionar favorito." });
    }
};

// Obter favoritos de um usuário
const getFavoritosByUsuario = async (req, res) => {
    const { uuid_usuario } = req.params;
    try {
        const result = await pool.query(
            "SELECT * FROM FAVORITO F INNER JOIN LIVRO L ON L.UUID_LIVRO = F.UUID_LIVRO WHERE F.UUID_USUARIO =  $1",
            [uuid_usuario]
        );
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao buscar favoritos." });
    }
};

// Remover um favorito
const removeFavorito = async (req, res) => {
    const { uuid_favorito } = req.params;
    try {
        await pool.query("DELETE FROM Favorito WHERE uuid_favorito = $1", [
            uuid_favorito,
        ]);
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao remover favorito." });
    }
};

module.exports = {
    addFavorito,
    getFavoritosByUsuario,
    removeFavorito,
};
