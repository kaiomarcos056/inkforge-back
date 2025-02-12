const pool = require("../config/db");

const criarVotacao = async (req, res) => {
    const { uuid_capitulo, titulo, status, data_inicio, data_fim, opcoes } =
        req.body;
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
            return res
                .status(403)
                .json({ erro: "Você não pode criar votação neste capítulo." });
        }

        const { rows: votacao } = await pool.query(
            `INSERT INTO Votacao (uuid_capitulo, titulo, status, criador, data_inicio, data_fim, opcoes) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [
                uuid_capitulo,
                titulo,
                status,
                uuid_usuario,
                data_inicio,
                data_fim,
                JSON.stringify(opcoes),
            ]
        );

        res.status(201).json(votacao[0]);
    } catch (error) {
        console.error("Erro ao criar votação:", error.message);
        res.status(500).json({ erro: "Erro ao criar votação." });
    }
};

const listarVotacoesPorCapitulo = async (req, res) => {
    const { uuid_capitulo } = req.params;

    try {
        const { rows } = await pool.query(
            `SELECT v.uuid_votacao, v.titulo, v.status, v.data_inicio, v.data_fim, v.opcoes
             FROM Votacao v
             WHERE v.uuid_capitulo = $1
             ORDER BY v.data_criacao DESC`,
            [uuid_capitulo]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                erro: "Nenhuma votação encontrada para este capítulo.",
            });
        }

        res.json(rows);
    } catch (error) {
        console.error("Erro ao listar votações por capítulo:", error.message);
        res.status(500).json({ erro: "Erro ao listar votações." });
    }
};

const editarVotacao = async (req, res) => {
    const { uuid_votacao } = req.params;
    const { titulo, status, data_inicio, data_fim, opcoes } = req.body;
    const uuid_usuario = req.usuario.uuid_usuario;

    try {
        const { rows } = await pool.query(
            `SELECT criador FROM Votacao WHERE uuid_votacao = $1 AND criador = $2`,
            [uuid_votacao, uuid_usuario]
        );

        if (rows.length === 0) {
            return res
                .status(403)
                .json({ erro: "Você não pode editar esta votação." });
        }

        const { rows: votacao } = await pool.query(
            `UPDATE Votacao 
             SET titulo = $1, status = $2, data_inicio = $3, data_fim = $4, opcoes = $5, data_atualizado = NOW() 
             WHERE uuid_votacao = $6 RETURNING *`,
            [
                titulo,
                status,
                data_inicio,
                data_fim,
                JSON.stringify(opcoes),
                uuid_votacao,
            ]
        );

        res.json(votacao[0]);
    } catch (error) {
        console.error("Erro ao editar votação:", error.message);
        res.status(500).json({ erro: "Erro ao editar votação." });
    }
};

const excluirVotacao = async (req, res) => {
    const { uuid_votacao } = req.params;
    const uuid_usuario = req.usuario.uuid_usuario;

    try {
        const { rows } = await pool.query(
            `SELECT criador FROM Votacao WHERE uuid_votacao = $1 AND criador = $2`,
            [uuid_votacao, uuid_usuario]
        );

        if (rows.length === 0) {
            return res
                .status(403)
                .json({ erro: "Você não pode excluir esta votação." });
        }

        await pool.query(`DELETE FROM Votacao WHERE uuid_votacao = $1`, [
            uuid_votacao,
        ]);

        res.json({ mensagem: "Votação excluída com sucesso." });
    } catch (error) {
        console.error("Erro ao excluir votação:", error.message);
        res.status(500).json({ erro: "Erro ao excluir votação." });
    }
};

const votar = async (req, res) => {
    const { uuid_votacao, opcao_escolhida } = req.body;
    const uuid_usuario = req.usuario.uuid_usuario;

    try {
        const { rows: votacaoRows } = await pool.query(
            `SELECT opcoes, status FROM Votacao WHERE uuid_votacao = $1`,
            [uuid_votacao]
        );

        if (votacaoRows.length === 0) {
            return res.status(404).json({ erro: "Votação não encontrada." });
        }

        const votacao = votacaoRows[0];

        if (votacao.status !== "aberta") {
            return res
                .status(403)
                .json({ erro: "A votação já foi encerrada." });
        }

        let opcoes = votacao.opcoes.map((opcao) => ({
            ...opcao,
            qtd_votos: opcao.qtd_votos || 0,
        }));

        const opcaoIndex = opcoes.findIndex(
            (o) => o.descricao === opcao_escolhida
        );

        if (opcaoIndex === -1) {
            return res
                .status(400)
                .json({ erro: "Opção inválida para esta votação." });
        }

        const { rows: votoExistente } = await pool.query(
            `SELECT opcao_escolhida FROM Voto_Usuario WHERE uuid_usuario = $1 AND uuid_votacao = $2`,
            [uuid_usuario, uuid_votacao]
        );

        if (votoExistente.length > 0) {
            const opcao_anterior = votoExistente[0].opcao_escolhida;

            if (opcao_anterior === opcao_escolhida) {
                return res
                    .status(400)
                    .json({ erro: "Você já votou nesta opção." });
            }

            const indexAnterior = opcoes.findIndex(
                (o) => o.descricao === opcao_anterior
            );
            if (indexAnterior !== -1) {
                opcoes[indexAnterior].qtd_votos -= 1;
            }

            await pool.query(
                `UPDATE Voto_Usuario SET opcao_escolhida = $1, data_criacao = NOW()
                 WHERE uuid_usuario = $2 AND uuid_votacao = $3`,
                [opcao_escolhida, uuid_usuario, uuid_votacao]
            );
        } else {
            await pool.query(
                `INSERT INTO Voto_Usuario (uuid_usuario, uuid_votacao, opcao_escolhida, data_criacao) 
                 VALUES ($1, $2, $3, NOW())`,
                [uuid_usuario, uuid_votacao, opcao_escolhida]
            );
        }

        opcoes[opcaoIndex].qtd_votos += 1;

        await pool.query(
            `UPDATE Votacao SET opcoes = $1, data_atualizado = NOW() WHERE uuid_votacao = $2`,
            [JSON.stringify(opcoes), uuid_votacao]
        );

        res.json({ mensagem: "Voto registrado com sucesso." });
    } catch (error) {
        console.error("Erro ao votar:", error.message);
        res.status(500).json({ erro: "Erro ao registrar o voto." });
    }
};

module.exports = {
    criarVotacao,
    listarVotacoesPorCapitulo,
    editarVotacao,
    excluirVotacao,
    votar,
};
