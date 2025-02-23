const pool = require("../config/db");

const autorizarDono = (tabela, colunaDono, colunaUUID) => {
    return async (req, res, next) => {
        const uuid_usuario = req.usuario.uuid_usuario;
        const uuid_recurso = req.params[colunaUUID];

        try {

            const { rows } = await pool.query(
                `
                SELECT 
                    l.uuid_usuario
                FROM capitulo c
                INNER JOIN livro l 
                ON l.uuid_livro = c.uuid_livro
                WHERE 1 = 1 
                AND uuid_capitulo = $1
                `,
                [uuid_recurso]
            );

            if (rows.length === 0) {
                return res
                    .status(404)
                    .json({ erro: "Recurso não encontrado." });
            }

            if (rows[0].uuid_usuario !== uuid_usuario) {
                return res.status(403).json({
                    erro: "Você não tem permissão para modificar este recurso.",
                });
            }

            next();
        } 
        catch (erro) {
            res.status(500).json({ erro: "Erro interno ao verificar permissão.", });
        }
    };
};

module.exports = autorizarDono;
