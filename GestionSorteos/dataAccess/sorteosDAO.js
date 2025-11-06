const { Sorteo } = require('../models');
const { Premio } = require('../models');
const { Op } = require('sequelize');

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
                    id_sorteo: sorteoCreado.id
                });
            }

            return sorteoCreado;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async obtenerSorteoPorId(id) {
        try {
            const sorteo = await Sorteo.findByPk(id);
            const premios = await Premio.findAll({
                where: {
                    id_sorteo: {
                        [Op.eq]: id
                    }
                }
            })
            return { sorteo, premios };
        } catch (error) {
            throw error;
        }
    }

    async obtenerSorteoPorTitulo(titulo) {
        try {
            console.log('---> TITULO:', titulo);
            const sorteo = await Sorteo.findAll({
                where: {
                    titulo: {
                        [Op.eq]: `${titulo}` //Se usa el operador like para los titulos que coincidan con el mandado en el parámetro
                    }
                },
            });
            const premios = await Premio.findAll({
                where: {
                    id_sorteo: {
                        [Op.eq]: id
                    }
                }
            })
            return { sorteo, premios };
        } catch (error) {
            throw error;
        }
    }

}

module.exports = new SorteosDAO();