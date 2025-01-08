const express = require('express');
const router = express.Router();
const {
    createLivro,
    getLivros,
    getLivroByUuid,
    getCapitulosByLivro,
    updateLivro,
    deleteLivro
} = require('../controllers/livroController');

//POST
router.post('/', createLivro);

//GET
router.get('/', getLivros); 
router.get('/:livroUuid', getLivroByUuid); 
router.get('/:livroUuid/capitulos', getCapitulosByLivro);

//PUT
router.put('/:livroUuid', updateLivro); 

//DELETE
router.delete('/:livroUuid', deleteLivro);

module.exports = router;