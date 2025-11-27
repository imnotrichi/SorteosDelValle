const express = require('express');
const usuariosController = require('../controllers/usuariosController.js');

router.post('/registrar', usuariosController.registrarUsuario);
router.post('/login', usuariosController.iniciarSesion);

module.exports = router;