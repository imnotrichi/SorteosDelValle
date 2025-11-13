import { describe, it, expect, beforeAll, afterAll } from "vitest";
const sorteosDAO = require('../dataAccess/sorteosDAO.js');
const { Sorteo, Configuracion, Premio, Organizador, Usuario, OrganizadorSorteo } = require("../models/index.js");

let configGlobalId;
let configNuevaId;
let organizadorId1;
let organizadorId2;
let datosSorteoBase;

beforeAll(async () => {
    // Insertas una configuración de prueba
    const configGlobal = await Configuracion.create({
        "tiempo_limite_apartado": "160:00:00",
        "tiempo_recordatorio_pago": "72:00:00"
    });
    configGlobalId = configGlobal.id;

    // Insertas una configuración de prueba
    const configNueva = await Configuracion.create({
        "tiempo_limite_apartado": "72:00:00",
        "tiempo_recordatorio_pago": "24:00:00"
    });
    configNuevaId = configNueva.id;

    // Creamos los organizadores
    const datosOrganizador1 = {
        nombres: "Ricardo Alán",
        apellido_paterno: "Gutiérrez",
        apellido_materno: "Garcés",
        correo: "ricardogutierrez@gmail.com"
    };
    const usuario1 = await Usuario.create({
        ...datosOrganizador1
    });
    const organizador1 = await Organizador.create({
        id_usuario: usuario1.id,
    });

    const datosOrganizador2 = {
        nombres: "Abel Eduardo",
        apellido_paterno: "Sánchez",
        apellido_materno: "Guerrerp",
        correo: "abelsanchez@gmail.com"
    };
    const usuario2 = await Usuario.create({
        ...datosOrganizador2
    });
    const organizador2 = await Organizador.create({
        id_usuario: usuario2.id,
    });

    organizadorId1 = organizador1.id_usuario;
    organizadorId2 = organizador2.id_usuario;

    // Datos a usar/modificar en las pruebas
    datosSorteoBase = {
        "titulo": "Sorteo - DAO",
        "descripcion": "Descripción del sorteo - DAO.",
        "imagen_url": "http:imagenes.com/sorteo-dao",
        "rango_numeros": 100,
        "inicio_periodo_venta": "2025-12-06",
        "fin_periodo_venta": "2025-12-23",
        "fecha_realizacion": "2025-12-24",
        "precio_numero": 1000,
        "id_configuracion": configGlobalId,
        "Premios": [{
            "titulo": "Premio - DAO",
            "imagen_premio_url": "http:imagenes.com/premio-dao"
        }],
        "OrganizadorSorteos": [{ id_organizador: organizadorId1 }]
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
    await Configuracion.destroy({ where: { id: configGlobalId } });
    await Configuracion.destroy({ where: { id: configNuevaId } });
});

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

describe('crearSorteo (DAO)', () => {
    // Prueba 1: Crear un sorteo con datos válidos (con 1 organizador)
    it('debería crear un nuevo sorteo en la base de datos', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase);
        datosSorteo.titulo = "Sorteo 1 - DAO";

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
        expect(sorteoCreado.precio_numero).toBe(datosSorteo.precio_numero);
        expect(sorteoCreado.id_configuracion).toBe(configGlobalId);
    });

    // Prueba 2: Intentar crear un sorteo sin título
    it('no debería crear un sorteo si falta el título', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        delete datosSorteoIncompleto.titulo;

        // Act + Assert
        await expect(sorteosDAO.crearSorteo(datosSorteoIncompleto))
            .rejects.toThrow("Field 'titulo' doesn't have a default value");
    });

    // Prueba 3: Intentar crear un sorteo sin descripción
    it('no debería crear un sorteo si falta la descripción', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        delete datosSorteoIncompleto.descripcion;

        // Act + Assert
        await expect(sorteosDAO.crearSorteo(datosSorteoIncompleto))
            .rejects.toThrow("Field 'descripcion' doesn't have a default value");
    });

    // Prueba 4: Intentar crear un sorteo sin imagen
    it('no debería crear un sorteo si falta la imagen', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        delete datosSorteoIncompleto.imagen_url;

        // Act + Assert
        await expect(sorteosDAO.crearSorteo(datosSorteoIncompleto))
            .rejects.toThrow("Field 'imagen_url' doesn't have a default value");
    });

    // Prueba 5: Intentar crear un sorteo sin rango de números
    it('no debería crear un sorteo si falta el rango de números', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        delete datosSorteoIncompleto.rango_numeros;

        // Act + Assert
        await expect(sorteosDAO.crearSorteo(datosSorteoIncompleto))
            .rejects.toThrow("Field 'rango_numeros' doesn't have a default value");
    });

    // Prueba 6: Intentar crear un sorteo sin inicio de periodo de venta
    it('no debería crear un sorteo si falta el inicio de periodo de venta', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        delete datosSorteoIncompleto.inicio_periodo_venta;

        // Act + Assert
        await expect(sorteosDAO.crearSorteo(datosSorteoIncompleto))
            .rejects.toThrow("Field 'inicio_periodo_venta' doesn't have a default value");
    });

    // Prueba 7: Intentar crear un sorteo sin fin de periodo de venta
    it('no debería crear un sorteo si falta el fin de periodo de venta', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        delete datosSorteoIncompleto.fin_periodo_venta;

        // Act + Assert
        await expect(sorteosDAO.crearSorteo(datosSorteoIncompleto))
            .rejects.toThrow("Field 'fin_periodo_venta' doesn't have a default value");
    });

    // Prueba 8: Intentar crear un sorteo sin fecha de realización
    it('no debería crear un sorteo si falta la fecha de realización', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        delete datosSorteoIncompleto.fecha_realizacion;

        // Act + Assert
        await expect(sorteosDAO.crearSorteo(datosSorteoIncompleto))
            .rejects.toThrow("Field 'fecha_realizacion' doesn't have a default value");
    });

    // Prueba 9: Intentar crear un sorteo sin precio por número
    it('no debería crear un sorteo si falta el precio por número', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        delete datosSorteoIncompleto.precio_numero;

        // Act + Assert
        await expect(sorteosDAO.crearSorteo(datosSorteoIncompleto))
            .rejects.toThrow("Field 'precio_numero' doesn't have a default value");
    });

    // Prueba 10: Intentar crear un sorteo sin ID de configuración
    it('no debería crear un sorteo si falta el ID de configuración', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        delete datosSorteoIncompleto.id_configuracion;

        // Act + Assert
        await expect(sorteosDAO.crearSorteo(datosSorteoIncompleto))
            .rejects.toThrow("Field 'id_configuracion' doesn't have a default value");
    });

    // Prueba 11: Intentar crear un sorteo sin datos del premio
    it('no debería crear un sorteo si faltan los datos del premio', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        datosSorteoIncompleto.titulo = "Sorteo 11 - DAO";
        delete datosSorteoIncompleto.Premios;
        console.log(datosSorteoIncompleto);

        // Act + Assert
        await expect(sorteosDAO.crearSorteo(datosSorteoIncompleto))
            .rejects.toThrow("Los datos de los premios son requeridos para crear un sorteo.");
    });

    // Prueba 12: Intentar crear un sorteo con el arreglo de premios vacío
    it('no debería crear un sorteo si faltan los datos del premio', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        datosSorteoIncompleto.Premios = [];

        // Act + Assert
        await expect(sorteosDAO.crearSorteo(datosSorteoIncompleto))
            .rejects.toThrow("Los datos de los premios son requeridos para crear un sorteo.");
    });

    // Prueba 13: Intentar crear un sorteo sin el título del premio
    it('no debería crear un sorteo si falta el título del premio', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        delete datosSorteoIncompleto.Premios[0].titulo;

        // Act + Assert
        await expect(sorteosDAO.crearSorteo(datosSorteoIncompleto))
            .rejects.toThrow("Field 'titulo' doesn't have a default value");
    });

    // Prueba 14: Intentar crear un sorteo sin la imagen del premio
    it('no debería crear un sorteo si falta la imagen del premio', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        delete datosSorteoIncompleto.Premios[0].imagen_premio_url;

        // Act + Assert
        await expect(sorteosDAO.crearSorteo(datosSorteoIncompleto))
            .rejects.toThrow("Validation error");
    });

    // Prueba 15: Intentar crear un sorteo con el título duplicado
    it('no debería crear un sorteo si ya existe otro con el mismo título', async () => {
        // Arrange
        const datosSorteo1 = deepClone(datosSorteoBase);
        datosSorteo1.titulo = "Sorteo 15 - DAO";
        const datosSorteo2 = deepClone(datosSorteoBase);
        datosSorteo2.titulo = "Sorteo 15 - DAO";

        // Act
        await sorteosDAO.crearSorteo(datosSorteo1);

        // Assert
        await expect(sorteosDAO.crearSorteo(datosSorteo2)).rejects.toThrow();
    });

    // Prueba 16: Crear un sorteo con datos válidos (con 2 organizadores)
    it('debería crear un nuevo sorteo en la base de datos', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase);
        datosSorteo.titulo = "Sorteo 16 - DAO";
        datosSorteo.OrganizadorSorteos.push({ id_organizador: organizadorId2 });

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
        expect(sorteoCreado.precio_numero).toBe(datosSorteo.precio_numero);
    });

    // Prueba 17: Intentar crear un sorteo sin organizadores
    it('no debería crear un sorteo sin los datos de los organizadores', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        delete datosSorteoIncompleto.OrganizadorSorteos;

        // Act + Assert
        await expect(sorteosDAO.crearSorteo(datosSorteoIncompleto))
            .rejects.toThrow("Se requiere al menos un organizador para crear un sorteo.");

    });

    // Prueba 18: Intentar crear un sorteo con el arreglo de organizadores vacío
    it('no debería crear un sorteo sin los datos de los organizadores', async () => {
        // Arrange
        const datosSorteoIncompleto = deepClone(datosSorteoBase);
        datosSorteoIncompleto.OrganizadorSorteos = [];

        // Act + Assert
        await expect(sorteosDAO.crearSorteo(datosSorteoIncompleto))
            .rejects.toThrow("Se requiere al menos un organizador para crear un sorteo.");
    });

});

