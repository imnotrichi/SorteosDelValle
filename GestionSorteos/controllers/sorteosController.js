const sorteosDAO = require('../dataAccess/sorteosDAO.js');
const usuariosDAO = require('../dataAccess/usuariosDAO.js');
const { AppError } = require('../utils/appError.js');

class SorteosController {

    constructor() { }

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
                id_configuracion,
                Premios,
                organizadores } = req.body;

            if (!titulo || !descripcion || !imagen_url || rango_numeros == null || !inicio_periodo_venta || !fin_periodo_venta
                || !fecha_realizacion || precio_numero == null || !id_configuracion || !Premios || !organizadores) {
                return next(new AppError('Todos los campos son requeridos.', 404));
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

            if (!Array.isArray(Premios) || Premios.length === 0) {
                return next(new AppError('Se deben proporcionar datos válidos para los premios.', 404));
            }

            if (!Array.isArray(Premios) || Premios.length === 0) {
                return next(new AppError('Debe haber al menos un organizador para el sorteo.', 404));
            }

            for (const premio of Premios) {
                if (!premio.titulo || !premio.imagen_premio_url) {
                    return next(new AppError('Todos los campos son requeridos.', 400));
                }
            }

            const sorteoExistente = await sorteosDAO.obtenerSorteoPorTitulo(titulo);
            if (sorteoExistente) {
                return next(new AppError('Ya existe un sorteo con ese título.', 400));
            }

            const OrganizadorSorteos = [];
            for (let i = 0; i < organizadores.length; i++) {
                const organizadorObtenido = await usuariosDAO.obtenerUsuarioPorCorreo(organizadores[i].correo);
                OrganizadorSorteos.push({ id_organizador: organizadorObtenido.id });
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
                id_configuracion,
                Premios,
                OrganizadorSorteos
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
                next(new AppError('Se debe proporcionar el id para realizar la búsqueda.', 404));
            }

            const sorteo = await sorteosDAO.obtenerSorteoPorId(idSorteo);
            res.status(200).json(sorteo);
        } catch (error) {
            next(new AppError('Ocurrió un error al obtener el sorteo.', 500));
        }
    }

    async obtenerSorteoPorTitulo(req, res, next) {
        try {
            const titulo = req.query.titulo;

            if (!titulo) {
                next(new AppError('Asegúrese de enviar el título para realizar la búsqueda.', 404));
            }

            const sorteo = await sorteosDAO.obtenerSorteoPorTitulo(titulo);
            res.status(200).json(sorteo);
        } catch (error) {
            next(new AppError('Ocurrió un error al obtener el sorteo.', 500));
        }
    }

    async obtenerSorteosPorOrganizador(req, res, next) {
        try {
            const idOrganizador = req.params.id;

            if (!idOrganizador) {
                next(new AppError('Se debe especificar el id del organizador para realizar la búsqueda.', 404));
            }

            const sorteos = await sorteosDAO.obtenerSorteosPorOrganizador(idOrganizador);
            res.status(200).json(sorteos);
        } catch (error) {
            next(new AppError('Ocurrió un error al obtener los sorteos.', 500));
        }
    }

    async obtenerSorteosActivos(req, res, next) {
        try {
            const sorteos = await sorteosDAO.obtenerSorteosActivos();
            res.status(200).json(sorteos);
        } catch (error) {
            next(new AppError('Ocurrió un error al obtener los sorteos.', 500));
        }
    }

    async obtenerSorteosFinalizados(req, res, next) {
        try {
            const sorteos = await sorteosDAO.obtenerSorteosFinalizados();
            res.status(200).json(sorteos);
        } catch (error) {
            next(new AppError('Ocurrió un error al obtener los sorteos.', 500));
        }
    }

    async actualizarSorteo(req, res, next) {
        try {
            const idSorteo = req.params.id;

            if (!idSorteo) {
                next(new AppError('Es necesario el id del sorteo para actualizarlo.', 404));
            }

            const sorteoExists = await sorteosDAO.obtenerSorteoPorId(idSorteo);
            if (!sorteoExists) {
                next(new AppError('El sorteo no existe.', 404));
            }

            const sorteoData = req.body;
            if (!sorteoData) {
                next(new AppError('No se proporcionó ningún dato para realizar la actualización.', 404));
            }

            const sorteoActualizado = await sorteosDAO.actualizarSorteo(idSorteo, sorteoData);
            res.status(200).json(sorteoActualizado);
        } catch (error) {
            next(new AppError('Ocurrió un error al actualizar el sorteo.', 500));
        }
    }

    async eliminarSorteo(req, res, next) {
        try {
            const idSorteo = req.params.id;

            if (!idSorteo) {
                next(new AppError('Es necesario el id del sorteo para eliminarlo.', 404));
            }

            const sorteoExists = await sorteosDAO.obtenerSorteoPorId(idSorteo);
            if (!sorteoExists) {
                next(new AppError('El sorteo no existe.', 404));
            }

            await sorteosDAO.eliminarSorteo(idSorteo);
            res.status(200).json('Se eliminió el sorteo correctamente.');
        } catch (error) {
            next(new AppError('Ocurrió un error al eliminar el sorteo.', 500));
        }
    }

}

module.exports = new SorteosController();