import { or } from "sequelize";
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
const sorteosController = require('../controllers/sorteosController.js');
const { Sorteo, Configuracion, Premio, Organizador, Usuario, OrganizadorSorteo } = require("../models/index.js");

let configId;
let organizadorId1;
let organizadorId2;
let organizadorCorreo1;
let organizadorCorreo2;
let datosSorteoBase;

beforeAll(async () => {
    // Configuración de prueba
    const config = await Configuracion.create({
        "tiempo_limite_apartado": "160:00:00",
        "tiempo_recordatorio_pago": "72:00:00"
    });
    configId = config.id;

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


    datosSorteoBase = {
        "titulo": "Sorteo - Controller",
        "descripcion": "Descripción del sorteo - Controller.",
        "imagen_url": "http:imagenes.com/sorteo-controller",
        "rango_numeros": 100,
        "inicio_periodo_venta": "2025-12-06",
        "fin_periodo_venta": "2025-12-23",
        "fecha_realizacion": "2025-12-24",
        "precio_numero": 1000,
        "id_configuracion": configId,
        //"config_global": true,
        //"tiempo_limite_apartado": 7,
        //"tiempo_recordatorio_pago": 3,
        "Premios": [{
            "titulo": "Premio - Controller",
            "imagen_premio_url": "http:imagenes.com/premio-controller"
        }],
        "organizadores": [{ "correo": organizadorCorreo1 }]
    };
});

afterAll(async () => {
    // Eliminar organizadores y usuarios creados
    await OrganizadorSorteo.destroy({ where: { id_organizador: organizadorId1 } });
    await OrganizadorSorteo.destroy({ where: { id_organizador: organizadorId2 } });
    await Organizador.destroy({ where: { id_usuario: organizadorId1 } });
    await Organizador.destroy({ where: { id_usuario: organizadorId2 } });
    await Usuario.destroy({ where: { id: organizadorId1 } });
    await Usuario.destroy({ where: { id: organizadorId2 } });
    await Premio.destroy({ where: {} });
    await Sorteo.destroy({ where: {} });
    await Configuracion.destroy({ where: { id: configId } });
});

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// Función auxiliar para no repetir mocks
const setupMocks = () => ({
    mockRes: {
        status: vi.fn(() => this.mockRes),
        json: vi.fn(),
    },
    mockNext: vi.fn(),
});

