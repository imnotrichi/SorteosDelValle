const { Numero, Cliente, Usuario } = require('../models');
const { Op } = require('sequelize');

class NumerosDAO {

    constructor() { }

    async apartarNumeros({ numeros, id_sorteo, id_cliente }) {
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
}

module.exports = new NumerosDAO();