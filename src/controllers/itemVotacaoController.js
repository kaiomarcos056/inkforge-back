const pool = require('../db/db');

// Criar um item de votação
const createItemVotacao = async (req, res) => {
  const { uuid_votacao, descricao, qtd_votos, indicacao } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO Item_Votacao (uuid_votacao, descricao, qtd_votos, indicacao) VALUES ($1, $2, $3, $4) RETURNING *',
      [uuid_votacao, descricao, qtd_votos, indicacao]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar item de votação.' });
  }
};

// Obter itens de uma votação
const getItemsByVotacao = async (req, res) => {
  const { uuid_votacao } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM Item_Votacao WHERE uuid_votacao = $1',
      [uuid_votacao]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar itens de votação.' });
  }
};

module.exports = {
  createItemVotacao,
  getItemsByVotacao,
};