describe('crearSorteo (Controller)', () => {
    // Prueba 1: Crear un sorteo con datos válidos (1 organizador)
    it('debería crear un nuevo sorteo y responder con 200', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase);

        const mockReq = { body: datosSorteo };
        const mockRes = {
            status: vi.fn(() => mockRes),
            json: vi.fn(),
        };
        const mockNext = vi.fn();

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalled();
        const sorteoCreado = mockRes.json.mock.calls[0][0];
        const toShort = d => new Date(d).toISOString().substring(0, 10);
        expect(sorteoCreado).toHaveProperty('id');
        expect(sorteoCreado.titulo).toBe(datosSorteo.titulo);
        expect(sorteoCreado.descripcion).toBe(datosSorteo.descripcion);
        expect(sorteoCreado.imagen_url).toBe(datosSorteo.imagen_url);
        expect(sorteoCreado.rango_numeros).toBe(datosSorteo.rango_numeros);
        expect(toShort(sorteoCreado.inicio_periodo_venta))
            .toBe(datosSorteo.inicio_periodo_venta);
        expect(toShort(sorteoCreado.fin_periodo_venta))
            .toBe(datosSorteo.fin_periodo_venta);
        expect(toShort(sorteoCreado.fecha_realizacion))
            .toBe(datosSorteo.fecha_realizacion);
        expect(sorteoCreado.precio_numero).toBe(datosSorteo.precio_numero);
        expect(sorteoCreado.id_configuracion).toBe(datosSorteo.id_configuracion);
    });

    // Prueba 2: Intentar crear un sorteo sin título
    it('debería llamar a next con error 400 si falta el título', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        delete datosSorteoIncompleto.titulo;
        const mockReq = { body: datosSorteoIncompleto };
        const { mockRes, mockNext } = setupMocks();

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
        const { mockRes, mockNext } = setupMocks();
        const mockReq = { body: datosSorteoIncompleto };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });

    // Prueba 4: Intentar crear un sorteo sin imagen
    it('debería llamar a next con error 400 si falta la imagen', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        delete datosSorteoIncompleto.imagen_url;
        const { mockRes, mockNext } = setupMocks();
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
        const { mockRes, mockNext } = setupMocks();
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
        const { mockRes, mockNext } = setupMocks();
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
        const { mockRes, mockNext } = setupMocks();
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
        const { mockRes, mockNext } = setupMocks();
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
        const { mockRes, mockNext } = setupMocks();
        const mockReq = { body: datosSorteoIncompleto };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });

    // Prueba 10: Intentar crear un sorteo sin ID de configuración
    it('debería llamar a next con error 400 si falta el ID de configuración', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        delete datosSorteoIncompleto.id_configuracion;
        const { mockRes, mockNext } = setupMocks();
        const mockReq = { body: datosSorteoIncompleto };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });

    // Prueba 11: Intentar crear un sorteo sin datos del premio
    it('debería llamar a next con error 400 si faltan los datos del premio', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        delete datosSorteoIncompleto.Premios;
        const { mockRes, mockNext } = setupMocks();
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
        delete datosSorteoIncompleto.Premios[0].titulo;
        const { mockRes, mockNext } = setupMocks();
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
        delete datosSorteoIncompleto.Premios[0].imagen_premio_url;
        const { mockRes, mockNext } = setupMocks();
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
        datosSorteo.titulo = "Sorteo 14 - Controller";

        // Primera llamada: DEBE CREAR el sorteo correctamente
        {
            const { mockRes, mockNext } = setupMocks();
            const mockReq = { body: datosSorteo };

            await sorteosController.crearSorteo(mockReq, mockRes, mockNext);
        }

        // Segunda llamada: DEBE FALLAR porque el título ya existe
        const { mockRes, mockNext } = setupMocks();
        const mockReq = { body: datosSorteo };

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
        datosSorteoIncompleto.inicio_periodo_venta = "2025-12-01";
        datosSorteoIncompleto.fin_periodo_venta = "2025-10-20";
        const { mockRes, mockNext } = setupMocks();
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
        datosSorteoIncompleto.fecha_realizacion = "2020-01-01";
        const { mockRes, mockNext } = setupMocks();
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
        datosSorteoIncompleto.inicio_periodo_venta = "2020-01-01";
        const { mockRes, mockNext } = setupMocks();
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
        datosSorteoIncompleto.fin_periodo_venta = "2020-01-01";
        const { mockRes, mockNext } = setupMocks();
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
        datosSorteoIncompleto.precio_numero = 0;
        const { mockRes, mockNext } = setupMocks();
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
        datosSorteo.titulo = "Sorteo 20 - Controller";
        datosSorteo.organizadores.push({ "correo": organizadorCorreo2 })

        const mockReq = { body: datosSorteo };
        const mockRes = {
            status: vi.fn(() => mockRes),
            json: vi.fn(),
        };
        const mockNext = vi.fn();

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalled();
        const sorteoCreado = mockRes.json.mock.calls[0][0];
        const toShort = d => new Date(d).toISOString().substring(0, 10);
        expect(sorteoCreado).toHaveProperty('id');
        expect(sorteoCreado.titulo).toBe(datosSorteo.titulo);
        expect(sorteoCreado.descripcion).toBe(datosSorteo.descripcion);
        expect(sorteoCreado.imagen_url).toBe(datosSorteo.imagen_url);
        expect(sorteoCreado.rango_numeros).toBe(datosSorteo.rango_numeros);
        expect(toShort(sorteoCreado.inicio_periodo_venta))
            .toBe(datosSorteo.inicio_periodo_venta);
        expect(toShort(sorteoCreado.fin_periodo_venta))
            .toBe(datosSorteo.fin_periodo_venta);
        expect(toShort(sorteoCreado.fecha_realizacion))
            .toBe(datosSorteo.fecha_realizacion);
        expect(sorteoCreado.precio_numero).toBe(datosSorteo.precio_numero);
        expect(sorteoCreado.id_configuracion).toBe(datosSorteo.id_configuracion);
    });

    // Prueba 21: Intentar crear un sorteo sin datos de los organizadores
    it('debería llamar a next con error 400 si faltan los datos de los organizadores', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        delete datosSorteoIncompleto.organizadores;
        const { mockRes, mockNext } = setupMocks();
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
        datosSorteoIncompleto.organizadores = [];
        const { mockRes, mockNext } = setupMocks();
        const mockReq = { body: datosSorteoIncompleto };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('Se debe seleccionar al menos a un organizador.');
    });

    // Prueba 23: Intentar crear un sorteo si el rango de números es menor a 1
    it('debería llamar a next con error 400 si el rango de números es menor a 1', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        datosSorteoIncompleto.rango_numeros = 0;
        const { mockRes, mockNext } = setupMocks();
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
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        datosSorteoIncompleto.organizadores[0].correo = "correofalso@falso.falacia.com";
        const { mockRes, mockNext } = setupMocks();
        const mockReq = { body: datosSorteoIncompleto };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('No hay un organizador registrado con ese correo.');
    });
