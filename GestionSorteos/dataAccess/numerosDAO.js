const { Numero } = require('../models');

class NumerosDAO {

    constructor() { }

    async obtenerNumerosPorSorteo(idSorteo) {
        try {
            if (!idSorteo) {
                throw new Error('Se debe proporcionar el id del sorteo para realizar la búsqueda.');
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