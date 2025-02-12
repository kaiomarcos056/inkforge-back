require("dotenv").config();

module.exports = {
    segredo: process.env.JWT_SEGREDO,
    tempoExpiracao: process.env.JWT_TEMPO_EXPIRACAO,
};
