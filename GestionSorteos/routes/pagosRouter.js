const express = require('express');
const pagosController = require('../controllers/pagosController.js');

const router = express.Router();

router.post('/registrar-comprobante', pagosController.registrarComprobantePago);
router.get('/:idSorteo', pagosController.obtenerPagosPorSorteo);

module.exports = router;