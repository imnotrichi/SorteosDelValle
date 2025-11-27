const usuariosDAO = require('../dataAccess/usuariosDAO.js');
const configuracionesDAO = require('../dataAccess/configuracionesDAO.js');
const { AppError } = require('../utils/appError.js');

class UsuariosController {

    constructor() {
        this.registrarUsuario = this.registrarUsuario.bind(this);
    }

    async registrarUsuario(req, res, next) {
        try {
            const {
                nombres,
                apellidoPaterno,
                apellidoMaterno,
                contrasenia,
                telefono,
                fechaNacimiento
            } = req.body;
            const correo = req.body.correo.toLowerCase();

            // Se valida que los campos no vengan vacíos 
            if (
                !nombres?.trim() ||
                !apellidoPaterno?.trim() ||
                !apellidoMaterno?.trim() ||
                !correo?.trim() ||
                !contrasenia?.trim() ||
                !telefono?.trim() ||
                !fechaNacimiento?.trim()
            ) {
                return next(new AppError('Todos los campos son requeridos.', 400));
            }

            // Correo inválido
            if (!this.#esCorreoValido(correo)) return next(new AppError('El formato del correo no es válido.', 400));
            // Longitud de correo
            if (correo.length > 100) return next(new AppError("El correo no puede exceder los 100 caracteres.", 400));
            // Correo duplicado
            if (await usuariosDAO.obtenerUsuarioPorCorreo(correo)) return next(new AppError('El correo proporcionado ya está en uso.', 400));

            // Nombres y apellidos inválidos
            if (!this.#esCampoValido(nombres)) return next(new AppError('El nombre solo puede contener letras y espacios.', 400));
            if (!this.#esCampoValido(apellidoPaterno)) return next(new AppError('El apellido paterno solo puede contener letras y espacios.', 400));
            if (!this.#esCampoValido(apellidoMaterno)) return next(new AppError('El apellido materno solo puede contener letras y espacios.', 400));

            // Longitud de nombres y apellidos
            if (nombres.length < 2 || nombres.length > 255) return next(new AppError('Favor de ingresar un nombre válido.', 400));
            if (apellidoPaterno.length < 2 || apellidoPaterno.length > 255) return next(new AppError('Favor de ingresar un apellido paterno válido.', 400));
            if (apellidoMaterno.length < 2 || apellidoMaterno.length > 255) return next(new AppError('Favor de ingresar un apellido materno válido.', 400));

            // Contraseña inválida
            if (!this.#esContraseniaValida(contrasenia)) return next(new AppError('La contraseña debe tener al menos 10 caracteres, una mayúscula, un número y un carácter especial (! @ # $ % ^ & * ( ) - _ = + . ?).', 400));
            if (contrasenia.length > 128) return next(new AppError('La contraseña no puede exceder los 128 caracteres.', 400));

            // Teléfono inválido
            if (!this.#esTelefonoValido(telefono)) return next(new AppError('El número de teléfono debe tener 10 dígitos.', 400));
            // Teléfono duplicado
            if (await usuariosDAO.obtenerUsuarioPorTelefono(telefono)) return next(new AppError('El número de teléfono ya está registrado.', 400));

            // Fecha de nacimiento inválida
            if (isNaN(Date.parse(fechaNacimiento))) {
                return next(new AppError('La fecha de nacimiento no es válida.', 400));
            }

            const nacimiento = new Date(fechaNacimiento);
            const hoy = new Date();
            const edad = hoy.getFullYear() - nacimiento.getFullYear();
            // Menor de edad
            if (edad < 18) return next(new AppError('Debes tener al menos 18 años para registrarte.', 400));

            const contraseniaEncriptada = await this.#encriptarContrasenia(contrasenia);
            const clienteData = {
                nombres,
                apellidoPaterno,
                apellidoMaterno,
                correo,
                contrasenia: contraseniaEncriptada,
                telefono,
                fechaNacimiento
            }

            const clienteCreado = await usuariosDAO.registrarCliente(clienteData);
            const respuestaJSON = this.#formatearJsonCliente(clienteCreado, false);
            res.status(200).json(respuestaJSON);
        } catch (error) {
            console.log(error);
            next(new AppError('Ocurrió un error al crear el sorteo', 500));
        }
    }

    async #encriptarContrasenia(contrasenia) {
        const saltRounds = 10;   // Nivel estándar de seguridad
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

    // Para nombres y apellidos
    #esCampoValido(campo) {
        const regex = /^[a-zA-ZÀ-ÿ\s]+$/;
        return regex.test(campo);
    }

    #formatearJsonCliente(jsonCliente) {
        return {
            id: jsonCliente.id,
            correo: jsonCliente.Usuario.correo
        };
    }
}

module.exports = new UsuariosController();