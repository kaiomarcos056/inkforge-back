const express = require("express");
const router = express.Router();
const {
    criarVotacao,
    listarVotacoesPorCapitulo,
    editarVotacao,
    excluirVotacao,
    votar,
} = require("../controllers/votacaoController");

const autenticar = require("../middlewares/autenticar");
const autorizarDono = require("../middlewares/autorizarDono");

router.post("/", autenticar, criarVotacao);

router.get("/capitulo/:uuid_capitulo", listarVotacoesPorCapitulo);

router.put(
    "/:uuid_votacao",
    autenticar,
    autorizarDono("Votacao", "criador", "uuid_votacao"),
    editarVotacao
);

router.delete(
    "/:uuid_votacao",
    autenticar,
    autorizarDono("Votacao", "criador", "uuid_votacao"),
    excluirVotacao
);
router.post("/votar", autenticar, votar);

module.exports = router;
