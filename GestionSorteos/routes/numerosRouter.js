const express = require('express');
const numerosController = require('../controllers/numerosController.js');

const router = express.Router();

router.post('/apartar', numerosController.apartarNumeros);
router.get('/disponibles', numerosController.obtenerNumerosDisponibles);

module.exports = router;