const express = require('express');
const router = express.Router();
const {
  criarHistorico,
  listarHistorico,
  ultimasLeituras
} = require('../controllers/historicoController');

// POST
router.post("/", criarHistorico);

// GET
router.get("/:uuid_usuario", listarHistorico);
router.get("/leituras/:uuid_usuario", ultimasLeituras);

module.exports = router;