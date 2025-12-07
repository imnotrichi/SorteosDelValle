import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from "vitest";
import sorteosDAO from "../dataAccess/sorteosDAO.js";
const sorteosController = require('../controllers/sorteosController.js');
const { Sorteo, Configuracion, Premio, Organizador, Usuario, OrganizadorSorteo, Cliente, Numero, Pago } = require("../models/index.js");

let configId;
let organizadorId1;
let organizadorId2;
let organizadorCorreo1;
let organizadorCorreo2;
let datosSorteoBase;
let clienteId;
let mockRes, mockNext;
let id_sorteos = [];
let id_pagos = [];
let id_configuraciones = [];

// Función auxiliar para no repetir mocks
const setupMocks = () => ({
    mockRes: {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
        send: vi.fn()
    },
    mockNext: vi.fn(),
});

beforeAll(async () => {
    // Creamos los organizadores
    const datosUsuario1 = {
        nombres: "Diego",
        apellido_paterno: "Valenzuela",
        apellido_materno: "Parra",
        correo: "diegovalenzuela@gmail.com"
    };
    const usuario1 = await Usuario.create({
        ...datosUsuario1
    });
    const organizador1 = await Organizador.create({
        id_usuario: usuario1.id,
    });

    const datosUsuario2 = {
        nombres: "Victoria",
        apellido_paterno: "Vega",
        apellido_materno: "Bernal",
        correo: "victoriavega@gmail.com"
    };
    const usuario2 = await Usuario.create({
        ...datosUsuario2
    });
    const organizador2 = await Organizador.create({
        id_usuario: usuario2.id,
    });

    organizadorId1 = organizador1.id_usuario;
    organizadorId2 = organizador2.id_usuario;
    organizadorCorreo1 = datosUsuario1.correo;
    organizadorCorreo2 = datosUsuario2.correo;


    // Configuración de prueba
    const config = await Configuracion.create({
        "tiempo_limite_apartado": "160:00:00",
        "tiempo_recordatorio_pago": "72:00:00",
        "id_organizador": usuario1.id
    });
    configId = config.id;
    id_configuraciones.push(configId)

    datosSorteoBase = {
        "titulo": "Sorteo - Controller",
        "descripcion": "Descripción del sorteo - Controller.",
        "imagen_url": "http:imagenes.com/sorteo-controller",
        "rango_numeros": 100,
        "inicio_periodo_venta": "2025-12-15",
        "fin_periodo_venta": "2025-12-23",
        "fecha_realizacion": "2025-12-24",
        "precio_numero": 1000,
        "configuracionData": {
            "global": true,
            "tiempo_limite_apartado": null,
            "tiempo_recordatorio_pago": null,
            "correoOrganizador": organizadorCorreo1
        },
        "premiosData": [
            {
                "titulo": "Premio - Controller",
                "imagen_premio_url": "http:imagenes.com/premio-controller"
            }
        ],
        "organizadoresData": [
            { "correo": organizadorCorreo1 }
        ]
    };
});

beforeEach(async () => {
    ({ mockRes, mockNext } = setupMocks());
})

afterAll(async () => {
    await Sorteo.destroy({ where: { id: id_sorteos } });
    await Pago.destroy({ where: { id: id_pagos } });
    await OrganizadorSorteo.destroy({ where: { id_organizador: [organizadorId1, organizadorId2] } });
    await Configuracion.destroy({ where: { id: id_configuraciones } });
    await Organizador.destroy({ where: { id_usuario: [organizadorId1, organizadorId2] } });
    await Usuario.destroy({ where: { id: [organizadorId1, organizadorId2] } });
});

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

