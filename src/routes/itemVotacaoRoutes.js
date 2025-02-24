const express = require('express');
const router = express.Router();
const {
  criarItemVotacao,
  listarItemPorVotacao,
  listarItemPorSugestao
} = require('../controllers/itemVotacaoController');

// POST
router.post('/', criarItemVotacao);

// GET
router.get('/sugestao', listarItemPorSugestao);
router.get('/:uuid_votacao', listarItemPorVotacao);


module.exports = router;
