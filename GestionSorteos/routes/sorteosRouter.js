const express = require('express');
const sorteosController = require('../controllers/sorteosController.js');

const router = express.Router();

router.post('/', sorteosController.crearPublicacion);

module.exports = router;