const express = require("express");
const {
    criarCapitulo,
    editarCapitulo,
    excluirCapitulo,
    listarCapitulos,
} = require("../controllers/capituloController");
const autenticar = require("../middlewares/autenticar");
const autorizarDono = require("../middlewares/autorizarDono");

const router = express.Router();

router.post("/", autenticar, criarCapitulo);

router.get("/:uuid_livro", listarCapitulos);

router.put(
    "/:uuid_capitulo",
    autenticar,
    autorizarDono("Capitulo", "uuid_livro", "uuid_capitulo"),
    editarCapitulo
);
router.delete(
    "/:uuid_capitulo",
    autenticar,
    autorizarDono("Capitulo", "uuid_livro", "uuid_capitulo"),
    excluirCapitulo
);

module.exports = router;
