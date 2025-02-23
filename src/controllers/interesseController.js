const pool = require("../config/db");

const criarInteresse = async (req, res) => {
    const { nome } = req.body;

    try {
        const result = await pool.query(
            "INSERT INTO Interesse (nome) VALUES ($1) RETURNING *",
            [nome]
        );
        res.status(201).json(result.rows[0]);
    } 
    catch (error) {
        res.status(500).json({ error: "Erro ao criar interesse." });
    }
};

const listarInteresses = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM Interesse");
        res.status(200).json(result.rows);
    } 
    catch (error) {
        res.status(500).json({ error: "Erro ao obter interesses." });
    }
};

module.exports = {
    criarInteresse,
    listarInteresses,
};
