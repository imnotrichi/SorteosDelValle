import { describe, it, expect, beforeAll, afterAll, vi, beforeEach, afterEach } from "vitest";
const usuariosController = require('../controllers/usuariosController.js');
const { Usuario, Cliente } = require("../models/index.js");

let mockRes, mockNext;

// Función auxiliar para no repetir mocks
const setupMocks = () => ({
    mockRes: {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
        send: vi.fn()
    },
    mockNext: vi.fn(),
});

describe('Registrar Usuario', async () => {

    beforeEach(async () => {
        ({ mockRes, mockNext } = setupMocks());
    });

    afterEach(async () => {
        await Usuario.destroy({ where: {} });
        await Cliente.destroy({ where: {} });
    });

    //RGU-001. Probar que se pueda registrar un usuario nuevo correctamente.
    it('Debería registrar un nuevo usuario y responder con 200', async () => {
        //Arrange
        const datosUsuario = {
            nombres: "Ricardo Alán",
            apellidoPaterno: "Gutiérrez",
            apellidoMaterno: "Garcés",
            correo: "ricardogtz@gmail.com",
            contrasenia: "123456789_Rg",
            telefono: "6442456789",
            fechaNacimiento: "2004-03-21"
        }
        const mockReq = { body: datosUsuario }

        //Act
        await usuariosController.registrarUsuario(mockReq, mockRes, mockNext);

        //Assert
        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json.mock.calls[0][0].message).toBe('Usuario registrado correctamente');
    });

    //RGU-002. Verificar que el sistema alerte al usuario cuando hace falta el nombre al registrarse.
    it('Debería alertar que el nombre es obligatorio y responder con 400.', async () => {
        //Arrange
        const datosUsuario = {
            apellidoPaterno: "Gutiérrez",
            apellidoMaterno: "Garcés",
            correo: "ricardogtz@gmail.com",
            contrasenia: "123456789_Rg",
            telefono: "6442456789",
            fechaNacimiento: "2004-03-21"
        }
        const mockReq = { body: datosUsuario }

        //Act
        await usuariosController.registrarUsuario(mockReq, mockRes, mockNext);

        //Assert
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });

    //RGU-003. Verificar que el sistema alerte al usuario cuando hace falta el apellido paterno al registrarse.
    it('Debería alertar que el apellido paterno es obligatorio y responder con 400.', async () => {
        //Arrange
        const datosUsuario = {
            nombres: "Ricardo",
            apellidoMaterno: "Garcés",
            correo: "ricardogtz@gmail.com",
            contrasenia: "123456789_Rg",
            telefono: "6442456789",
            fechaNacimiento: "2004-03-21"
        }
        const mockReq = { body: datosUsuario }

        //Act
        await usuariosController.registrarUsuario(mockReq, mockRes, mockNext);

        //Assert
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });

    //RGU-004. Verificar que el sistema permita registrarse sin especificar el apellido materno.
    it('Debería registrar un nuevo usuario y responder con 200', async () => {
        //Arrange
        const datosUsuario = {
            nombres: "Ricardo",
            apellidoPaterno: "Gutiérrez",
            correo: "ricardogtz@gmail.com",
            contrasenia: "123456789_Rg",
            telefono: "6442456789",
            fechaNacimiento: "2004-03-21"
        }
        const mockReq = { body: datosUsuario }

        //Act
        await usuariosController.registrarUsuario(mockReq, mockRes, mockNext);

        //Assert
        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json.mock.calls[0][0].message).toBe('Usuario registrado correctamente');
    });

    //RGU-005. Verificar que el sistema alerte al usuario cuando hace falta el correo al registrarse.
    it('Debería alertar que el correo es obligatorio y responder con 400.', async () => {
        //Arrange
        const datosUsuario = {
            nombres: "Ricardo",
            apellidoPaterno: "Gutierrez",
            apellidoMaterno: "Garcés",
            contrasenia: "123456789_Rg",
            telefono: "6442456789",
            fechaNacimiento: "2004-03-21"
        }
        const mockReq = { body: datosUsuario }

        //Act
        await usuariosController.registrarUsuario(mockReq, mockRes, mockNext);

        //Assert
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });

    //RGU-006. Verificar que el sistema alerte al usuario cuando hace falta la contraseña al registrarse.
    it('Debería alertar que la contraseña es obligatoria y responder con 400.', async () => {
        //Arrange
        const datosUsuario = {
            nombres: "Ricardo",
            apellidoPaterno: "Gutiérrez",
            apellidoMaterno: "Garcés",
            correo: "ricardogtz@gmail.com",
            telefono: "6442456789",
            fechaNacimiento: "2004-03-21"
        }
        const mockReq = { body: datosUsuario }

        //Act
        await usuariosController.registrarUsuario(mockReq, mockRes, mockNext);

        //Assert
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });

    //RGU-007. Verificar que el sistema alerte al usuario cuando hace falta el teléfono al registrarse.
    it('Debería alertar que el teléfono es obligatorio y responder con 400.', async () => {
        //Arrange
        const datosUsuario = {
            nombres: "Ricardo",
            apellidoPaterno: "Gutiérrez",
            apellidoMaterno: "Garcés",
            correo: "ricardogtz@gmail.com",
            contrasenia: "123456789_Rg",
            fechaNacimiento: "2004-03-21"
        }
        const mockReq = { body: datosUsuario }

        //Act
        await usuariosController.registrarUsuario(mockReq, mockRes, mockNext);

        //Assert
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });

    //RGU-008. Verificar que el sistema alerte al usuario cuando hace falta la fecha de nacimiento al registrarse.
    it('Debería alertar que la fecha de nacimiento es obligatoria y responder con 400.', async () => {
        //Arrange
        const datosUsuario = {
            nombres: "Ricardo",
            apellidoPaterno: "Gutiérrez",
            apellidoMaterno: "Garcés",
            correo: "ricardogtz@gmail.com",
            contrasenia: "123456789_Rg",
            telefono: "6442456789",
        }
        const mockReq = { body: datosUsuario }

        //Act
        await usuariosController.registrarUsuario(mockReq, mockRes, mockNext);

        //Assert
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });

    //RGU-009. Verificar que el sistema indique que no se puede ingresar un nombre que contenga números.
    it('Debería alertar que el nombre no puede contener números y responder con 400.', async () => {
        //Arrange
        const datosUsuario = {
            nombres: "R1cArd0",
            apellidoPaterno: "Gutiérrez",
            apellidoMaterno: "Garcés",
            correo: "ricardogtz@gmail.com",
            contrasenia: "123456789_Rg",
            telefono: "6442456789",
            fechaNacimiento: "2004-03-21"
        }
        const mockReq = { body: datosUsuario }

        //Act
        await usuariosController.registrarUsuario(mockReq, mockRes, mockNext);

        //Assert
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('El nombre solo puede contener letras, espacios y guiones.');
    });

    //RGU-010. Verificar que el sistema indique que no se puede ingresar un apellido paterno que contenga números.
    it('Debería alertar que el apellido paterno no puede contener números y responder con 400.', async () => {
        //Arrange
        const datosUsuario = {
            nombres: "Ricardo",
            apellidoPaterno: "Gu71err3z",
            apellidoMaterno: "Garcés",
            correo: "ricardogtz@gmail.com",
            contrasenia: "123456789_Rg",
            telefono: "6442456789",
            fechaNacimiento: "2004-03-21"
        }
        const mockReq = { body: datosUsuario }

        //Act
        await usuariosController.registrarUsuario(mockReq, mockRes, mockNext);

        //Assert
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('El apellido paterno solo puede contener letras, espacios y guiones.');
    });

    //RGU-011. Verificar que el sistema indique que no se puede ingresar un apellido materno que contenga números.
    it('Debería alertar que el nombre no puede contener números y responder con 400.', async () => {
        //Arrange
        const datosUsuario = {
            nombres: "Ricardo",
            apellidoPaterno: "Gutiérrez",
            apellidoMaterno: "G4rcé5",
            correo: "ricardogtz@gmail.com",
            contrasenia: "123456789_Rg",
            telefono: "6442456789",
            fechaNacimiento: "2004-03-21"
        }
        const mockReq = { body: datosUsuario }

        //Act
        await usuariosController.registrarUsuario(mockReq, mockRes, mockNext);

        //Assert
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('El apellido materno solo puede contener letras, espacios y guiones.');
    });

    //RGU-012. Verificar que el sistema indique que no se puede ingresar un nombre que contenga caracteres especiales (exceptuando guiones).
    it('Debería alertar que el nombre no puede contener caracteres especiales y responder con 400.', async () => {
        //Arrange
        const datosUsuario = {
            nombres: "/.<Ricardo",
            apellidoPaterno: "Gutiérrez",
            apellidoMaterno: "Garcés",
            correo: "ricardogtz@gmail.com",
            contrasenia: "123456789_Rg",
            telefono: "6442456789",
            fechaNacimiento: "2004-03-21"
        }
        const mockReq = { body: datosUsuario }

        //Act
        await usuariosController.registrarUsuario(mockReq, mockRes, mockNext);

        //Assert
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('El nombre solo puede contener letras, espacios y guiones.');
    });

    //RGU-013. Verificar que el sistema indique que no se puede ingresar un apellido paterno que contenga caracteres especiales (exceptuando guiones).
    it('Debería alertar que el apellido paterno no puede contener caracteres especiales y responder con 400.', async () => {
        //Arrange
        const datosUsuario = {
            nombres: "Ricardo",
            apellidoPaterno: "Gu.t/i&é%r$r#ez",
            apellidoMaterno: "Garcés",
            correo: "ricardogtz@gmail.com",
            contrasenia: "123456789_Rg",
            telefono: "6442456789",
            fechaNacimiento: "2004-03-21"
        }
        const mockReq = { body: datosUsuario }

        //Act
        await usuariosController.registrarUsuario(mockReq, mockRes, mockNext);

        //Assert
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('El apellido paterno solo puede contener letras, espacios y guiones.');
    });

    //RGU-014. Verificar que el sistema indique que no se puede ingresar un apellido materno que contenga caracteres especiales (exceptuando guiones).
    it('Debería alertar que el apellido materno no puede contener caracteres especiales y responder con 400.', async () => {
        //Arrange
        const datosUsuario = {
            nombres: "Ricardo",
            apellidoPaterno: "Gutiérrez",
            apellidoMaterno: "G#a$r&c&/s",
            correo: "ricardogtz@gmail.com",
            contrasenia: "123456789_Rg",
            telefono: "6442456789",
            fechaNacimiento: "2004-03-21"
        }
        const mockReq = { body: datosUsuario }

        //Act
        await usuariosController.registrarUsuario(mockReq, mockRes, mockNext);

        //Assert
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('El apellido materno solo puede contener letras, espacios y guiones.');
    });

    //RGU-015. Verificar que el sistema permita ingresar un nombre que contenga guiones.
    it('Debería registrar un nuevo usuario y responder con 200', async () => {
        //Arrange
        const datosUsuario = {
            nombres: "Ricardo-Alan",
            apellidoPaterno: "Gutiérrez",
            apellidoMaterno: "Garcés",
            correo: "ricardogtz@gmail.com",
            contrasenia: "123456789_Rg",
            telefono: "6442456789",
            fechaNacimiento: "2004-03-21"
        }
        const mockReq = { body: datosUsuario }

        //Act
        await usuariosController.registrarUsuario(mockReq, mockRes, mockNext);

        //Assert
        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json.mock.calls[0][0].message).toBe('Usuario registrado correctamente');
    });

    //RGU-016. Verificar que el sistema permita ingresar un apellido paterno que contenga guiones.
    it('Debería registrar un nuevo usuario y responder con 200', async () => {
        //Arrange
        const datosUsuario = {
            nombres: "Ricardo-Alan",
            apellidoPaterno: "Gutié-rrez",
            apellidoMaterno: "Garcés",
            correo: "ricardogtz@gmail.com",
            contrasenia: "123456789_Rg",
            telefono: "6442456789",
            fechaNacimiento: "2004-03-21"
        }
        const mockReq = { body: datosUsuario }

        //Act
        await usuariosController.registrarUsuario(mockReq, mockRes, mockNext);

        //Assert
        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json.mock.calls[0][0].message).toBe('Usuario registrado correctamente');
    });

    //RGU-017. Verificar que el sistema permita ingresar un apellido materno que contenga guiones.
    it('Debería registrar un nuevo usuario y responder con 200', async () => {
        //Arrange
        const datosUsuario = {
            nombres: "Ricardo-Alan",
            apellidoPaterno: "Gutiérrez",
            apellidoMaterno: "Garc-éss",
            correo: "ricardogtz@gmail.com",
            contrasenia: "123456789_Rg",
            telefono: "6442456789",
            fechaNacimiento: "2004-03-21"
        }
        const mockReq = { body: datosUsuario }

        //Act
        await usuariosController.registrarUsuario(mockReq, mockRes, mockNext);

        //Assert
        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json.mock.calls[0][0].message).toBe('Usuario registrado correctamente');
    });

    //RGU-018. Verificar que el sistema indique que no se puede ingresar un nombre que contenga emojis.
    it('Debería alertar que el nombre no puede contener caracteres especiales y responder con 400.', async () => {
        //Arrange
        const datosUsuario = {
            nombres: "Ricardo😍😍😍😍",
            apellidoPaterno: "Gutiérrez",
            apellidoMaterno: "Garcés",
            correo: "ricardogtz@gmail.com",
            contrasenia: "123456789_Rg",
            telefono: "6442456789",
            fechaNacimiento: "2004-03-21"
        }
        const mockReq = { body: datosUsuario }

        //Act
        await usuariosController.registrarUsuario(mockReq, mockRes, mockNext);

        //Assert
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('El nombre solo puede contener letras, espacios y guiones.');
    });

    //RGU-019. Verificar que el sistema indique que no se puede ingresar un apellido paterno que contenga emojis.
    it('Debería alertar que el nombre no puede contener caracteres especiales y responder con 400.', async () => {
        //Arrange
        const datosUsuario = {
            nombres: "Ricardo",
            apellidoPaterno: "Gutié😍😍😍😍😍rrez",
            apellidoMaterno: "Garcés",
            correo: "ricardogtz@gmail.com",
            contrasenia: "123456789_Rg",
            telefono: "6442456789",
            fechaNacimiento: "2004-03-21"
        }
        const mockReq = { body: datosUsuario }

        //Act
        await usuariosController.registrarUsuario(mockReq, mockRes, mockNext);

        //Assert
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('El apellido paterno solo puede contener letras, espacios y guiones.');
    });

    //RGU-020. Verificar que el sistema indique que no se puede ingresar un apellido materno que contenga emojis.
    it('Debería alertar que el nombre no puede contener caracteres especiales y responder con 400.', async () => {
        //Arrange
        const datosUsuario = {
            nombres: "Ricardo",
            apellidoPaterno: "Gutiérrez",
            apellidoMaterno: "Ga😍😍😍😍😍rcés",
            correo: "ricardogtz@gmail.com",
            contrasenia: "123456789_Rg",
            telefono: "6442456789",
            fechaNacimiento: "2004-03-21"
        }
        const mockReq = { body: datosUsuario }

        //Act
        await usuariosController.registrarUsuario(mockReq, mockRes, mockNext);

        //Assert
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('El apellido materno solo puede contener letras, espacios y guiones.');
    });

    //RGU-021. Verificar que el sistema indique que el correo debe cumplir con un formato válido.
    it('Debería alertar que el correo debe cumplir con el formato correcto y responder con 400.', async () => {
        //Arrange
        const datosUsuario = {
            nombres: "Ricardo",
            apellidoPaterno: "Gutiérrez",
            apellidoMaterno: "Garcés",
            correo: "ricar-!dogtzgmail.com",
            contrasenia: "123456789_Rg",
            telefono: "6442456789",
            fechaNacimiento: "2004-03-21"
        }
        const mockReq = { body: datosUsuario }

        //Act
        await usuariosController.registrarUsuario(mockReq, mockRes, mockNext);

        //Assert
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('El formato del correo no es válido.');
    });

    //RGU-022. Verificar que el sistema indique que el correo no puede incluir emojis.
    it('Debería alertar que el correo no puede incluir emojis y responder con 400.', async () => {
        //Arrange
        const datosUsuario = {
            nombres: "Ricardo",
            apellidoPaterno: "Gutiérrez",
            apellidoMaterno: "Garcés",
            correo: "ricardogtz@😍😍😍gmail.com",
            contrasenia: "123456789_Rg",
            telefono: "6442456789",
            fechaNacimiento: "2004-03-21"
        }
        const mockReq = { body: datosUsuario }

        //Act
        await usuariosController.registrarUsuario(mockReq, mockRes, mockNext);

        //Assert
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('El formato del correo no es válido.');
    });

    //RGU-023. Verificar que el sistema indique que la contraseña debe tener al menos 10 caracteres
    it('Debería alertar que la contraseña debe tener al menos 10 caracteres y responder con 400.', async () => {
        //Arrange
        const datosUsuario = {
            nombres: "Ricardo",
            apellidoPaterno: "Gutiérrez",
            apellidoMaterno: "Garcés",
            correo: "ricardogtz@gmail.com",
            contrasenia: "123456_Rg",
            telefono: "6442456789",
            fechaNacimiento: "2004-03-21"
        }
        const mockReq = { body: datosUsuario }

        //Act
        await usuariosController.registrarUsuario(mockReq, mockRes, mockNext);

        //Assert
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('La contraseña debe tener al menos 10 caracteres, una mayúscula, un número y un carácter especial (! @ # $ % ^ & * ( ) - _ = + . ?).');
    });

    //RGU-024. Verificar que el sistema indique que la contraseña debe tener una letra mayúscula, una letra minúscula, un número y un caracter especial.
    it('Debería alertar que la contraseña debe tener una letra mayúscula, una letra minúscula, un número y un caracter especial y responder con 400.', async () => {
        //Arrange
        const datosUsuario = {
            nombres: "Ricardo",
            apellidoPaterno: "Gutiérrez",
            apellidoMaterno: "Garcés",
            correo: "ricardogtz@gmail.com",
            contrasenia: "123456789Rg",
            telefono: "6442456789",
            fechaNacimiento: "2004-03-21"
        }
        const mockReq = { body: datosUsuario }

        //Act
        await usuariosController.registrarUsuario(mockReq, mockRes, mockNext);

        //Assert
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('La contraseña debe tener al menos 10 caracteres, una mayúscula, un número y un carácter especial (! @ # $ % ^ & * ( ) - _ = + . ?).');
    });

    //RGU-025. Verificar que el sistema indique que la contraseña debe tener una letra mayúscula, una letra minúscula, un número y un caracter especial.
    it('Debería alertar que la contraseña debe tener una letra mayúscula, una letra minúscula, un número y un caracter especial y responder con 400.', async () => {
        //Arrange
        const datosUsuario = {
            nombres: "Ricardo",
            apellidoPaterno: "Gutiérrez",
            apellidoMaterno: "Garcés",
            correo: "ricardogtz@gmail.com",
            contrasenia: "123456789_rg",
            telefono: "6442456789",
            fechaNacimiento: "2004-03-21"
        }
        const mockReq = { body: datosUsuario }

        //Act
        await usuariosController.registrarUsuario(mockReq, mockRes, mockNext);

        //Assert
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('La contraseña debe tener al menos 10 caracteres, una mayúscula, un número y un carácter especial (! @ # $ % ^ & * ( ) - _ = + . ?).');
    });

    //RGU-026. Verificar que el sistema indique que la contraseña debe tener una letra mayúscula, una letra minúscula, un número y un caracter especial.
    it('Debería alertar que la contraseña debe tener una letra mayúscula, una letra minúscula, un número y un caracter especial y responder con 400.', async () => {
        //Arrange
        const datosUsuario = {
            nombres: "Ricardo",
            apellidoPaterno: "Gutiérrez",
            apellidoMaterno: "Garcés",
            correo: "ricardogtz@gmail.com",
            contrasenia: "123456789_RG",
            telefono: "6442456789",
            fechaNacimiento: "2004-03-21"
        }
        const mockReq = { body: datosUsuario }

        //Act
        await usuariosController.registrarUsuario(mockReq, mockRes, mockNext);

        //Assert
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('La contraseña debe tener al menos 10 caracteres, una mayúscula, un número y un carácter especial (! @ # $ % ^ & * ( ) - _ = + . ?).');
    });

    //RGU-027. Verificar que el sistema indique que el teléfono debe tener 10 caracteres.
    it('Debería alertar que el teléfono debe tener 10 caracteres y responder con 400.', async () => {
        //Arrange
        const datosUsuario = {
            nombres: "Ricardo",
            apellidoPaterno: "Gutiérrez",
            apellidoMaterno: "Garcés",
            correo: "ricardogtz@gmail.com",
            contrasenia: "123456789_Rg",
            telefono: "644245678",
            fechaNacimiento: "2004-03-21"
        }
        const mockReq = { body: datosUsuario }

        //Act
        await usuariosController.registrarUsuario(mockReq, mockRes, mockNext);

        //Assert
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('El número de teléfono debe tener 10 dígitos.');
    });

    //RGU-028. Verificar que el sistema indique que el teléfono debe tener 10 caracteres.
    it('Debería alertar que el teléfono debe tener 10 caracteres y responder con 400.', async () => {
        //Arrange
        const datosUsuario = {
            nombres: "Ricardo",
            apellidoPaterno: "Gutiérrez",
            apellidoMaterno: "Garcés",
            correo: "ricardogtz@gmail.com",
            contrasenia: "123456789_Rg",
            telefono: "64424567890",
            fechaNacimiento: "2004-03-21"
        }
        const mockReq = { body: datosUsuario }

        //Act
        await usuariosController.registrarUsuario(mockReq, mockRes, mockNext);

        //Assert
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('El número de teléfono debe tener 10 dígitos.');
    });

    //RGU-029. Verificar que el sistema indique que el usuario debe tener al menos 18 años para crear su cuenta.
    it('Debería alertar que el usuario debe tener al menos 18 años y responder con 400.', async () => {
        //Arrange
        const datosUsuario = {
            nombres: "Ricardo",
            apellidoPaterno: "Gutiérrez",
            apellidoMaterno: "Garcés",
            correo: "ricardogtz@gmail.com",
            contrasenia: "123456789_Rg",
            telefono: "6442456789",
            fechaNacimiento: "2008-03-21"
        }
        const mockReq = { body: datosUsuario }

        //Act
        await usuariosController.registrarUsuario(mockReq, mockRes, mockNext);

        //Assert
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('Debes tener al menos 18 años para registrarte.');
    });

    //RGU-030. Verificar que el sistema indique que la fecha de nacimiento debe cumplir con el formato 'AAAA-MM-DD'
    it("Debería alertar que la fecha de nacimiento debe cumplir con el formato 'AAA-MM-DD' y responder con 400.", async () => {
        //Arrange
        const datosUsuario = {
            nombres: "Ricardo",
            apellidoPaterno: "Gutiérrez",
            apellidoMaterno: "Garcés",
            correo: "ricardogtz@gmail.com",
            contrasenia: "123456789_Rg",
            telefono: "6442456789",
            fechaNacimiento: "21-03-2004"
        }
        const mockReq = { body: datosUsuario }

        //Act
        await usuariosController.registrarUsuario(mockReq, mockRes, mockNext);

        //Assert
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('La fecha de nacimiento no es válida.');
    });

    // //RGU-031. Verificar que el sistema indique que el usuario no puede tener más de 100 años.
    // it('Debería alertar que el usuario no puede tener más de 100 años y responder con 400.', async () => {
    //      //Arrange
    //     const datosUsuario = {
    //         nombres: "Ricardo",
    //         apellidoPaterno: "Gutiérrez",
    //         apellidoMaterno: "Garcés",
    //         correo: "ricardogtz@gmail.com",
    //         contrasenia: "123456789_Rg",
    //         telefono: "6442456789",
    //         fechaNacimiento: "1900-03-21"
    //     }
    //     const mockReq = { body: datosUsuario }

    //     //Act
    //     await usuariosController.registrarUsuario(mockReq, mockRes, mockNext);

    //     //Assert
    //     expect(mockNext).toHaveBeenCalled();
    //     expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
    //     expect(mockNext.mock.calls[0][0].message).toBe('Debes tener al menos 18 años para registrarte.');
    // });

    //RGU-032. Verificar que el sistema no permita ingresar nombres de más de 100 caracteres
    it("Debería alertar que el nombre no puede tener más de 100 caracteres' y responder con 400.", async () => {
        //Arrange
        const datosUsuario = {
            nombres: "Lorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industry",
            apellidoPaterno: "Gutiérrez",
            apellidoMaterno: "Garcés",
            correo: "ricardogtz@gmail.com",
            contrasenia: "123456789_Rg",
            telefono: "6442456789",
            fechaNacimiento: "2004-03-21"
        }
        const mockReq = { body: datosUsuario }

        //Act
        await usuariosController.registrarUsuario(mockReq, mockRes, mockNext);

        //Assert
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('Favor de ingresar un nombre válido.');
    });

    //RGU-033. Verificar que el sistema no permita ingresar un apellido paterno de más de 100 caracteres
    it("Debería alertar que el apellido paterno no puede tener más de 100 caracteres' y responder con 400.", async () => {
        //Arrange
        const datosUsuario = {
            nombres: "Ricardo",
            apellidoPaterno: "Lorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the Lorem Ipsum is simply dummy text of the printing and typesetting industry",
            apellidoMaterno: "Garcés",
            correo: "ricardogtz@gmail.com",
            contrasenia: "123456789_Rg",
            telefono: "6442456789",
            fechaNacimiento: "2004-03-21"
        }
        const mockReq = { body: datosUsuario }

        //Act
        await usuariosController.registrarUsuario(mockReq, mockRes, mockNext);

        //Assert
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('Favor de ingresar un apellido paterno válido.');
    });

    //RGU-034. Verificar que el sistema no permita ingresar un apellido materno de más de 100 caracteres
    it("Debería alertar que el apellido materno no puede tener más de 100 caracteres' y responder con 400.", async () => {
        //Arrange
        const datosUsuario = {
            nombres: "Ricardo",
            apellidoPaterno: "Gutiérrez",
            apellidoMaterno: "Lorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industryLorem Ipsum is simply dummy text of the printing and typesetting industry",
            correo: "ricardogtz@gmail.com",
            contrasenia: "123456789_Rg",
            telefono: "6442456789",
            fechaNacimiento: "2004-03-21"
        }
        const mockReq = { body: datosUsuario }

        //Act
        await usuariosController.registrarUsuario(mockReq, mockRes, mockNext);

        //Assert
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('Favor de ingresar un apellido materno válido.');
    });

    //RGU-035. Verificar que el sistema no permita ingresar un correo de más de 100 caracteres
    it("Debería alertar que el correo no puede tener más de 100 caracteres' y responder con 400.", async () => {
        //Arrange
        const datosUsuario = {
            nombres: "Ricardo",
            apellidoPaterno: "Gutiérrez",
            apellidoMaterno: "Garcés",
            correo: "LoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremL@LoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLorLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLorememLoremLoremLoremLorem.com",
            contrasenia: "123456789_Rg",
            telefono: "6442456789",
            fechaNacimiento: "2004-03-21"
        }
        const mockReq = { body: datosUsuario }

        //Act
        await usuariosController.registrarUsuario(mockReq, mockRes, mockNext);

        //Assert
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('El correo no puede exceder los 100 caracteres.');
    });

    //RGU-036. Verificar que el sistema no permita ingresar una contraseña de más de 128 caracteres
    it("Debería alertar que la contraseña no puede tener más de 100 caracteres' y responder con 400.", async () => {
        //Arrange
        const datosUsuario = {
            nombres: "Ricardo",
            apellidoPaterno: "Gutiérrez",
            apellidoMaterno: "Garcés",
            correo: "ricardogtz@gmail.com",
            contrasenia: "LoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLoremLorem123_LoremLoremLoremLoremLoremLoremLoremLoremLoremv",
            telefono: "6442456789",
            fechaNacimiento: "2004-03-21"
        }
        const mockReq = { body: datosUsuario }

        //Act
        await usuariosController.registrarUsuario(mockReq, mockRes, mockNext);

        //Assert
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('La contraseña no puede exceder los 128 caracteres.');
    });

    //RGU-037. Verificar que el sistema no permita ingresar un teléfono con letras
    it("Debería alertar que el teléfono no puede contener letras y responder con 400.", async () => {
        //Arrange
        const datosUsuario = {
            nombres: "Ricardo",
            apellidoPaterno: "Gutiérrez",
            apellidoMaterno: "Garcés",
            correo: "ricardogtz@gmail.com",
            contrasenia: "123456789_Rg",
            telefono: "holacomoes",
            fechaNacimiento: "2004-03-21"
        }
        const mockReq = { body: datosUsuario }

        //Act
        await usuariosController.registrarUsuario(mockReq, mockRes, mockNext);

        //Assert
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('El número de teléfono debe tener 10 dígitos.');
    });

    //RGU-038. Verificar que el sistema no permita que dos usuarios tengan el mismo número
    it("Debería alertar que el no se puede ingresar un teléfono asociado a otra cuenta y responder con 400.", async () => {
        //Arrange
        const datosUsuario1 = {
            nombres: "Ricardo",
            apellidoPaterno: "Gutiérrez",
            apellidoMaterno: "Garcés",
            correo: "ricardogtz@gmail.com",
            contrasenia: "123456789_Rg",
            telefono: "6442876543",
            fechaNacimiento: "2004-03-21"
        }
        const datosUsuario2 = {
            nombres: "Abel",
            apellidoPaterno: "Sánchez",
            apellidoMaterno: "Guerrero",
            correo: "abelsan@gmail.com",
            contrasenia: "123456789_As",
            telefono: datosUsuario1.telefono,
            fechaNacimiento: "2004-05-13"
        }
        const mockRes1 = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            send: vi.fn()
        }
        const mockRes2 = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            send: vi.fn()
        }
        const mockNext2 = vi.fn();
        const mockNext1 = vi.fn();
        const mockReq1 = { body: datosUsuario1 }
        const mockReq2 = { body: datosUsuario2 }

        //Act 
        await usuariosController.registrarUsuario(mockReq1, mockRes1, mockNext1);
        await usuariosController.registrarUsuario(mockReq2, mockRes2, mockNext2);

        //Assert
        expect(mockNext2).toHaveBeenCalled();
        expect(mockNext2.mock.calls[0][0].statusCode).toBe(400);
        expect(mockNext2.mock.calls[0][0].message).toBe('El número de teléfono ya está registrado.');
    });

    //RGU-039. Verificar que el sistema no permita que dos usuarios tengan el mismo correo
    it("Debería alertar que el no se puede ingresar un correo asociado a otra cuenta y responder con 400.", async () => {
        //Arrange
        const datosUsuario1 = {
            nombres: "Ricardo",
            apellidoPaterno: "Gutiérrez",
            apellidoMaterno: "Garcés",
            correo: "ricardogtz@gmail.com",
            contrasenia: "123456789_Rg",
            telefono: "6442876543",
            fechaNacimiento: "2004-03-21"
        }
        const datosUsuario2 = {
            nombres: "Abel",
            apellidoPaterno: "Sánchez",
            apellidoMaterno: "Guerrero",
            correo: datosUsuario1.correo,
            contrasenia: "123456789_As",
            telefono: "6441768209",
            fechaNacimiento: "2004-05-13"
        }
        const mockRes1 = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            send: vi.fn()
        }
        const mockRes2 = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            send: vi.fn()
        }
        const mockNext2 = vi.fn();
        const mockNext1 = vi.fn();
        const mockReq1 = { body: datosUsuario1 }
        const mockReq2 = { body: datosUsuario2 }

        //Act 
        await usuariosController.registrarUsuario(mockReq1, mockRes1, mockNext1);
        await usuariosController.registrarUsuario(mockReq2, mockRes2, mockNext2);

        // Assert
        expect(mockNext2).toHaveBeenCalled();
        expect(mockNext2.mock.calls[0][0].statusCode).toBe(400);
        expect(mockNext2.mock.calls[0][0].message).toBe('El correo proporcionado ya está en uso.');
    });

});

