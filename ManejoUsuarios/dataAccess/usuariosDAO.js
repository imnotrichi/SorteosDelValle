const { Usuario, Cliente } = require('../models/');
const { sequelize } = require('../models');
const { Op } = require('sequelize');

class UsuariosDAO {

    constructor() { }

    async registrarCliente(clienteData) {

        const t = await sequelize.transaction();
        try {
            const nuevoUsuario = await Usuario.create(
                clienteData,
                { transaction: t }
            );

            const idUsuario = nuevoUsuario.id;

            await Cliente.create({
                id_usuario: idUsuario,
            }, { transaction: t });

            await t.commit();

            return;
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

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

    async obtenerUsuarioPorTelefono(telefono) {
        try {
            if (!telefono) {
                throw new Error('Se debe proporcionar el teléfono para realizar la consulta.');
            }

            const usuarioObtenido = await Usuario.findOne({
                where: {
                    telefono: {
                        [Op.eq]: telefono
                    }
                }
            });

            return usuarioObtenido;
        } catch (error) {
            throw error;
        }
    }

    async #encriptarContrasenia(contrasenia) {
        const saltRounds = 10;
        const hash = await bcrypt.hash(contrasenia, saltRounds);
        return hash;
    }

    #esCorreoValido(correo) {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(correo);
    }

    #esContraseniaValida(contrasenia) {
        const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-=+.?]).{10,}$/;
        return regex.test(contrasenia);
    }

    #esTelefonoValido(telefono) {
        const regex = /^\d{10}$/;
        return regex.test(telefono);
    }

    #esCampoValido(campo) {
        const regex = /^[a-zA-ZÀ-ÿ\s]+$/;
        return regex.test(campo);
    }
}

module.exports = new UsuariosDAO();