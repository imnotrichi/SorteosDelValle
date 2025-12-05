const { Usuario } = require('../models/');
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

    async obtenerUsuarioPorId(id) {
        try {
            if (!id) {
                throw new Error('Se debe proporcionar el id para realizar la consulta.');
            }

            const usuarioObtenido = await Usuario.findOne({
                where: {
                    id
                }
            });

            return usuarioObtenido;
        } catch (error) {
            throw error;
        }
    }

    async crearUsuarioReplicado(datosUsuario) {
        try {
            const [usuario, created] = await Usuario.findOrCreate({
                where: { correo: datosUsuario.correo },
                defaults: {
                    nombres: datosUsuario.nombres,
                    apellido_paterno: datosUsuario.apellido_paterno,
                    apellido_materno: datosUsuario.apellido_materno || '', 
                }
            });
            return usuario;
        } catch (error) {
            console.error("Error al replicar usuario en BD local:", error);
            throw error;
        }
    }
}

module.exports = new UsuariosDAO();