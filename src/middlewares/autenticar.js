const jwt = require("jsonwebtoken");
const { segredo } = require("../config/autenticacaoConfig");

const autenticar = (req, res, next) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        return res
            .status(401)
            .json({ erro: "Acesso negado. Token não fornecido." });
    }

    const [, token] = authHeader.split(" ");        

    try {
        const usuario = jwt.verify(token, segredo);
        req.usuario = usuario;
        next();
    } catch (erro) {
        return res.status(401).json({ erro: "Não autorizado." });
    }
};

module.exports = autenticar;
