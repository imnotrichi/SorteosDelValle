import { describe, it, expect, beforeAll, afterAll } from "vitest";
const sorteosDAO = require('../dataAccess/sorteosDAO.js');
const { Sorteo, Configuracion, Premio } = require("../models/index.js");

let configId;

beforeAll(async () => {
    // Insertas una configuración de prueba
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
    // Eliminar la configuración de prueba con su id
    await Configuracion.destroy({ where: { id: configId } });
});


describe('crearSorteo (DAO)', () => {
    // Prueba 1: Crear un sorteo con datos válidos
    it('debería crear un nuevo sorteo en la base de datos', async () => {
        // Arrange
        const datosSorteo = {
            "titulo": "Sorteo 1 - DAO",
            "descripcion": "Descripción del sorteo 1 - DAO.",
            "imagen_url": "http:imagenes.com/sorteo1-dao",
            "rango_numeros": 100,
            "inicio_periodo_venta": "2025-12-06",
            "fin_periodo_venta": "2025-12-23",
            "fecha_realizacion": "2025-12-24",
            "precio_numero": 1000,
            "id_configuracion": configId,
            "premiosData": [{
                "titulo": "Premio 1 - DAO",
                "imagen_premio_url": "http:imagenes.com/premio1-dao"
            }]
        };

        // Act
        const sorteoCreado = await sorteosDAO.crearSorteo(datosSorteo);

        // Assert
        expect(sorteoCreado).toHaveProperty('id');
        expect(sorteoCreado.titulo).toBe(datosSorteo.titulo);
        expect(sorteoCreado.descripcion).toBe(datosSorteo.descripcion);
        expect(sorteoCreado.imagen_url).toBe(datosSorteo.imagen_url);
        expect(sorteoCreado.rango_numeros).toBe(datosSorteo.rango_numeros);
        expect(new Date(sorteoCreado.inicio_periodo_venta)).toEqual(new Date(datosSorteo.inicio_periodo_venta));
        expect(new Date(sorteoCreado.fin_periodo_venta)).toEqual(new Date(datosSorteo.fin_periodo_venta));
        expect(new Date(sorteoCreado.fecha_realizacion)).toEqual(new Date(datosSorteo.fecha_realizacion));
        expect(sorteoCreado.precio_numero).toBe
    });

    // Prueba 2: Intentar crear un sorteo sin título
    it('no debería crear un sorteo si falta el título', async () => {
        // Arrange
        const datosSorteoIncompletos = {
            "descripcion": "Descripción del sorteo 2 - DAO.",
            "imagen_url": "http:imagenes.com/sorteo2-dao",
            "rango_numeros": 100,
            "inicio_periodo_venta": "2025-12-06",
            "fin_periodo_venta": "2025-12-23",
            "fecha_realizacion": "2025-12-24",
            "precio_numero": 1000.00,
            "id_configuracion": configId,
            "premiosData": [{
                "titulo": "Premio 2 - DAO",
                "imagen_premio_url": "http:imagenes.com/premio2-dao"
            }]
        };

        // Act + Assert
        await expect(sorteosDAO.crearSorteo(datosSorteoIncompletos))
            .rejects.toThrow("Field 'titulo' doesn't have a default value");
    });

    // Prueba 3: Intentar crear un sorteo sin descripción
    it('no debería crear un sorteo si falta la descripción', async () => {
        // Arrange
        const datosSorteoIncompletos = {
            "titulo": "Sorteo 3 - DAO",
            "imagen_url": "http:imagenes.com/sorteo3-dao",
            "rango_numeros": 100,
            "inicio_periodo_venta": "2025-12-06",
            "fin_periodo_venta": "2025-12-23",
            "fecha_realizacion": "2025-12-24",
            "precio_numero": 1000.00,
            "id_configuracion": configId,
            "premiosData": [{
                "titulo": "Premio 3 - DAO",
                "imagen_premio_url": "http:imagenes.com/premio3-dao"
            }]
        };

        // Act + Assert
        await expect(sorteosDAO.crearSorteo(datosSorteoIncompletos))
            .rejects.toThrow("Field 'descripcion' doesn't have a default value");
    });

    // Prueba 4: Intentar crear un sorteo sin imagen
    it('no debería crear un sorteo si falta la imagen', async () => {
        // Arrange
        const datosSorteoIncompletos = {
            "titulo": "Sorteo 4 - DAO",
            "descripcion": "Descripción del sorteo 4 - DAO.",
            "rango_numeros": 100,
            "inicio_periodo_venta": "2025-12-06",
            "fin_periodo_venta": "2025-12-23",
            "fecha_realizacion": "2025-12-24",
            "precio_numero": 1000.00,
            "id_configuracion": configId,
            "premiosData": [{
                "titulo": "Premio 4 - DAO",
                "imagen_premio_url": "http:imagenes.com/premio4-dao"
            }]
        };

        // Act + Assert
        await expect(sorteosDAO.crearSorteo(datosSorteoIncompletos))
            .rejects.toThrow("Field 'imagen_url' doesn't have a default value");
    });

    // Prueba 5: Intentar crear un sorteo sin rango de números
    it('no debería crear un sorteo si falta el rango de números', async () => {
        // Arrange
        const datosSorteoIncompletos = {
            "titulo": "Sorteo 5 - DAO",
            "descripcion": "Descripción del sorteo 5 - DAO.",
            "imagen_url": "http:imagenes.com/sorteo5-dao",
            "inicio_periodo_venta": "2025-12-06",
            "fin_periodo_venta": "2025-12-23",
            "fecha_realizacion": "2025-12-24",
            "precio_numero": 1000.00,
            "id_configuracion": configId,
            "premiosData": [{
                "titulo": "Premio 5 - DAO",
                "imagen_premio_url": "http:imagenes.com/premio5-dao"
            }]
        };

        // Act + Assert
        await expect(sorteosDAO.crearSorteo(datosSorteoIncompletos))
            .rejects.toThrow("Field 'rango_numeros' doesn't have a default value");
    });

    // Prueba 6: Intentar crear un sorteo sin inicio de periodo de venta
    it('no debería crear un sorteo si falta el inicio de periodo de venta', async () => {
        // Arrange
        const datosSorteoIncompletos = {
            "titulo": "Sorteo 6 - DAO",
            "descripcion": "Descripción del sorteo 6 - DAO.",
            "imagen_url": "http:imagenes.com/sorteo6-dao",
            "rango_numeros": 100,
            "fin_periodo_venta": "2025-12-23",
            "fecha_realizacion": "2025-12-24",
            "precio_numero": 1000.00,
            "id_configuracion": configId,
            "premiosData": [{
                "titulo": "Premio 6 - DAO",
                "imagen_premio_url": "http:imagenes.com/premio6-dao"
            }]
        };

        // Act + Assert
        await expect(sorteosDAO.crearSorteo(datosSorteoIncompletos))
            .rejects.toThrow("Field 'inicio_periodo_venta' doesn't have a default value");
    });

    // Prueba 7: Intentar crear un sorteo sin fin de periodo de venta
    it('no debería crear un sorteo si falta el fin de periodo de venta', async () => {
        // Arrange
        const datosSorteoIncompletos = {
            "titulo": "Sorteo 7 - DAO",
            "descripcion": "Descripción del sorteo 7 - DAO.",
            "imagen_url": "http:imagenes.com/sorteo7-dao",
            "rango_numeros": 100,
            "inicio_periodo_venta": "2025-12-06",
            "fecha_realizacion": "2025-12-24",
            "precio_numero": 1000.00,
            "id_configuracion": configId,
            "premiosData": [{
                "titulo": "Premio 7 - DAO",
                "imagen_premio_url": "http:imagenes.com/premio7-dao"
            }]
        };

        // Act + Assert
        await expect(sorteosDAO.crearSorteo(datosSorteoIncompletos))
            .rejects.toThrow("Field 'fin_periodo_venta' doesn't have a default value");
    });

    // Prueba 8: Intentar crear un sorteo sin fecha de realización
    it('no debería crear un sorteo si falta la fecha de realización', async () => {
        // Arrange
        const datosSorteoIncompletos = {
            "titulo": "Sorteo 8 - DAO",
            "descripcion": "Descripción del sorteo 8 - DAO.",
            "imagen_url": "http:imagenes.com/sorteo8-dao",
            "rango_numeros": 100,
            "inicio_periodo_venta": "2025-12-06",
            "fin_periodo_venta": "2025-12-23",
            "precio_numero": 1000.00,
            "id_configuracion": configId,
            "premiosData": [{
                "titulo": "Premio 8 - DAO",
                "imagen_premio_url": "http:imagenes.com/premio8-dao"
            }]
        };

        // Act + Assert
        await expect(sorteosDAO.crearSorteo(datosSorteoIncompletos))
            .rejects.toThrow("Field 'fecha_realizacion' doesn't have a default value");
    });

    // Prueba 9: Intentar crear un sorteo sin precio por número
    it('no debería crear un sorteo si falta el precio por número', async () => {
        // Arrange
        const datosSorteoIncompletos = {
            "titulo": "Sorteo 9 - DAO",
            "descripcion": "Descripción del sorteo 9 - DAO.",
            "imagen_url": "http:imagenes.com/sorteo9-dao",
            "rango_numeros": 100,
            "inicio_periodo_venta": "2025-12-06",
            "fin_periodo_venta": "2025-12-23",
            "fecha_realizacion": "2025-12-24",
            "id_configuracion": configId,
            "premiosData": [{
                "titulo": "Premio 9 - DAO",
                "imagen_premio_url": "http:imagenes.com/premio9-dao "
            }]
        };

        // Act + Assert
        await expect(sorteosDAO.crearSorteo(datosSorteoIncompletos))
            .rejects.toThrow("Field 'precio_numero' doesn't have a default value");
    });

    // Prueba 10: Intentar crear un sorteo sin ID de configuración
    it('no debería crear un sorteo si falta el ID de configuración', async () => {
        // Arrange
        const datosSorteoIncompletos = {
            "titulo": "Sorteo 10 - DAO",
            "descripcion": "Descripción del sorteo 10 - DAO.",
            "imagen_url": "http:imagenes.com/sorteo10-dao",
            "rango_numeros": 100,
            "inicio_periodo_venta": "2025-12-06",
            "fin_periodo_venta": "2025-12-23",
            "fecha_realizacion": "2025-12-24",
            "precio_numero": 1000.00,
            "premiosData": [{
                "titulo": "Premio 10 - DAO",
                "imagen_premio_url": "http:imagenes.com/premio10-dao"
            }]
        };

        // Act + Assert
        await expect(sorteosDAO.crearSorteo(datosSorteoIncompletos))
            .rejects.toThrow("Field 'id_configuracion' doesn't have a default value");
    });

    // Prueba 11: Intentar crear un sorteo sin datos del premio
    it('no debería crear un sorteo si faltan los datos del premio', async () => {
        // Arrange
        const datosSorteoIncompletos = {
            "titulo": "Sorteo 11 - DAO",
            "descripcion": "Descripción del sorteo 11 - DAO.",
            "imagen_url": "http:imagenes.com/sorteo11-dao",
            "rango_numeros": 100,
            "inicio_periodo_venta": "2025-12-06",
            "fin_periodo_venta": "2025-12-23",
            "fecha_realizacion": "2025-12-24",
            "precio_numero": 1000.00,
            "id_configuracion": configId
        };

        // Act + Assert
        await expect(sorteosDAO.crearSorteo(datosSorteoIncompletos))
            .rejects.toThrow("Cannot read properties of undefined");
    });

    // Prueba 12: Intentar crear un sorteo sin el título del premio
    it('no debería crear un sorteo si falta el título del premio', async () => {
        // Arrange
        const datosSorteoIncompletos = {
            "titulo": "Sorteo 12 - DAO",
            "descripcion": "Descripción del sorteo 12 - DAO.",
            "imagen_url": "http:imagenes.com/sorteo12-dao",
            "rango_numeros": 100,
            "inicio_periodo_venta": "2025-12-06",
            "fin_periodo_venta": "2025-12-23",
            "fecha_realizacion": "2025-12-24",
            "precio_numero": 1000.00,
            "id_configuracion": configId,
            "premiosData": [{
                "imagen_premio_url": "http:imagenes.com/premio12-dao"
            }]
        };

        // Act + Assert
        await expect(sorteosDAO.crearSorteo(datosSorteoIncompletos))
            .rejects.toThrow("Field 'titulo' doesn't have a default value");
    });

    // Prueba 13: Intentar crear un sorteo sin la imagen del premio
    it('no debería crear un sorteo si falta la imagen del premio', async () => {
        // Arrange
        const datosSorteoIncompletos = {
            "titulo": "Sorteo 13 - DAO",
            "descripcion": "Descripción del sorteo 13 - DAO.",
            "imagen_url": "http:imagenes.com/sorteo13-dao",
            "rango_numeros": 100,
            "inicio_periodo_venta": "2025-12-06",
            "fin_periodo_venta": "2025-12-23",
            "fecha_realizacion": "2025-12-24",
            "precio_numero": 1000.00,
            "id_configuracion": configId,
            "premiosData": [{
                "titulo": "Premio 13 - DAO"
            }]
        };

        // Act + Assert
        await expect(sorteosDAO.crearSorteo(datosSorteoIncompletos))
            .rejects.toThrow("Field 'imagen_premio_url' doesn't have a default value");
    });

    // Prueba 14: Intentar crear un sorteo con el título duplicado
    it('no debería crear un sorteo si ya existe otro con el mismo título', async () => {
        // Arrange
        const datosSorteo1 = {
            "titulo": "Sorteo 14 - DAO",
            "descripcion": "Descripción del sorteo 14 - DAO.",
            "imagen_url": "http:imagenes.com/sorteo14-dao",
            "rango_numeros": 100,
            "inicio_periodo_venta": "2025-12-06",
            "fin_periodo_venta": "2025-12-23",
            "fecha_realizacion": "2025-12-24",
            "precio_numero": 1000,
            "id_configuracion": configId,
            "premiosData": [{
                "titulo": "Premio 14 - DAO",
                "imagen_premio_url": "http:imagenes.com/premio14-dao"
            }]
        };

        const datosSorteo2 = {
            "titulo": "Sorteo 14 - DAO",
            "descripcion": "Descripción del sorteo 14 - DAO.",
            "imagen_url": "http:imagenes.com/sorteo14-dao",
            "rango_numeros": 100,
            "inicio_periodo_venta": "2025-12-06",
            "fin_periodo_venta": "2025-12-23",
            "fecha_realizacion": "2025-12-24",
            "precio_numero": 1000,
            "id_configuracion": configId,
            "premiosData": [{
                "titulo": "Premio 14 - DAO",
                "imagen_premio_url": "http:imagenes.com/premio14-dao"
            }]
        };

        // Act
        await sorteosDAO.crearSorteo(datosSorteo1);

        // Assert
        await expect(sorteosDAO.crearSorteo(datosSorteo2)).rejects.toThrow();
    });
});
