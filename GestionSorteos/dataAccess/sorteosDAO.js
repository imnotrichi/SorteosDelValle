const { Sorteo } = require('../models');
const { Premio } = require('../models');
const { OrganizadorSorteo } = require('../models/');
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

            for (let i = 0; i < sorteoData.organizadores.length; i++) {
                await OrganizadorSorteo.create({
                    id_organizador: sorteoData.organizadores[i].id_usuario,
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

            const sorteo = await Sorteo.findOne({
                where: {
                    titulo: {
                        [Op.eq]: titulo
                    }
                },
            });

            // 2. VERIFICAR si se encontró el sorteo
            if (!sorteo) {
                // Si no se encuentra, devuelve null o un objeto vacío
                console.log('Sorteo no encontrado');
                return null; // O return { sorteo: null, premios: [] };
            }

            // 3. Ahora sorteo.id es válido
            const premios = await Premio.findAll({
                where: {
                    id_sorteo: {
                        [Op.eq]: sorteo.id
                    }
                }
            });

            return { sorteo, premios };

        } catch (error) {
            console.error("Error al obtener sorteo por título:", error); // Es mejor loguear el error
            throw error;
        }
    }

}

module.exports = new SorteosDAO();