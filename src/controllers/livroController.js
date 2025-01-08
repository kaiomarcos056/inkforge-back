const pool = require('../db/db');

// Criar um novo livro
const createLivro = async (req, res) => {
  const { nome, capa, uuid_usuario, generos } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const livroResult = await client.query(
      'INSERT INTO Livro (nome, capa, uuid_usuario) VALUES ($1, $2, $3) RETURNING *',
      [nome, capa, uuid_usuario]
    );

    const livro = livroResult.rows[0];

    if (Array.isArray(generos) && generos.length > 0) {
      const livroGeneroQuery = `
        INSERT INTO Livro_Genero (uuid_livro, uuid_genero)
        VALUES ($1, $2)
      `;
      for (const uuid_genero of generos) {
        await client.query(livroGeneroQuery, [livro.uuid_livro, uuid_genero]);
      }
    }

    const generosResult = await client.query(
      `SELECT g.uuid_genero, g.nome
       FROM Genero g
       JOIN Livro_Genero lg ON g.uuid_genero = lg.uuid_genero
       WHERE lg.uuid_livro = $1`,
      [livro.uuid_livro]
    );

    await client.query('COMMIT');

    livro.generos = generosResult.rows;

    res.status(201).json(livro);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar livro.' });
  } finally {
    client.release();
  }
};

// Listar livros
const getLivros = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        l.uuid_livro, 
        l.nome, 
        l.capa, 
        l.uuid_usuario,
        COALESCE(JSON_AGG(
          JSON_BUILD_OBJECT('uuid_genero', g.uuid_genero, 'nome', g.nome)
        ) FILTER (WHERE g.uuid_genero IS NOT NULL), '[]') AS generos
      FROM Livro l
      LEFT JOIN Livro_Genero lg ON l.uuid_livro = lg.uuid_livro
      LEFT JOIN Genero g ON lg.uuid_genero = g.uuid_genero
      GROUP BY l.uuid_livro
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter livros.' });
  }
};

// Obter livro por ID
const getLivroByUuid = async (req, res) => {
  const { livroUuid } = req.params;

  try {
    const result = await pool.query(`
      SELECT 
        l.uuid_livro, 
        l.nome, 
        l.capa, 
        l.uuid_usuario,
        COALESCE(JSON_AGG(
          JSON_BUILD_OBJECT('uuid_genero', g.uuid_genero, 'nome', g.nome)
        ) FILTER (WHERE g.uuid_genero IS NOT NULL), '[]') AS generos
      FROM Livro l
      LEFT JOIN Livro_Genero lg ON l.uuid_livro = lg.uuid_livro
      LEFT JOIN Genero g ON lg.uuid_genero = g.uuid_genero
      WHERE l.uuid_livro = $1
      GROUP BY l.uuid_livro
    `, [livroUuid]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Livro não encontrado.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter livro.' });
  }
};

// Listar capítulos de um livro
const getCapitulosByLivro = async (req, res) => {
  const { livroUuid } = req.params;

  try {
    const result = await pool.query('SELECT * FROM Capitulo WHERE uuid_livro = $1', [livroUuid]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar capítulos' });
  }
};

// Atualizar livro
const updateLivro = async (req, res) => {
  const { livroUuid } = req.params;
  const { nome, capa, generos } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const livroResult = await client.query(
      'UPDATE Livro SET nome = $1, capa = $2 WHERE uuid_livro = $3 RETURNING *',
      [nome, capa, livroUuid]
    );

    if (livroResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Livro não encontrado.' });
    }

    // Atualizar gêneros associados
    await client.query('DELETE FROM Livro_Genero WHERE uuid_livro = $1', [livroUuid]);

    if (Array.isArray(generos) && generos.length > 0) {
      const livroGeneroQuery = `
        INSERT INTO Livro_Genero (uuid_livro, uuid_genero)
        VALUES ($1, $2)
      `;
      for (const uuid_genero of generos) {
        await client.query(livroGeneroQuery, [livroUuid, uuid_genero]);
      }
    }

    const generosResult = await client.query(
      `SELECT g.uuid_genero, g.nome
       FROM Genero g
       JOIN Livro_Genero lg ON g.uuid_genero = lg.uuid_genero
       WHERE lg.uuid_livro = $1`,
      [livroUuid]
    );

    await client.query('COMMIT');

    const livro = livroResult.rows[0];
    livro.generos = generosResult.rows;

    res.json(livro);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar livro.' });
  } finally {
    client.release();
  }
};

// Excluir livro
const deleteLivro = async (req, res) => {
  const { livroUuid } = req.params;

  try {
    const result = await pool.query('DELETE FROM Livro WHERE uuid_livro = $1 RETURNING *', [livroUuid]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Livro não encontrado.' });
    }

    res.json({ message: 'Livro excluído com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao excluir livro.' });
  }
};

module.exports = {
  createLivro,
  getLivros,
  getLivroByUuid,
  getCapitulosByLivro,
  updateLivro,
  deleteLivro
};
