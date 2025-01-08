const pool = require('../db/db');

// Criar um novo capítulo
const createCapitulo = async (req, res) => {
  const { uuid_livro, titulo, conteudo } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO Capitulo (uuid_livro, titulo, conteudo) VALUES ($1, $2, $3) RETURNING *',
      [uuid_livro, titulo, conteudo]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar capítulo.' });
  }
};

// Obter capítulo por ID
const getCapituloByUuid = async (req, res) => {
  const { capituloUuid } = req.params;

  try {
    const result = await pool.query('SELECT * FROM Capitulo WHERE uuid_capitulo = $1', [capituloUuid]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Capítulo não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao obter capítulo' });
  }
};

// Atualizar capítulo
const updateCapitulo = async (req, res) => {
  const { capituloUuid } = req.params;
  const { titulo, conteudo } = req.body;

  try {
    const result = await pool.query(
      'UPDATE Capitulo SET titulo = $1, conteudo = $2 WHERE uuid_capitulo = $3 RETURNING *',
      [titulo, conteudo, capituloUuid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Capítulo não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar capítulo' });
  }
};

// Excluir capítulo
const deleteCapitulo = async (req, res) => {
  const { capituloUuid } = req.params;

  try {
    const result = await pool.query('DELETE FROM Capitulo WHERE uuid_capitulo = $1 RETURNING *', [capituloUuid]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Capítulo não encontrado' });
    }

    res.json({ message: 'Capítulo excluído com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir capítulo' });
  }
};

module.exports = {
  createCapitulo,
  getCapituloByUuid,
  updateCapitulo,
  deleteCapitulo
};