describe('crearSorteo (Controller)', () => {
    // Prueba 1: Crear un sorteo con datos válidos (1 organizador)
    it('debería crear un nuevo sorteo y responder con 200', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase);
        datosSorteo.titulo = "Sorteo - CST-001";

        const mockReq = { body: datosSorteo };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalled();
        const sorteoCreado = mockRes.json.mock.calls[0][0];
        id_sorteos.push(sorteoCreado.id);
        id_configuraciones.push(sorteoCreado.configuracionData.id);
        expect(sorteoCreado).toHaveProperty('id');
        expect(sorteoCreado.titulo).toBe(datosSorteo.titulo);
        expect(sorteoCreado.descripcion).toBe(datosSorteo.descripcion);
        expect(sorteoCreado.imagen_url).toBe(datosSorteo.imagen_url);
        expect(Number(sorteoCreado.rango_numeros)).toBe(Number(datosSorteo.rango_numeros));
        expect(sorteoCreado.inicio_periodo_venta).toBe(formatearFecha(datosSorteo.inicio_periodo_venta));
        expect(sorteoCreado.fin_periodo_venta).toBe(formatearFecha(datosSorteo.fin_periodo_venta));
        expect(sorteoCreado.fecha_realizacion).toBe(formatearFecha(datosSorteo.fecha_realizacion));
        expect(Number(sorteoCreado.precio_numero)).toBe(datosSorteo.precio_numero);
    });

    // Prueba 2: Intentar crear un sorteo sin título
    it('debería llamar a next con error 400 si falta el título', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        delete datosSorteoIncompleto.titulo;
        const mockReq = { body: datosSorteoIncompleto };


        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });

    // Prueba 3: Intentar crear un sorteo sin descripción
    it('debería llamar a next con error 400 si falta la descripción', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        delete datosSorteoIncompleto.descripcion;

        const mockReq = { body: datosSorteoIncompleto };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });

    // Prueba 4: Intentar crear un sorteo sin imagen del sorteo
    it('debería llamar a next con error 400 si falta la imagen del sorteo', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        delete datosSorteoIncompleto.imagen_url;

        const mockReq = { body: datosSorteoIncompleto };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });

    // Prueba 5: Intentar crear un sorteo sin rango de números
    it('debería llamar a next con error 400 si falta el rango de números', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        delete datosSorteoIncompleto.rango_numeros;

        const mockReq = { body: datosSorteoIncompleto };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });

    // Prueba 6: Intentar crear un sorteo sin inicio de periodo de venta
    it('debería llamar a next con error 400 si falta el inicio de periodo de venta', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        delete datosSorteoIncompleto.inicio_periodo_venta;

        const mockReq = { body: datosSorteoIncompleto };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });

    // Prueba 7: Intentar crear un sorteo sin periodo de venta
    it('debería llamar a next con error 400 si falta el fin de periodo de venta', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        delete datosSorteoIncompleto.fin_periodo_venta;

        const mockReq = { body: datosSorteoIncompleto };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });

    // Prueba 8: Intentar crear un sorteo sin fecha de realización
    it('debería llamar a next con error 400 si falta la fecha de realización', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        delete datosSorteoIncompleto.fecha_realizacion;

        const mockReq = { body: datosSorteoIncompleto };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });

    // Prueba 9: Intentar crear un sorteo sin precio por número
    it('debería llamar a next con error 400 si falta el precio por número', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        delete datosSorteoIncompleto.precio_numero;

        const mockReq = { body: datosSorteoIncompleto };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });

    // Prueba 10: Crear un sorteo con una nueva configuración
    it('debería crear un nuevo sorteo y responder con 200', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase);
        datosSorteo.titulo = "Sorteo - CST-010";
        datosSorteo.configuracionData.global = false;
        datosSorteo.configuracionData.tiempo_limite_apartado = 5;
        datosSorteo.configuracionData.tiempo_recordatorio_pago = 10;

        const mockReq = { body: datosSorteo };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        // Assert
        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalled();
        const sorteoCreado = mockRes.json.mock.calls[0][0];
        id_sorteos.push(sorteoCreado.id);
        id_configuraciones.push(sorteoCreado.configuracionData.id);
        expect(sorteoCreado).toHaveProperty('id');
        expect(sorteoCreado.titulo).toBe(datosSorteo.titulo);
        expect(sorteoCreado.descripcion).toBe(datosSorteo.descripcion);
        expect(sorteoCreado.imagen_url).toBe(datosSorteo.imagen_url);
        expect(sorteoCreado.rango_numeros).toBe(datosSorteo.rango_numeros);
        expect(sorteoCreado.inicio_periodo_venta).toBe(formatearFecha(datosSorteo.inicio_periodo_venta));
        expect(sorteoCreado.fin_periodo_venta).toBe(formatearFecha(datosSorteo.fin_periodo_venta));
        expect(sorteoCreado.fecha_realizacion).toBe(formatearFecha(datosSorteo.fecha_realizacion));
        expect(Number(sorteoCreado.precio_numero)).toBe(datosSorteo.precio_numero);
    });

    // Prueba 11: Intentar crear un sorteo sin datos del premio
    it('debería llamar a next con error 400 si faltan los datos del premio', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        delete datosSorteoIncompleto.premiosData;

        const mockReq = { body: datosSorteoIncompleto };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });

    // Prueba 12: Intentar crear un sorteo sin el título del premio
    it('debería llamar a next con error 400 si falta el título del premio', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        datosSorteoIncompleto.titulo = "Sorteo - CST-012";
        delete datosSorteoIncompleto.premiosData[0].titulo;
        const mockReq = { body: datosSorteoIncompleto };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });

    // Prueba 13: Intentar crear un sorteo sin la imagen del premio
    it('debería llamar a next con error 400 si falta la imagen del premio', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        datosSorteoIncompleto.titulo = "Sorteo - CST-013";
        delete datosSorteoIncompleto.premiosData[0].imagen_premio_url;
        const mockReq = { body: datosSorteoIncompleto };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });

    // Prueba 14: Intentar crear un sorteo con el título duplicado
    it('debería llamar a next con error 400 si el título del sorteo está duplicado', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase);
        datosSorteo.titulo = "Sorteo - CST-014";
        let mockReq = { body: datosSorteo };
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);
        const sorteoCreado = mockRes.json.mock.calls[0][0];
        id_sorteos.push(sorteoCreado.id);
        id_configuraciones.push(sorteoCreado.configuracionData.id);
        ({ mockRes, mockNext } = setupMocks());

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockRes.json).not.toHaveBeenCalled();
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Ya existe un sorteo con ese título.");
    });

    // Prueba 15: Intentar crear un sorteo con una la fecha fin de venta menor a la inicio
    it('debería llamar a next con error 400 si el periodo de venta es inválido (fin < inicio)', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        datosSorteoIncompleto.titulo = "Sorteo - CST-022";
        datosSorteoIncompleto.inicio_periodo_venta = "2025-12-01";
        datosSorteoIncompleto.fin_periodo_venta = "2025-10-20";

        const mockReq = { body: datosSorteoIncompleto };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        //Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Ingrese un periodo válido.");
    });

    // Prueba 16: Intentar crear un sorteo pero la fecha de realización ya pasó
    it('debería llamar a next con error 400 si la fecha de realización ya pasó', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        datosSorteoIncompleto.titulo = "Sorteo - CST-022";
        datosSorteoIncompleto.fecha_realizacion = "2020-01-01";

        const mockReq = { body: datosSorteoIncompleto };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("La fecha de realización del sorteo debe ser válida.");
    });

    // Prueba 17: Intentar crear un sorteo pero la fecha de inicio de venta ya pasó
    it('debería llamar a next con error 400 si la fecha inicial del periodo de venta ya pasó', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        datosSorteoIncompleto.titulo = "Sorteo - CST-022";
        datosSorteoIncompleto.inicio_periodo_venta = "2020-01-01";

        const mockReq = { body: datosSorteoIncompleto };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Arrange
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Ingrese un periodo válido.");

    });

    // Prueba 18: Intentar crear un sorteo pero la fecha final de venta ya pasó
    it('debería llamar a next con error 400 si la fecha final del periodo de venta ya pasó', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        datosSorteoIncompleto.titulo = "Sorteo - CST-022";
        datosSorteoIncompleto.fin_periodo_venta = "2020-01-01";

        const mockReq = { body: datosSorteoIncompleto };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Ingrese un periodo válido.");

    });

    // Prueba 19: Intentar crear un sorteo pero el recio por número es menor a $1
    it('debería llamar a next con error 400 si el precio por número es menor a 1 peso', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        datosSorteoIncompleto.titulo = "Sorteo - CST-022";
        datosSorteoIncompleto.precio_numero = 0;
        const mockReq = { body: datosSorteoIncompleto };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("El precio del número no puede ser menor a 1 peso.");
    });

    // Prueba 20: Crear un sorteo con datos válidos (2 organizadores)
    it('debería crear un nuevo sorteo y responder con 200', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase);
        datosSorteo.titulo = "Sorteo - CST-020";
        datosSorteo.organizadoresData.push({ "correo": organizadorCorreo2 })
        const mockReq = { body: datosSorteo };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalled();
        const sorteoCreado = mockRes.json.mock.calls[0][0];
        id_sorteos.push(sorteoCreado.id);
        id_configuraciones.push(sorteoCreado.configuracionData.id);
        expect(sorteoCreado).toHaveProperty('id');
        expect(sorteoCreado.titulo).toBe(datosSorteo.titulo);
        expect(sorteoCreado.descripcion).toBe(datosSorteo.descripcion);
        expect(sorteoCreado.imagen_url).toBe(datosSorteo.imagen_url);
        expect(sorteoCreado.rango_numeros).toBe(datosSorteo.rango_numeros);
        expect(sorteoCreado.inicio_periodo_venta).toBe(formatearFecha(datosSorteo.inicio_periodo_venta));
        expect(sorteoCreado.fin_periodo_venta).toBe(formatearFecha(datosSorteo.fin_periodo_venta));
        expect(sorteoCreado.fecha_realizacion).toBe(formatearFecha(datosSorteo.fecha_realizacion));
        expect(Number(sorteoCreado.precio_numero)).toBe(datosSorteo.precio_numero);
    });

    // Prueba 21: Intentar crear un sorteo sin datos de los organizadores
    it('debería llamar a next con error 400 si faltan los datos de los organizadores', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        delete datosSorteoIncompleto.organizadoresData;
        const mockReq = { body: datosSorteoIncompleto };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });

    // Prueba 22: Intentar crear un sorteo sin datos de los organizadores (array vacío)
    it('debería llamar a next con error 400 si faltan los datos de los organizadores (array vacío)', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        datosSorteoIncompleto.titulo = "Sorteo - CST-022";
        datosSorteoIncompleto.organizadoresData = [];
        const mockReq = { body: datosSorteoIncompleto };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('Debe haber al menos un organizador para el sorteo.');
    });

    // Prueba 23: Intentar crear un sorteo si el rango de números es menor a 1
    it('debería llamar a next con error 400 si el rango de números es menor a 1', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        datosSorteoIncompleto.titulo = "Sorteo - CST-023";
        datosSorteoIncompleto.rango_numeros = 0;
        const mockReq = { body: datosSorteoIncompleto };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('Se debe ingresar un rango de números mayor a 0.');
    });

    // Prueba 24: Intentar crear un sorteo con un correo no registrado como organizador
    it('debería llamar a next con error 400 si el correo no pertenece a un organizador', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase);
        datosSorteo.titulo = "Sorteo - CST-024"
        datosSorteo.organizadoresData[0].correo = "correofalso@falso.falacia.com";
        const mockReq = { body: datosSorteo };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe(`El correo del organizador 'correofalso@falso.falacia.com' no se encuentra registrado.`);
    });

    // Prueba 26: Intentar crear un sorteo sin ninguna configuración
    it('debería llamar a next con error 400 si no se pone ninguna configuración', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        datosSorteoIncompleto.titulo = "Sorteo - CST-026";
        datosSorteoIncompleto.configuracionData.global = false;
        datosSorteoIncompleto.configuracionData.tiempo_limite_apartado = null;
        datosSorteoIncompleto.configuracionData.tiempo_recordatorio_pago = null;
        const mockReq = { body: datosSorteoIncompleto };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });

    // Prueba 27: Intentar crear un sorteo pero el tiempo límite de apartado es menor a 1
    it('debería llamar a next con error 400 si el tiempo límite de apartado es menor a 1', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        datosSorteoIncompleto.titulo = "Sorteo  CST-027";
        datosSorteoIncompleto.configuracionData.global = false;
        datosSorteoIncompleto.configuracionData.tiempo_limite_apartado = 0;
        datosSorteoIncompleto.configuracionData.tiempo_recordatorio_pago = 8;
        const mockReq = { body: datosSorteoIncompleto };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });

    // Prueba 28: Intentar crear un sorteo pero el tiempo de recordatorio de pago es menor a 1
    it('debería llamar a next con error 400 si el tiempo de recordatorio de pago es menor a 1', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        datosSorteoIncompleto.titulo = "Sorteo  CST-028";
        datosSorteoIncompleto.configuracionData.global = false;
        datosSorteoIncompleto.configuracionData.tiempo_limite_apartado = 7;
        datosSorteoIncompleto.configuracionData.tiempo_recordatorio_pago = 0;
        const mockReq = { body: datosSorteoIncompleto };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });
});



