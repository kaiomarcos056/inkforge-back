const pool = require("../config/db");

// Criar um novo plano
const createPlano = async (req, res) => {
    const { nome, preco } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO Plano (nome, preco) VALUES ($1, $2) RETURNING *",
            [nome, preco]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao criar plano." });
    }
};

// Obter todos os planos
const getAllPlanos = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM Plano");
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao buscar planos." });
    }
};

module.exports = {
    createPlano,
    getAllPlanos,
};
