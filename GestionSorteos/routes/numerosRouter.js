const express = require('express');
const numerosController = require('../controllers/numerosController.js');

const router = express.Router();

router.post('/apartar', numerosController.apartarNumeros);
router.post('/marcar-pagados', numerosController.marcarNumerosComoPagados);
router.get('/disponibles', numerosController.obtenerNumerosDisponibles);
router.get('/cliente', numerosController.obtenerNumerosCliente);
router.get('/apartados', numerosController.obtenerNumerosApartados);
router.delete('/liberar', numerosController.liberarNumeros);

module.exports = router;