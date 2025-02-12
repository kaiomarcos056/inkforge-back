const pool = require("../config/db");

const autorizarDono = (tabela, colunaDono, colunaUUID) => {
    return async (req, res, next) => {
        const uuid_usuario = req.usuario.uuid_usuario;
        const uuid_recurso = req.params[colunaUUID];

        try {
            const { rows } = await pool.query(
                `SELECT ${colunaDono} FROM ${tabela} WHERE ${colunaUUID} = $1`,
                [uuid_recurso]
            );

            if (rows.length === 0) {
                return res
                    .status(404)
                    .json({ erro: "Recurso não encontrado." });
            }

            if (rows[0][colunaDono] !== uuid_usuario) {
                return res.status(403).json({
                    erro: "Você não tem permissão para modificar este recurso.",
                });
            }

            next();
        } catch (erro) {
            console.error(
                "Erro ao verificar propriedade do recurso:",
                erro.message
            );
            res.status(500).json({
                erro: "Erro interno ao verificar permissão.",
            });
        }
    };
};

module.exports = autorizarDono;
