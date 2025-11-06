const { Sorteo } = require('../models');
const { Premio } = require('../models');

class SorteosDAO {

    constructor() { }

    async crearSorteo(sorteoData) {
        try {
            const sorteoCreado = await Sorteo.create({
                ...sorteoData
            });

            for (let i = 0; i < sorteoData.premios.length; i++) {
                await Premio.create({ 
                    titulo: sorteoData.premioData[i].titulo, 
                    imagen_premio_url: sorteoData.premioData[i].imagen_url, 
                    id_sorteo: sorteoCreado.id });
            }
        } catch (error) {
            throw error;
        }
    }

}

module.exports = new SorteosDAO();