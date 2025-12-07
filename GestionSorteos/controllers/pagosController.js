const { AppError } = require('../utils/appError.js');
const pagosDAO = require('../dataAccess/pagosDAO.js');

class PagosController {

    constructor() {
        this.obtenerPagosPorSorteo = this.obtenerPagosPorSorteo.bind(this);
    }

    async obtenerPagosPorSorteo(req, res, next) {
        try {
            const idSorteo = req.params.idSorteo;

            const pagos = await pagosDAO.obtenerPagosPorSorteo(idSorteo);

            res.status(200).json(this.#formatearJsonPagos(pagos));
        } catch (error) {
            console.log(error);
            next(new AppError('Ocurrió un error al obtener los pagos.', 500));
        }

    }

    async registrarComprobantePago(req, res, next) {
        try {
            const { id_sorteo, numeros, url_comprobante } = req.body;

            if (!id_sorteo) {
                return next(new AppError('Se debe proporcionar el id del sorteo.', 400));
            }

            if (!numeros || numeros.length === 0) {
                return next(new AppError('Se debe proporcionar al menos un número.', 400));
            }

            if (!url_comprobante) {
                return next(new AppError('Se debe proporcionar la imagen del comprobante de pago.', 400));
            }

            const sorteo = await sorteosDAO.obtenerSorteoPorId(id_sorteo);

            if (!sorteo) {
                return next(new AppError('El sorteo no existe.', 400));
            }

            const numerosApartados = await numerosDAO.obtenerNumerosApartados(id_sorteo);

            if (!numerosApartados || numerosApartados.length === 0) {
                return next(new AppError('El sorteo no cuenta con números apartados.', 400));
            }

            const estanTodos = numeros.every(numSolicitado =>
                numerosApartados.some(apartado => apartado.numero === numSolicitado)
            );

            if (!estanTodos) {
                return next(new AppError('Todos los números deben estar apartados.', 400));
            }

            const monto = sorteo.precio_numero * numeros.length;

            await pagosDAO.registrarComprobantePago({ id_sorteo, numeros, monto, url_comprobante });

            res.status(200).json('Se registró correctamente el comprobante de pago.');
        } catch (error) {
            next(new AppError('Ocurrió un error al registrar el comprobante de pago.', 500));
        }
    }

    // Función auxiliar para formatear fechas
    #formatearFecha = (fechaISO) => {
        if (!fechaISO) return null;
        const fecha = new Date(fechaISO);

        const fechaFormateada = fecha.toLocaleDateString('es-MX', {
            timeZone: 'America/Mexico_City',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });

        return fechaFormateada.replace(/\//g, '-');
    };

    #formatearJsonPagos(jsonPagos) {
        const pagosData = {};

        jsonPagos.forEach(pagoData => {
            const idPago = pagoData.Pago.id;

            if (!pagosData[idPago]) {
                pagosData[idPago] = {
                    id_pago: idPago,
                    nombres_cliente: pagoData.Cliente.Usuario.nombres,
                    apellido_paterno_cliente: pagoData.Cliente.Usuario.apellido_paterno,
                    correo_cliente: pagoData.Cliente.Usuario.correo,
                    fecha_pago: this.#formatearFecha(pagoData.Pago.fecha),
                    numeros: [],
                    _precio_unitario: pagoData.Sorteo.precio_numero,
                    url_comprobante: pagoData.Pago.PagoConComprobante.img_comprobante_url
                };
            }

            pagosData[idPago].numeros.push(pagoData.numero);
        });

        return Object.values(pagosData).map(pago => {
            pago.total_esperado = pago.numeros.length * pago._precio_unitario;

            delete pago._precio_unitario;

            return pago;
        });
    }
}

module.exports = new PagosController();