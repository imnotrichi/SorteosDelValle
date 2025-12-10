const sorteosDAO = require('../dataAccess/sorteosDAO.js');
const usuariosDAO = require('../dataAccess/usuariosDAO.js');
const organizadoresDAO = require('../dataAccess/organizadoresDAO.js');
const organizadoresSorteosDAO = require('../dataAccess/organizadoresSorteosDAO.js');
const configuracionesDAO = require('../dataAccess/configuracionesDAO.js');
const numerosDAO = require('../dataAccess/numerosDAO.js');
const { AppError } = require('../utils/appError.js');
const { json } = require('express');

class SorteosController {

    constructor() {
        this.crearSorteo = this.crearSorteo.bind(this);
        this.obtenerSorteoPorId = this.obtenerSorteoPorId.bind(this);
        this.obtenerTableroSorteo = this.obtenerTableroSorteo.bind(this);
        this.obtenerSorteoPorTitulo = this.obtenerSorteoPorTitulo.bind(this);
        this.obtenerSorteosPorOrganizador = this.obtenerSorteosPorOrganizador.bind(this);
        this.obtenerSorteosActivos = this.obtenerSorteosActivos.bind(this);
        this.obtenerSorteosFinalizados = this.obtenerSorteosFinalizados.bind(this);
        this.actualizarSorteo = this.actualizarSorteo.bind(this);
        this.eliminarSorteo = this.eliminarSorteo.bind(this);
        this.obtenerSorteosPropios = this.obtenerSorteosPropios.bind(this);

        this.fechaHoy = new Date();
        this.fechaHoy.setHours(0, 0, 0, 0);
    }

    async crearSorteo(req, res, next) {
        try {
            const { titulo,
                descripcion,
                imagen_url,
                rango_numeros,
                inicio_periodo_venta,
                fin_periodo_venta,
                fecha_realizacion,
                precio_numero,
                configuracionData,
                premiosData,
                organizadoresData } = req.body;

            if (!titulo || !descripcion || !imagen_url || rango_numeros == null || !inicio_periodo_venta || !fin_periodo_venta
                || !fecha_realizacion || precio_numero == null || !configuracionData || !premiosData || !organizadoresData) {
                return next(new AppError('Todos los campos son requeridos.', 400));
            }

            const sorteoExistente = await sorteosDAO.obtenerSorteoPorTitulo(titulo);
            if (sorteoExistente) {
                return next(new AppError('Ya existe un sorteo con ese título.', 400));
            }
            if (rango_numeros < 1) return next(new AppError('Se debe ingresar un rango de números mayor a 0.', 400));
            if (precio_numero < 1) return next(new AppError('El precio del número no puede ser menor a 1 peso.', 400));

            const fechaInicioVenta = new Date(inicio_periodo_venta);
            const fechaFinVenta = new Date(fin_periodo_venta);
            if (fechaFinVenta < fechaInicioVenta || fechaFinVenta < this.fechaHoy || fechaInicioVenta < this.fechaHoy) {
                return next(new AppError('Ingrese un periodo válido.', 400));
            }
            const fechaRealizacion = new Date(fecha_realizacion);
            if (fechaRealizacion < this.fechaHoy) {
                return next(new AppError('La fecha de realización del sorteo debe ser válida.', 400));
            }

            if (!Array.isArray(premiosData) || premiosData.length === 0) return next(new AppError('Se deben proporcionar datos válidos para los premios.', 400));
            if (!Array.isArray(organizadoresData) || organizadoresData.length === 0) return next(new AppError('Debe haber al menos un organizador para el sorteo.', 400));

            const organizadores = [];
            const { global, correoOrganizador } = configuracionData;
            let organizadorPrincipal = null;

            const USUARIOS_SERVICE_URL = process.env.USUARIOS_SERVICE_URL || 'http://127.0.0.1:3001';

            for (let i = 0; i < organizadoresData.length; i++) {
                const correoOrg = organizadoresData[i].correo;

                let datosOrganizadorRemoto = null;
                try {
                    const response = await fetch(`${USUARIOS_SERVICE_URL}/api/usuarios/validar-organizador?correo=${correoOrg}`);
                    if (response.ok) {
                        const data = await response.json();
                        if (data.esOrganizador) {
                            datosOrganizadorRemoto = data.usuario;
                        } else {
                            return next(new AppError(`El correo '${correoOrg}' no pertenece a un organizador válido.`, 403));
                        }
                    } else {
                        throw new Error('Error en la respuesta del microservicio');
                    }
                } catch (err) {
                    console.error("Error validando organizador:", err.message);
                    return next(new AppError(`No se pudo validar al organizador '${correoOrg}'. Intente más tarde.`, 500));
                }

                let organizadorLocal = await usuariosDAO.obtenerUsuarioPorCorreo(correoOrg);

                if (!organizadorLocal) {
                    console.log(`Replicando usuario organizador ${correoOrg} localmente...`);
                    organizadorLocal = await usuariosDAO.crearUsuarioReplicado(datosOrganizadorRemoto);
                }
                
                organizadores.push({ id_organizador: organizadorLocal.id });

                if (global && correoOrg === correoOrganizador) {
                    organizadorPrincipal = organizadorLocal;
                }
            }

            let configuracion;
            if (global) {
                if (!organizadorPrincipal) {
                    organizadorPrincipal = await usuariosDAO.obtenerUsuarioPorCorreo(correoOrganizador);
                    if (!organizadorPrincipal) return next(new AppError('El organizador de la configuración no es válido.', 400));
                }

                configuracion = await configuracionesDAO.obtenerConfiguracionGlobalOrganizador(organizadorPrincipal.id);
                if (!configuracion) {
                    configuracion = await configuracionesDAO.obtenerConfiguracionGlobal();
                }
            } else if (!global && (configuracionData.tiempo_limite_apartado && configuracionData.tiempo_recordatorio_pago)) {
                configuracion = await configuracionesDAO.crearConfiguracion(configuracionData);
            } else {
                return next(new AppError('Todos los campos son requeridos.', 400));
            }

            for (const premio of premiosData) {
                if (!premio.titulo || !premio.imagen_premio_url) {
                    return next(new AppError('Todos los campos son requeridos.', 400));
                }
            }

            const sorteoData = {
                titulo,
                descripcion,
                imagen_url,
                rango_numeros,
                inicio_periodo_venta,
                fin_periodo_venta,
                fecha_realizacion,
                precio_numero,
                id_configuracion: configuracion.id,
                Premios: premiosData,
                OrganizadorSorteos: organizadores
            }

            const sorteoCreado = await sorteosDAO.crearSorteo(sorteoData);
            const respuestaJSON = this.#formatearJsonSorteo(sorteoCreado, false);
            res.status(200).json(respuestaJSON);

        } catch (error) {
            console.error("Error FATAL en crearSorteo:", error);
            next(new AppError('Ocurrió un error al crear el sorteo', 500));
        }
    }

