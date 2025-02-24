const pool = require("../config/db");

// Criar um novo gênero
const criarItemVotacao = async (req, res) => {
    const { uuid_usuario, uuid_votacao, descricao } = req.body;

    try {
        const result = await pool.query(
            "INSERT INTO item_votacao (uuid_usuario, uuid_votacao, descricao) VALUES ($1, $2, $3) RETURNING *",
            [uuid_usuario, uuid_votacao, descricao]
        );
        res.status(201).json(result.rows[0]);
    } 
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao criar item." });
    }
};

const listarItemPorVotacao = async (req, res) => {
    const { uuid_votacao } = req.params;
    try {
        console.log(uuid_votacao)
        const { rows } = await pool.query(
            `
            SELECT 
                I.*
            FROM ITEM_VOTACAO I
            INNER JOIN VOTACAO V ON V.UUID_VOTACAO = I.UUID_VOTACAO
            INNER JOIN CAPITULO C ON C.UUID_CAPITULO = V.UUID_CAPITULO
            INNER JOIN LIVRO L ON L.UUID_LIVRO = C.UUID_LIVRO
            INNER JOIN USUARIO U ON U.UUID_USUARIO = I.UUID_USUARIO
            WHERE L.UUID_USUARIO = I.UUID_USUARIO
            AND I.UUID_VOTACAO = $1
            `,
            [uuid_votacao]
        );
        
        res.status(200).json(rows);
    } 
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao obter item."+error.message });
    }
};

const listarItemPorSugestao = async (req, res) => {
    const { uuid_votacao } = req.params;
    try {
        const { rows } = await pool.query(
            `
            SELECT 
                I.*,
                U.NOME,
                U.FOTO
            FROM ITEM_VOTACAO I
            INNER JOIN VOTACAO V ON V.UUID_VOTACAO = I.UUID_VOTACAO
            INNER JOIN CAPITULO C ON C.UUID_CAPITULO = V.UUID_CAPITULO
            INNER JOIN LIVRO L ON L.UUID_LIVRO = C.UUID_LIVRO
            INNER JOIN USUARIO U ON U.UUID_USUARIO = I.UUID_USUARIO
            WHERE L.UUID_USUARIO <> I.UUID_USUARIO
            AND I.UUID_VOTACAO = $1
            `,
            [uuid_votacao]
        );
        
        res.status(200).json(rows);
    } 
    catch (error) {
        res.status(500).json({ error: "Erro ao obter item."+error.message });
    }
};

const adicionarVoto = async (req, res) => {
    const { uuid_item_votacao } = req.params;

    try {
        await pool.query(
            `
            UPDATE ITEM_VOTACAO SET VOTOS = VOTOS + 1 WHERE UUID_ITEM_VOTACAO = $1
            `,
            [uuid_item_votacao]
        );

        res.json({ mensagem: "voto cadastrado com sucesso." });
    } 
    catch (error) {
        res.status(500).json({ erro: "Erro ao votar." });
    }
};

module.exports = {
    criarItemVotacao,
    listarItemPorVotacao,
    listarItemPorSugestao,
    adicionarVoto
};