describe('actualizarSorteo (Controller)', () => {
    // GST-001
    it('debería actualizar un sorteo exitosamente y responder con 200', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase);
        datosSorteo.titulo = "Sorteo - GST-001 - Controller"
        let mockReq = { body: datosSorteo };
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);
        const sorteoCreado = mockRes.json.mock.calls[0][0];

        const datosSorteoActualizado = {
            "descripcion": "Descripción del sorteo actualizado - DAO.",
            "imagen_url": "http:imagenes.com/sorteoactualizado-dao",
            "rango_numeros": 150,
            "inicio_periodo_venta": "2025-12-07",
            "fin_periodo_venta": "2025-12-24",
            "fecha_realizacion": "2025-12-25",
            "configuracionData": {
                "global": false,
                "tiempo_limite_apartado": 5,
                "tiempo_recordatorio_pago": 10,
                "correoOrganizador": organizadorCorreo2
            },
            "organizadoresData": [
                { "correo": organizadorCorreo2 }
            ]
        };

        mockReq = { params: { id: sorteoCreado.id }, body: datosSorteoActualizado };
        ({ mockRes, mockNext } = setupMocks());
        // Act
        await sorteosController.actualizarSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalled();
        const sorteoActualizado = mockRes.json.mock.calls[0][0];
        id_sorteos.push(sorteoActualizado.id);
        id_configuraciones.push(sorteoActualizado.configuracionData.id);
        expect(sorteoActualizado.descripcion).toBe(datosSorteoActualizado.descripcion);
        expect(sorteoActualizado.imagen_url).toBe(datosSorteoActualizado.imagen_url);
        expect(sorteoActualizado.rango_numeros).toBe(datosSorteoActualizado.rango_numeros);
        expect(sorteoActualizado.inicio_periodo_venta).toBe(formatearFecha(datosSorteoActualizado.inicio_periodo_venta));
        expect(sorteoActualizado.fin_periodo_venta).toBe(formatearFecha(datosSorteoActualizado.fin_periodo_venta));
        expect(sorteoActualizado.fecha_realizacion).toBe(formatearFecha(datosSorteoActualizado.fecha_realizacion));
    });

    it('debería llamar a next con error 404 si el sorteo a actualizar no existe', async () => {
        // Arrange
        const mockReq = { params: { id: 999999 }, body: { descripcion: "Test" } };

        // Act
        await sorteosController.actualizarSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe("El sorteo no existe.");
    });

    // ID: GST-013
    it('GST-013: debería llamar a next con error 400 si no se proporciona ningún dato (body vacío)', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase);
        datosSorteo.titulo = "Sorteo - GST-013 - Controller"
        let mockReq = { body: datosSorteo };
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);
        const sorteoCreado = mockRes.json.mock.calls[0][0];
        id_sorteos.push(sorteoCreado.id);
        id_configuraciones.push(sorteoCreado.configuracionData.id);
        mockReq = { params: { id: sorteoCreado.id }, body: {} };

        // Act
        await sorteosController.actualizarSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("No se proporcionó ningún dato para realizar la actualización.");
    });

    // ID: GST-014
    it('GST-014: debería llamar a next con error 400 si el rango de números es menor a 1', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase);
        datosSorteo.titulo = "Sorteo - GST-014 - Controller"
        let mockReq = { body: datosSorteo };
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);
        const sorteoCreado = mockRes.json.mock.calls[0][0];
        id_sorteos.push(sorteoCreado.id);
        id_configuraciones.push(sorteoCreado.configuracionData.id);
        mockReq = {
            params: { id: sorteoCreado.id }, body: { rango_numeros: 0 }
        };

        // Act
        await sorteosController.actualizarSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("El rango no puede ser menor a 1.");
    });

    // GST-015
    it('GST-015: debería llamar a next con error 400 si la fecha de inicio de venta ya pasó', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase);
        datosSorteo.titulo = "Sorteo - GST-015 - Controller"
        let mockReq = { body: datosSorteo };
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);
        const sorteoCreado = mockRes.json.mock.calls[0][0];
        id_sorteos.push(sorteoCreado.id);
        id_configuraciones.push(sorteoCreado.configuracionData.id);
        mockReq = {
            params: { id: sorteoCreado.id }, body: { inicio_periodo_venta: "2009-10-10", fin_periodo_venta: "2025-10-30" }
        };

        // Act
        await sorteosController.actualizarSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Ingrese un periodo válido.");
    });

    // GST-016
    it('GST-016: debería llamar a next con error 400 si la fecha de fin de venta ya pasó', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase);
        datosSorteo.titulo = "Sorteo - GST-016 - Controller"
        let mockReq = { body: datosSorteo };
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);
        const sorteoCreado = mockRes.json.mock.calls[0][0];
        id_sorteos.push(sorteoCreado.id);
        id_configuraciones.push(sorteoCreado.configuracionData.id);
        mockReq = {
            params: { id: sorteoCreado.id }, body: { fin_periodo_venta: "2025-10-30" }
        };

        // Act
        await sorteosController.actualizarSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Ingrese un periodo válido.");
    });

    // GST-017
    it('GST-017: debería llamar a next con error 400 si el periodo de venta es inválido (inicio > fin)', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase);
        datosSorteo.titulo = "Sorteo - GST-017 - Controller"
        let mockReq = { body: datosSorteo };
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);
        const sorteoCreado = mockRes.json.mock.calls[0][0];
        id_sorteos.push(sorteoCreado.id);
        id_configuraciones.push(sorteoCreado.configuracionData.id);
        mockReq = {
            params: { id: sorteoCreado.id }, body: {
                inicio_periodo_venta: "2026-02-20",
                fin_periodo_venta: "2025-01-01"
            }
        };

        // Act
        await sorteosController.actualizarSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Ingrese un periodo válido.");
    });

    // GST-018
    it('GST-018: debería llamar a next con error 400 si la fecha de realización ya pasó', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase);
        datosSorteo.titulo = "Sorteo - GST-018 - Controller"
        let mockReq = { body: datosSorteo };
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);
        const sorteoCreado = mockRes.json.mock.calls[0][0];
        id_sorteos.push(sorteoCreado.id);
        id_configuraciones.push(sorteoCreado.configuracionData.id);
        mockReq = {
            params: { id: sorteoCreado.id }, body: {
                fecha_realizacion: "2022-02-20",
            }
        };

        // Act
        await sorteosController.actualizarSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("La fecha de realización del sorteo debe ser válida.");
    });

    // GST-020
    it('GST-020: debería llamar a next con error 400 si el tiempo límite de apartado es menor a 1', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase);
        datosSorteo.titulo = "Sorteo - GST-020 - Controller"
        let mockReq = { body: datosSorteo };
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);
        const sorteoCreado = mockRes.json.mock.calls[0][0];
        id_sorteos.push(sorteoCreado.id);
        id_configuraciones.push(sorteoCreado.configuracionData.id);
        mockReq = {
            params: { id: sorteoCreado.id }, body: {
                configuracionData:
                {
                    global: false,
                    tiempo_limite_apartado: 0,
                    tiempo_recordatorio_pago: 3
                },
                organizadoresData: [{
                    "correo": organizadorCorreo1
                }]
            }
        };

        // Act
        await sorteosController.actualizarSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Todos los campos son requeridos.");
    });

    // GST-021
    it('GST-021: debería llamar a next con error 400 si el tiempo de recordatorio de pago es menor a 1', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase);
        datosSorteo.titulo = "Sorteo - GST-021 - Controller"
        let mockReq = { body: datosSorteo };
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);
        const sorteoCreado = mockRes.json.mock.calls[0][0];
        id_sorteos.push(sorteoCreado.id);
        id_configuraciones.push(sorteoCreado.configuracionData.id);
        mockReq = {
            params: { id: sorteoCreado.id }, body: {
                configuracionData:
                {
                    global: false,
                    tiempo_limite_apartado: 6,
                    tiempo_recordatorio_pago: 0
                },
                organizadoresData: [{
                    "correo": organizadorCorreo1
                }]
            }
        };

        // Act
        await sorteosController.actualizarSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Todos los campos son requeridos.");
    });

    // GST-022
    it('GST-022: debería llamar a next con error 400 si el correo de organizador no existe', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        datosSorteoIncompleto.titulo = "Sorteo - CST-022"
        datosSorteoIncompleto.organizadoresData[0].correo = "correofalso@falso.falacia.com";
        const mockReq = { body: datosSorteoIncompleto };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe(`El correo del organizador 'correofalso@falso.falacia.com' no se encuentra registrado.`);
    });

    // GST-02X
    it('GST-023: debería llamar a next con error 400 se trata de actualizar el rango de números si ya hay vendidos', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase);
        datosSorteo.titulo = "Sorteo - GST-023X";
        const mockReq = { body: datosSorteo };
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);
        const sorteoCreado = mockRes.json.mock.calls[0][0];
        id_sorteos.push(sorteoCreado.id);
        id_configuraciones.push(sorteoCreado.configuracionData.id);
        const usuario = await Usuario.create({ nombres: "Maynard", apellido_paterno: "James", apellido_materno: "Keenan", correo: "maynardjames@gmail.com" });
        const cliente = await Cliente.create({ id_usuario: usuario.id });
        const pago = await Pago.create({ monto_total: 1000, fecha: new Date() });
        id_pagos.push(pago.id);

        await Numero.create({
            numero: 67,
            estado: 'PAGADO',
            id_sorteo: sorteoCreado.id,
            id_cliente: cliente.id_usuario,
            id_pago: pago.id
        });

        // Act
        const mockReqEliminar = { params: { id: sorteoCreado.id }, body: { rango_numeros: 50 } };
        await sorteosController.actualizarSorteo(mockReqEliminar, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(405);
        expect(error.message).toBe("Solo se puede aumentar el rango de números ya que el sorteo cuenta con números vendidos.");

        // Cleanup
        await Numero.destroy({ where: { id_sorteo: sorteoCreado.id } });
        await Sorteo.destroy({ where: { id: sorteoCreado.id } });
        await Cliente.destroy({ where: { id_usuario: cliente.id_usuario } });
        await Usuario.destroy({ where: { id: usuario.id } });
    });

    // GST-02X
    it('GST-024X: debería llamar a next con error 400 si se actualiza la fecha de inicio del periodo de venta, pero el sorteo ya inició', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase);
        datosSorteo.titulo = "Sorteo - GST024X";
        datosSorteo.inicio_periodo_venta = "2025-11-01";
        datosSorteo.fin_periodo_venta = "2025-12-30";
        datosSorteo.fecha_realizacion = "2026-01-01";
        datosSorteo.Premios = {
            "titulo": "Premio - Controller",
            "imagen_premio_url": "http:imagenes.com/premio-controller"
        }
        datosSorteo.OrganizadorSorteos = [{ id_organizador: organizadorId1 }];
        datosSorteo.id_configuracion = configId;
        const sorteoCreado = await sorteosDAO.crearSorteo(datosSorteo);
        id_sorteos.push(sorteoCreado.id);
        id_configuraciones.push(sorteoCreado.Configuracion.id);

        const mockReq = {
            params: { id: sorteoCreado.id }, body: { inicio_periodo_venta: "2025-11-25" }
        };

        // Act
        await sorteosController.actualizarSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(405);
        expect(error.message).toBe("No se puede modificar la fecha de incio de venta de boletos ya que el sorteo cuenta con números vendidos.");
    });

    // GST-02X
    it('GST-025X: debería llamar a next con error 400 si se actualiza cualquier dato del sorteo, pero el sorteo ya se realizó', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase);
        datosSorteo.titulo = "Sorteo - GST025X";
        datosSorteo.inicio_periodo_venta = "2025-10-01";
        datosSorteo.fin_periodo_venta = "2025-10-20";
        datosSorteo.fecha_realizacion = "2025-10-25";
        datosSorteo.Premios = {
            "titulo": "Premio - Controller",
            "imagen_premio_url": "http:imagenes.com/premio-controller"
        }
        datosSorteo.OrganizadorSorteos = [{ id_organizador: organizadorId1 }];
        datosSorteo.id_configuracion = configId;
        const sorteoCreado = await sorteosDAO.crearSorteo(datosSorteo);
        id_sorteos.push(sorteoCreado.id);
        id_configuraciones.push(sorteoCreado.Configuracion.id);
        const mockReq = {
            params: { id: sorteoCreado.id }, body: {} // No mandamos nada porque aunque le mandemos nos debe dar para atrás
        };

        // Act
        await sorteosController.actualizarSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("No se puede actualizar este sorteo porque ya pasó.");
    });
});


