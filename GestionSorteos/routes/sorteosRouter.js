const express = require('express');
const sorteosController = require('../controllers/sorteosController.js');

const router = express.Router();

router.post('/', sorteosController.crearSorteo);
router.get('/buscar', sorteosController.obtenerSorteoPorTitulo);
router.get('/activos', sorteosController.obtenerSorteosActivos);
router.get('/finalizados', sorteosController.obtenerSorteosFinalizados);
router.get('/organizador/:id', sorteosController.obtenerSorteosPorOrganizador);
router.get('/:id', sorteosController.obtenerSorteoPorId);
router.put('/:id', sorteosController.actualizarSorteo);
router.delete('/:id', sorteosController.eliminarSorteo);

module.exports = router;