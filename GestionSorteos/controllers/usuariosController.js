const usuariosDAO = require('../dataAccess/usuariosDAO.js');
const configuracionesDAO = require('../dataAccess/configuracionesDAO.js');
const { AppError } = require('../utils/appError.js');

class UsuariosController {

    constructor() {
        this.obtenerIdPorCorreo = this.obtenerIdPorCorreo.bind(this);
    }

    async obtenerIdPorCorreo(req, res, next) {
        try {
            const { correo } = req.query;

            if (!correo) {
                return next(new AppError('El correo es requerido.', 400));
            }

            const usuario = await usuariosDAO.obtenerUsuarioPorCorreo(correo);

            if (!usuario) {
                return next(new AppError('Usuario no encontrado en este servicio.', 404));
            }

            res.status(200).json({
                id: usuario.id
            });

        } catch (error) {
            console.error(error);
            next(new AppError('Error al buscar el usuario.', 500));
        }
    }

}

module.exports = new UsuariosController();