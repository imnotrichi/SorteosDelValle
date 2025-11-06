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
    // Limpieza
    await Premio.destroy({ where: {} });
    await Sorteo.destroy({ where: {} });
    await Configuracion.destroy({ where: {} });
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
    // Prueba 1: Funciona (la dejamos como está)
    it('debería crear un nuevo sorteo y responder con 200', async () => {
        // Arrange
        const datosSorteo = {
            titulo: "Camioneta F-150 modelo 2025",
            descripcion: "Rifa de una camioneta Ford F-150 del año.",
            imagen_url: "imagenes/imagenCamioneta.jpeg",
            rango_numeros: 100,
            inicio_periodo_venta: "2025-12-06",
            fin_periodo_venta: "2025-12-23",
            fecha_realizacion: "2025-12-24",
            precio_numero: 1000,
            id_configuracion: configId,
            premiosData: [{
                titulo: "Camioneta Ford F-150 modelo 2025",
                imagen_premio_url: "imagenes/imagenCamioneta.jpeg"
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
        expect(sorteoCreado).toHaveProperty('id');
        expect(sorteoCreado.titulo).toBe(datosSorteo.titulo);
        expect(sorteoCreado.precio_numero).toBe(datosSorteo.precio_numero);
    });

    // --- PRUEBAS CORREGIDAS (2-11) ---
    // Estas pruebas verifican que la validación de campos requeridos funcione.

    // Prueba 2: Intentar crear un sorteo sin título
    it('debería llamar a next con error si falta el título', async () => {
        // Arrange
        const datosSorteoIncompletos = {
            descripcion: "Rifa de una camioneta Ford F-150 del año.",
            imagen_url: "imagenes/imagenCamioneta.jpeg",
            rango_numeros: 100,
            inicio_periodo_venta: "2025-12-06",
            fin_periodo_venta: "2025-12-23",
            fecha_realizacion: "2025-12-24",
            precio_numero: 1000,
            id_configuracion: configId,
            premiosData: [{
                titulo: "Camioneta Ford F-150 modelo 2025",
                imagen_premio_url: "imagenes/imagenCamioneta.jpeg"
            }]
        };
        const { mockRes, mockNext } = setupMocks();
        const mockReq = { body: datosSorteoIncompletos };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockRes.json).not.toHaveBeenCalled();
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });

    // Prueba 3: Intentar crear un sorteo sin descripción
    it('debería llamar a next con error si falta la descripción', async () => {
        // Arrange
        const datosSorteoIncompletos = {
            "titulo": "Camioneta F-150 modelo 2025",
            // falta descripcion
            "imagen_url": "imagenes/imagenCamioneta.jpeg",
            "rango_numeros": 100,
            "inicio_periodo_venta": "2025-12-06",
            "fin_periodo_venta": "2025-12-23",
            "fecha_realizacion": "2025-12-24",
            "precio_numero": 1000.00,
            "id_configuracion": configId,
            "premiosData": [{ "titulo": "...", "imagen_premio_url": "..." }]
        };
        const { mockRes, mockNext } = setupMocks();
        const mockReq = { body: datosSorteoIncompletos };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockRes.json).not.toHaveBeenCalled();
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });

    // Prueba 4: Sin imagen
    it('debería llamar a next con error si falta la imagen', async () => {
        // Arrange
        const datosSorteoIncompletos = {
            "titulo": "Camioneta F-150 modelo 2025",
            "descripcion": "Rifa...",
            // falta imagen_url
            "rango_numeros": 100,
            "inicio_periodo_venta": "2025-12-06",
            "fin_periodo_venta": "2025-12-23",
            "fecha_realizacion": "2025-12-24",
            "precio_numero": 1000.00,
            "id_configuracion": configId,
            "premiosData": [{ "titulo": "...", "imagen_premio_url": "..." }]
        };
        const { mockRes, mockNext } = setupMocks();
        const mockReq = { body: datosSorteoIncompletos };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });

    // Prueba 5: Sin rango de números
    it('debería llamar a next con error si falta el rango de números', async () => {
        // ... (misma estructura que prueba 4, pero quitando rango_numeros)
        // Arrange
        const datosSorteoIncompletos = {
            "titulo": "Camioneta F-150 modelo 2025",
            "descripcion": "Rifa...",
            "imagen_url": "imagenes/imagenCamioneta.jpeg",
            // falta rango_numeros
            "inicio_periodo_venta": "2025-12-06",
            "fin_periodo_venta": "2025-12-23",
            "fecha_realizacion": "2025-12-24",
            "precio_numero": 1000.00,
            "id_configuracion": configId,
            "premiosData": [{ "titulo": "...", "imagen_premio_url": "..." }]
        };
        const { mockRes, mockNext } = setupMocks();
        const mockReq = { body: datosSorteoIncompletos };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });

    // Prueba 6: Sin inicio de periodo de venta
    it('debería llamar a next con error si falta el inicio de periodo de venta', async () => {
        // ...
        // Arrange
        const datosSorteoIncompletos = {
            "titulo": "Camioneta F-150 modelo 2025",
            "descripcion": "Rifa...",
            "imagen_url": "imagenes/imagenCamioneta.jpeg",
            "rango_numeros": 100,
            // falta inicio_periodo_venta
            "fin_periodo_venta": "2025-12-23",
            "fecha_realizacion": "2025-12-24",
            "precio_numero": 1000.00,
            "id_configuracion": configId,
            "premiosData": [{ "titulo": "...", "imagen_premio_url": "..." }]
        };
        const { mockRes, mockNext } = setupMocks();
        const mockReq = { body: datosSorteoIncompletos };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });

    // Prueba 7: Sin fin de periodo de venta
    it('debería llamar a next con error si falta el fin de periodo de venta', async () => {
        // ...
        // Arrange
        const datosSorteoIncompletos = {
            "titulo": "Camioneta F-150 modelo 2025",
            "descripcion": "Rifa...",
            "imagen_url": "imagenes/imagenCamioneta.jpeg",
            "rango_numeros": 100,
            "inicio_periodo_venta": "2025-12-06",
            // falta fin_periodo_venta
            "fecha_realizacion": "2025-12-24",
            "precio_numero": 1000.00,
            "id_configuracion": configId,
            "premiosData": [{ "titulo": "...", "imagen_premio_url": "..." }]
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
            "titulo": "Camioneta F-150 modelo 2025",
            "descripcion": "Rifa...",
            "imagen_url": "imagenes/imagenCamioneta.jpeg",
            "rango_numeros": 100,
            "inicio_periodo_venta": "2025-12-06",
            "fin_periodo_venta": "2025-12-23",
            // falta fecha_realizacion
            "precio_numero": 1000.00,
            "id_configuracion": configId,
            "premiosData": [{ "titulo": "...", "imagen_premio_url": "..." }]
        };
        const { mockRes, mockNext } = setupMocks();
        const mockReq = { body: datosSorteoIncompletos };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });

    // Prueba 9: Sin precio por número
    it('debería llamar a next con error si falta el precio por número', async () => {
        // ...
        // Arrange
        const datosSorteoIncompletos = {
            "titulo": "Camioneta F-150 modelo 2025",
            "descripcion": "Rifa...",
            "imagen_url": "imagenes/imagenCamioneta.jpeg",
            "rango_numeros": 100,
            "inicio_periodo_venta": "2025-12-06",
            "fin_periodo_venta": "2025-12-23",
            "fecha_realizacion": "2025-12-24",
            // falta precio_numero
            "id_configuracion": configId,
            "premiosData": [{ "titulo": "...", "imagen_premio_url": "..." }]
        };
        const { mockRes, mockNext } = setupMocks();
        const mockReq = { body: datosSorteoIncompletos };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });

    // Prueba 10: Sin ID de configuración
    it('debería llamar a next con error si falta el ID de configuración', async () => {
        // ...
        // Arrange
        const datosSorteoIncompletos = {
            "titulo": "Camioneta F-150 modelo 2025",
            "descripcion": "Rifa...",
            "imagen_url": "imagenes/imagenCamioneta.jpeg",
            "rango_numeros": 100,
            "inicio_periodo_venta": "2025-12-06",
            "fin_periodo_venta": "2025-12-23",
            "fecha_realizacion": "2025-12-24",
            "precio_numero": 1000.00,
            // falta id_configuracion
            "premiosData": [{ "titulo": "...", "imagen_premio_url": "..." }]
        };
        const { mockRes, mockNext } = setupMocks();
        const mockReq = { body: datosSorteoIncompletos };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });

    // Prueba 11: Sin datos del premio
    it('debería llamar a next con error si faltan los datos del premio', async () => {
        // ...
        // Arrange
        const datosSorteoIncompletos = {
            "titulo": "Camioneta F-150 modelo 2025",
            "descripcion": "Rifa...",
            "imagen_url": "imagenes/imagenCamioneta.jpeg",
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
        expect(mockNext.mock.calls[0][0].message).toBe('Todos los campos son requeridos.');
    });


    // --- PRUEBAS CORREGIDAS (12-14) ---
    // Estas pruebas verifican el bloque catch del controlador (errores del DAO).

    // Prueba 12: Sin el título del premio (falla el DAO, no la validación inicial)
    it('debería llamar a next con error 500 si falta el título del premio', async () => {
        // Arrange
        await Premio.destroy({ where: {} });
        await Sorteo.destroy({ where: {} });

        const datosSorteoIncompletos = {
            "titulo": "Sorteo Falla Premio",
            "descripcion": "Rifa...",
            "imagen_url": "imagenes/imagenCamioneta.jpeg",
            "rango_numeros": 100,
            "inicio_periodo_venta": "2025-12-06",
            "fin_periodo_venta": "2025-12-23",
            "fecha_realizacion": "2025-12-24",
            "precio_numero": 1000.00,
            "id_configuracion": configId,
            "premiosData": [{
                // falta titulo
                "imagen_premio_url": "imagenes/imagenCamioneta.jpeg"
            }]
        };
        const { mockRes, mockNext } = setupMocks();
        const mockReq = { body: datosSorteoIncompletos };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockRes.json).not.toHaveBeenCalled();
        expect(mockNext.mock.calls[0][0].message).toBe('Se deben proporcionar datos válidos para los premios.');
    });

    // Prueba 13: Sin la imagen del premio (falla el DAO)
    it('debería llamar a next con error 500 si falta la imagen del premio', async () => {
        // Arrange
        await Premio.destroy({ where: {} });
        await Sorteo.destroy({ where: {} });

        const datosSorteoIncompletos = {
            "titulo": "Sorteo Falla Imagen Premio",
            "descripcion": "Rifa...",
            "imagen_url": "imagenes/imagenCamioneta.jpeg",
            "rango_numeros": 100,
            "inicio_periodo_venta": "2025-12-06",
            "fin_periodo_venta": "2025-12-23",
            "fecha_realizacion": "2025-12-24",
            "precio_numero": 1000.00,
            "id_configuracion": configId,
            "premiosData": [{
                "titulo": "Camioneta Ford F-150 modelo 2025"
                // falta imagen_premio_url
            }]
        };
        const { mockRes, mockNext } = setupMocks();
        const mockReq = { body: datosSorteoIncompletos };

        // Act
        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockRes.json).not.toHaveBeenCalled();
        expect(mockNext.mock.calls[0][0].message).toBe('Se deben proporcionar datos válidos para los premios.');
    });

    // Prueba 14: Título duplicado (falla el DAO)
    it('debería llamar a next con error 500 si el título del sorteo está duplicado', async () => {
        // Arrange
        await Premio.destroy({ where: {} });
        await Sorteo.destroy({ where: {} });

        const datosSorteo = {
            titulo: "Camioneta F-150 modelo 2025",
            descripcion: "Rifa de una camioneta Ford F-150 del año.",
            imagen_url: "imagenes/imagenCamioneta.jpeg",
            rango_numeros: 100,
            inicio_periodo_venta: "2025-12-06",
            fin_periodo_venta: "2025-12-23",
            fecha_realizacion: "2025-12-24",
            precio_numero: 1000,
            id_configuracion: configId,
            premiosData: [{
                titulo: "Camioneta Ford F-150 modelo 2025",
                imagen_premio_url: "imagenes/imagenCamioneta.jpeg"
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

        expect(error.statusCode).toBe(404);
        expect(error.message).toBe("Ya existe un sorteo con ese título.");
    });

    it('debería llamar a next con error 404 si el periodo de venta es inválido (fin < inicio)', async () => {
        const { mockRes, mockNext } = setupMocks();

        const mockReq = {
            body: {
                titulo: "Sorteo 1",
                descripcion: "Desc",
                imagen_url: "img.jpg",
                rango_numeros: 100,
                inicio_periodo_venta: "2025-11-01",
                fin_periodo_venta: "2025-10-20",   // FIN MENOR AL INICIO
                fecha_realizacion: "2025-12-20",
                precio_numero: 100,
                id_configuracion: configId,
                premiosData: [{
                    titulo: "Premio",
                    imagen_premio_url: "imgPremio.jpg"
                }]
            }
        };

        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];

        expect(error.statusCode).toBe(404);
        expect(error.message).toBe("Ingrese un periodo válido.");
    });

    it('debería llamar a next con error 404 si la fecha de realización ya pasó', async () => {
        const { mockRes, mockNext } = setupMocks();

        const mockReq = {
            body: {
                titulo: "Sorteo 2",
                descripcion: "Desc",
                imagen_url: "img.jpg",
                rango_numeros: 100,
                inicio_periodo_venta: "2025-12-01",
                fin_periodo_venta: "2025-12-20",
                fecha_realizacion: "2020-01-01",   // FECHA EN EL PASADO
                precio_numero: 100,
                id_configuracion: configId,
                premiosData: [{
                    titulo: "Premio",
                    imagen_premio_url: "imgPremio.jpg"
                }]
            }
        };

        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];

        expect(error.statusCode).toBe(404);
        expect(error.message).toBe("La fecha de realización del sorteo debe ser válida.");
    });


    it('debería llamar a next con error 404 si la fecha inicial del periodo de venta ya pasó', async () => {
        const { mockRes, mockNext } = setupMocks();

        const mockReq = {
            body: {
                titulo: "Sorteo 3",
                descripcion: "Desc",
                imagen_url: "img.jpg",
                rango_numeros: 100,
                inicio_periodo_venta: "2020-01-01",  // YA PASÓ
                fin_periodo_venta: "2025-12-20",
                fecha_realizacion: "2025-12-25",
                precio_numero: 100,
                id_configuracion: configId,
                premiosData: [{
                    titulo: "Premio",
                    imagen_premio_url: "imgPremio.jpg"
                }]
            }
        };

        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];

        expect(error.statusCode).toBe(404);
        expect(error.message).toBe("Ingrese un periodo válido.");
    });

    it('debería llamar a next con error 404 si la fecha final del periodo de venta ya pasó', async () => {
        const { mockRes, mockNext } = setupMocks();

        const mockReq = {
            body: {
                titulo: "Sorteo 4",
                descripcion: "Desc",
                imagen_url: "img.jpg",
                rango_numeros: 100,
                inicio_periodo_venta: "2025-11-01",
                fin_periodo_venta: "2020-01-01",   // YA PASÓ
                fecha_realizacion: "2025-12-25",
                precio_numero: 100,
                id_configuracion: configId,
                premiosData: [{
                    titulo: "Premio",
                    imagen_premio_url: "imgPremio.jpg"
                }]
            }
        };

        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];

        expect(error.statusCode).toBe(404);
        expect(error.message).toBe("Ingrese un periodo válido.");
    });


    it('debería llamar a next con error 404 si el precio del número es menor a 1 peso', async () => {
        const { mockRes, mockNext } = setupMocks();

        const mockReq = {
            body: {
                titulo: "Sorteo 5",
                descripcion: "Desc",
                imagen_url: "img.jpg",
                rango_numeros: 100,
                inicio_periodo_venta: "2025-12-01",
                fin_periodo_venta: "2025-12-20",
                fecha_realizacion: "2025-12-25",
                precio_numero: 0,   // INVÁLIDO
                id_configuracion: configId,
                premiosData: [{
                    titulo: "Premio",
                    imagen_premio_url: "imgPremio.jpg"
                }]
            }
        };

        await sorteosController.crearSorteo(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledTimes(1);
        const error = mockNext.mock.calls[0][0];

        expect(error.statusCode).toBe(404);
        expect(error.message).toBe("El precio del número no puede ser menor a 1 peso.");
    });

});