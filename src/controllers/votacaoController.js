const pool = require('../db/db');

// Criar uma votação
const createVotacao = async (req, res) => {
  const { uuid_capitulo, titulo, status, criador, data_inicio, data_fim } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO Votacao (uuid_capitulo, titulo, status, criador, data_inicio, data_fim) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [uuid_capitulo, titulo, status, criador, data_inicio, data_fim]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar votação.' });
  }
};

// Obter votações de um capítulo
const getVotacoesByCapitulo = async (req, res) => {
  const { uuid_capitulo } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM Votacao WHERE uuid_capitulo = $1',
      [uuid_capitulo]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar votações.' });
  }
};

module.exports = {
  createVotacao,
  getVotacoesByCapitulo,
};