describe('eliminarSorteo (Controller)', () => {
    // ID: GST-025
    it('GST-025: debería eliminar un sorteo existente y responder con 200', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase);
        datosSorteo.titulo = "Sorteo - GST025";
        let mockReq = { body: datosSorteo };
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        const sorteoCreado = mockRes.json.mock.calls[0][0];

        ({ mockRes, mockNext } = setupMocks());
        mockReq = { params: { id: sorteoCreado.id } };

        // Act
        await sorteosController.eliminarSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    // ID: GST-026
    it('GST-026: debería llamar a next con error 404 si el sorteo a eliminar no existe', async () => {
        // Arrange

        const mockReq = { params: { id: 99999 } }; // ID Inexistente

        // Act
        await sorteosController.eliminarSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe("El sorteo no existe.");
    });

    // ID: GST-027
    it('GST-027: debería llamar a next con error 405 si el sorteo tiene números vendidos', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase);
        datosSorteo.titulo = "Sorteo - GST-027";
        const mockReq = { body: datosSorteo };
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);
        const sorteoCreado = mockRes.json.mock.calls[0][0];
        id_sorteos.push(sorteoCreado.id);
        id_configuraciones.push(sorteoCreado.configuracionData.id);
        const usuario = await Usuario.create({ nombres: "Maynard", apellido_paterno: "James", apellido_materno: "Keenan", correo: "maynardjames@gmail.com" });
        const cliente = await Cliente.create({ id_usuario: usuario.id });
        const pago = await Pago.create({ monto_total: 1000, fecha: new Date() });
        id_pagos.push(pago.id);

        await Numero.create({
            numero: 67,
            estado: 'PAGADO',
            id_sorteo: sorteoCreado.id,
            id_cliente: cliente.id_usuario,
            id_pago: pago.id
        });

        // Act
        const mockReqEliminar = { params: { id: sorteoCreado.id } };
        await sorteosController.eliminarSorteo(mockReqEliminar, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(405);
        expect(error.message).toBe("No se puede eliminar este sorteo porque ya hay números vendidos.");

        // Cleanup
        await Numero.destroy({ where: { id_sorteo: sorteoCreado.id } });
        await Sorteo.destroy({ where: { id: sorteoCreado.id } });
        await Cliente.destroy({ where: { id_usuario: cliente.id_usuario } });
        await Usuario.destroy({ where: { id: usuario.id } });
    });

    // ID: GST-028
    it('GST-028: debería llamar a next con error 405 si ya se realizó el sorteo', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase);
        datosSorteo.titulo = "Sorteo - GST028";
        datosSorteo.fin_periodo_venta = "2020-05-01";
        datosSorteo.inicio_periodo_venta = "2020-01-01";
        datosSorteo.fecha_realizacion = "2020-06-03";
        datosSorteo.Premios = {
            "titulo": "Premio - Controller",
            "imagen_premio_url": "http:imagenes.com/premio-controller"
        }
        datosSorteo.OrganizadorSorteos = [{ id_organizador: organizadorId1 }];
        datosSorteo.id_configuracion = configId;
        const sorteoCreado = await sorteosDAO.crearSorteo(datosSorteo);
        id_sorteos.push(sorteoCreado.id);
        id_configuraciones.push(sorteoCreado.Configuracion.id);

        const mockReq = { params: { id: sorteoCreado.id } };

        // Act
        await sorteosController.eliminarSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(405);
        expect(error.message).toBe("No se puede eliminar este sorteo porque ya pasó.");

    });
});


