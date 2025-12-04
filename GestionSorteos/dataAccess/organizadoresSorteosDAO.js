const { OrganizadorSorteo } = require('../models');
const { Op } = require('sequelize');

class OrganizadoresSorteosDAO {

    constructor() { }

    async obtenerOrganizadoresSorteo(id_sorteo) {
        try {
            if (!id_sorteo) {
                throw new Error('Se debe proporcionar el ID del sorteo para realizar la consulta.');
            }

            const organizadoresSorteoObtenidos = await OrganizadorSorteo.findAll({
                where: {
                    id_sorteo
                }
            });

            return organizadoresSorteoObtenidos;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new OrganizadoresSorteosDAO();