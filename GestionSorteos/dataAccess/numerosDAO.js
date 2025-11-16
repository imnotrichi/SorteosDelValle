const { Numero } = require('../models');
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

    async obtenerNumerosPorSorteo(idSorteo) {
        try {
            if (!idSorteo) {
                throw new Error('Se debe proporcionar el ID del sorteo para realizar la búsqueda.');
            }

            const numeros = await Numero.findAll({
                where: {
                    id_sorteo: idSorteo
                }
            });
            return numeros;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new NumerosDAO();