const express = require('express');
const router = express.Router();
const {
  createCapitulo,
  getCapituloByUuid,
  updateCapitulo,
  deleteCapitulo
} = require('../controllers/capituloController');

// POST
router.post('/', createCapitulo);

// GET
router.get('/:capituloUuid', getCapituloByUuid);

// PUT
router.put('/:capituloUuid', updateCapitulo);

// DELETE
router.delete('/:capituloUuid', deleteCapitulo);

module.exports = router;
