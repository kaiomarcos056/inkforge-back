const pool = require('../db/db');

// Adicionar um comentário
const addComentario = async (req, res) => {
  const { uuid_capitulo, uuid_usuario, comentario } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO Comentario (uuid_capitulo, uuid_usuario, comentario) VALUES ($1, $2, $3) RETURNING *',
      [uuid_capitulo, uuid_usuario, comentario]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao adicionar comentário.' });
  }
};

// Obter comentários de um capítulo
const getComentariosByCapitulo = async (req, res) => {
  const { uuid_capitulo } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM Comentario WHERE uuid_capitulo = $1',
      [uuid_capitulo]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar comentários.' });
  }
};

module.exports = {
  addComentario,
  getComentariosByCapitulo,
};
