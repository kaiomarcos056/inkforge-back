const express = require("express");
const {
    login,
    registrar,
    redefinirSenha,
} = require("../controllers/autenticacaoController");
const router = express.Router();

router.post("/login", login);
router.post("/registrar", registrar);

router.post("/redefinir-senha", redefinirSenha);

module.exports = router;
