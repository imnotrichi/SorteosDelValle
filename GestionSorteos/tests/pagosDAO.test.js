import { describe, it, expect, beforeAll, afterAll } from "vitest";
const sorteosDAO = require('../dataAccess/sorteosDAO.js');
const numerosDAO = require('../dataAccess/numerosDAO.js');
const pagosDAO = require('../dataAccess/pagosDAO.js');
const { Sorteo, Configuracion, Premio, Organizador, Usuario, OrganizadorSorteo, Cliente, Numero, Pago } = require("../models/index.js");

let configGlobalId;
let organizadorId;
let id_sorteo;
let id_cliente;
let datosSorteo;
const id_sorteos = [];
const id_pagos = [];

beforeAll(async () => {
    // Insertas una configuración de prueba
    const configGlobal = await Configuracion.create({
        "tiempo_limite_apartado": "160:00:00",
        "tiempo_recordatorio_pago": "72:00:00"
    });
    configGlobalId = configGlobal.id;

    // Creamos un organizador
    const datosOrganizador = {
        nombres: "Ricardo Alán",
        apellido_paterno: "Gutiérrez",
        apellido_materno: "Garcés",
        correo: "skibidigonzalez@gmail.com"
    };
    const usuario1 = await Usuario.create({
        ...datosOrganizador
    });
    const organizador = await Organizador.create({
        id_usuario: usuario1.id,
    });
    organizadorId = organizador.id_usuario;

    // Datos a usar/modificar en las pruebas
    datosSorteo = {
        "titulo": "Sorteo - PAGOS - DAO",
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
        "OrganizadorSorteos": [{ id_organizador: organizadorId }]
    };
    const sorteoCreado = await sorteosDAO.crearSorteo(datosSorteo);
    id_sorteo = sorteoCreado.id;
    id_sorteos.push(sorteoCreado.id);

    // Creamos un cliente
    const datosCliente = {
        nombres: "Abel Eduardo",
        apellido_paterno: "Sánchez",
        apellido_materno: "Guerrero",
        correo: "papugomez@gmail.com"
    };
    const usuario2 = await Usuario.create({
        ...datosCliente
    });
    const cliente = await Cliente.create({
        id_usuario: usuario2.id,
    });
    id_cliente = cliente.id_usuario;
});

afterAll(async () => {
    await Numero.destroy({ where: { id_sorteo: id_sorteos } });
    await OrganizadorSorteo.destroy({ where: { id_organizador: organizadorId } });
    await Organizador.destroy({ where: { id_usuario: organizadorId } });
    await Cliente.destroy({ where: { id_usuario: id_cliente } });
    await Usuario.destroy({ where: { id: organizadorId } });
    await Usuario.destroy({ where: { id: id_cliente } });
    await Premio.destroy({ where: { id_sorteo: id_sorteo } });
    await Sorteo.destroy({ where: { id: id_sorteos } });
    await Configuracion.destroy({ where: { id: configGlobalId } });
    await Pago.destroy({ where: { id: id_pagos } });
});

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

describe('registrarComprobantePago (DAO)', () => {
    // RCP-001
    it('debería registrar un comprobante de pago exitosamente', async () => {
        // Arrange
        await numerosDAO.apartarNumeros({ numeros: [10, 20, 30], id_sorteo, id_cliente });

        // Act
        const response = await pagosDAO.registrarComprobantePago({ id_sorteo, numeros: [10, 20, 30], monto: 3000, url_comprobante: "http:comprobante.com/comp-pago-rcp1" });

        // Assert
        expect(response).toBe("Se registró correctamente el pago.");
        const numeros = await numerosDAO.obtenerNumerosPorSorteo(id_sorteo);
        id_pagos.push(numeros[0].id_pago);
    });

    // RCP-002
    it('no debería registrar el comprobante de pago si ninguno de los números está apartado', async () => {
        // Arrange
        await numerosDAO.apartarNumeros({ id_sorteo, numeros: [11, 22, 33], monto: 3000, id_cliente });

        // Act + Assert
        await expect(pagosDAO.registrarComprobantePago({
            id_sorteo,
            numeros: [40, 50, 60],
            url_comprobante: "http://comprobante.com/comp-pago-rcp2"
        })
        ).rejects.toThrow('No se encontró ninguno de los números proporcionados.');
    });
});