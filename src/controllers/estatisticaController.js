const pool = require("../config/db");

const getEstatisticasByUsuario = async (req, res) => {
    const { uuid_usuario } = req.params;

    try {
        const result = await pool.query(
            "SELECT * FROM Estatistica WHERE uuid_usuario = $1",
            [uuid_usuario]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Nenhuma estatística encontrada para este usuário.",
            });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao recuperar estatísticas." });
    }
};

module.exports = {
    getEstatisticasByUsuario,
};
