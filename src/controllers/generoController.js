const pool = require("../config/db");

// Criar um novo gênero
const createGenero = async (req, res) => {
    const { nome } = req.body;

    try {
        const result = await pool.query(
            "INSERT INTO Genero (nome) VALUES ($1) RETURNING *",
            [nome]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao criar gênero." });
    }
};

// Listar todos os gêneros
const getGeneros = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM Genero");
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao obter gêneros."+error.message });
    }
};

module.exports = {
    createGenero,
    getGeneros,
};
