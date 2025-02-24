const express = require('express');
const router = express.Router();
const {
  criarItemVotacao,
  listarItemPorVotacao,
  listarItemPorSugestao,
  adicionarVoto
} = require('../controllers/itemVotacaoController');

// POST
router.post('/', criarItemVotacao);

// GET
router.get('/sugestao/:uuid_votacao', listarItemPorSugestao);
router.get('/:uuid_votacao', listarItemPorVotacao);

adicionarVoto.put('/votar/:uuid_item_votacao', listarItemPorVotacao);

module.exports = router;
