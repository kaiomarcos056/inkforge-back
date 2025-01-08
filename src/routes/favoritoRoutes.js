const express = require('express');
const router = express.Router();
const favoritoController = require('../controllers/favoritoController');

//post
router.post('/', favoritoController.addFavorito);

// GET
router.get('/:uuid_usuario', favoritoController.getFavoritosByUsuario);

// DELETE
router.delete('/:uuid_favorito', favoritoController.removeFavorito);

module.exports = router;
