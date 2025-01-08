const express = require('express');
const router = express.Router();
const {
  createGenero,
  getGeneros
} = require('../controllers/generoController');

// POST
router.post('/', createGenero);

// GET
router.get('/', getGeneros);

module.exports = router;
