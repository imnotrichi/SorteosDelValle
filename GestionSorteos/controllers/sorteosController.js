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
                premiosData } = req.body;

            if (!titulo || !descripcion || !imagen_url || !rango_numeros || !inicio_periodo_venta || !fin_periodo_venta
                || !fecha_realizacion || !precio_numero || !id_configuracion || !premiosData) {
                next(new AppError('Todos los campos son requeridos.', 404));
            }

            if (rango_numeros < 1) {
                next(new AppError('Se debe ingresar un rango de números mayor a 0.', 404));
            }

            const fechaInicioVenta = new Date(inicio_periodo_venta);
            const fechaFinVenta = new Date(fin_periodo_venta);
            if (fechaFinVenta < fechaInicioVenta || fechaFinVenta < new Date()) {
                next(new AppError('Ingrese un periodo válido.', 404));
            }

            const fechaRealizacion = new Date(fecha_realizacion);
            if (fechaRealizacion < new Date()) {
                next(new AppError('La fecha de realización del sorteo debe ser válida.', 404));
            }

            if (precio_numero < 1) {
                next(new AppError('El precio del número no puede ser menor a 1 peso.', 404));
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
                premiosData
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
                next(new AppError('Asegúrese de enviar el título para realizar la búsqueda', 404));
            }
            const sorteo = await sorteosDAO.obtenerSorteoPorTitulo(titulo);
            res.status(200).json(sorteo);
        } catch (error) {
            next(new AppError('Ocurrió un error al obtener el sorteo.', 500));
        }
    }

}

module.exports = new SorteosController();