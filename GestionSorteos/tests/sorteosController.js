import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
const sorteosController = require('../controllers/sorteosController.js');
const { Sorteo, Configuracion, Premio } = require("../models/index.js");

let configId;

beforeAll(async () => {
    // Inserta una configuración de prueba
    const config = await Configuracion.create({
        "tiempo_limite_apartado": "160:00:00",
        "tiempo_recordatorio_pago": "72:00:00"
    });
    configId = config.id;
});

afterAll(async () => {
    // Limpieza de la base de datos
    await Premio.destroy({ where: {} });
    await Sorteo.destroy({ where: {} });
    // Eliminar la configuración de prueba con su id
    await Configuracion.destroy({ where: { id: configId } });
});

// Función auxiliar para no repetir mocks
const setupMocks = () => ({
    mockRes: {
        status: vi.fn(() => this.mockRes),
        json: vi.fn(),
    },
    mockNext: vi.fn(),
});

describe('crearSorteo (Controller)', () => {

    // Prueba 1: Crear un sorteo con datos válidos
    it('debería crear un nuevo sorteo y responder con 200', async () => {
        // Arrange
        const datosSorteo = {
            titulo: "Sorteo 1 - Controller",
            descripcion: "Descripción del sorteo 1 - Controller.",
            imagen_url: "http:imagenes.com/sorteo1-controller",
            rango_numeros: 100,
            inicio_periodo_venta: "2025-12-06",
            fin_periodo_venta: "2025-12-23",
            fecha_realizacion: "2025-12-24",
            precio_numero: 1000,
            id_configuracion: configId,
            premiosData: [{
                titulo: "Premio 1 - Controller",
                imagen_premio_url: "http:imagenes.com/premio1-controller"
            }]
        };

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
    it('debería llamar a next con error si falta el título y responder con 400', async () => {
        // Arrange
        const datosSorteoIncompletos = {
            descripcion: "Descripción del sorteo 2 - Controller.",
            imagen_url: "http:imagenes.com/sorteo2-controller",
            rango_numeros: 100,
            inicio_periodo_venta: "2025-12-06",
            fin_periodo_venta: "2025-12-23",
            fecha_realizacion: "2025-12-24",
            precio_numero: 1000,
            id_configuracion: configId,
            premiosData: [{
                titulo: "Premio 2 - Controller",
                imagen_premio_url: "http:imagenes.com/premio2-controller"
            }]
        };
        const mockReq = { body: datosSorteoIncompletos };
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
    it('debería llamar a next con error si falta la descripción', async () => {
        // Arrange
        const datosSorteoIncompletos = {
            "titulo": "Sorteo 3 - Controller",
            // falta descripcion
            "imagen_url": "http:imagenes.com/sorteo3-controller",
            "rango_numeros": 100,
            "inicio_periodo_venta": "2025-12-06",
            "fin_periodo_venta": "2025-12-23",
            "fecha_realizacion": "2025-12-24",
            "precio_numero": 1000.00,
            "id_configuracion": configId,
            "premiosData": [{
                "titulo": "Premio 3 - Controller",
                "imagen_premio_url": "http:imagenes.com/premio3-controller"
            }]
        };
        const { mockRes, mockNext } = setupMocks();
        const mockReq = { body: datosSorteoIncompletos };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });

    // Prueba 4: Sin imagen
    it('debería llamar a next con error si falta la imagen', async () => {
        // Arrange
        const datosSorteoIncompletos = {
            "titulo": "Sorteo 4 - Controller",
            "descripcion": "Descripción del sorteo 4 - Controller.",
            // falta imagen_url
            "rango_numeros": 100,
            "inicio_periodo_venta": "2025-12-06",
            "fin_periodo_venta": "2025-12-23",
            "fecha_realizacion": "2025-12-24",
            "precio_numero": 1000.00,
            "id_configuracion": configId,
            "premiosData": [{
                "titulo": "Premio 4 - Controller",
                "imagen_premio_url": "http:imagenes.com/premio4-controller"
            }]
        };
        const { mockRes, mockNext } = setupMocks();
        const mockReq = { body: datosSorteoIncompletos };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });

    // Prueba 5: Sin rango de números
    it('debería llamar a next con error si falta el rango de números', async () => {
        // ... (misma estructura que prueba 4, pero quitando rango_numeros)
        // Arrange
        const datosSorteoIncompletos = {
            "titulo": "Sorteo 5 - Controller",
            "descripcion": "Descripción del sorteo 5 - Controller.",
            "imagen_url": "http:imagenes.com/sorteo5-controller",
            // falta rango_numeros
            "inicio_periodo_venta": "2025-12-06",
            "fin_periodo_venta": "2025-12-23",
            "fecha_realizacion": "2025-12-24",
            "precio_numero": 1000.00,
            "id_configuracion": configId,
            "premiosData": [{
                "titulo": "Premio 5 - Controller",
                "imagen_premio_url": "http:imagenes.com/premio5-controller"
            }]
        };
        const { mockRes, mockNext } = setupMocks();
        const mockReq = { body: datosSorteoIncompletos };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });

    // Prueba 6: Sin inicio de periodo de venta
    it('debería llamar a next con error si falta el inicio de periodo de venta', async () => {
        // ...
        // Arrange
        const datosSorteoIncompletos = {
            "titulo": "Sorteo 6 - Controller",
            "descripcion": "Descripción del sorteo 6 - Controller.",
            "imagen_url": "http:imagenes.com/sorteo6-controller",
            "rango_numeros": 100,
            // falta inicio_periodo_venta
            "fin_periodo_venta": "2025-12-23",
            "fecha_realizacion": "2025-12-24",
            "precio_numero": 1000.00,
            "id_configuracion": configId,
            "premiosData": [{
                "titulo": "Premio 6 - Controller",
                "imagen_premio_url": "http:imagenes.com/premio6-controller"
            }]
        };
        const { mockRes, mockNext } = setupMocks();
        const mockReq = { body: datosSorteoIncompletos };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });

    // Prueba 7: Sin fin de periodo de venta
    it('debería llamar a next con error si falta el fin de periodo de venta', async () => {
        // ...
        // Arrange
        const datosSorteoIncompletos = {
            "titulo": "Sorteo 7 - Controller",
            "descripcion": "Descripción del sorteo 7 - Controller.",
            "imagen_url": "http:imagenes.com/sorteo7-controller",
            "rango_numeros": 100,
            "inicio_periodo_venta": "2025-12-06",
            // falta fin_periodo_venta
            "fecha_realizacion": "2025-12-24",
            "precio_numero": 1000.00,
            "id_configuracion": configId,
            "premiosData": [{
                "titulo": "Premio 7 - Controller",
                "imagen_premio_url": "http:imagenes.com/premio7-controller"
            }]
        };
        const { mockRes, mockNext } = setupMocks();
        const mockReq = { body: datosSorteoIncompletos };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });

    // Prueba 8: Sin fecha de realización
    it('debería llamar a next con error si falta la fecha de realización', async () => {
        // ...
        // Arrange
        const datosSorteoIncompletos = {
            "titulo": "Sorteo 8 - Controller",
            "descripcion": "Descripción del sorteo 8 - Controller.",
            "imagen_url": "http:imagenes.com/sorteo8-controller",
            "rango_numeros": 100,
            "inicio_periodo_venta": "2025-12-06",
            "fin_periodo_venta": "2025-12-23",
            // falta fecha_realizacion
            "precio_numero": 1000.00,
            "id_configuracion": configId,
            "premiosData": [{
                "titulo": "Premio 8 - Controller",
                "imagen_premio_url": "http:imagenes.com/premio8-controller"
            }]
        };
        const { mockRes, mockNext } = setupMocks();
        const mockReq = { body: datosSorteoIncompletos };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });

    // Prueba 9: Sin precio por número
    it('debería llamar a next con error si falta el precio por número', async () => {
        // ...
        // Arrange
        const datosSorteoIncompletos = {
            "titulo": "Sorteo 9 - Controller",
            "descripcion": "Descripción del sorteo 9 - Controller.",
            "imagen_url": "http:imagenes.com/sorteo9-controller",
            "rango_numeros": 100,
            "inicio_periodo_venta": "2025-12-06",
            "fin_periodo_venta": "2025-12-23",
            "fecha_realizacion": "2025-12-24",
            // falta precio_numero
            "id_configuracion": configId,
            "premiosData": [{
                "titulo": "Premio 9 - Controller",
                "imagen_premio_url": "http:imagenes.com/premio9-controller"
            }]
        };
        const { mockRes, mockNext } = setupMocks();
        const mockReq = { body: datosSorteoIncompletos };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });

    // Prueba 10: Sin ID de configuración
    it('debería llamar a next con error si falta el ID de configuración', async () => {
        // ...
        // Arrange
        const datosSorteoIncompletos = {
            "titulo": "Sorteo 10 - Controller",
            "descripcion": "Descripción del sorteo 10 - Controller.",
            "imagen_url": "http:imagenes.com/sorteo10-controller",
            "rango_numeros": 100,
            "inicio_periodo_venta": "2025-12-06",
            "fin_periodo_venta": "2025-12-23",
            "fecha_realizacion": "2025-12-24",
            "precio_numero": 1000.00,
            // falta id_configuracion
            "premiosData": [{
                "titulo": "Premio 10 - Controller",
                "imagen_premio_url": "http:imagenes.com/premio10-controller"
            }]
        };
        const { mockRes, mockNext } = setupMocks();
        const mockReq = { body: datosSorteoIncompletos };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });

    // Prueba 11: Sin datos del premio
    it('debería llamar a next con error si faltan los datos del premio', async () => {
        // ...
        // Arrange
        const datosSorteoIncompletos = {
            "titulo": "Sorteo 11 - Controller",
            "descripcion": "Descripción del sorteo 11 - Controller.",
            "imagen_url": "http:imagenes.com/sorteo11-controller",
            "rango_numeros": 100,
            "inicio_periodo_venta": "2025-12-06",
            "fin_periodo_venta": "2025-12-23",
            "fecha_realizacion": "2025-12-24",
            "precio_numero": 1000.00,
            "id_configuracion": configId,
            // falta premiosData
        };
        const { mockRes, mockNext } = setupMocks();
        const mockReq = { body: datosSorteoIncompletos };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });

    // Prueba 12: Sin el título del premio (falla el DAO, no la validación inicial)
    it('debería llamar a next con error 500 si falta el título del premio', async () => {
        const datosSorteoIncompletos = {
            "titulo": "Sorteo 12 - Controller",
            "descripcion": "Descripción del sorteo 12 - Controller.",
            "imagen_url": "http:imagenes.com/sorteo12-controller",
            "rango_numeros": 100,
            "inicio_periodo_venta": "2025-12-06",
            "fin_periodo_venta": "2025-12-23",
            "fecha_realizacion": "2025-12-24",
            "precio_numero": 1000.00,
            "id_configuracion": configId,
            "premiosData": [{
                // falta titulo
                "imagen_premio_url": "http:imagenes.com/premio12-controller"
            }]
        };
        const { mockRes, mockNext } = setupMocks();
        const mockReq = { body: datosSorteoIncompletos };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });

    // Prueba 13: Sin la imagen del premio (falla el DAO)
    it('debería llamar a next con error 500 si falta la imagen del premio', async () => {
        const datosSorteoIncompletos = {
            "titulo": "Sorteo 13 - Controller",
            "descripcion": "Descripción del sorteo 13 - Controller.",
            "imagen_url": "http:imagenes.com/sorteo13-controller",
            "rango_numeros": 100,
            "inicio_periodo_venta": "2025-12-06",
            "fin_periodo_venta": "2025-12-23",
            "fecha_realizacion": "2025-12-24",
            "precio_numero": 1000.00,
            "id_configuracion": configId,
            "premiosData": [{
                "titulo": "Premio 13 - Controller"
                // falta imagen_premio_url
            }]
        };
        const { mockRes, mockNext } = setupMocks();
        const mockReq = { body: datosSorteoIncompletos };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });

    // Prueba 14: Título duplicado (falla el DAO)
    it('debería llamar a next con error 500 si el título del sorteo está duplicado', async () => {
        // Arrange
        const datosSorteo = {
            titulo: "Sorteo 14 - Controller",
            descripcion: "Descripción del sorteo 14 - Controller.",
            imagen_url: "http:imagenes.com/sorteo14-controller",
            rango_numeros: 100,
            inicio_periodo_venta: "2025-12-06",
            fin_periodo_venta: "2025-12-23",
            fecha_realizacion: "2025-12-24",
            precio_numero: 1000,
            id_configuracion: configId,
            premiosData: [{
                titulo: "Premio 14 - Controller",
                imagen_premio_url: "http:imagenes.com/premio14-controller"
            }]
        };

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
    // Prueba 15: Fecha fin de venta menor al inicio
    it('debería llamar a next con error 400 si el periodo de venta es inválido (fin < inicio)', async () => {
        const { mockRes, mockNext } = setupMocks();

        const mockReq = {
            body: {
                titulo: "Sorteo 15 - Controller",
                descripcion: "Descripción del sorteo 15 - Controller.",
                imagen_url: "http:imagenes.com/sorteo15-controller",
                rango_numeros: 100,
                inicio_periodo_venta: "2025-12-01",
                fin_periodo_venta: "2025-10-20",   // FIN MENOR AL INICIO
                fecha_realizacion: "2025-12-20",
                precio_numero: 100,
                id_configuracion: configId,
                premiosData: [{
                    titulo: "Premio 15 - Controller",
                    imagen_premio_url: "http:imagenes.com/premio15-controller"
                }]
            }
        };

        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Ingrese un periodo válido.");
    });

    // Prueba 16: Fecha de realización ya pasó
    it('debería llamar a next con error 404 si la fecha de realización ya pasó', async () => {
        const { mockRes, mockNext } = setupMocks();

        const mockReq = {
            body: {
                titulo: "Sorteo 16 - Controller",
                descripcion: "Descripción del sorteo 16 - Controller.",
                imagen_url: "http:imagenes.com/sorteo16-controller",
                rango_numeros: 100,
                inicio_periodo_venta: "2025-12-01",
                fin_periodo_venta: "2025-12-20",
                fecha_realizacion: "2020-01-01",   // FECHA EN EL PASADO
                precio_numero: 100,
                id_configuracion: configId,
                premiosData: [{
                    titulo: "Premio 16 - Controller",
                    imagen_premio_url: "http:imagenes.com/premio16-controller"
                }]
            }
        };

        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("La fecha de realización del sorteo debe ser válida.");
    });

    // Prueba 17: Fecha de inicio de venta ya pasó
    it('debería llamar a next con error 400 si la fecha inicial del periodo de venta ya pasó', async () => {
        const { mockRes, mockNext } = setupMocks();

        const mockReq = {
            body: {
                titulo: "Sorteo 17 - Controller",
                descripcion: "Descripción del sorteo 17 - Controller.",
                imagen_url: "http:imagenes.com/sorteo17-controller",
                rango_numeros: 100,
                inicio_periodo_venta: "2020-01-01",  // YA PASÓ
                fin_periodo_venta: "2025-12-20",
                fecha_realizacion: "2025-12-25",
                precio_numero: 100,
                id_configuracion: configId,
                premiosData: [{
                    titulo: "Premio 17 - Controller",
                    imagen_premio_url: "http:imagenes.com/premio17-controller"
                }]
            }
        };

        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Ingrese un periodo válido.");

    });

    // Prueba 18: Fecha final de venta ya pasó
    it('debería llamar a next con error 404 si la fecha final del periodo de venta ya pasó', async () => {
        const { mockRes, mockNext } = setupMocks();

        const mockReq = {
            body: {
                titulo: "Sorteo 18 - Controller",
                descripcion: "Descripción del sorteo 18 - Controller.",
                imagen_url: "http:imagenes.com/sorteo18-controller",
                rango_numeros: 100,
                inicio_periodo_venta: "2025-12-01",
                fin_periodo_venta: "2020-01-01",   // YA PASÓ
                fecha_realizacion: "2025-12-25",
                precio_numero: 100,
                id_configuracion: configId,
                premiosData: [{
                    titulo: "Premio 18 - Controller",
                    imagen_premio_url: "http:imagenes.com/premio18-controller"
                }]
            }
        };

        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("Ingrese un periodo válido.");

    });

    // Prueba 19: Precio del número menor a $1
    it('debería llamar a next con error 404 si el precio del número es menor a 1 peso', async () => {
        const { mockRes, mockNext } = setupMocks();

        const mockReq = {
            body: {
                titulo: "Sorteo 19 - Controller",
                descripcion: "Descripción del sorteo 19 - Controller.",
                imagen_url: "http:imagenes.com/sorteo19-controller",
                rango_numeros: 100,
                inicio_periodo_venta: "2025-12-01",
                fin_periodo_venta: "2025-12-20",
                fecha_realizacion: "2025-12-25",
                precio_numero: 0,   // INVÁLIDO
                id_configuracion: configId,
                premiosData: [{
                    titulo: "Premio 19 - Controller",
                    imagen_premio_url: "http:imagenes.com/premio19-controller"
                }]
            }
        };

        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe("El precio del número no puede ser menor a 1 peso.");
    });

});