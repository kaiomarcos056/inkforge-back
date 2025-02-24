const pool = require("../config/db");

// Criar um novo gênero
const criarItemVotacao = async (req, res) => {
    const { uuid_usuario, uuid_votacao, descricao } = req.body;

    try {
        const result = await pool.query(
            "INSERT INTO item_votacao (uuid_usuario, uuid_votacao, descricao) VALUES ($1, $2, $3) RETURNING *",
            [uuid_usuario, uuid_votacao, descricao]
        );
        res.status(201).json(result.rows[0]);
    } 
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao criar item." });
    }
};

// Listar todos os gêneros
const listarItemPorVotacao = async (req, res) => {
    const { uuid_votacao } = req.params;
    try {
        console.log(uuid_votacao)
        const { rows } = await pool.query(
            `
            select * from item_votacao where uuid_votacao = $1
            `,
            [uuid_votacao]
        );
        
        res.status(200).json(rows);
    } 
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao obter item."+error.message });
    }
};

module.exports = {
    criarItemVotacao,
    listarItemPorVotacao,
};
