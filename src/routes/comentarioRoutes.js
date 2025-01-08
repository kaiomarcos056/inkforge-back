const express = require('express');
const router = express.Router();
const comentarioController = require('../controllers/comentarioController');

//POST
router.post('/', comentarioController.addComentario);

//GET
router.get('/:uuid_capitulo', comentarioController.getComentariosByCapitulo);

module.exports = router;
