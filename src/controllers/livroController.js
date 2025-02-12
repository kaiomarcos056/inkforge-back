const pool = require("../config/db");

const criarLivro = async (req, res) => {
    const { nome, capa, generos } = req.body;
    const uuid_usuario = req.usuario.uuid_usuario;

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // Inserir livro
        const livroResult = await client.query(
            `INSERT INTO Livro (nome, capa, uuid_usuario) 
             VALUES ($1, $2, $3) 
             RETURNING *`,
            [nome, capa, uuid_usuario]
        );

        const livro = livroResult.rows[0];

        if (Array.isArray(generos) && generos.length > 0) {
            const insertGeneroQuery = `
                INSERT INTO Livro_Genero (uuid_livro, uuid_genero) 
                VALUES ($1, $2)
            `;

            for (const uuid_genero of generos) {
                await client.query(insertGeneroQuery, [
                    livro.uuid_livro,
                    uuid_genero,
                ]);
            }
        }

        await client.query("COMMIT");
        res.status(201).json(livro);
    } catch (err) {
        await client.query("ROLLBACK");
        console.error(err);
        res.status(500).json({ erro: "Erro ao criar livro." });
    } finally {
        client.release();
    }
};

const listarLivros = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                l.uuid_livro, 
                l.nome, 
                l.capa, 
                l.data_criacao, 
                u.nome AS autor, 
                COALESCE(JSON_AGG(
                    JSON_BUILD_OBJECT('uuid_genero', g.uuid_genero, 'nome', g.nome)
                ) FILTER (WHERE g.uuid_genero IS NOT NULL), '[]') AS generos
            FROM Livro l
            LEFT JOIN Usuario u ON l.uuid_usuario = u.uuid_usuario
            LEFT JOIN Livro_Genero lg ON l.uuid_livro = lg.uuid_livro
            LEFT JOIN Genero g ON lg.uuid_genero = g.uuid_genero
            GROUP BY l.uuid_livro, u.nome, l.data_criacao
            ORDER BY l.data_criacao DESC
        `);

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao obter livros." });
    }
};

const buscarLivros = async (req, res) => {
    const { search } = req.query;
    const { sort } = req.query;
    const filtro = req.headers["filtro"];
    const ordenarPor = req.headers["ordenar-por"];

    try {
        let query = `
            SELECT 
                l.uuid_livro, 
                l.nome, 
                l.capa, 
                l.data_criacao, 
                u.nome AS autor
            FROM Livro l
            LEFT JOIN Usuario u ON l.uuid_usuario = u.uuid_usuario
            LEFT JOIN Livro_Genero lg ON l.uuid_livro = lg.uuid_livro
            LEFT JOIN Genero g ON lg.uuid_genero = g.uuid_genero
        `;

        const valores = [];
        let condicao = "";

        if (search) {
            valores.push(`%${search}%`);
            if (filtro === "nome") {
                condicao = " WHERE l.nome ILIKE $1";
            } else if (filtro === "autor") {
                condicao = " WHERE u.nome ILIKE $1";
            } else if (filtro === "genero") {
                condicao = " WHERE g.nome ILIKE $1";
            } else {
                return res.status(400).json({
                    erro: 'Filtro inválido. Use "nome", "autor" ou "genero".',
                });
            }
        }

        query += condicao;
        query += " GROUP BY l.uuid_livro, u.nome";

        if (ordenarPor === "alfabetica") {
            query += ` ORDER BY l.nome ${sort === "desc" ? "DESC" : "ASC"}`;
        } else if (ordenarPor === "data_criacao") {
            query += ` ORDER BY l.data_criacao ${
                sort === "desc" ? "DESC" : "ASC"
            }`;
        } else {
            return res
                .status(400)
                .json({ erro: "Critério de ordenação inválido." });
        }

        const livrosResult = await pool.query(query, valores);

        if (livrosResult.rows.length === 0) {
            return res.status(404).json({ erro: "Nenhum livro encontrado." });
        }

        // Buscar todos os gêneros associados aos livros encontrados
        const livrosIds = livrosResult.rows.map((livro) => livro.uuid_livro);
        const generosQuery = `
            SELECT lg.uuid_livro, g.uuid_genero, g.nome
            FROM Livro_Genero lg
            JOIN Genero g ON lg.uuid_genero = g.uuid_genero
            WHERE lg.uuid_livro = ANY($1)
        `;
        const generosResult = await pool.query(generosQuery, [livrosIds]);

        // Mapear gêneros para cada livro
        const livrosComGeneros = livrosResult.rows.map((livro) => ({
            ...livro,
            generos: generosResult.rows
                .filter((genero) => genero.uuid_livro === livro.uuid_livro)
                .map(({ uuid_genero, nome }) => ({ uuid_genero, nome })),
        }));

        res.json(livrosComGeneros);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao buscar livros." });
    }
};

const obterLivroPorUUID = async (req, res) => {
    const { uuid_livro } = req.params;

    try {
        const result = await pool.query(
            `SELECT 
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
            GROUP BY l.uuid_livro`,
            [uuid_livro]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ erro: "Livro não encontrado." });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao obter livro." });
    }
};

const atualizarLivro = async (req, res) => {
    const { uuid_livro } = req.params;
    const { nome, capa, generos } = req.body;

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const livroResult = await client.query(
            `UPDATE Livro SET nome = $1, capa = $2, data_atualizado = NOW() 
             WHERE uuid_livro = $3 
             RETURNING *`,
            [nome, capa, uuid_livro]
        );

        if (livroResult.rows.length === 0) {
            return res.status(404).json({ erro: "Livro não encontrado." });
        }

        const livro = livroResult.rows[0];

        if (Array.isArray(generos)) {
            await client.query(
                `DELETE FROM Livro_Genero WHERE uuid_livro = $1`,
                [uuid_livro]
            );

            const insertGeneroQuery = `
                INSERT INTO Livro_Genero (uuid_livro, uuid_genero) 
                VALUES ($1, $2)
            `;

            for (const uuid_genero of generos) {
                await client.query(insertGeneroQuery, [
                    uuid_livro,
                    uuid_genero,
                ]);
            }
        }

        await client.query("COMMIT");
        res.json(livro);
    } catch (err) {
        await client.query("ROLLBACK");
        console.error(err);
        res.status(500).json({ erro: "Erro ao atualizar livro." });
    } finally {
        client.release();
    }
};

const excluirLivro = async (req, res) => {
    const { uuid_livro } = req.params;

    try {
        const result = await pool.query(
            "DELETE FROM Livro WHERE uuid_livro = $1 RETURNING *",
            [uuid_livro]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ erro: "Livro não encontrado." });
        }

        res.json({ mensagem: "Livro excluído com sucesso." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao excluir livro." });
    }
};

module.exports = {
    criarLivro,
    listarLivros,
    buscarLivros,
    obterLivroPorUUID,
    atualizarLivro,
    excluirLivro,
};
