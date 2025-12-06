const express = require('express');
const usuariosController = require('../controllers/usuariosController.js');

const router = express.Router();

router.get('/id', usuariosController.obtenerIdPorCorreo);

module.exports = router;