    async obtenerTableroSorteo(req, res, next) {
        try {
            // Obtenemos el ID del usuario del cuerpo de la solicitud
            const idUsuario = req.params?.idUsuario;
            // Obtenemos el ID del sorteo de la URL
            const idSorteo = req.params?.id;

            // Validación de idUsuario
            if (!idUsuario ||
                (typeof idUsuario === 'string' && idUsuario.trim() === '') ||
                (typeof idUsuario === 'object' && Object.keys(idUsuario).length === 0)) {
                return next(new AppError('Se debe proporcionar un ID de usuario para ver el tablero.', 400));
            }
            if (isNaN(Number(idUsuario))) {
                return next(new AppError('El ID de usuario proporcionado no es válido.', 400));
            }

            if (!idSorteo) { // Si no se proporciona el ID del sorteo
                return next(new AppError('Se debe proporcionar el ID del sorteo para ver el tablero.', 400));
            }
            // Validación de idUsuario
            if (!idSorteo ||
                (typeof idSorteo === 'string' && idSorteo.trim() === '') ||
                (typeof idSorteo === 'object' && Object.keys(idSorteo).length === 0)) {
                return next(new AppError('Se debe proporcionar un ID de sorteo para ver el tablero.', 400));
            }
            if (isNaN(Number(idSorteo))) {
                return next(new AppError('El ID del sorteo proporcionado no es válido.', 400));
            }

            const sorteo = await sorteosDAO.obtenerSorteoPorId(idSorteo);
            if (!sorteo) { // Si no se encuentra el sorteo
                return next(new AppError('No se encontró el sorteo solicitado.', 404));
            }

            const usuario = await usuariosDAO.obtenerUsuarioPorId(idUsuario);
            if (!usuario) { // Si no se encuentra el usuario
                return next(new AppError('No se encontró el usuario.', 404));
            }

            const organizadoresSorteo = await organizadoresSorteosDAO.obtenerOrganizadoresSorteo(idSorteo);
            const idUsuarioNum = Number(idUsuario);

            const esOrganizador = organizadoresSorteo.some(
                orgSor => orgSor.id_organizador === idUsuarioNum
            );

            if (!esOrganizador) {
                return next(new AppError('Usted no tiene los permisos para ver el tablero del sorteo.', 403));
            }

            // Calculamos los datos que se mostrarán en el tablero
            const numerosSorteo = await numerosDAO.obtenerNumerosPorSorteo(idSorteo);
            let numerosApartados = 0;
            let numerosPagados = 0;
            numerosSorteo.map(numero => {
                if (numero.estado.toLowerCase() === 'apartado') {
                    numerosApartados++;
                } else if (numero.estado.toLowerCase() === 'pagado') {
                    numerosPagados++;
                }
            })
            const numerosDisponibles = sorteo.rango_numeros - (numerosApartados + numerosPagados);

            const premiosData = sorteo.Premios.map(premio => ({
                titulo: premio.titulo,
                imagen_premio_url: premio.imagen_premio_url
            }));

            // Calcular el estado comparando la fecha de realización con la fecha actual
            const fechaActual = this.fechaHoy;
            let estadoSorteo;
            if (sorteo.fecha_realizacion > fechaActual) {
                estadoSorteo = 'Activo';
            } else {
                estadoSorteo = 'Finalizado';
            }

            // Formateamos la respuesta JSON
            const tableroData = {
                id: sorteo.id,
                titulo: sorteo.titulo,
                descripcion: sorteo.descripcion,
                imagen_url: sorteo.imagen_url,
                boletos_pagados: numerosPagados,
                boletos_apartados: numerosApartados,
                boletos_disponibles: numerosDisponibles,
                dinero_recaudado: (sorteo.precio_numero * numerosPagados).toFixed(2),
                dinero_por_recaudar: (sorteo.precio_numero * numerosApartados).toFixed(2),
                fin_periodo_venta: this.#formatearFecha(sorteo.fin_periodo_venta),
                fecha_realizacion: this.#formatearFecha(sorteo.fecha_realizacion),
                precio_numero: sorteo.precio_numero,
                estado: estadoSorteo,
                premios: premiosData,
            };

            res.status(200).json(tableroData);
        } catch (error) {
            console.log(error);
            next(new AppError('Ocurrió un error al obtener el sorteo.', 500));
        }
    }
    async obtenerSorteoPorId(req, res, next) {
        try {
            const idSorteo = req.params.id;

            if (!idSorteo) {
                next(new AppError('Se debe proporcionar el id para realizar la búsqueda.', 400));
            }

            const numerosExist = await numerosDAO.obtenerNumerosPorSorteo(idSorteo);

            const sorteo = await sorteosDAO.obtenerSorteoPorId(idSorteo);
            const respuestaJSON = this.#formatearJsonSorteo(sorteo, numerosExist.length);
            res.status(200).json(respuestaJSON);
        } catch (error) {
            console.log(error);
            next(new AppError('Ocurrió un error al obtener el sorteo.', 500));
        }
    }

