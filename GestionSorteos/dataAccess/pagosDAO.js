const { Numero, Sorteo, Usuario, Cliente, Pago, PagoConComprobante, sequelize } = require('../models');
const { Op } = require('sequelize');

class PagosDAO {

    constructor() { }

    async obtenerPagosPorSorteo(idSorteo) {
        try {
            if (!idSorteo) {
                throw new Error('Se debe proporcionar el id del sorteo para realizar la búsqueda.');
            }

            const pagos = await Numero.findAll({
                where:{
                    id_sorteo: idSorteo
                },
                include: [
                    {
                        model: Pago,
                        as: 'Pago',
                        required: true,
                        include: [
                            {
                                model: PagoConComprobante,
                                as: 'PagoConComprobante'
                            }
                        ]
                    },
                    {
                        model: Sorteo,
                        as: 'Sorteo'
                    },
                    {
                        model: Cliente,
                        as: 'Cliente',
                        include: [
                            {
                                model: Usuario,
                                as: 'Usuario'
                            }
                        ]
                    }
                ]
            });

            return pagos;
        } catch (error) {
            throw error;
        }
    }

    async registrarComprobantePago({ id_sorteo, numeros, monto, url_comprobante }) {
        let t;

        try {
            const numerosObtenidos = await Numero.findAll({
                where: {
                    id_sorteo,
                    numero: {
                        [Op.in]: numeros
                    },
                    estado: "APARTADO"
                }
            });

            if (!numerosObtenidos || numerosObtenidos.length === 0) {
                throw new Error('No se encontró ninguno de los números proporcionados.');
            }

            t = await sequelize.transaction();

            const pago = await Pago.create(
                { monto_total: monto },
                { transaction: t }
            );

            await Numero.update(
                {
                    estado: "PENDIENTE",
                    id_pago: pago.id
                },
                {
                    where: {
                        id_sorteo,
                        numero: {
                            [Op.in]: numeros
                        }
                    },
                    transaction: t
                }
            );

            await PagoConComprobante.create(
                {
                    id_pago: pago.id,
                    img_comprobante_url: url_comprobante
                },
                { transaction: t }
            );

            t.commit();

            return 'Se registró correctamente el pago.';
        } catch (error) {
            if (t) await t.rollback();
            throw error;
        }
    }

}

module.exports = new PagosDAO();