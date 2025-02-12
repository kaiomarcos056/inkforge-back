const express = require("express");
const { login, registrar } = require("../controllers/autenticacaoController");
const router = express.Router();

router.post("/login", login);
router.post("/registrar", registrar);

module.exports = router;
