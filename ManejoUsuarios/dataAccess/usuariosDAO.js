const { Usuario, Cliente } = require('../models/');
const clientesDAO = require('../dataAccess/clientesDAO.js');
const organizadoresDAO = require('../dataAccess/organizadoresDAO.js');
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

    async obtenerTipoUsuarioPorId(idUsuario) {
        try {
            if (!idUsuario) {
                throw new Error('Se debe proporcionar el ID de usuario para realizar la consulta.');
            }

            const clienteObtenido = await clientesDAO.obtenerClientePorId(idUsuario);
            const organizadorObtenido = await organizadoresDAO.obtenerOrganizadorPorId(idUsuario);
            if (clienteObtenido) {
                return "cliente";
            } else if (organizadorObtenido) {
                return "organizador";
            } else {
                return "desconocido";
            }
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