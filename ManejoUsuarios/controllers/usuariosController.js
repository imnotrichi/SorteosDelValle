const usuariosDAO = require('../dataAccess/usuariosDAO.js');
const { AppError } = require('../utils/appError.js');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");

class UsuariosController {

    constructor() {
        this.registrarUsuario = this.registrarUsuario.bind(this);
        this.iniciarSesion = this.iniciarSesion.bind(this);
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
            const correo = req.body.correo?.toLowerCase();

            // Se valida que los campos no vengan vacíos 
            if (
                !nombres?.trim() ||
                !apellidoPaterno?.trim() ||
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

            // Nombres y apellidos inválidos
            if (!this.#esCampoValido(nombres)) return next(new AppError('El nombre solo puede contener letras, espacios y guiones.', 400));
            if (!this.#esCampoValido(apellidoPaterno)) return next(new AppError('El apellido paterno solo puede contener letras, espacios y guiones.', 400));

            // Longitud de nombres y apellidos
            if (nombres.length < 2 || nombres.length > 100) return next(new AppError('Favor de ingresar un nombre válido.', 400));
            if (apellidoPaterno.length < 2 || apellidoPaterno.length > 100) return next(new AppError('Favor de ingresar un apellido paterno válido.', 400));

            // VALIDACIÓN OPCIONAL DEL APELLIDO MATERNO
            let apellidoMaternoFinal = null;
            if (apellidoMaterno?.trim()) {
                // Si se envió, se valida igual que los demás
                if (!this.#esCampoValido(apellidoMaterno)) return next(new AppError('El apellido materno solo puede contener letras, espacios y guiones.', 400));

                if (apellidoMaterno.length < 2 || apellidoMaterno.length > 100) return next(new AppError('Favor de ingresar un apellido materno válido.', 400));

                apellidoMaternoFinal = apellidoMaterno.trim();
            }


            // Contraseña inválida
            if (!this.#esContraseniaValida(contrasenia)) return next(new AppError('La contraseña debe tener al menos 10 caracteres, una mayúscula, un número y un carácter especial (! @ # $ % ^ & * ( ) - _ = + . ?).', 400));
            if (contrasenia.length > 128) return next(new AppError('La contraseña no puede exceder los 128 caracteres.', 400));

            // Teléfono inválido
            if (!this.#esTelefonoValido(telefono)) return next(new AppError('El número de teléfono debe tener 10 dígitos.', 400));

            // Fecha de nacimiento no numérica
            if (isNaN(Date.parse(fechaNacimiento))) {
                return next(new AppError('La fecha de nacimiento no es válida.', 400));
            }
            // Fecha de nacimiento inválida
            if (!this.#esFechaNacimientoValida(fechaNacimiento)) return next(new AppError('La fecha de nacimiento no es válida.', 400));

            const nacimiento = new Date(fechaNacimiento);
            const hoy = new Date();
            const edad = hoy.getFullYear() - nacimiento.getFullYear();
            
            // Menor de edad
            if (edad < 18) return next(new AppError('Debes tener al menos 18 años para registrarte.', 400));

            // Correo duplicado
            if (await usuariosDAO.obtenerUsuarioPorCorreo(correo)) return next(new AppError('El correo proporcionado ya está en uso.', 400));

            // Teléfono duplicado
            if (await usuariosDAO.obtenerUsuarioPorTelefono(telefono)) return next(new AppError('El número de teléfono ya está registrado.', 400));

            const contraseniaEncriptada = await this.#encriptarContrasenia(contrasenia);
            const clienteData = {
                nombres: nombres,
                apellido_paterno: apellidoPaterno,
                apellido_materno: apellidoMaternoFinal,
                correo: correo,
                contrasenia: contraseniaEncriptada,
                telefono: telefono,
                fecha_nacimiento: new Date(fechaNacimiento)
            }

            await usuariosDAO.registrarCliente(clienteData);
            res.status(200).json({
                ok: true,
                message: 'Usuario registrado correctamente'
            });
        } catch (error) {
            console.log(error);
            next(new AppError('Ocurrió un error al registrar al usuario', 500));
        }
    }

    async iniciarSesion(req, res, next) {
        try {
            const correo = req.body.correo?.toLowerCase();
            const contrasenia = req.body.contrasenia;

            // Se valida que los campos no vengan vacíos 
            if (
                !correo?.trim() ||
                !contrasenia?.trim()
            ) {
                return next(new AppError('Todos los campos son requeridos.', 400));
            }

            // Buscamos el usuario
            const usuarioObtenido = await usuariosDAO.obtenerUsuarioPorCorreo(correo);
            if (!usuarioObtenido) {
                return next(new AppError('No se encontró ningún usuario con ese correo.', 401));
            }

            // Comparamos la contraseña encriptada con la del usuario obtenido
            const passwordCorrecta = await bcrypt.compare(contrasenia, usuarioObtenido.contrasenia);
            if (!passwordCorrecta) {
                return next(new AppError('Correo o contraseña incorrectos.', 401));
            }

            // Obtenemos el tipo de usuario
            const tipoUsuario = await usuariosDAO.obtenerTipoUsuarioPorId(usuarioObtenido.id);

            const payload = {
                id: usuarioObtenido.id,
                correo: usuarioObtenido.correo,
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: '1h'
            });

            res.status(200).json({
                message: 'Inicio de sesión exitoso',
                token: token,
                id_usuario: usuarioObtenido.id,
                correo: usuarioObtenido.correo,
                nombres: usuarioObtenido.nombres,
                tipoUsuario: tipoUsuario
            });
        } catch (error) {
            console.log(error);
            next(new AppError('Ocurrió un error al iniciar sesión', 500));
        }
    }

    async #encriptarContrasenia(contrasenia) {
        const saltRounds = 10;   // Nivel estándar de seguridad
        const hash = await bcrypt.hash(contrasenia, saltRounds);
        return hash;
    }

    #esCorreoValido(correo) {
        const regex = /^[a-zA-Z0-9]+(?:[._%+-][a-zA-Z0-9]+)*@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
        return regex.test(correo);
    }

    #esContraseniaValida(contrasenia) {
        const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_\-=+.?]).{10,}$/;
        return regex.test(contrasenia);
    }

    #esTelefonoValido(telefono) {
        const regex = /^\d{10}$/;
        return regex.test(telefono);
    }

    // Para nombres y apellidos
    #esCampoValido(campo) {
        const regex = /^[a-zA-ZÀ-ÿ\s-]+$/;
        return regex.test(campo);
    }

    // Para nombres y apellidos
    #esFechaNacimientoValida(fechaNacimiento) {
        const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
        return regex.test(fechaNacimiento);
    }


}

module.exports = new UsuariosController();