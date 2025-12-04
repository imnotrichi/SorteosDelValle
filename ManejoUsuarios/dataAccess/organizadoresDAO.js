const { Organizador } = require('../models/');
const { Op } = require('sequelize');

class OrganizadoresDAO {

    constructor() { }

    async obtenerOrganizadorPorId(id) {
        try {
            if (!id) {
                throw new Error('Se debe proporcionar el ID para realizar la consulta.');
            }

            const organizadorObtenido = await Organizador.findOne({
                where: {
                    id_usuario: { [Op.eq]: id }
                }
            });

            return organizadorObtenido; // Regresa null si no lo encuentra.
        } catch (error) {
            throw error;
        }
    }

    
}

module.exports = new OrganizadoresDAO();