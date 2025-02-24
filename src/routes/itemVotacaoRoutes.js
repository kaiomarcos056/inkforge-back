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
router.get('/:uuid_votacao', listarItemPorVotacao);
router.get('/sugestao', listarItemPorSugestao);

module.exports = router;
