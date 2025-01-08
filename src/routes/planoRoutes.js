const express = require('express');
const router = express.Router();
const planoController = require('../controllers/planoController');

//POST
router.post('/', planoController.createPlano);

//GET
router.get('/', planoController.getAllPlanos);

module.exports = router;