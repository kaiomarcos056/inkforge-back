const express = require("express");
const router = express.Router();
const comentarioController = require("../controllers/comentarioController");

router.post("/", comentarioController.addComentario);

router.get("/:uuid_capitulo", comentarioController.getComentariosByCapitulo);

module.exports = router;