describe('Iniciar Sesión', () => {

    beforeAll(async () => {
        process.env.JWT_SECRET = 'mi_clave_secreta_para_tests';
    });

    beforeEach(async () => {
        const datosUsuario = {
            nombres: "Ricardo Alán",
            apellidoPaterno: "Gutiérrez",
            apellidoMaterno: "Garcés",
            correo: "ricardogtz@gmail.com",
            contrasenia: "123456789_Rg",
            telefono: "6442456789",
            fechaNacimiento: "2004-03-21"
        }

        const mockReq = { body: datosUsuario }

        await usuariosController.registrarUsuario(mockReq, mockRes, mockNext);

        ({ mockRes, mockNext } = setupMocks());
    });

    afterEach(async () => {
        await Usuario.destroy({ where: {} });
        await Cliente.destroy({ where: {} });
    });

    //INS-001. Verifica que se puede iniciar sesión correctamente.
    it('Debe iniciar sesión correctamente y responder con 200.', async () => {
        //Arrange
        const datosInicioSesion = {
            correo: 'ricardogtz@gmail.com',
            contrasenia: "123456789_Rg"
        }

        const mockReq = { body: datosInicioSesion }

        //Act
        await usuariosController.iniciarSesion(mockReq, mockRes, mockNext);

        //Assert
        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json.mock.calls[0][0].message).toBe('Inicio de sesión exitoso');
    });

    //INS-002. Verifica que se puede iniciar sesión correctamente.
    it('Debe iniciar sesión correctamente y responder con 200.', async () => {
        //Arrange
        const datosInicioSesion = {
            correo: 'ricardogtz@gmail.com',
            contrasenia: "123456789_Rg"
        }

        const mockReq = { body: datosInicioSesion }

        //Act
        await usuariosController.iniciarSesion(mockReq, mockRes, mockNext);

        //Assert
        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json.mock.calls[0][0].message).toBe('Inicio de sesión exitoso');
    });

    //INS-003. Verificar que el sistema no permite iniciar sesión si no se ingresa el correo.
    it('Debe indicar que se debe proporcionar el correo y responder con 400.', async () => {
        //Arrange
        const datosInicioSesion = {
            contrasenia: "123456789_Rg"
        }

        const mockReq = { body: datosInicioSesion }

        //Act
        await usuariosController.iniciarSesion(mockReq, mockRes, mockNext);

        //Assert
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });

    //INS-004. Verificar que el sistema no permite iniciar sesión si no se ingresa la contraseña.
    it('Debe indicar que se debe proporcionar la contraseña y responder con 400.', async () => {
        //Arrange
        const datosInicioSesion = {
            correo: 'ricardogtz@gmail.com'
        }

        const mockReq = { body: datosInicioSesion }

        //Act
        await usuariosController.iniciarSesion(mockReq, mockRes, mockNext);

        //Assert
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });

    //INS-005. Verificar que el sistema no permite iniciar sesión si el correo y la contraseña con coinciden.
    it('Debe indicar que la contraseña o el correo son erróneos y responder con 400.', async () => {
        //Arrange
        const datosInicioSesion = {
            correo: 'ricardogtz@gmail.com',
            contrasenia: '12345678_Rg'
        }

        const mockReq = { body: datosInicioSesion }

        //Act
        await usuariosController.iniciarSesion(mockReq, mockRes, mockNext);

        //Assert
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext.mock.calls[0][0].statusCode).toBe(401);
        expect(mockNext.mock.calls[0][0].message).toBe('Correo o contraseña incorrectos.');
    });

    //INS-006. Verificar que el sistema no permite iniciar sesión si el correo no pertenece a ninguna cuenta.
    it('Debe indicar que la contraseña o el correo son erróneos y responder con 400.', async () => {
        //Arrange
        const datosInicioSesion = {
            correo: 'ricardo.alan.gtz@gmail.com',
            contrasenia: '12345678_Rg'
        }

        const mockReq = { body: datosInicioSesion }

        //Act
        await usuariosController.iniciarSesion(mockReq, mockRes, mockNext);

        //Assert
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext.mock.calls[0][0].statusCode).toBe(401);
        expect(mockNext.mock.calls[0][0].message).toBe('No se encontró ningún usuario con ese correo.');
    });

});

