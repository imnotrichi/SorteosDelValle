const numerosDAO = require('../dataAccess/numerosDAO.js');
const sorteosDAO = require('../dataAccess/sorteosDAO.js');
const clientesDAO = require('../dataAccess/clientesDAO.js');
const { AppError } = require('../utils/appError.js');
const { json } = require('express');

class NumerosController {

    constructor() {
        this.apartarNumeros = this.apartarNumeros.bind(this);
    }

    /*
    body = {
        numeros: [1, 2, 3, 4],
        id_sorteo: 1,
        id_cliente: 1
    }
    */
    async apartarNumeros(req, res, next) {
        try {
            const { numeros, id_sorteo, id_cliente } = req.body;
            // Validaciones del sorteo
            if (!id_sorteo) {
                return next(new AppError('No se proporcionó el ID del sorteo.', 400));
            }
            const sorteoObtenido = await sorteosDAO.obtenerSorteoPorId(id_sorteo);
            if (!sorteoObtenido) {
                return next(new AppError(`No se encontró el sorteo con ID: ${id_sorteo}.`, 404));
            }

            // Validaciones del cliente
            if (!id_cliente) {
                return next(new AppError('No se proporcionó el ID del cliente.', 400));
            }
            const clienteObtenido = await clientesDAO.obtenerClientePorId(id_cliente);
            if (!clienteObtenido) {
                return next(new AppError(`No se encontró un cliente con ID: ${id_cliente}.`, 404));
            }

            // Validaciones de los números
            if (!Array.isArray(numeros)) {
                return next(new AppError('El campo "numeros" debe ser un arreglo.', 400));
            }
            const noNumeros = numeros.filter(n => typeof n !== "number" || !Number.isInteger(n));
            if (noNumeros.length > 0) {
                return next(new AppError('Solo se permiten números enteros.', 400));
            }
            if (!numeros?.length) {
                return next(new AppError('No se seleccionó ningún número.', 400));
            }

            const rango_numeros = await sorteosDAO.obtenerRangoNumeros(id_sorteo);
            const fueraDeRango = numeros.filter(n => n < 1 || n > rango_numeros);
            if (fueraDeRango.length > 0) {
                return next(new AppError(`Los siguientes números están fuera del rango permitido (1-${rango_numeros}): ${fueraDeRango.join(', ')}`, 400));
            }

            const resultado = await numerosDAO.apartarNumeros({
                numeros,
                id_sorteo,
                id_cliente
            });

            // Si algun número ya NO está disponible
            if (!resultado.exito) {
                const noDisponibles = resultado.noDisponibles;
                return next(new AppError(`Los números ${noDisponibles.join(", ")} ya no están disponibles.`, 409));
            }

            // GG, sí estaban disponibles los números
            res.status(201).json(numeros);
        } catch (err) {
            next(err);
        }
    }

    /*
    Para buscar TODOS los números disponibles
    GET http://localhost:3000/api/numeros/disponibles?sorteo=3

    Para buscar números disponibles
    GET http://localhost:3000/api/numeros/disponibles?sorteo=3&buscar=7
    */
    async obtenerNumerosDisponibles(req, res, next) {
        try {
            if (!req.query.sorteo) {
                return next(new AppError("Se debe proporcionar el ID del sorteo.", 400));
            }
            const id_sorteo = Number(req.query.sorteo);
            if (isNaN(id_sorteo) || !Number.isInteger(id_sorteo)) {
                return next(new AppError("El ID del sorteo debe ser un número entero.", 400));
            }
            const sorteoObtenido = await sorteosDAO.obtenerSorteoPorId(id_sorteo);
            if (!sorteoObtenido) {
                return next(new AppError(`No se encontró el sorteo con ID: ${id_sorteo}.`, 404));
            }

            // Obtener rango desde BD
            const rango_numeros = await sorteosDAO.obtenerRangoNumeros(id_sorteo);

            const buscar_numero = req.query.buscar ? Number(req.query.buscar) : null;
            let resultado;
            if (buscar_numero !== null) {
                if (isNaN(buscar_numero) || !Number.isInteger(buscar_numero)) {
                    return next(new AppError("Solo se permiten números enteros.", 400));
                }

                if (buscar_numero < 0 || buscar_numero > rango_numeros) {
                    return next(new AppError(`El número buscado está fuera del rango (1-${rango_numeros})`, 400));
                }
            }
            resultado = await numerosDAO.obtenerNumerosPorSorteo(id_sorteo);

            // Resultado debe ser un arreglo de objetos que contienen { numero }
            const numerosOcupados = resultado.map(n => n.numero);

            // Construir arreglo con números disponibles
            const numerosDisponibles = [];
            for (let i = 1; i <= rango_numeros; i++) {
                const estaDisponible = !numerosOcupados.includes(i);
                // Si NO se está buscando, agregar todos los disponibles
                if (buscar_numero === null) {
                    if (estaDisponible) numerosDisponibles.push(i);
                    continue;
                }

                // Si SÍ se está buscando, agregar solo los que contengan el número buscado
                const contieneBusqueda = i.toString().includes(buscar_numero.toString());
                if (estaDisponible && contieneBusqueda) {
                    numerosDisponibles.push(i);
                }
            }

            // Hola persona que lee esto :D
            res.status(200).json(numerosDisponibles);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new NumerosController();