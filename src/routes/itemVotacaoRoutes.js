const express = require('express');
const router = express.Router();
const itemVotacaoController = require('../controllers/itemVotacaoController');

//POST
router.post('/', itemVotacaoController.createItemVotacao);

//GET
router.get('/:uuid_votacao', itemVotacaoController.getItemsByVotacao);

module.exports = router;
