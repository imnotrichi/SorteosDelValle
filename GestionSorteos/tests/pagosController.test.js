import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from "vitest";
import numerosDAO from "../dataAccess/numerosDAO.js";
import sorteosDAO from "../dataAccess/sorteosDAO.js";
const pagosController = require('../controllers/pagosController.js');
const { Sorteo, Configuracion, Premio, Organizador, Usuario, OrganizadorSorteo, Cliente, Numero, Pago, PagoConComprobante } = require("../models/index.js");

let configGlobalId;
let organizadorId;
let id_sorteo;
let id_cliente;
let mockRes, mockNext;
let id_sorteos = [];
let id_pagos = [];
const url_comprobante = "https://fastly.picsum.photos/id/412/300/200";
let datosSorteo = {};

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
        correo: "fuachaval@gmail.com"
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
        "titulo": "ESTE SORTEO ES PARA PRUEBAS",
        "descripcion": "Descripción del sorteo - LBN.",
        "imagen_url": "http:imagenes.com/sorteo-LBN",
        "rango_numeros": 100,
        "inicio_periodo_venta": "2025-12-06",
        "fin_periodo_venta": "2025-12-23",
        "fecha_realizacion": "2025-12-24",
        "precio_numero": 100,
        "id_configuracion": configGlobalId,
        "Premios": [{
            "titulo": "Premio - LBN",
            "imagen_premio_url": "http:imagenes.com/premio-LBN"
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
        correo: "aaaaaaaaaaaaaa@gmail.com"
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
    await Usuario.destroy({ where: { id: [organizadorId, id_cliente] } });
    await Premio.destroy({ where: { id_sorteo: id_sorteos } });
    await Sorteo.destroy({ where: { id: id_sorteos } });
    await Configuracion.destroy({ where: { id: configGlobalId } });
    await PagoConComprobante.destroy({ where: { id_pago: id_pagos } });
    await Pago.destroy({ where: { id: id_pagos } });
});

beforeEach(async () => {
    ({ mockRes, mockNext } = setupMocks());
})

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

describe('registrarComprobantePago (Controller)', () => {
    // RCP-003
    it('debería registrar un comprobante de pago exitosamente', async () => {
        // Arrange
        await numerosDAO.apartarNumeros({ numeros: [11,12,13], id_sorteo, id_cliente });
        const mockReq = { body: { numeros: [11,12,13], id_sorteo, url_comprobante } };

        // Act
        await pagosController.registrarComprobantePago(mockReq, mockRes, mockNext);

        // Assert
        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json.mock.calls[0][0].message).toBe('Se registró correctamente el comprobante de pago.');
        const numeros = await numerosDAO.obtenerNumerosPorSorteo(id_sorteo);
        id_pagos.push(numeros[0].id_pago);
    });

    // RCP-004
    it('no debería registrar el comprobante de pago si falta el ID del sorteo', async () => {
        // Arrange
        const mockReq = { body: { numeros: [1, 2, 3], url_comprobante } };

        // Act
        await pagosController.registrarComprobantePago(mockReq, mockRes, mockNext);

        // Assert
        const error = mockNext.mock.calls[0][0];
        expect(error.message).toBe("Se debe proporcionar el id del sorteo.");
    });

    // RCP-005
    it('no debería registrar el comprobante de pago si no se proporciona ningún número', async () => {
        // Arrange
        const mockReq = { body: { id_sorteo, url_comprobante } };

        // Act
        await pagosController.registrarComprobantePago(mockReq, mockRes, mockNext);

        // Assert
        const error = mockNext.mock.calls[0][0];
        expect(error.message).toBe("Se debe proporcionar al menos un número.");
    });

    // RCP-006
    it('no debería registrar el comprobante de pago si no se proporciona una imagen del comprobante', async () => {
        // Arrange
        const mockReq = { body: { id_sorteo, numeros: [1,2,3] } };

        // Act
        await pagosController.registrarComprobantePago(mockReq, mockRes, mockNext);

        // Assert
        const error = mockNext.mock.calls[0][0];
        expect(error.message).toBe("Se debe proporcionar la imagen del comprobante de pago.");
    });

    // RCP-007
    it('no debería registrar el comprobante de pago si no existe el sorteo', async () => {
        // Arrange
        const mockReq = { body: { id_sorteo: 9999, numeros: [1,2,3], url_comprobante } };

        // Act
        await pagosController.registrarComprobantePago(mockReq, mockRes, mockNext);

        // Assert
        const error = mockNext.mock.calls[0][0];
        expect(error.message).toBe("El sorteo no existe.");
    });

    // RCP-008
    it('no debería registrar el comprobante de pago si el sorteo no tiene números apartados', async () => {
        // Arrange
        datosSorteo.titulo = "Sorteo - RCP-008";
        const nuevoSorteo = await sorteosDAO.crearSorteo(datosSorteo);
        const sorteoId = nuevoSorteo.id;
        id_sorteos.push(sorteoId);
        const mockReq = { body: { id_sorteo: sorteoId, numeros: [1,2,3], url_comprobante } };

        // Act
        await pagosController.registrarComprobantePago(mockReq, mockRes, mockNext);

        // Assert
        const error = mockNext.mock.calls[0][0];
        expect(error.message).toBe("El sorteo no cuenta con números apartados.");
    });

    // RCP-009
    it('no debería registrar el comprobante de pago si alguno de los números del comprobante no está apartado', async () => {
        // Arrange
        datosSorteo.titulo = "Sorteo - RCP-009";
        const nuevoSorteo = await sorteosDAO.crearSorteo(datosSorteo);
        const sorteoId = nuevoSorteo.id;
        id_sorteos.push(sorteoId);
        await numerosDAO.apartarNumeros({ numeros: [10, 20, 30], id_sorteo: sorteoId, id_cliente });
        const mockReq = { body: { id_sorteo: sorteoId, numeros: [10, 20, 30, 40, 50], url_comprobante } };

        // Act
        await pagosController.registrarComprobantePago(mockReq, mockRes, mockNext);

        // Assert
        const error = mockNext.mock.calls[0][0];
        expect(error.message).toBe("Todos los números deben estar apartados.");
    });
});