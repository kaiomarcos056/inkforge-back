const express = require('express');
const router = express.Router();
const estatisticaController = require('../controllers/estatisticaController');

//GET
router.get('/:uuid_usuario', estatisticaController.getEstatisticasByUsuario);

module.exports = router;