const express = require('express');
const router = express.Router();
const {
  criarInteresse,
  listarInteresses
} = require('../controllers/interesseController');

// POST
router.post('/', criarInteresse);

// GET
router.get('/', listarInteresses);

module.exports = router;