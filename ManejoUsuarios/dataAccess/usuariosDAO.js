const { Usuario, Cliente } = require('../models/');
const { sequelize } = require('../models');
const { Op } = require('sequelize');

class UsuariosDAO {

    constructor() { }

    async registrarCliente(clienteData) {
        const {
            nombres,
            apellido_paterno,
            apellido_materno,
            correo,
            contrasenia,
            telefono,
            fecha_nacimiento
        } = clienteData;

        // Validación básica interna del DAO (opcional)
        if (
            !nombres?.trim() ||
            !apellido_paterno?.trim() ||
            !apellido_materno?.trim() ||
            !correo?.trim() ||
            !contrasenia?.trim() ||
            !telefono?.trim() ||
            !fecha_nacimiento
        ) {
            throw new Error("Faltan datos obligatorios para registrar el cliente.");
        }

        // Correo inválido
        if (!this.#esCorreoValido(correo)) return next(new AppError('El formato del correo no es válido.', 400));
        // Longitud de correo
        if (correo.length > 100) return next(new AppError("El correo no puede exceder los 100 caracteres.", 400));
        // Correo duplicado
        if (await this.obtenerUsuarioPorCorreo(correo)) return next(new AppError('El correo proporcionado ya está en uso.', 400));

        // Nombres y apellidos inválidos
        if (!this.#esCampoValido(nombres)) return next(new AppError('El nombre solo puede contener letras y espacios.', 400));
        if (!this.#esCampoValido(apellido_paterno)) return next(new AppError('El apellido paterno solo puede contener letras y espacios.', 400));
        if (!this.#esCampoValido(apellido_materno)) return next(new AppError('El apellido materno solo puede contener letras y espacios.', 400));

        // Longitud de nombres y apellidos
        if (nombres.length < 2 || nombres.length > 255) return next(new AppError('Favor de ingresar un nombre válido.', 400));
        if (apellido_paterno.length < 2 || apellido_paterno.length > 255) return next(new AppError('Favor de ingresar un apellido paterno válido.', 400));
        if (apellido_materno.length < 2 || apellido_materno.length > 255) return next(new AppError('Favor de ingresar un apellido materno válido.', 400));

        // Contraseña inválida
        if (!this.#esContraseniaValida(contrasenia)) return next(new AppError('La contraseña debe tener al menos 10 caracteres, una mayúscula, un número y un carácter especial (! @ # $ % ^ & * ( ) - _ = + . ?).', 400));
        if (contrasenia.length > 128) return next(new AppError('La contraseña no puede exceder los 128 caracteres.', 400));

        // Teléfono inválido
        if (!this.#esTelefonoValido(telefono)) return next(new AppError('El número de teléfono debe tener 10 dígitos.', 400));
        // Teléfono duplicado
        if (await this.obtenerUsuarioPorTelefono(telefono)) return next(new AppError('El número de teléfono ya está registrado.', 400));

        // Fecha de nacimiento inválida
        if (isNaN(Date.parse(fecha_nacimiento))) {
            return next(new AppError('La fecha de nacimiento no es válida.', 400));
        }

        const nacimiento = new Date(fecha_nacimiento);
        const hoy = new Date();
        const edad = hoy.getFullYear() - nacimiento.getFullYear();
        // Menor de edad
        if (edad < 18) return next(new AppError('Debes tener al menos 18 años para registrarte.', 400));

        const t = await sequelize.transaction();
        try {
            // 2. Crear el Usuario (dentro de la transacción)
            const nuevoUsuario = await Usuario.create(
                clienteData,
                { transaction: t } // <-- ¡IMPORTANTE! Asocia la operación a la transacción
            );

            // 3. Obtener la ID generada automáticamente
            const idUsuario = nuevoUsuario.id; // Sequelize asigna 'id' por defecto

            // 4. Crear la entrada en la tabla Clientes (dentro de la transacción)
            await Cliente.create({
                // Guarda la ID en la columna id_usuario de la tabla Clientes
                id_usuario: idUsuario,
                // (Otros campos de Cliente si son necesarios)
            }, { transaction: t }); // <-- ¡IMPORTANTE!

            // 5. Confirmar (Commit) la transacción
            // Si ambos pasos anteriores tuvieron éxito, confirma los cambios.
            await t.commit();

            return;
        } catch (error) {
            console.log(error);
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
}

module.exports = new UsuariosDAO();