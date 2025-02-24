const pool = require("../config/db");

const criarVotacao = async (req, res) => {
    const { uuid_capitulo, titulo, data_inicio, data_fim, opcoes } = req.body;
    const uuid_usuario = req.usuario.uuid_usuario;

    try {
        const { rows: capituloRows } = await pool.query(
            `SELECT c.uuid_capitulo FROM Capitulo c
             INNER JOIN Livro l ON c.uuid_livro = l.uuid_livro
             WHERE c.uuid_capitulo = $1 AND l.uuid_usuario = $2`,
            [uuid_capitulo, uuid_usuario]
        );

        if (capituloRows.length === 0) {
            return res.status(403).json({
                erro: "Você não tem permissão para criar votações neste capítulo.",
            });
        }

        const agora = new Date();
        const inicio = new Date(data_inicio);
        const statusInicial = inicio <= agora ? "aberta" : "preparando";

        const { rows: votacaoRows } = await pool.query(
            `INSERT INTO Votacao (uuid_capitulo, titulo, status, criador, data_inicio, data_fim)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING uuid_votacao`,
            [
                uuid_capitulo,
                titulo,
                statusInicial,
                uuid_usuario,
                data_inicio,
                data_fim,
            ]
        );

        const uuid_votacao = votacaoRows[0].uuid_votacao;

        let opcoesComIndex = opcoes.map((opcao, index) => ({
            descricao: opcao.descricao,
            index: index,
            qtd_votos: 0,
        }));

        await pool.query(
            `UPDATE Votacao SET opcoes = $1 WHERE uuid_votacao = $2`,
            [JSON.stringify(opcoesComIndex), uuid_votacao]
        );

        res.status(201).json({
            mensagem: "Votação criada com sucesso.",
            uuid_votacao,
            titulo,
            status: statusInicial,
            data_inicio,
            data_fim,
            opcoes: opcoesComIndex,
        });
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
    const { uuid_votacao, opcao_index } = req.body;
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

        let opcoes = votacao.opcoes.map((opcao, index) => ({
            ...opcao,
            index: index,
            qtd_votos: opcao.qtd_votos || 0,
        }));

        if (opcao_index < 0 || opcao_index >= opcoes.length) {
            return res
                .status(400)
                .json({ erro: "Índice de opção inválido para esta votação." });
        }

        const { rows: votoExistente } = await pool.query(
            `SELECT opcao_escolhida FROM Voto_Usuario WHERE uuid_usuario = $1 AND uuid_votacao = $2`,
            [uuid_usuario, uuid_votacao]
        );

        if (votoExistente.length > 0) {
            const opcao_anterior = votoExistente[0].opcao_escolhida;

            if (opcao_anterior === opcao_index) {
                return res
                    .status(400)
                    .json({ erro: "Você já votou nesta opção." });
            }

            if (opcoes[opcao_anterior]) {
                opcoes[opcao_anterior].qtd_votos -= 1;
            }

            await pool.query(
                `UPDATE Voto_Usuario SET opcao_escolhida = $1, data_criacao = NOW()
                 WHERE uuid_usuario = $2 AND uuid_votacao = $3`,
                [opcao_index, uuid_usuario, uuid_votacao]
            );
        } else {
            await pool.query(
                `INSERT INTO Voto_Usuario (uuid_usuario, uuid_votacao, opcao_escolhida, data_criacao) 
                 VALUES ($1, $2, $3, NOW())`,
                [uuid_usuario, uuid_votacao, opcao_index]
            );
        }

        opcoes[opcao_index].qtd_votos += 1;

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

const atualizarStatusVotacoes = async () => {
    try {
        await pool.query(
            `UPDATE Votacao SET status = 'aberta', data_atualizado = NOW()
             WHERE status = 'preparando' AND data_inicio <= NOW()`
        );

        await pool.query(
            `UPDATE Votacao SET status = 'fechada', data_atualizado = NOW()
             WHERE status = 'aberta' AND data_fim < NOW()`
        );

        console.log("Votações atualizadas automaticamente.");
    } catch (error) {
        console.error(
            "Erro ao atualizar votações automaticamente:",
            error.message
        );
    }
};

const usuarioVotacao = async (req, res) => {
    const { uuid_usuario, uuid_votacao, uuid_item_votacao } = req.body;
    
    try {

        const { rows } = await pool.query(
            `INSERT INTO voto_usuario(uuid_usuario, uuid_votacao, uuid_item_votacao) 
            VALUES($1, $2, $3) RETURNING uuid_votacao`,
            [
                uuid_usuario,
                uuid_votacao,
                uuid_item_votacao,
            ]
        );

        console.log(rows);

        res.status(201).json(rows);
    } 
    catch (error) {
        res.status(500).json({ erro: "Erro ao criar votação." });
    }
};


//setInterval(atualizarStatusVotacoes, 10 * 60 * 1000);

module.exports = {
    criarVotacao,
    listarVotacoesPorCapitulo,
    editarVotacao,
    excluirVotacao,
    votar,
    usuarioVotacao
};
