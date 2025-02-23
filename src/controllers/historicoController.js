const pool = require("../config/db");

const criarHistorico = async (req, res) => {
    const { uuid_capitulo, uuid_usuario } = req.body;

    try {
        const result = await pool.query(
            "INSERT INTO historico (uuid_capitulo, uuid_usuario) VALUES ($1, $2) RETURNING *",
            [uuid_capitulo, uuid_usuario]
        );
        res.status(201).json(result.rows[0]);
    } 
    catch (error) {
        res.status(500).json({ error: "Erro ao criar histórico." });
    }
};


const listarHistorico = async (req, res) => {
    const { uuid_usuario } = req.params;

    try {
        const { rows } = await pool.query(
            `
            SELECT DISTINCT ON (l.uuid_livro) 
                l.uuid_livro,
                l.nome,
                c.uuid_capitulo,
                c.titulo,
                TO_CHAR(h.data_criacao, 'DD/MM/YYYY HH24:MI') AS data_criacao
            FROM historico h
            INNER JOIN capitulo c ON c.uuid_capitulo = h.uuid_capitulo
            INNER JOIN livro l ON l.uuid_livro = c.uuid_livro
            WHERE h.uuid_usuario = $1
            ORDER BY l.uuid_livro, h.data_criacao DESC
            `,
            [uuid_usuario]
        );

        res.json(rows);
    } 
    catch (error) {
        res.status(500).json({ erro: "Erro ao listar leituras." });
    }
};

const ultimasLeituras = async (req, res) => {
    const { uuid_usuario } = req.params;

    try {
        const { rows } = await pool.query(
            `
            SELECT DISTINCT ON (l.uuid_livro) 
                l.uuid_livro,
                l.nome,
                c.uuid_capitulo,
                c.titulo,
                h.data_criacao
            FROM historico h
            INNER JOIN capitulo c ON c.uuid_capitulo = h.uuid_capitulo
            INNER JOIN livro l ON l.uuid_livro = c.uuid_livro
            WHERE h.uuid_usuario = $1
            ORDER BY l.uuid_livro, h.data_criacao DESC
            LIMIT 4
            `,
            [uuid_usuario]
        );

        res.json(rows);
    } 
    catch (error) {
        res.status(500).json({ erro: "Erro ao listar leituras." });
    }
};

module.exports = {
    criarHistorico,
    listarHistorico,
    ultimasLeituras
};