describe('actualizarSorteo (DAO)', () => {
    // ID: GST-001
    it('GST-001: debería actualizar todos los datos válidos de un sorteo', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase);
        datosSorteo.titulo = "Sorteo GST-001"; // Título único
        const sorteoCreado = await sorteosDAO.crearSorteo(datosSorteo);
        const sorteoId = sorteoCreado.id;

        const datosSorteoActualizado = {
            "descripcion": "Descripción del sorteo actualizado - DAO.",
            "imagen_url": "http:imagenes.com/sorteoactualizado-dao",
            "rango_numeros": 150,
            "inicio_periodo_venta": "2025-12-07",
            "fin_periodo_venta": "2025-12-24",
            "fecha_realizacion": "2025-12-25",
            "precio_numero": 1500,
            "id_configuracion": configNuevaId,
            "Premios": [{
                "id": sorteoCreado.Premios[0].id,
                "titulo": "Premio actualizado - DAO",
                "imagen_premio_url": "http:imagenes.com/premioactualizado-dao"
            }],
            "OrganizadorSorteos": [organizadorId2] // Se espera una lista de IDs
        };

        // Act
        console.log(sorteoId);
        const sorteoActualizado = await sorteosDAO.actualizarSorteo(sorteoId, datosSorteoActualizado);

        // Assert
        expect(sorteoActualizado.descripcion).toBe(datosSorteoActualizado.descripcion);
        expect(sorteoActualizado.imagen_url).toBe(datosSorteoActualizado.imagen_url);
        expect(sorteoActualizado.rango_numeros).toBe(datosSorteoActualizado.rango_numeros);
        expect(new Date(sorteoActualizado.inicio_periodo_venta)).toEqual(new Date(datosSorteoActualizado.inicio_periodo_venta));
        expect(new Date(sorteoActualizado.fin_periodo_venta)).toEqual(new Date(datosSorteoActualizado.fin_periodo_venta));
        expect(new Date(sorteoActualizado.fecha_realizacion)).toEqual(new Date(datosSorteoActualizado.fecha_realizacion));
        expect(Number(sorteoActualizado.precio_numero)).toBe(datosSorteoActualizado.precio_numero);
        expect(sorteoActualizado.id_configuracion).toBe(datosSorteoActualizado.id_configuracion);
        expect(sorteoActualizado.Premios[0].titulo).toBe(datosSorteoActualizado.Premios[0].titulo);
        expect(sorteoActualizado.Premios[0].imagen_premio_url).toBe(datosSorteoActualizado.Premios[0].imagen_premio_url);

        // Verificar organizadores en la tabla de unión
        const orgSorteos = await OrganizadorSorteo.findAll({ where: { id_sorteo: sorteoId } });
        expect(orgSorteos).toHaveLength(1);
        expect(orgSorteos[0].id_organizador).toBe(organizadorId2);
    });

    // ID: GST-002
    it('GST-002: debería actualizar solo la descripción', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase);
        datosSorteo.titulo = "Sorteo GST-002";
        const sorteoCreado = await sorteosDAO.crearSorteo(datosSorteo);
        const datosActualizados = {
            descripcion: "Descripción del sorteo actualizado - DAO"
        };

        // Act
        const sorteoActualizado = await sorteosDAO.actualizarSorteo(sorteoCreado.id, datosActualizados);

        // Assert
        expect(sorteoActualizado.descripcion).toBe(datosActualizados.descripcion);
        expect(sorteoActualizado.titulo).toBe(datosSorteo.titulo); // Verificar que otros datos no cambiaron
    });

    // ID: GST-003
    it('GST-003: debería actualizar solo la imagen del sorteo', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase);
        datosSorteo.titulo = "Sorteo GST-003";
        const sorteoCreado = await sorteosDAO.crearSorteo(datosSorteo);
        const datosActualizados = {
            imagen_url: "http:imagenes.com/sorteoactualizado-dao"
        };

        // Act
        const sorteoActualizado = await sorteosDAO.actualizarSorteo(sorteoCreado.id, datosActualizados);

        // Assert
        expect(sorteoActualizado.imagen_url).toBe(datosActualizados.imagen_url);
        expect(sorteoActualizado.titulo).toBe(datosSorteo.titulo);
    });

    // ID: GST-004
    it('GST-004: debería actualizar solo el rango de números', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase);
        datosSorteo.titulo = "Sorteo GST-004";
        const sorteoCreado = await sorteosDAO.crearSorteo(datosSorteo);
        const datosActualizados = { rango_numeros: 150 };

        // Act
        const sorteoActualizado = await sorteosDAO.actualizarSorteo(sorteoCreado.id, datosActualizados);

        // Assert
        expect(sorteoActualizado.rango_numeros).toBe(datosActualizados.rango_numeros);
        expect(sorteoActualizado.titulo).toBe(datosSorteo.titulo);
    });

    // ID: GST-005
    it('GST-005: debería actualizar solo la fecha de inicio de venta', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase);
        datosSorteo.titulo = "Sorteo GST-005";
        const sorteoCreado = await sorteosDAO.crearSorteo(datosSorteo);
        const datosActualizados = {
            inicio_periodo_venta: "2025-12-07"
        };

        // Act
        const sorteoActualizado = await sorteosDAO.actualizarSorteo(sorteoCreado.id, datosActualizados);

        // Assert
        expect(new Date(sorteoActualizado.inicio_periodo_venta)).toEqual(new Date(datosActualizados.inicio_periodo_venta));
        expect(sorteoActualizado.titulo).toBe(datosSorteo.titulo);
    });

    // ID: GST-006
    it('GST-006: debería actualizar solo la fecha de fin de venta', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase);
        datosSorteo.titulo = "Sorteo GST-006";
        const sorteoCreado = await sorteosDAO.crearSorteo(datosSorteo);
        const datosActualizados = {
            fin_periodo_venta: "2025-12-24"
        };

        // Act
        const sorteoActualizado = await sorteosDAO.actualizarSorteo(sorteoCreado.id, datosActualizados);

        // Assert
        expect(new Date(sorteoActualizado.fin_periodo_venta)).toEqual(new Date(datosActualizados.fin_periodo_venta));
        expect(sorteoActualizado.titulo).toBe(datosSorteo.titulo);
    });

    // ID: GST-007
    it('GST-007: debería actualizar solo la fecha de realización', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase);
        datosSorteo.titulo = "Sorteo GST-007";
        const sorteoCreado = await sorteosDAO.crearSorteo(datosSorteo);
        const datosActualizados = {
            fecha_realizacion: "2025-12-25"
        };

        // Act
        const sorteoActualizado = await sorteosDAO.actualizarSorteo(sorteoCreado.id, datosActualizados);

        // Assert
        expect(new Date(sorteoActualizado.fecha_realizacion)).toEqual(new Date(datosActualizados.fecha_realizacion));
        expect(sorteoActualizado.titulo).toBe(datosSorteo.titulo);
    });

    // ID: GST-008
    it('GST-008: debería actualizar solo el precio por número', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase);
        datosSorteo.titulo = "Sorteo GST-008";
        const sorteoCreado = await sorteosDAO.crearSorteo(datosSorteo);
        const datosActualizados = { precio_numero: 1500.0 };

        // Act
        const sorteoActualizado = await sorteosDAO.actualizarSorteo(sorteoCreado.id, datosActualizados);

        // Assert
        expect(Number(sorteoActualizado.precio_numero)).toBe(datosActualizados.precio_numero);
        expect(sorteoActualizado.titulo).toBe(datosSorteo.titulo);
    });

    // ID: GST-009
    it('GST-009: debería actualizar solo la configuración', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase);
        datosSorteo.titulo = "Sorteo GST-009";
        const sorteoCreado = await sorteosDAO.crearSorteo(datosSorteo);
        expect(sorteoCreado.id_configuracion).toBe(configGlobalId); // Verificar estado inicial
        const datosActualizados = {
            id_configuracion: configNuevaId
        };

        // Act
        const sorteoActualizado = await sorteosDAO.actualizarSorteo(sorteoCreado.id, datosActualizados);

        // Assert
        expect(sorteoActualizado.id_configuracion).toBe(configNuevaId);
        expect(sorteoActualizado.titulo).toBe(datosSorteo.titulo);
    });

    // ID: GST-010
    it('GST-010: debería actualizar solo el título de un premio', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase);
        datosSorteo.titulo = "Sorteo GST-010";
        const sorteoCreado = await sorteosDAO.crearSorteo(datosSorteo);
        const datosActualizados = {
            Premios: [{
                id: sorteoCreado.Premios[0].id, // Se debe pasar el ID del premio a actualizar
                titulo: "Premio actualizado - DAO"
            }]
        };

        // Act
        const sorteoActualizado = await sorteosDAO.actualizarSorteo(sorteoCreado.id, datosActualizados);

        // Assert
        expect(sorteoActualizado.Premios).toHaveLength(1);
        expect(sorteoActualizado.Premios[0].titulo).toBe(datosActualizados.Premios[0].titulo);
        // Verificar que el otro campo del premio no cambió
        expect(sorteoActualizado.Premios[0].imagen_premio_url).toBe(datosSorteo.Premios[0].imagen_premio_url);
    });

    // ID: GST-011
    it('GST-011: debería actualizar solo la imagen de un premio', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase);
        datosSorteo.titulo = "Sorteo GST-011";
        const sorteoCreado = await sorteosDAO.crearSorteo(datosSorteo);
        const datosActualizados = {
            Premios: [{
                id: sorteoCreado.Premios[0].id, // Se debe pasar el ID del premio a actualizar
                imagen_premio_url: "http:imagenes.com/premioactualizado-dao"
            }]
        };

        // Act
        const sorteoActualizado = await sorteosDAO.actualizarSorteo(sorteoCreado.id, datosActualizados);

        // Assert
        expect(sorteoActualizado.Premios).toHaveLength(1);
        expect(sorteoActualizado.Premios[0].imagen_premio_url).toBe(datosActualizados.Premios[0].imagen_premio_url);
        // Verificar que el otro campo del premio no cambió
        expect(sorteoActualizado.Premios[0].titulo).toBe(datosSorteo.Premios[0].titulo);
    });

    // ID: GST-012
    it('GST-012: debería actualizar solo los organizadores', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase); // Inicia con organizadorId1
        datosSorteo.titulo = "Sorteo GST-012";
        const sorteoCreado = await sorteosDAO.crearSorteo(datosSorteo);

        const datosActualizados = {
            OrganizadorSorteos: [organizadorId2] // Se pasa la lista de IDs de organizador
        };

        // Act
        const sorteoActualizado = await sorteosDAO.actualizarSorteo(sorteoCreado.id, datosActualizados);

        // Assert
        // Verificar la tabla de unión directamente
        const orgSorteos = await OrganizadorSorteo.findAll({ where: { id_sorteo: sorteoActualizado.id } });
        expect(orgSorteos).toHaveLength(1);
        expect(orgSorteos[0].id_organizador).toBe(organizadorId2);
    });

});

describe('eliminarSorteo (DAO)', () => {
    // ID: GST-023
    it('GST-023: debería eliminar un sorteo existente', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase);
        datosSorteo.titulo = "Sorteo GST-023";
        const sorteoCreado = await sorteosDAO.crearSorteo(datosSorteo);
        const sorteoId = sorteoCreado.id;

        // Act
        const resultado = await sorteosDAO.eliminarSorteo(sorteoId);

        // Assert
        const sorteoEliminado = await Sorteo.findByPk(sorteoId);
        expect(sorteoEliminado).toBeNull();
    });

    // ID: GST-024
    it('GST-024: no debería eliminar nada y devolver 0 si el ID no existe', async () => {
        // Arrange
        const idInexistente = 999999; // Un ID que seguramente no existe

        // Act + Assert
        await expect(sorteosDAO.eliminarSorteo(idInexistente))
            .rejects.toThrow("El sorteo no existe.");

    });
});