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
        const { mockRes, mockNext } = setupMocks();

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

    describe('actualizarSorteo (Controller)', () => {
        // GST-001
        it('debería actualizar un sorteo exitosamente y responder con 200', async () => {
            // Arrange
            const datosSorteo = deepClone(datosSorteoBase);
            datosSorteo.titulo = "Sorteo GST-001";
            let mockReq = { body: datosSorteo };
            let { mockRes, mockNext } = setupMocks();
            const sorteoCreado = await sorteosController.crearSorteo(mockReq, mockRes, mockNext);
            const sorteoId = sorteoCreado.id;

            const datosSorteoActualizado = {
                "descripcion": "Descripción del sorteo actualizado - Controller.",
                "imagen_url": "http:imagenes.com/sorteoactualizado-controller",
                "rango_numeros": 150,
                "inicio_periodo_venta": "2025-12-07",
                "fin_periodo_venta": "2025-12-24",
                "fecha_realizacion": "2025-12-25",
                /////////////////////////////////////////////////////////////
                //NO ME ACUERDO SI EL PRECIO POR NÚMERO SE PUEDE ACTUALIZAR//
                /////////////////////////////////////////////////////////////
                "precio_numero": 1500,
                /////////////////////////////////////////////////////////////
                //NO ME ACUERDO SI EL PRECIO POR NÚMERO SE PUEDE ACTUALIZAR//
                /////////////////////////////////////////////////////////////
                "config_global": false,
                "tiempo_limite_apartado": 10,
                "tiempo_recordatorio_pago": 20,
                "Premios": [{
                    "id": sorteoCreado.Premios[0].id,
                    "titulo": "Premio actualizado - Controller",
                    "imagen_premio_url": "http:imagenes.com/premioactualizado-controller"
                }],
                "OrganizadorSorteos": [organizadorCorreo2]
            };

            mockRes, mockNext = setupMocks();
            mockReq = { params: { id: sorteoId }, body: datosSorteoActualizado };

            // Act
            await sorteosController.actualizarSorteo(mockReq, mockRes, mockNext);

            // Assert
            expect(mockNext).not.toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalled();
            const sorteoActualizado = mockRes.json.mock.calls[0][0];
            expect(sorteoActualizado.descripcion).toBe(datosSorteoActualizado.descripcion);
            expect(sorteoActualizado.imagen_url).toBe(datosSorteoActualizado.imagen_url);
            expect(sorteoActualizado.rango_numeros).toBe(datosSorteoActualizado.rango_numeros);
            expect(toShort(sorteoActualizado.inicio_periodo_venta)).toBe(datosSorteoActualizado.inicio_periodo_venta);
            expect(toShort(sorteoActualizado.fin_periodo_venta)).toBe(datosSorteoActualizado.fin_periodo_venta);
            expect(toShort(sorteoActualizado.fecha_realizacion)).toBe(datosSorteoActualizado.fecha_realizacion);
            expect(sorteoActualizado.precio_numero).toBe(datosSorteoActualizado.precio_numero);
            expect(sorteoActualizado.Premios[0].id).toBe(datosSorteoActualizado.Premios[0].id);
            expect(sorteoActualizado.Premios[0].titulo).toBe(datosSorteoActualizado.Premios[0].titulo);
            expect(sorteoActualizado.Premios[0].imagen_premio_url).toBe(datosSorteoActualizado.Premios[0].imagen_premio_url);
        });

        it('debería llamar a next con error 404 si el sorteo a actualizar no existe', async () => {
            // Arrange
            const { mockRes, mockNext } = setupMocks();
            const mockReq = { params: { id: 99999 }, body: { descripcion: "Test" } };

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
            datosSorteo.titulo = "Sorteo - GST 013";
            const mockReq = { params: { id: sorteoId }, body: {} };
            const { mockRes, mockNext } = setupMocks();
            const sorteoCreado = await sorteosController.crearSorteo(mockReq, mockRes, mockNext);
            const sorteoId = sorteoCreado.id;

            // Act
            await sorteosController.actualizarSorteo(mockReq, mockRes, mockNext);

            // Assert
            expect(mockNext).toHaveBeenCalledTimes(1);
            const error = mockNext.mock.calls[0][0];
            expect(error.statusCode).toBe(404);
            expect(error.message).toBe("No se proporcionó ningún dato para realizar la actualización.");
        });

        // ID: GST-014
        it('GST-014: debería llamar a next con error 400 si el rango de números es menor a 1', async () => {
            // Arrange
            const datosSorteo = deepClone(datosSorteoBase);
            datosSorteo.titulo = "Sorteo - GST 014";
            datosSorteo.rango_numeros = 0;
            const mockReq = { params: { id: sorteoId }, body: datosSorteo };
            const { mockRes, mockNext } = setupMocks();
            const sorteoCreado = await sorteosController.crearSorteo(mockReq, mockRes, mockNext);
            const sorteoId = sorteoCreado.id;

            // Act
            await sorteosController.actualizarSorteo(mockReq, mockRes, mockNext);

            // Assert
            expect(mockNext).toHaveBeenCalledTimes(1);
            const error = mockNext.mock.calls[0][0];
            expect(error.statusCode).toBe(400);
            expect(error.message).toBe("El rango no puede ser menor a 1.");
        });

        // ID: GST-015
        it('GST-015: debería llamar a next con error 400 si la fecha de inicio de venta ya pasó', async () => {
            // Arrange
            // Crear el sorteo base para la prueba
            const { mockRes: mockResCrear, mockNext: mockNextCrear } = setupMocks();
            const datosCrear = deepClone(datosSorteoBase);
            datosCrear.titulo = "Sorteo GST-015";
            await sorteosController.crearSorteo({ body: datosCrear }, mockResCrear, mockNextCrear);
            if (mockNextCrear.mock.calls.length > 0) { throw new Error(`Fallo al crear sorteo de prueba: ${mockNextCrear.mock.calls[0][0].message}`); }
            const sorteoId = mockResCrear.json.mock.calls[0][0].id;

            const { mockRes, mockNext } = setupMocks();
            const mockReq = { params: { id: sorteoId }, body: { inicio_periodo_venta: "2020-01-01" } };

            // Act
            await sorteosController.actualizarSorteo(mockReq, mockRes, mockNext);

            // Assert
            expect(mockNext).toHaveBeenCalledTimes(1);
            const error = mockNext.mock.calls[0][0];
            expect(error.statusCode).toBe(400);
            expect(error.message).toBe("La fecha de inicio de venta ya pasó.");
        });

        // ID: GST-016
        it('GST-016: debería llamar a next con error 400 si la fecha de fin de venta ya pasó', async () => {
            // Arrange
            // Crear el sorteo base para la prueba
            const { mockRes: mockResCrear, mockNext: mockNextCrear } = setupMocks();
            const datosCrear = deepClone(datosSorteoBase);
            datosCrear.titulo = "Sorteo GST-016";
            await sorteosController.crearSorteo({ body: datosCrear }, mockResCrear, mockNextCrear);
            if (mockNextCrear.mock.calls.length > 0) { throw new Error(`Fallo al crear sorteo de prueba: ${mockNextCrear.mock.calls[0][0].message}`); }
            const sorteoId = mockResCrear.json.mock.calls[0][0].id;

            const { mockRes, mockNext } = setupMocks();
            const mockReq = { params: { id: sorteoId }, body: { fin_periodo_venta: "2020-01-01" } };

            // Act
            await sorteosController.actualizarSorteo(mockReq, mockRes, mockNext);

            // Assert
            expect(mockNext).toHaveBeenCalledTimes(1);
            const error = mockNext.mock.calls[0][0];
            expect(error.statusCode).toBe(400);
            expect(error.message).toBe("La fecha de fin de venta ya pasó.");
        });

        // ID: GST-017
        it('GST-017: debería llamar a next con error 400 si la fecha de inicio es posterior a la de fin', async () => {
            // Arrange
            // Crear el sorteo base para la prueba
            const { mockRes: mockResCrear, mockNext: mockNextCrear } = setupMocks();
            const datosCrear = deepClone(datosSorteoBase);
            datosCrear.titulo = "Sorteo GST-017";
            await sorteosController.crearSorteo({ body: datosCrear }, mockResCrear, mockNextCrear);
            if (mockNextCrear.mock.calls.length > 0) { throw new Error(`Fallo al crear sorteo de prueba: ${mockNextCrear.mock.calls[0][0].message}`); }
            const sorteoId = mockResCrear.json.mock.calls[0][0].id;

            const { mockRes, mockNext } = setupMocks();
            const mockReq = {
                params: { id: sorteoId }, body: {
                    inicio_periodo_venta: "2025-12-23",
                    fin_periodo_venta: "2025-12-06"
                }
            };

            // Act
            await sorteosController.actualizarSorteo(mockReq, mockRes, mockNext);

            // Assert
            expect(mockNext).toHaveBeenCalledTimes(1);
            const error = mockNext.mock.calls[0][0];
            expect(error.statusCode).toBe(400);
            expect(error.message).toBe("Se debe ingresar un periodo válido.");
        });

        // ID: GST-018
        it('GST-018: debería llamar a next con error 400 si la fecha de realización ya pasó', async () => {
            // Arrange
            // Crear el sorteo base para la prueba
            const { mockRes: mockResCrear, mockNext: mockNextCrear } = setupMocks();
            const datosCrear = deepClone(datosSorteoBase);
            datosCrear.titulo = "Sorteo GST-018";
            await sorteosController.crearSorteo({ body: datosCrear }, mockResCrear, mockNextCrear);
            if (mockNextCrear.mock.calls.length > 0) { throw new Error(`Fallo al crear sorteo de prueba: ${mockNextCrear.mock.calls[0][0].message}`); }
            const sorteoId = mockResCrear.json.mock.calls[0][0].id;

            const { mockRes, mockNext } = setupMocks();
            const mockReq = { params: { id: sorteoId }, body: { fecha_realizacion: "2020-01-01" } };

            // Act
            await sorteosController.actualizarSorteo(mockReq, mockRes, mockNext);

            // Assert
            expect(mockNext).toHaveBeenCalledTimes(1);
            const error = mockNext.mock.calls[0][0];
            expect(error.statusCode).toBe(400);
            expect(error.message).toBe("La fecha de realización ya pasó.");
        });

        // ID: GST-019
        it('GST-019: debería llamar a next con error 400 si el precio por número es menor a 1', async () => {
            // Arrange
            // Crear el sorteo base para la prueba
            const { mockRes: mockResCrear, mockNext: mockNextCrear } = setupMocks();
            const datosCrear = deepClone(datosSorteoBase);
            datosCrear.titulo = "Sorteo GST-019";
            await sorteosController.crearSorteo({ body: datosCrear }, mockResCrear, mockNextCrear);
            if (mockNextCrear.mock.calls.length > 0) { throw new Error(`Fallo al crear sorteo de prueba: ${mockNextCrear.mock.calls[0][0].message}`); }
            const sorteoId = mockResCrear.json.mock.calls[0][0].id;

            const { mockRes, mockNext } = setupMocks();
            const mockReq = { params: { id: sorteoId }, body: { precio_numero: 0 } };

            // Act
            await sorteosController.actualizarSorteo(mockReq, mockRes, mockNext);

            // Assert
            expect(mockNext).toHaveBeenCalledTimes(1);
            const error = mockNext.mock.calls[0][0];
            expect(error.statusCode).toBe(400);
            expect(error.message).toBe("El precio por número no puede ser menor a $1.");
        });

        // ID: GST-020
        it('GST-020: debería llamar a next con error 400 si el tiempo límite de apartado es menor a 1', async () => {
            // Arrange
            // Crear el sorteo base para la prueba
            const { mockRes: mockResCrear, mockNext: mockNextCrear } = setupMocks();
            const datosCrear = deepClone(datosSorteoBase);
            datosCrear.titulo = "Sorteo GST-020";
            await sorteosController.crearSorteo({ body: datosCrear }, mockResCrear, mockNextCrear);
            if (mockNextCrear.mock.calls.length > 0) { throw new Error(`Fallo al crear sorteo de prueba: ${mockNextCrear.mock.calls[0][0].message}`); }
            const sorteoId = mockResCrear.json.mock.calls[0][0].id;

            const { mockRes, mockNext } = setupMocks();
            // Asumiendo que el controlador puede crear/actualizar config desde el body
            const mockReq = {
                params: { id: sorteoId }, body: {
                    tiempo_limite_apartado: 0,
                    tiempo_recordatorio_pago: 4 // Se provee el otro campo para que sea válido
                }
            };

            // Act
            await sorteosController.actualizarSorteo(mockReq, mockRes, mockNext);

            // Assert
            expect(mockNext).toHaveBeenCalledTimes(1);
            const error = mockNext.mock.calls[0][0];
            expect(error.statusCode).toBe(400);
            expect(error.message).toBe("El tiempo límite de apartado no puede ser menor a 1.");
        });

        // ID: GST-021
        it('GST-021: debería llamar a next con error 400 si el tiempo de recordatorio es menor a 1', async () => {
            // Arrange
            // Crear el sorteo base para la prueba
            const { mockRes: mockResCrear, mockNext: mockNextCrear } = setupMocks();
            const datosCrear = deepClone(datosSorteoBase);
            datosCrear.titulo = "Sorteo GST-021";
            await sorteosController.crearSorteo({ body: datosCrear }, mockResCrear, mockNextCrear);
            if (mockNextCrear.mock.calls.length > 0) { throw new Error(`Fallo al crear sorteo de prueba: ${mockNextCrear.mock.calls[0][0].message}`); }
            const sorteoId = mockResCrear.json.mock.calls[0][0].id;

            const { mockRes, mockNext } = setupMocks();
            const mockReq = {
                params: { id: sorteoId }, body: {
                    tiempo_limite_apartado: 7,
                    tiempo_recordatorio_pago: 0
                }
            };

            // Act
            await sorteosController.actualizarSorteo(mockReq, mockRes, mockNext);

            // Assert
            expect(mockNext).toHaveBeenCalledTimes(1);
            const error = mockNext.mock.calls[0][0];
            expect(error.statusCode).toBe(400);
            expect(error.message).toBe("El tiempo de recordatorio de pago no puede ser menor a 1.");
        });

        // ID: GST-022
        it('GST-022: debería llamar a next con error 400 si un correo de organizador no existe', async () => {
            // Arrange
            // Crear el sorteo base para la prueba
            const { mockRes: mockResCrear, mockNext: mockNextCrear } = setupMocks();
            const datosCrear = deepClone(datosSorteoBase);
            datosCrear.titulo = "Sorteo GST-022";
            await sorteosController.crearSorteo({ body: datosCrear }, mockResCrear, mockNextCrear);
            if (mockNextCrear.mock.calls.length > 0) { throw new Error(`Fallo al crear sorteo de prueba: ${mockNextCrear.mock.calls[0][0].message}`); }
            const sorteoId = mockResCrear.json.mock.calls[0][0].id;

            const { mockRes, mockNext } = setupMocks();
            const mockReq = {
                params: { id: sorteoId }, body: {
                    organizadores: [{ correo: "correofalso@falso.falacia.com" }]
                }
            };

            // Act
            await sorteosController.actualizarSorteo(mockReq, mockRes, mockNext);

            // Assert
            expect(mockNext).toHaveBeenCalledTimes(1);
            const error = mockNext.mock.calls[0][0];
            expect(error.statusCode).toBe(400);
            // El mensaje lógico (basado en la prueba de creación) es este:
            expect(error.message).toBe("No hay un organizador registrado con ese correo.");
        });
    });


    describe('eliminarSorteo (Controller)', () => {

        // ID: GST-025
        it('GST-025: debería eliminar un sorteo existente y responder con 200', async () => {
            // Arrange
            // Crear el sorteo base para la prueba
            const { mockRes: mockResCrear, mockNext: mockNextCrear } = setupMocks();
            const datosCrear = deepClone(datosSorteoBase);
            datosCrear.titulo = "Sorteo GST-025";
            await sorteosController.crearSorteo({ body: datosCrear }, mockResCrear, mockNextCrear);
            if (mockNextCrear.mock.calls.length > 0) { throw new Error(`Fallo al crear sorteo de prueba: ${mockNextCrear.mock.calls[0][0].message}`); }
            const sorteoId = mockResCrear.json.mock.calls[0][0].id;

            const { mockRes, mockNext } = setupMocks();
            const mockReq = { params: { id: sorteoId } };

            // Act
            await sorteosController.eliminarSorteo(mockReq, mockRes, mockNext);

            // Assert
            expect(mockNext).not.toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ message: "Sorteo eliminado exitosamente." });
        });

        // ID: GST-026
        it('GST-026: debería llamar a next con error 404 si el sorteo a eliminar no existe', async () => {
            // Arrange
            const { mockRes, mockNext } = setupMocks();
            const mockReq = { params: { id: 99999 } }; // ID Inexistente

            // Act
            await sorteosController.eliminarSorteo(mockReq, mockRes, mockNext);

            // Assert
            expect(mockNext).toHaveBeenCalledTimes(1);
            const error = mockNext.mock.calls[0][0];
            expect(error.statusCode).toBe(404);
            expect(error.message).toBe("El sorteo no existe.");
        });
    });
});