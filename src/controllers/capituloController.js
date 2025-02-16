const pool = require("../config/db");

const criarCapitulo = async (req, res) => {
    const { uuid_livro, titulo, conteudo } = req.body;
    const uuid_usuario = req.usuario.uuid_usuario;

    try {
        const { rows } = await pool.query(
            `SELECT uuid_livro 
            FROM Livro 
            WHERE uuid_livro = $1 AND uuid_usuario = $2`,
            [uuid_livro, uuid_usuario]
        );

        if (rows.length === 0) {
            return res.status(403).json({
                erro: "Você não tem permissão para adicionar capítulos a este livro.",
            });
        }

        const { rows: capituloRows } = await pool.query(
            `INSERT INTO Capitulo (uuid_livro, titulo, conteudo) 
            VALUES ($1, $2, $3) 
            RETURNING uuid_capitulo`,
            [uuid_livro, titulo, conteudo]
        );

        res.status(201).json({
            mensagem: "Capítulo criado com sucesso.",
            uuid_capitulo: capituloRows[0].uuid_capitulo,
        });
    } catch (error) {
        console.error("Erro ao criar capítulo:", error.message);
        res.status(500).json({ erro: "Erro ao criar capítulo." });
    }
};

const registrarLeituraCapitulo = async (req, res) => {
    const { uuid_capitulo } = req.params;
    const uuid_usuario = req.usuario.uuid_usuario;

    try {
        await pool.query(
            `
            INSERT INTO Leitura_Historico (uuid_usuario, uuid_capitulo, data_leitura)
            VALUES ($1, $2, NOW())
            ON CONFLICT (uuid_usuario, uuid_capitulo) 
            DO UPDATE SET data_leitura = NOW()
        `,
            [uuid_usuario, uuid_capitulo]
        );

        res.status(200).json({
            mensagem: "Progresso salvo com sucesso.",
            uuid_usuario,
            uuid_capitulo,
        });
    } catch (error) {
        console.error("Erro ao registrar leitura:", error.message);
        res.status(500).json({
            erro: "Erro ao registrar leitura.",
        });
    }
};

const listarCapitulos = async (req, res) => {
    const { uuid_livro } = req.params;

    try {
        const { rows } = await pool.query(
            `SELECT uuid_capitulo, titulo, conteudo, data_criacao, data_atualizado 
       FROM Capitulo 
       WHERE uuid_livro = $1 
       ORDER BY data_criacao ASC`,
            [uuid_livro]
        );

        res.json(rows);
    } catch (error) {
        console.error("Erro ao listar capítulos:", error.message);
        res.status(500).json({ erro: "Erro ao listar capítulos." });
    }
};

const listarUltimosCapitulosLidos = async (req, res) => {
    const uuid_usuario = req.usuario.uuid_usuario;

    try {
        const { rows } = await pool.query(
            `
            SELECT DISTINCT ON (l.uuid_livro) 
                l.uuid_livro,
                l.nome AS titulo_livro,
                c.uuid_capitulo,
                c.titulo AS titulo_capitulo,
                lh.data_leitura
            FROM Leitura_Historico lh
            INNER JOIN Capitulo c ON lh.uuid_capitulo = c.uuid_capitulo
            INNER JOIN Livro l ON c.uuid_livro = l.uuid_livro
            WHERE lh.uuid_usuario = $1
            ORDER BY l.uuid_livro, lh.data_leitura DESC
            LIMIT 4
        `,
            [uuid_usuario]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                erro: "Nenhum capítulo encontrado",
            });
        }

        res.json(rows);
    } catch (error) {
        console.error("Erro ao obter últimos capítulos lidos:", error.message);
        res.status(500).json({
            erro: "Erro ao obter últimos capítulos lidos.",
        });
    }
};

const editarCapitulo = async (req, res) => {
    const { uuid_capitulo } = req.params;
    const { titulo, conteudo } = req.body;
    const uuid_usuario = req.usuario.uuid_usuario;

    try {
        const { rows } = await pool.query(
            `SELECT c.uuid_capitulo 
       FROM Capitulo c
       INNER JOIN Livro l ON c.uuid_livro = l.uuid_livro
       WHERE c.uuid_capitulo = $1 AND l.uuid_usuario = $2`,
            [uuid_capitulo, uuid_usuario]
        );

        if (rows.length === 0) {
            return res.status(403).json({
                erro: "Você não tem permissão para editar este capítulo.",
            });
        }

        await pool.query(
            `UPDATE Capitulo 
       SET titulo = $1, conteudo = $2, data_atualizado = NOW() 
       WHERE uuid_capitulo = $3`,
            [titulo, conteudo, uuid_capitulo]
        );

        res.json({ mensagem: "Capítulo atualizado com sucesso." });
    } catch (error) {
        console.error("Erro ao editar capítulo:", error.message);
        res.status(500).json({ erro: "Erro ao editar capítulo." });
    }
};

const excluirCapitulo = async (req, res) => {
    const { uuid_capitulo } = req.params;
    const uuid_usuario = req.usuario.uuid_usuario;

    try {
        const { rows } = await pool.query(
            `SELECT c.uuid_capitulo 
       FROM Capitulo c
       INNER JOIN Livro l ON c.uuid_livro = l.uuid_livro
       WHERE c.uuid_capitulo = $1 AND l.uuid_usuario = $2`,
            [uuid_capitulo, uuid_usuario]
        );

        if (rows.length === 0) {
            return res.status(403).json({
                erro: "Você não tem permissão para excluir este capítulo.",
            });
        }

        await pool.query(`DELETE FROM Capitulo WHERE uuid_capitulo = $1`, [
            uuid_capitulo,
        ]);

        res.json({ mensagem: "Capítulo excluído com sucesso." });
    } catch (error) {
        console.error("Erro ao excluir capítulo:", error.message);
        res.status(500).json({ erro: "Erro ao excluir capítulo." });
    }
};

module.exports = {
    criarCapitulo,
    editarCapitulo,
    excluirCapitulo,
    listarCapitulos,
    registrarLeituraCapitulo,
    listarUltimosCapitulosLidos,
};
