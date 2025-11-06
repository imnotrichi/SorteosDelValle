const express = require('express');
const sorteosController = require('../controllers/sorteosController.js');

const router = express.Router();

router.post('/', sorteosController.crearSorteo);
router.get('/:id', sorteosController.obtenerSorteoPorId);
router.get('/buscar', sorteosController.obtenerSorteoPorTitulo);

module.exports = router;