const express = require('express');
const router = express.Router();
const {
  createUsuario,
  getUsuarios,
  getUsuarioByUuid,
  getLivrosByUsuario,
  updateUsuario,
  deleteUsuario,
} = require('../controllers/usuarioController');


// POST
router.post('/', createUsuario);

// GET
router.get('/', getUsuarios);
router.get('/:uuid', getUsuarioByUuid);
router.get('/livros/:usuarioUuid', getLivrosByUsuario);

// PUT
router.put('/:uuid', updateUsuario);

// DELETE
router.delete('/:uuid', deleteUsuario);

module.exports = router;
