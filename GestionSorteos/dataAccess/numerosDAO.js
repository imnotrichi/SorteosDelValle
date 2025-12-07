const { Numero, Cliente, Usuario, Pago, PagoConComprobante, sequelize } = require('../models');
const { Op } = require('sequelize');
const sorteosDAO = require('../dataAccess/sorteosDAO.js');

class NumerosDAO {

    constructor() { }

    async apartarNumeros({ numeros, id_sorteo, id_cliente }) {
        const sorteo = await sorteosDAO.obtenerSorteoPorId(id_sorteo);
        if (!sorteo) {
            throw new Error(`No se encontró el sorteo con ID ${id_sorteo}.`);
        }
        if (new Date(sorteo.fecha_realizacion) < new Date()) {
            throw new Error("El sorteo ya finalizó.");
        }

        // Verificar si alguno ya existe
        const existentes = await Numero.findAll({
            where: {
                numero: { [Op.in]: numeros },
                id_sorteo
            },
            attributes: ["numero"] // Solo obtener la columna los números
        });

        const noDisponibles = existentes.map(elemento => elemento.numero);

        // Si alguno YA NO está disponible
        if (noDisponibles.length > 0) {
            return {
                exito: false,
                noDisponibles
            };
        }

        // Si TODOS están disponibles, tratar de guardarlos
        const nuevos = numeros.map(num => ({
            numero: num,
            id_sorteo,
            id_cliente,
            estado: "APARTADO"
        }));

        await Numero.bulkCreate(nuevos);

        return { exito: true };
    }

    async liberarNumeros({ numeros, id_sorteo }) {
        const sorteo = await sorteosDAO.obtenerSorteoPorId(id_sorteo);
        if (!sorteo) {
            throw new Error(`No se encontró el sorteo con ID ${id_sorteo}.`);
        }
        if (sorteo.fecha_realización < new Date()) {
            throw new Error("El sorteo ya finalizó.");
        }

        const transaction = await Numero.sequelize.transaction();

        try {
            // Revisar cuántos existen actualmente
            const existentes = await Numero.findAll({
                where: {
                    numero: { [Op.in]: numeros },
                    id_sorteo,
                    estado: "APARTADO"
                },
                attributes: ["numero"],
                lock: transaction.LOCK.UPDATE,
                transaction
            });

            const existentesLista = existentes.map(e => e.numero);

            // Si hay números que no están apartados
            const faltantes = numeros.filter(n => !existentesLista.includes(n));
            if (faltantes.length > 0) {
                await transaction.rollback();
                return {
                    exito: false,
                    faltantes
                };
            }

            // ELIMINACIÓN SEGURA
            const eliminados = await Numero.destroy({
                where: {
                    numero: { [Op.in]: numeros },
                    id_sorteo
                },
                transaction
            });

            // Validamos la concurrencia
            if (eliminados !== numeros.length) {
                // Significa que alguien modificó mientras tratábamos de liberar
                await transaction.rollback();
                return {
                    exito: false,
                    error: "No todos los números pudieron liberarse."
                };
            }

            await transaction.commit();
            return { exito: true };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async obtenerNumerosPorSorteo(id_sorteo) {
        try {
            if (!id_sorteo) {
                throw new Error('Se debe proporcionar el ID del sorteo para realizar la búsqueda.');
            }

            const numeros = await Numero.findAll({
                where: {
                    id_sorteo: id_sorteo
                }
            });
            return numeros;
        } catch (error) {
            throw error;
        }
    }

    async obtenerNumerosApartados(id_sorteo) {
        try {
            if (!id_sorteo) {
                throw new Error('Se debe proporcionar el ID del sorteo para realizar la búsqueda.');
            }

            const numeros = await Numero.findAll({
                where: {
                    id_sorteo,
                    estado: "APARTADO"
                },
                attributes: [
                    "numero",
                    "id_sorteo",
                    "createdAt"       // Fecha de apartado
                ],
                include: [
                    {
                        model: Cliente,
                        attributes: [],  // No queremos columnas separadas
                        include: [
                            {
                                model: Usuario,
                                attributes: [
                                    "correo",
                                    "nombres",
                                    "apellido_paterno"
                                ]
                            }
                        ]
                    }
                ],
                raw: true
            });

            // Combinar nombre completo directamente
            return numeros.map(num => ({
                numero: num.numero,
                id_sorteo: num.id_sorteo,
                nombre_cliente: `${num["Cliente.Usuario.nombres"]} ${num["Cliente.Usuario.apellido_paterno"]}`,
                correo_cliente: num["Cliente.Usuario.correo"],
                fecha_apartado: num.createdAt
            }));
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

module.exports = new NumerosDAO();