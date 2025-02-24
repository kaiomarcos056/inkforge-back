const express = require('express');
const router = express.Router();
const {
  criarItemVotacao,
  listarItemPorVotacao
} = require('../controllers/itemVotacaoController');

// POST
router.post('/', criarItemVotacao);

// GET
router.get('/:uuid_votacao', listarItemPorVotacao);

module.exports = router;