    async obtenerSorteoPorTitulo(req, res, next) {
        try {
            const titulo = req.query.titulo;

            if (!titulo) {
                next(new AppError('Asegúrese de enviar el título para realizar la búsqueda.', 400));
            }

            const sorteo = await sorteosDAO.obtenerSorteoPorTitulo(titulo);

            const numerosExist = await numerosDAO.obtenerNumerosPorSorteo(sorteo.id);
            const existe = numerosExist.length > 0;

            const respuestaJSON = this.#formatearJsonSorteo(sorteo, numerosExist.length);
            res.status(200).json(respuestaJSON);
        } catch (error) {
            console.log(error);
            next(new AppError('Ocurrió un error al obtener el sorteo.', 500));
        }
    }

    async obtenerSorteosPorOrganizador(req, res, next) {
        try {
            const idOrganizador = req.params.id;

            if (!idOrganizador) {
                next(new AppError('Se debe especificar el id del organizador para realizar la búsqueda.', 400));
            }

            const sorteos = await sorteosDAO.obtenerSorteosPorOrganizador(idOrganizador);

            let respuestaJSON = [];
            for (const sorteo of sorteos) {
                const numerosExist = await numerosDAO.obtenerNumerosPorSorteo(sorteo.id);
                const existe = numerosExist.length > 0;

                respuestaJSON.push(this.#formatearJsonSorteo(sorteo, numerosExist.length));
            }

            res.status(200).json(respuestaJSON);
        } catch (error) {
            console.log(error)
            next(new AppError('Ocurrió un error al obtener los sorteos.', 500));
        }
    }

    async obtenerSorteosActivos(req, res, next) {
        try {
            const sorteos = await sorteosDAO.obtenerSorteosActivos();

            let respuestaJSON = [];
            for (const sorteo of sorteos) {
                const numerosExist = await numerosDAO.obtenerNumerosPorSorteo(sorteo.id);
                const existe = numerosExist.length > 0;

                respuestaJSON.push(this.#formatearJsonSorteo(sorteo, numerosExist.length));
            }

            res.status(200).json(respuestaJSON);
        } catch (error) {
            next(new AppError('Ocurrió un error al obtener los sorteos.', 500));
        }
    }

    async obtenerSorteosFinalizados(req, res, next) {
        try {
            const sorteos = await sorteosDAO.obtenerSorteosFinalizados();

            let respuestaJSON = [];
            for (const sorteo of sorteos) {
                const numerosExist = await numerosDAO.obtenerNumerosPorSorteo(sorteo.id);
                const existe = numerosExist.length > 0;

                respuestaJSON.push(this.#formatearJsonSorteo(sorteo, numerosExist.length));
            }

            res.status(200).json(respuestaJSON);
        } catch (error) {
            next(new AppError('Ocurrió un error al obtener los sorteos.', 500));
        }
    }

    async actualizarSorteo(req, res, next) {
        try {
            const idSorteo = req.params.id;

            if (!idSorteo) return next(new AppError('Es necesario el id del sorteo para actualizarlo.', 400));

            const sorteoExists = await sorteosDAO.obtenerSorteoPorId(idSorteo);
            if (!sorteoExists) return next(new AppError('El sorteo no existe.', 404));
            if (sorteoExists.fecha_realizacion < this.fechaHoy) return next(new AppError('No se puede actualizar este sorteo porque ya pasó.', 400));

            const {
                descripcion, imagen_url, rango_numeros, inicio_periodo_venta, fin_periodo_venta,
                fecha_realizacion, precio_numero, configuracionData, organizadoresData, premiosData
            } = req.body;

            if (!descripcion && !imagen_url && rango_numeros == null && !inicio_periodo_venta &&
                !fin_periodo_venta && !fecha_realizacion && !configuracionData && !organizadoresData) {
                return next(new AppError('No se proporcionó ningún dato para realizar la actualización.', 400));
            }

            const numerosExist = await numerosDAO.obtenerNumerosPorSorteo(sorteoExists.id);
            const existe = numerosExist.length > 0;

            if (existe) {
                if (rango_numeros < 1) return next(new AppError('Se debe ingresar un rango de números mayor a 0.', 400));
                if (sorteoExists.rango_numeros > rango_numeros) return next(new AppError('Solo se puede aumentar el rango de números ya que el sorteo cuenta con números vendidos.', 405));
            }

            if (premiosData) {
                if (existe) {
                    return next(new AppError('No se pueden modificar los premios del sorteo porque ya hay números vendidos.', 405));
                }
            }
            
            if (precio_numero) {
                if (existe) {
                    return next(new AppError('No se pueden modificar el precio del número porque ya hay números vendidos.', 405));
                }
            }

            const fechaInicioVentaBoletosOriginal = new Date(sorteoExists.inicio_periodo_venta);

            if (this.fechaHoy > fechaInicioVentaBoletosOriginal && inicio_periodo_venta) {

                const seEstaCambiandoLaFecha = new Date(inicio_periodo_venta).getTime() !== fechaInicioVentaBoletosOriginal.getTime();

                if (seEstaCambiandoLaFecha && existe) {
                    return next(new AppError('No se puede modificar la fecha de incio de venta de boletos ya que el sorteo cuenta con números vendidos.', 405));
                }
            }

            if (rango_numeros <= 0) return next(new AppError('El rango no puede ser menor a 1.', 400));

            const fechaInicioVenta = new Date(inicio_periodo_venta);
            const fechaFinVenta = new Date(fin_periodo_venta);
            if (fechaFinVenta < fechaInicioVenta || fechaFinVenta < this.fechaHoy) return next(new AppError('Ingrese un periodo válido.', 400));

            const fechaRealizacionDate = new Date(fecha_realizacion);
            if (fechaRealizacionDate < this.fechaHoy) return next(new AppError('La fecha de realización del sorteo debe ser válida.', 400));

            const organizadores = [];
            const USUARIOS_SERVICE_URL = process.env.USUARIOS_SERVICE_URL || 'http://localhost:3001';

            if (organizadoresData !== undefined) {
                if (!Array.isArray(organizadoresData) || organizadoresData.length === 0) {
                    return next(new AppError('Debe haber al menos un organizador para el sorteo.', 400));
                }

                for (let i = 0; i < organizadoresData.length; i++) {
                    const correoOrg = organizadoresData[i].correo;
                    if (!correoOrg) continue;

                    let organizadorObtenido = await usuariosDAO.obtenerUsuarioPorCorreo(correoOrg);

                    if (!organizadorObtenido) {
                        console.log(`Buscando ${correoOrg} en microservicio...`);
                        try {
                            const url = new URL(`${USUARIOS_SERVICE_URL}/api/usuarios/sincronizar`);
                            url.searchParams.append('correo', correoOrg);
                            const response = await fetch(url.toString(), { method: 'GET', headers: { 'Content-Type': 'application/json' } });

                            if (response.ok) {
                                const data = await response.json();
                                if (data.ok && data.usuario) {
                                    organizadorObtenido = await usuariosDAO.crearUsuarioReplicado(data.usuario);
                                }
                            }
                        } catch (error) {
                            console.error(`Error al sincronizar usuario ${correoOrg}:`, error.message);
                        }
                    }

                    if (!organizadorObtenido) {
                        return next(new AppError(`No hay un organizador registrado con el correo ${correoOrg}`, 400));
                    }

                    const esOrganizador = await organizadoresDAO.obtenerOrganizadorPorId(organizadorObtenido.id);

                    console.log("HOLA DESDE CONTROLER, EL USAURIO:" + esOrganizador);
                    if (!esOrganizador) {
                        return next(new AppError(`El usuario con correo '${correoOrg}' existe pero no es un organizador autorizado.`, 403));
                    }

                    organizadores.push({ id_organizador: organizadorObtenido.id });
                }
            }

            let configuracion = null;
            if (configuracionData !== undefined) {
                if (typeof configuracionData !== 'object' || configuracionData === null) return next(new AppError('configuracion debe ser un objeto válido.', 400));

                const { global, correoOrganizador, tiempo_limite_apartado, tiempo_recordatorio_pago } = configuracionData;

                if (global === true) {
                    if (!correoOrganizador) return next(new AppError('El correo del organizador es requerido.', 400));
                    const organizador = await usuariosDAO.obtenerUsuarioPorCorreo(correoOrganizador);
                    if (!organizador) return next(new AppError('No hay un organizador registrado con ese correo.', 400));
                    configuracion = await configuracionesDAO.obtenerConfiguracionGlobalOrganizador(organizador.id) ?? await configuracionesDAO.obtenerConfiguracionGlobal();
                } else if (global === false) {
                    if (!tiempo_limite_apartado || !tiempo_recordatorio_pago) return next(new AppError('Todos los campos son requeridos.', 400));
                    configuracion = await configuracionesDAO.crearConfiguracion(configuracionData);
                }
            }

            const sorteoData = {
                descripcion, imagen_url, rango_numeros, inicio_periodo_venta, fin_periodo_venta, fecha_realizacion, precio_numero, premiosData,
                id_configuracion: configuracion?.id,
                OrganizadorSorteos: organizadores.length > 0 ? organizadores : undefined
            }

            await sorteosDAO.actualizarSorteo(idSorteo, sorteoData);

            const sorteoActualizadoCompleto = await sorteosDAO.obtenerSorteoPorId(idSorteo);

            const respuestaJSON = this.#formatearJsonSorteo(sorteoActualizadoCompleto, existe);
            res.status(200).json(respuestaJSON);
        } catch (error) {
            console.log(error);
            next(new AppError('Ocurrió un error al actualizar el sorteo.', 500));
        }
    }

    async eliminarSorteo(req, res, next) {
        try {
            const idSorteo = req.params.id;

            if (!idSorteo) {
                return next(new AppError('Es necesario el id del sorteo para eliminarlo.', 400));
            }

            const sorteoExists = await sorteosDAO.obtenerSorteoPorId(idSorteo);
            if (!sorteoExists) {
                return next(new AppError('El sorteo no existe.', 404));
            }

            if (sorteoExists.fecha_realizacion < this.fechaHoy) {
                return next(new AppError('No se puede eliminar este sorteo porque ya pasó.', 405));
            }

            const numerosSorteo = await numerosDAO.obtenerNumerosPorSorteo(idSorteo);
            if (!Array.isArray(numerosSorteo) || numerosSorteo.length > 0) {
                return next(new AppError('No se puede eliminar este sorteo porque ya hay números vendidos.', 405));
            }

            await sorteosDAO.eliminarSorteo(idSorteo);
            res.status(200).json('Se eliminió el sorteo correctamente.');
        } catch (error) {
            next(new AppError('Ocurrió un error al eliminar el sorteo.', 500));
        }
    }

    async obtenerSorteosPropios(req, res, next) {
        try {
            const { correo } = req.query;

            if (!correo) {
                return next(new AppError('Se requiere el correo para buscar los sorteos.', 400));
            }

            const usuarioLocal = await usuariosDAO.obtenerUsuarioPorCorreo(correo);

            if (!usuarioLocal) {
                return res.status(200).json([]);
            }

            const sorteos = await sorteosDAO.obtenerSorteosPorOrganizador(usuarioLocal.id);

            let respuestaJSON = [];
            for (const sorteo of sorteos) {
                const numerosExist = await numerosDAO.obtenerNumerosPorSorteo(sorteo.id);
                respuestaJSON.push(this.#formatearJsonSorteo(sorteo, numerosExist.length));
            }

            res.status(200).json(respuestaJSON);

        } catch (error) {
            console.error(error);
            next(new AppError('Error al obtener los sorteos propios.', 500));
        }
    }

    #formatearJsonSorteo(jsonSorteo, numeros_vendidos) {
        const premios = [];
        jsonSorteo.Premios.forEach(premio => {
            const premioObtenido = {
                id: premio.id,
                titulo: premio.titulo,
                imagen_premio_url: premio.imagen_premio_url,
            }

            premios.push(premioObtenido);
        });

        const organizadores = [];
        jsonSorteo.OrganizadorSorteos.forEach(organizador => {
            const organizadorObtenido = {
                id: organizador.id_organizador,
                correo: organizador.Organizador.Usuario.correo
            }

            organizadores.push(organizadorObtenido);
        });

        const sorteoData = {
            id: jsonSorteo.id,
            titulo: jsonSorteo.titulo,
            descripcion: jsonSorteo.descripcion,
            imagen_url: jsonSorteo.imagen_url,
            rango_numeros: jsonSorteo.rango_numeros,
            inicio_periodo_venta: this.#formatearFecha(jsonSorteo.inicio_periodo_venta),
            fin_periodo_venta: this.#formatearFecha(jsonSorteo.fin_periodo_venta),
            fecha_realizacion: this.#formatearFecha(jsonSorteo.fecha_realizacion),
            precio_numero: jsonSorteo.precio_numero,
            numeros_vendidos: numeros_vendidos,
            premiosData: premios,
            organizadoresData: organizadores,
            configuracionData: {
                id: jsonSorteo.Configuracion.id,
                tiempo_limite_apartado: jsonSorteo.Configuracion.tiempo_limite_apartado,
                tiempo_recordatorio_pago: jsonSorteo.Configuracion.tiempo_recordatorio_pago
            }
        }

        return sorteoData;
    }
    // Función auxiliar para formatear fechas
    #formatearFecha = (fechaISO) => {
        if (!fechaISO) return null;
        const fecha = new Date(fechaISO);

        // Configura aquí tu zona horaria (ej. 'America/Mexico_City', 'America/Hermosillo', etc.)
        return fecha.toLocaleString('es-MX', {
            timeZone: 'America/Mexico_City',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true // Pone AM/PM
        });
    };
}
module.exports = new SorteosController();
