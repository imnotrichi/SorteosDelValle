const numerosDAO = require('../dataAccess/numerosDAO.js');
const sorteosDAO = require('../dataAccess/sorteosDAO.js');
const clientesDAO = require('../dataAccess/clientesDAO.js');
const usuariosDAO = require('../dataAccess/usuariosDAO.js');
const { AppError } = require('../utils/appError.js');
const { json } = require('express');

class NumerosController {

    constructor() {
        this.apartarNumeros = this.apartarNumeros.bind(this);
    }

    /*
    POST
    body = {
        numeros: [1, 2, 3, 4],
        id_sorteo: 1,
        id_cliente: 1
    }
    */
    async apartarNumeros(req, res, next) {
        try {
            let { numeros, id_sorteo, id_cliente, correo_usuario } = req.body;

            if (!id_sorteo) {
                return next(new AppError('No se proporcionó el ID del sorteo.', 400));
            }
            const sorteoObtenido = await sorteosDAO.obtenerSorteoPorId(id_sorteo);
            if (!sorteoObtenido) {
                return next(new AppError(`No se encontró el sorteo con ID: ${id_sorteo}.`, 404));
            }
            if (sorteoObtenido.fecha_realizacion < new Date()) {
                return next(new AppError("El sorteo ya finalizó.", 400));
            }

            if (!id_cliente) {
                return next(new AppError('No se proporcionó el ID del cliente.', 400));
            }

            let clienteObtenido = await clientesDAO.obtenerClientePorId(id_cliente);

            if (!clienteObtenido && correo_usuario) {
                const USUARIOS_SERVICE_URL = process.env.USUARIOS_SERVICE_URL || 'http://127.0.0.1:3001';

                try {
                    const response = await fetch(`${USUARIOS_SERVICE_URL}/api/usuarios/sincronizar?correo=${encodeURIComponent(correo_usuario)}`);

                    if (response.ok) {
                        const data = await response.json();
                        if (data.ok && data.usuario) {
                            const usuarioReplicado = await usuariosDAO.crearUsuarioReplicado(data.usuario);

                            await clientesDAO.registrarCliente(usuarioReplicado.id);

                            id_cliente = usuarioReplicado.id;
                            clienteObtenido = true;
                        }
                    }
                } catch (error) {
                    console.error("Error en sincronización ISC:", error.message);
                }
            }

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
                if (noDisponibles.length > 1) {
                    return next(new AppError(`Los números ${noDisponibles.join(", ")} ya no están disponibles.`, 409));
                }
                return next(new AppError(`El número ${noDisponibles[0]} ya no está disponible.`, 409));
            }

            // GG, sí estaban disponibles los números
            res.status(201).json(numeros);
        } catch (err) {
            console.log(err);
            next(new AppError('Ocurrió un error al apartar los números.', 500));
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
            if (buscar_numero !== null) {
                if (isNaN(buscar_numero) || !Number.isInteger(buscar_numero)) {
                    return next(new AppError("Solo se permiten números enteros.", 400));
                }

                if (buscar_numero < 0 || buscar_numero > rango_numeros) {
                    return next(new AppError(`El número buscado está fuera del rango (1-${rango_numeros})`, 400));
                }
            }
            const resultado = await numerosDAO.obtenerNumerosPorSorteo(id_sorteo);

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
            console.log(err);
            next(new AppError('Ocurrió un error al obtener los números disponibles.', 500));
        }
    }

    /*
    DELETE
    body = {
        numeros: [1, 2, 3, 4],
        id_sorteo: 1
    }
    */
    async liberarNumeros(req, res, next) {
        try {
            const { numeros, id_sorteo } = req.body;
            // Validaciones del sorteo
            if (!id_sorteo) {
                return next(new AppError('No se proporcionó el ID del sorteo.', 400));
            }
            const sorteoObtenido = await sorteosDAO.obtenerSorteoPorId(id_sorteo);
            if (!sorteoObtenido) {
                return next(new AppError(`No se encontró el sorteo con ID: ${id_sorteo}.`, 404));
            }
            if (sorteoObtenido.fecha_realizacion < new Date()) {
                return next(new AppError("El sorteo ya finalizó.", 400));
            }

            // Validaciones de los números
            if (!numeros) {
                return next(new AppError('No se proporcionó ningún número.', 400));
            }
            if (!Array.isArray(numeros)) {
                return next(new AppError('El campo "numeros" debe ser un arreglo.', 400));
            }
            const noNumeros = numeros.filter(n => typeof n !== "number" || !Number.isInteger(n));
            if (noNumeros.length > 0) {
                return next(new AppError('Solo se permiten números enteros.', 400));
            }
            if (numeros.length === 0) {
                return next(new AppError('No se seleccionó ningún número.', 400));
            }

            const rango_numeros = await sorteosDAO.obtenerRangoNumeros(id_sorteo);
            const fueraDeRango = numeros.filter(n => n < 1 || n > rango_numeros);
            if (fueraDeRango.length > 0) {
                return next(new AppError(`Los siguientes números están fuera del rango permitido (1-${rango_numeros}): ${fueraDeRango.join(', ')}`, 400));
            }

            const resultado = await numerosDAO.liberarNumeros({ numeros, id_sorteo });
            if (!resultado.exito) {
                // Hay números que NO están apartados/no existen
                if (resultado.faltantes?.length > 0) {
                    const faltantes = resultado.faltantes;
                    if (faltantes.length > 1) {
                        return next(new AppError(`Los números ${faltantes.join(", ")} no están apartados o ya fueron liberados.`, 409));
                    }
                    return next(AppError(`El número ${noDisponibles[0]} no está apartado o ya fue liberado.`, 409));
                }

                // Hubo un conflicto de concurrencia
                if (resultado.error) {
                    return next(new AppError(`Conflicto de concurrencia: ${resultado.error}`, 409));
                }
            }
            res.status(200).json(numeros);
        } catch (err) {
            console.log(err);
            next(new AppError('Ocurrió un error al liberar los números.', 500));
        }
    }

    /*
    Para buscar TODOS los números apartados
    GET http://localhost:3000/api/numeros/apartados?sorteo=3

    Para buscar ciertos números apartados
    GET http://localhost:3000/api/numeros/apartados?sorteo=3&buscar=7

    RESPUESTA:
    [
        {
            "numero": 5,
            "id_sorteo": 1,
            "nombre_cliente": "Diego Valenzuela",
            "correo_cliente": "diegovalenzuela@outlook.com",
            "fecha_apartado": "2025-11-16T06:34:24.000Z"
        },
        {
            "numero": 6,
            "id_sorteo": 1,
            "nombre_cliente": "Diego Valenzuela",
            "correo_cliente": "diegovalenzuela@outlook.com",
            "fecha_apartado": "2025-11-16T06:34:24.000Z"
        }
    ]
    */
    async obtenerNumerosApartados(req, res, next) {
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
            if (buscar_numero !== null) {
                if (isNaN(buscar_numero) || !Number.isInteger(buscar_numero)) {
                    return next(new AppError("Solo se permiten números enteros.", 400));
                }

                if (buscar_numero < 0 || buscar_numero > rango_numeros) {
                    return next(new AppError(`El número buscado está fuera del rango (1-${rango_numeros})`, 400));
                }
            }

            const resultado = await numerosDAO.obtenerNumerosApartados(id_sorteo);

            let numerosApartadosFiltrados = [];
            resultado.forEach(num => {
                // Si NO estamos buscando, agregamos todos los apartados
                if (buscar_numero === null) {
                    numerosApartadosFiltrados = [...resultado];
                    return;
                }

                // Si SÍ se está buscando → agregar solo los que contengan el número buscado
                const contieneBusqueda = num.numero.toString().includes(buscar_numero.toString());
                if (contieneBusqueda) {
                    numerosApartadosFiltrados.push({
                        numero: num.numero,
                        id_sorteo: num.id_sorteo,
                        nombre_cliente: num.nombre_cliente,
                        correo_cliente: num.correo_cliente,
                        fecha_apartado: num.fecha_apartado
                    });
                }
            });

            // Respuesta final
            res.status(200).json(numerosApartadosFiltrados);
        } catch (err) {
            console.log(err);
            next(new AppError('Ocurrió un error al obtener los números apartados.', 500));
        }
    }

    async marcarNumerosComoPagados(req, res, next) {
        try {
            const { id_sorteo, numeros } = req.body;

            if (!id_sorteo) {
                return next(new AppError('Se debe proporcionar el id del sorteo.', 400));
            }

            if (!numeros || numeros.length === 0) {
                return next(new AppError('Se debe proporcionar al menos un número.', 400));
            }

            const numerosPendientes = await numerosDAO.obtenerNumerosPendientes(id_sorteo);

            if (!numerosPendientes || numerosPendientes.length === 0) {
                return next(new AppError('El sorteo no cuenta con números pendientes.', 400));
            }

            const estanTodos = numeros.every(numSolicitado =>
                numerosPendientes.some(apartado => apartado.numero === numSolicitado)
            );

            if (!estanTodos) {
                return next(new AppError('Todos los números deben estar marcados como pendientes.', 400));
            }

            await numerosDAO.marcarNumerosComoPagados({ id_sorteo, numeros });

            res.status(200).json({
                ok: true,
                message: 'Se marcaron correctamente como pagados los números.'
            });
        } catch (error) {
            next(new AppError('Ocurrió un error al realizar la operación.', 500));
        }
    }

}

module.exports = new NumerosController();