const sorteosDAO = require('../dataAccess/sorteosDAO.js');
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
                premiosData,
                organizadores } = req.body;

            if (!titulo || !descripcion || !imagen_url || rango_numeros == null || !inicio_periodo_venta || !fin_periodo_venta
                || !fecha_realizacion || precio_numero == null || !id_configuracion || !premiosData || !organizadores) {
                return next(new AppError('Todos los campos son requeridos.', 400));
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
                return next(new AppError('Todos los campos son requeridos.', 400));
            }

            if (!Array.isArray(organizadores) || organizadores.length === 0) {
                return next(new AppError('Debe haber al menos un organizador para el sorteo.', 400));
            }

            for (const premio of premiosData) {
                console.log(premio.titulo)
                if (!premio.titulo || !premio.imagen_premio_url) {
                    return next(new AppError('Todos los campos son requeridos.', 400));
                }
            }
            const sorteoExistente = await sorteosDAO.obtenerSorteoPorTitulo(titulo);
            if (sorteoExistente) {
                return next(new AppError('Ya existe un sorteo con ese título.', 400));
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
                premiosData,
                organizadores
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

            const sorteo = await sorteosDAO.obtenerSorteoPorId(idSorteo);
            res.status(200).json(sorteo);
        } catch (error) {
            next(new AppError('Ocurrió un error al obtener el sorteo.', 500));
        }
    }

    async obtenerSorteoPorTitulo(req, res, next) {
        try {
            const titulo = req.query.titulo;
            console.log('---> TITULO:', titulo);

            if (!titulo) {
                next(new AppError('Asegúrese de enviar el título para realizar la búsqueda', 400));
            }
            const sorteo = await sorteosDAO.obtenerSorteoPorTitulo(titulo);
            res.status(200).json(sorteo);
        } catch (error) {
            next(new AppError('Ocurrió un error al obtener el sorteo.', 500));
        }
    }

}

module.exports = new SorteosController();