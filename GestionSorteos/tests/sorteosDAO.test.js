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
/*
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
*/


describe('actualizarSorteo (DAO)', () => {
    // Prueba 1: Editar un sorteo con datos válidos (con 1 organizador)
    it('debería editar un sorteo en la base de datos', async () => {
        // Arrange
        const datosSorteo = deepClone(datosSorteoBase);
        const sorteoId = (await sorteosDAO.crearSorteo(datosSorteo)).id;

        const datosSorteoActualizado = {
            "descripcion": "Descripción del sorteo editado - DAO.",
            "imagen_url": "http:imagenes.com/sorteoeditado-dao",
            "rango_numeros": 150,
            "inicio_periodo_venta": "2025-12-07",
            "fin_periodo_venta": "2025-12-24",
            "fecha_realizacion": "2025-12-25",
            "precio_numero": 1500,
            "id_configuracion": configNuevaId,
            "Premios": [{
                "titulo": "Premio editado - DAO",
                "imagen_premio_url": "http:imagenes.com/premioeditado-dao"
            }],
            "OrganizadorSorteos": [organizadorId2]
        };

        // Act
        const sorteoActualizado = await sorteosDAO.actualizarSorteo(sorteoId, datosSorteoActualizado);

        // Assert
        expect(sorteoActualizado.descripcion).toBe(datosSorteoActualizado.descripcion);
        expect(sorteoActualizado.imagen_url).toBe(datosSorteoActualizado.imagen_url);
        expect(sorteoActualizado.rango_numeros).toBe(datosSorteoActualizado.rango_numeros);
        expect(new Date(sorteoActualizado.inicio_periodo_venta)).toEqual(new Date(datosSorteoActualizado.inicio_periodo_venta));
        expect(new Date(sorteoActualizado.fin_periodo_venta)).toEqual(new Date(datosSorteoActualizado.fin_periodo_venta));
        expect(new Date(sorteoActualizado.fecha_realizacion)).toEqual(new Date(datosSorteoActualizado.fecha_realizacion));
        expect(sorteoActualizado.precio_numero).toBe(datosSorteoActualizado.precio_numero);
        expect(sorteoActualizado.Premios[0].titulo).toBe(datosSorteoActualizado.Premios[0].titulo);
        expect(sorteoActualizado.Premios[0].imagen_premio_url).toBe(datosSorteoActualizado.Premios[0].imagen_premio_url);
    });
});
