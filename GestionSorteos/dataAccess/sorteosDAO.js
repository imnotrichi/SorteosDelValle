const { Sorteo } = require('../models');
const { Premio } = require('../models');

class SorteosDAO {

    constructor() { }

    async crearSorteo(sorteoData) {
        try {
            const sorteoCreado = await Sorteo.create({
                ...sorteoData
            });

            for (let i = 0; i < sorteoData.premiosData.length; i++) {
                await Premio.create({ 
                    titulo: sorteoData.premiosData[i].titulo, 
                    imagen_premio_url: sorteoData.premiosData[i].imagen_premio_url, 
                    id_sorteo: sorteoCreado.id });
            }

            return sorteoCreado;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

}

module.exports = new SorteosDAO();