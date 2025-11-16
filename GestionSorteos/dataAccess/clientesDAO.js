const { Cliente } = require('../models/');
const { Op } = require('sequelize');

class ClientesDAO {

    constructor() { }

    async obtenerClientePorId(id) {
        try {
            if (!id) {
                throw new Error('Se debe proporcionar el ID para realizar la consulta.');
            }

            const clienteObtenido = await Cliente.findOne({
                where: {
                    id_usuario: { [Op.eq]: id }
                }
            });

            return clienteObtenido; // Regresa null si no lo encuentra.
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new ClientesDAO();