/*
    // Prueba 25: Crear un sorteo con una nueva configuración
    it('debería crear un nuevo sorteo y responder con 200', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase);
        datosSorteo.titulo = "Sorteo 25 - Controller";
        datosSorteo.config_global = false;
        datosSorteo.tiempo_limite_apartado = 7;
        datosSorteo.tiempo_recordatorio_pago = 3;
        const mockReq = { body: datosSorteo };
        const mockRes = {
            status: vi.fn(() => mockRes),
            json: vi.fn(),
        };
        const mockNext = vi.fn();

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalled();
        const sorteoCreado = mockRes.json.mock.calls[0][0];
        const toShort = d => new Date(d).toISOString().substring(0, 10);
        expect(sorteoCreado).toHaveProperty('id');
        expect(sorteoCreado.titulo).toBe(datosSorteo.titulo);
        expect(sorteoCreado.descripcion).toBe(datosSorteo.descripcion);
        expect(sorteoCreado.imagen_url).toBe(datosSorteo.imagen_url);
        expect(sorteoCreado.rango_numeros).toBe(datosSorteo.rango_numeros);
        expect(toShort(sorteoCreado.inicio_periodo_venta))
            .toBe(datosSorteo.inicio_periodo_venta);
        expect(toShort(sorteoCreado.fin_periodo_venta))
            .toBe(datosSorteo.fin_periodo_venta);
        expect(toShort(sorteoCreado.fecha_realizacion))
            .toBe(datosSorteo.fecha_realizacion);
        expect(sorteoCreado.precio_numero).toBe(datosSorteo.precio_numero);
        expect(sorteoCreado.id_configuracion).toBe(datosSorteo.id_configuracion);
    });

    // Prueba 26: Intentar crear un sorteo sin ninguna configuración
    it('debería llamar a next con error 400 si no se pone ninguna configuración', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        datosSorteoIncompleto.config_global = false;
        // El tiempo límite de apartado y el tiempo de recordatorio de pago no están por defecto
        const { mockRes, mockNext } = setupMocks();
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
        datosSorteoIncompleto.config_global = false;
        datosSorteo.tiempo_limite_apartado = 0;
        const { mockRes, mockNext } = setupMocks();
        const mockReq = { body: datosSorteoIncompleto };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('Ingrese un tiempo límite de apartado válido.');
    });

    // Prueba 28: Intentar crear un sorteo pero el tiempo de recordatorio de pago es menor a 1
    it('debería llamar a next con error 400 si el tiempo de recordatorio de pago es menor a 1', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        datosSorteoIncompleto.config_global = false;
        datosSorteo.tiempo_recordatorio_pago = 0;
        const { mockRes, mockNext } = setupMocks();
        const mockReq = { body: datosSorteoIncompleto };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('Ingrese un tiempo de recordatorio de pago válido.');
    });
*/
});