describe('obtenerTableroSorteo(Controller)', () => {
    // ID: VTC-001
    it('VTC-001: debería obtener el tablero de un sorteo existente y responder con 200', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase);
        datosSorteo.titulo = "Sorteo - VTC-001";
        let mockReq = { body: datosSorteo };
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);
        const sorteoCreado = mockRes.json.mock.calls[0][0];
        console.log("SORTEO CREADO:", JSON.stringify(sorteoCreado, null, 2));
        id_sorteos.push(sorteoCreado.id);
        id_configuraciones.push(sorteoCreado.configuracionData.id);
        mockReq = { params: { id: sorteoCreado.id, idUsuario: organizadorId1 } };
        ({ mockRes, mockNext } = setupMocks());

        // Act
        await sorteosController.obtenerTableroSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalled();
        const tableroData = mockRes.json.mock.calls[0][0];
        expect(tableroData.id).toBe(sorteoCreado.id);
        expect(tableroData.titulo).toBe(sorteoCreado.titulo);
        expect(tableroData.descripcion).toBe(sorteoCreado.descripcion);
        expect(tableroData.imagen_url).toBe(sorteoCreado.imagen_url);
        expect(tableroData.boletos_pagados).toBe(0);
        expect(tableroData.boletos_apartados).toBe(0);
        expect(tableroData.boletos_disponibles).toBe(sorteoCreado.rango_numeros);
        expect(tableroData.dinero_recaudado).toBe("0.00");
        expect(tableroData.dinero_por_recaudar).toBe("0.00");
        expect(tableroData.fin_periodo_venta).toBe(sorteoCreado.fin_periodo_venta);
        expect(tableroData.fecha_realizacion).toBe(sorteoCreado.fecha_realizacion);
        expect(tableroData.precio_numero).toBe(Number(sorteoCreado.precio_numero).toFixed(2));
        expect(tableroData.estado).toBe("Activo");
    });

    // ID: VTC-002
    it('VTC-002: debería llamar a next con error 400 si no se proporciona el ID del usuario', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase);
        datosSorteo.titulo = "Sorteo - VTC-002";
        let mockReq = { body: datosSorteo };
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);
        const sorteoCreado = mockRes.json.mock.calls[0][0];
        id_sorteos.push(sorteoCreado.id);
        id_configuraciones.push(sorteoCreado.configuracionData.id);

        mockReq = { params: { id: sorteoCreado.id } };
        ({ mockRes, mockNext } = setupMocks());

        // Act
        await sorteosController.obtenerTableroSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Se debe proporcionar un ID de usuario para ver el tablero.");
    });

    // ID: VTC-003
    it('VTC-003: debería llamar a next con error 400 si el ID del usuario tiene letras', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase);
        datosSorteo.titulo = "Sorteo - VTC-003";
        let mockReq = { body: datosSorteo };
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);
        const sorteoCreado = mockRes.json.mock.calls[0][0];
        id_sorteos.push(sorteoCreado.id);
        id_configuraciones.push(sorteoCreado.configuracionData.id);

        mockReq = { params: { id: sorteoCreado.id, idUsuario: "1abc" } };
        ({ mockRes, mockNext } = setupMocks());

        // Act
        await sorteosController.obtenerTableroSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("El ID de usuario proporcionado no es válido.");
    });

    // ID: VTC-004
    it('VTC-004: debería llamar a next con error 404 si el usuario no existe', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase);
        datosSorteo.titulo = "Sorteo - VTC-004";
        let mockReq = { body: datosSorteo };
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);
        const sorteoCreado = mockRes.json.mock.calls[0][0];
        id_sorteos.push(sorteoCreado.id);
        id_configuraciones.push(sorteoCreado.configuracionData.id);
        mockReq = { params: { id: sorteoCreado.id, idUsuario: 99999 } };
        ({ mockRes, mockNext } = setupMocks());

        // Act
        await sorteosController.obtenerTableroSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe("No se encontró el usuario.");
    });

    // ID: VTC-005
    it('VTC-005: debería llamar a next con error 400 si no se proporciona el ID del sorteo', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase);
        datosSorteo.titulo = "Sorteo - VTC-005";
        let mockReq = { body: datosSorteo };
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);
        const sorteoCreado = mockRes.json.mock.calls[0][0];
        id_sorteos.push(sorteoCreado.id);
        id_configuraciones.push(sorteoCreado.configuracionData.id);

        mockReq = { params: { idUsuario: organizadorId1 } };
        ({ mockRes, mockNext } = setupMocks());

        // Act
        await sorteosController.obtenerTableroSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Se debe proporcionar el ID del sorteo para ver el tablero.");
    });

    // ID: VTC-006
    it('VTC-006: debería llamar a next con error 400 si el ID del sorteo tiene letras', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase);
        datosSorteo.titulo = "Sorteo - VTC-006";
        let mockReq = { body: datosSorteo };
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);
        const sorteoCreado = mockRes.json.mock.calls[0][0];
        id_sorteos.push(sorteoCreado.id);
        id_configuraciones.push(sorteoCreado.configuracionData.id);

        mockReq = { params: { id: `${sorteoCreado.id}abc`, idUsuario: organizadorId1 } };
        ({ mockRes, mockNext } = setupMocks());

        // Act
        await sorteosController.obtenerTableroSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("El ID del sorteo proporcionado no es válido.");
    });

    // ID: VTC-007
    it('VTC-007: debería llamar a next con error 404 si el sorteo no existe', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase);
        datosSorteo.titulo = "Sorteo - VTC-007";
        let mockReq = { body: datosSorteo };
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);
        const sorteoCreado = mockRes.json.mock.calls[0][0];
        id_sorteos.push(sorteoCreado.id);
        id_configuraciones.push(sorteoCreado.configuracionData.id);
        mockReq = { params: { id: 99999, idUsuario: organizadorId1 } };
        ({ mockRes, mockNext } = setupMocks());

        // Act
        await sorteosController.obtenerTableroSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe("No se encontró el sorteo solicitado.");
    });

    // ID: VTC-008
    it('VTC-008: debería llamar a next con error 403 si el usuario no es un organizador a cargo del sorteo', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase);
        datosSorteo.titulo = "Sorteo - VTC-008";
        let mockReq = { body: datosSorteo };
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);
        const sorteoCreado = mockRes.json.mock.calls[0][0];
        id_sorteos.push(sorteoCreado.id);
        id_configuraciones.push(sorteoCreado.configuracionData.id);
        mockReq = { params: { id: sorteoCreado.id, idUsuario: organizadorId2 } };
        ({ mockRes, mockNext } = setupMocks());

        // Act
        await sorteosController.obtenerTableroSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(403);
        expect(error.message).toBe("Usted no tiene los permisos para ver el tablero del sorteo.");
    });
});
// Función auxiliar para formatear fechas
function formatearFecha(fechaISO) {
    if (!fechaISO) return null;
    const fecha = new Date(fechaISO);

    // Configura aquí tu zona horaria (ej. 'America/Mexico_City', 'America/Hermosillo', etc.)
    return fecha.toLocaleString('es-MX', {
        timeZone: 'America/Mexico_City',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true // Pone AM/PM
    });
};

