const express = require("express");
const router = express.Router();
const comentarioController = require("../controllers/comentarioController");

router.post("/", comentarioController.addComentario);

router.get("/", comentarioController.getComentariosByCapitulo);

module.exports = router;
