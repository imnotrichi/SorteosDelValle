const sorteosDAO = require('../dataAccess/sorteosDAO.js');
const usuariosDAO = require('../dataAccess/usuariosDAO.js');
const configuracionesDAO = require('../dataAccess/configuracionesDAO.js');
const numerosDAO = require('../dataAccess/numerosDAO.js');
const { AppError } = require('../utils/appError.js');
const { json } = require('express');

class SorteosController {

    constructor() {
        this.crearSorteo = this.crearSorteo.bind(this);
        this.obtenerSorteoPorId = this.obtenerSorteoPorId.bind(this);
        this.obtenerSorteoPorTitulo = this.obtenerSorteoPorTitulo.bind(this);
        this.obtenerSorteosPorOrganizador = this.obtenerSorteosPorOrganizador.bind(this);
        this.obtenerSorteosActivos = this.obtenerSorteosActivos.bind(this);
        this.obtenerSorteosFinalizados = this.obtenerSorteosFinalizados.bind(this);
        this.actualizarSorteo = this.actualizarSorteo.bind(this);
        this.eliminarSorteo = this.eliminarSorteo.bind(this);
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

            if (rango_numeros < 1) {
                return next(new AppError('Se debe ingresar un rango de números mayor a 0.', 400));
            }

            const fechaInicioVenta = new Date(inicio_periodo_venta);
            const fechaFinVenta = new Date(fin_periodo_venta);
            if (fechaFinVenta < fechaInicioVenta || fechaFinVenta < new Date() || fechaInicioVenta < new Date()) {
                return next(new AppError('Ingrese un periodo válido.', 400));
            }

            const fechaRealizacion = new Date(fecha_realizacion);
            if (fechaRealizacion < new Date()) {
                return next(new AppError('La fecha de realización del sorteo debe ser válida.', 400));
            }

            if (precio_numero < 1) {
                return next(new AppError('El precio del número no puede ser menor a 1 peso.', 400));
            }

            if (!Array.isArray(premiosData) || premiosData.length === 0) {
                return next(new AppError('Se deben proporcionar datos válidos para los premios.', 400));
            }

            if (!Array.isArray(organizadoresData) || organizadoresData.length === 0) {
                return next(new AppError('Debe haber al menos un organizador para el sorteo.', 400));
            }

            const { global, correoOrganizador } = configuracionData;
            let configuracion;
            if (global) {
                const organizador = await usuariosDAO.obtenerUsuarioPorCorreo(correoOrganizador);
                if (!organizador) {
                    return next(new AppError('No hay un organizador registrado con ese correo.', 400));
                }
                configuracion = await configuracionesDAO.obtenerConfiguracionGlobalOrganizador(organizador.id);
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

            const organizadores = [];
            for (let i = 0; i < organizadoresData.length; i++) {
                const organizadorObtenido = await usuariosDAO.obtenerUsuarioPorCorreo(organizadoresData[i].correo);
                if (!organizadorObtenido) {
                    return next(new AppError('No hay un organizador registrado con ese correo.', 400));
                }
                organizadores.push({ id_organizador: organizadorObtenido.id });
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
            res.status(200).json(sorteoCreado);
        } catch (error) {
            console.log(error);
            next(new AppError('Ocurrió un error al crear el sorteo', 500));
        }
    }

    async obtenerSorteoPorId(req, res, next) {
        try {
            const idSorteo = req.params.id;

            if (!idSorteo) {
                next(new AppError('Se debe proporcionar el id para realizar la búsqueda.', 400));
            }

            const numerosExist = await numerosDAO.obtenerNumerosPorSorteo(idSorteo);
            const existe = numerosExist.length > 0;

            const sorteo = await sorteosDAO.obtenerSorteoPorId(idSorteo);
            const respuestaJSON = this.#formatearJsonSorteo(sorteo, existe);
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

            const respuestaJSON = this.#formatearJsonSorteo(sorteo, existe);
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

                respuestaJSON.push(this.#formatearJsonSorteo(sorteo, existe));
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

                respuestaJSON.push(this.#formatearJsonSorteo(sorteo, existe));
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

                respuestaJSON.push(this.#formatearJsonSorteo(sorteo, existe));
            }

            res.status(200).json(respuestaJSON);
        } catch (error) {
            next(new AppError('Ocurrió un error al obtener los sorteos.', 500));
        }
    }

    async actualizarSorteo(req, res, next) {
        try {
            const idSorteo = req.params.id;

            if (!idSorteo) {
                return next(new AppError('Es necesario el id del sorteo para actualizarlo.', 400));
            }

            const sorteoExists = await sorteosDAO.obtenerSorteoPorId(idSorteo);
            if (!sorteoExists) {
                return next(new AppError('El sorteo no existe.', 404));
            }

            const {
                descripcion,
                imagen_url,
                rango_numeros,
                inicio_periodo_venta,
                fin_periodo_venta,
                fecha_realizacion,
                configuracionData,
                organizadoresData } = req.body;

            if (!descripcion && !imagen_url && rango_numeros == null && !inicio_periodo_venta &&
                !fin_periodo_venta && !fecha_realizacion && !configuracionData && !organizadoresData) {
                return next(new AppError('No se proporcionó ningún dato para realizar la actualización.', 400));
            }

            const numerosExist = await numerosDAO.obtenerNumerosPorSorteo(sorteoExists.id);
            const existe = numerosExist.length > 0;

            if (existe) {
                if (rango_numeros < 1) {
                    return next(new AppError('Se debe ingresar un rango de números mayor a 0.', 400));
                }

                if (sorteoExists.rango_numeros > rango_numeros) {
                    return next(new AppError('Solo se puede aumentar el rango de números ya que el sorteo cuenta con números vendidos.', 405));
                }

                const fechaInicioVentaBoletos = new Date(inicio_periodo_venta);
                if (fechaInicioVentaBoletos < new Date(sorteoExists.inicio_periodo_venta)) {
                    return next(new AppError('No se puede modificar la fecha de incio de venta de boletos ya que el sorteo cuenta con números vendidos.', 405));
                }
            }

            if (rango_numeros <= 0) {
                return next(new AppError('El rango no puede ser menor a 1.', 400));
            }

            const fechaInicioVenta = new Date(inicio_periodo_venta);
            const fechaFinVenta = new Date(fin_periodo_venta);
            if (fechaFinVenta < fechaInicioVenta || fechaFinVenta < new Date() || fechaInicioVenta < new Date()) {
                return next(new AppError('Ingrese un periodo válido.', 400));
            }

            const fechaRealizacion = new Date(fecha_realizacion);
            if (fechaRealizacion < new Date()) {
                return next(new AppError('La fecha de realización del sorteo debe ser válida.', 400));
            }

            if (!Array.isArray(organizadoresData) || organizadoresData.length === 0) {
                return next(new AppError('Debe haber al menos un organizador para el sorteo.', 400));
            }

            const organizadores = [];
            for (let i = 0; i < organizadoresData.length; i++) {
                const organizadorObtenido = await usuariosDAO.obtenerUsuarioPorCorreo(organizadoresData[i].correo);
                organizadores.push({ id_organizador: organizadorObtenido.id });
            }

            const { global, correoOrganizador } = configuracionData;
            let configuracion;
            if (global) {
                const organizador = await usuariosDAO.obtenerUsuarioPorCorreo(correoOrganizador);
                if (!organizador) {
                    return next(new AppError('No hay un organizador registrado con ese correo.', 400));
                }
                configuracion = await configuracionesDAO.obtenerConfiguracionGlobalOrganizador(organizador.id);
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
                descripcion,
                imagen_url,
                rango_numeros,
                inicio_periodo_venta,
                fin_periodo_venta,
                fecha_realizacion,
                id_configuracion: configuracion.id,
                OrganizadorSorteos: organizadores
            }

            const sorteoActualizado = await sorteosDAO.actualizarSorteo(idSorteo, sorteoData);
            res.status(200).json(sorteoActualizado);
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

            if (sorteoExists.fecha_realizacion < new Date()) {
                return next(new AppError('No se puede eliminar este sorteo ya pasó.', 405));
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
            inicio_periodo_venta: jsonSorteo.inicio_periodo_venta,
            fin_periodo_venta: jsonSorteo.fin_periodo_venta,
            fecha_realizacion: jsonSorteo.fecha_realizacion,
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

}

module.exports = new SorteosController();