const express = require('express');
const usuariosController = require('../controllers/usuariosController.js');

const router = express.Router();

router.post('/registrar', usuariosController.registrarUsuario);
router.post('/login', usuariosController.iniciarSesion);
router.get('/sincronizar', usuariosController.obtenerUsuarioParaSincronizacion);
router.get('/validar-organizador', usuariosController.validarEsOrganizador);

module.exports = router;