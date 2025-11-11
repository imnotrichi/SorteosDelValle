const { Usuario } = require('../models/');
const { Organizador } = require('../models/');
const { Cliente } = require('../models/');
const { Op } = require('sequelize');

class UsuariosDAO {

    constructor() { }

    async obtenerUsuarioPorCorreo(correo) {
        try {
            if (!correo) {
                throw new Error('Se debe proporcionar el correo para realizar la consulta.');
            }

            const usuarioObtenido = await Usuario.findOne({
                where: {
                    correo: {
                        [Op.eq]: correo
                    }
                }
            });

            return usuarioObtenido;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new UsuariosDAO();