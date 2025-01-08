const express = require('express');
const router = express.Router();
const votacaoController = require('../controllers/votacaoController');

//POST
router.post('/', votacaoController.createVotacao);

//GET
router.get('/:uuid_capitulo', votacaoController.getVotacoesByCapitulo);

module.exports = router;
