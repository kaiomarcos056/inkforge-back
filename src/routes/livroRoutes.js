const express = require("express");
const router = express.Router();
const autenticar = require("../middlewares/autenticar");
const autorizarDono = require("../middlewares/autorizarDono");
const {
    criarLivro,
    atualizarLivro,
    excluirLivro,
    listarLivros,
    obterLivroPorUUID,
    buscarLivros,
} = require("../controllers/livroController");

router.post("/", autenticar, criarLivro);

router.get("/", listarLivros);
router.get("/busca", buscarLivros);
router.get("/:uuid_livro", obterLivroPorUUID);

router.put(
    "/:uuid_livro",
    autenticar,
    autorizarDono("Livro", "uuid_usuario", "uuid_livro"),
    atualizarLivro
);

router.delete(
    "/:uuid_livro",
    autenticar,
    autorizarDono("Livro", "uuid_usuario", "uuid_livro"),
    excluirLivro
);

module.exports = router;
