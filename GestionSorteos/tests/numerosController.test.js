import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from "vitest";
import numerosDAO from "../dataAccess/numerosDAO.js";
import sorteosDAO from "../dataAccess/sorteosDAO.js";
const sorteosController = require('../controllers/sorteosController.js');
const numerosController = require('../controllers/numerosController.js');
const { Sorteo, Configuracion, Premio, Organizador, Usuario, OrganizadorSorteo, Cliente, Numero, Pago } = require("../models/index.js");

let configGlobalId;
let organizadorId;
let id_sorteo;
let id_cliente;
let mockRes, mockNext;

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
        correo: "ricardogutierrez@gmail.com"
    };
    const usuario1 = await Usuario.create({
        ...datosOrganizador
    });
    const organizador = await Organizador.create({
        id_usuario: usuario1.id,
    });
    organizadorId = organizador.id_usuario;

    // Datos a usar/modificar en las pruebas
    const datosSorteo = {
        "titulo": "Sorteo - LBN",
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

    // Creamos un cliente
    const datosCliente = {
        nombres: "Abel Eduardo",
        apellido_paterno: "Sánchez",
        apellido_materno: "Guerrero",
        correo: "abelsanchez@gmail.com"
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
    await Numero.destroy({ where: {} });
    await OrganizadorSorteo.destroy({ where: { id_organizador: organizadorId } });
    await Organizador.destroy({ where: { id_usuario: organizadorId } });
    await Cliente.destroy({ where: { id_usuario: id_cliente } });
    await Usuario.destroy({ where: { id: organizadorId } });
    await Usuario.destroy({ where: { id: id_cliente } });
    await Premio.destroy({ where: { id_sorteo: id_sorteo } });
    await Sorteo.destroy({ where: { id: id_sorteo } });
    await Configuracion.destroy({ where: { id: configGlobalId } });
});

beforeEach(async () => {
    ({ mockRes, mockNext } = setupMocks());
})

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

describe('liberarNumero (Controller)', () => {
    // LBN-005: Probar que funcione correctamente la funcionalidad de liberar un número apartado.
    it('debería liberar un número apartado', async () => {
        // Arrange
        await numerosDAO.apartarNumeros({ numeros: [21], id_sorteo, id_cliente });
        const mockReq = { body: { numeros: [21], id_sorteo } };

        // Act
        await numerosController.liberarNumeros(mockReq, mockRes, mockNext);
        const resultado = mockRes.json.mock.calls[0][0];

        // Assert
        expect(resultado).toStrictEqual([21]);
    });

    // LBN-006: Probar que funcione correctamente la funcionalidad de liberar varios números apartados.
    it('debería liberar varios números apartados', async () => {
        // Arrange
        await numerosDAO.apartarNumeros({ numeros: [21, 22, 23], id_sorteo, id_cliente });
        const mockReq = { body: { numeros: [21, 22, 23], id_sorteo } };

        // Act
        await numerosController.liberarNumeros(mockReq, mockRes, mockNext);
        const resultado = mockRes.json.mock.calls[0][0];

        // Assert
        expect(resultado).toStrictEqual([21, 22, 23]);
    });

    // LBN-007: Probar que no se libere ningún número si se proporcionan números que no estén apartados.
    it('no debería liberar ningún número si se proporcionan números que no estén apartados', async () => {
        // Arrange
        await numerosDAO.apartarNumeros({ numeros: [21, 22, 23], id_sorteo, id_cliente });
        const mockReq = { body: { numeros: [21, 67, 68], id_sorteo } };

        // Act
        await numerosController.liberarNumeros(mockReq, mockRes, mockNext);
        const error = mockNext.mock.calls[0][0];

        // Assert
        expect(mockNext.mock.calls[0][0].message).toBe("Los números 67, 68 no están apartados o ya fueron liberados.");
    });

    // LBN-008: Probar que no se libere ningún número si no se proporciona el ID del sorteo.
    it('no debería liberar ningún número si no se proporciona el ID del sorteo', async () => {
        // Arrange
        await numerosDAO.apartarNumeros({ numeros: [21, 22, 23], id_sorteo, id_cliente });
        const mockReq = { body: { numeros: [21, 22, 23] } };

        // Act
        await numerosController.liberarNumeros(mockReq, mockRes, mockNext);

        // Assert
        const error = mockNext.mock.calls[0][0];
        expect(error.message).toBe("No se proporcionó el ID del sorteo.");
    });

    // LBN-009: Probar que no se libere ningún número si no se proporciona el ID de un sorteo existente.
    it('no debería liberar ningún número si se proporciona el ID de un sorteo inexistente', async () => {
        // Arrange
        await numerosDAO.apartarNumeros({ numeros: [21, 22, 23], id_sorteo, id_cliente });
        const mockReq = { body: { numeros: [21, 22, 23], id_sorteo: 999 } };

        // Act
        await numerosController.liberarNumeros(mockReq, mockRes, mockNext);

        // Assert
        const error = mockNext.mock.calls[0][0];
        expect(error.message).toBe("No se encontró el sorteo con ID: 999.");
    });

    // LBN-010: Probar que no se libere ningún número si no se proporciona ningún número.
    it('no debería liberar ningún número si no proporciona ningún número', async () => {
        // Arrange
        await numerosDAO.apartarNumeros({ numeros: [21, 22, 23], id_sorteo, id_cliente });
        const mockReq = { body: { id_sorteo } };

        // Act
        await numerosController.liberarNumeros(mockReq, mockRes, mockNext);

        // Assert
        const error = mockNext.mock.calls[0][0];
        expect(error.message).toBe("No se proporcionó ningún número.");
    });

    // LBN-011: Probar que no se libere ningún número si el parámetro números no es un arreglo.
    it('no debería liberar ningún número si no proporciona ningún número', async () => {
        // Arrange
        await numerosDAO.apartarNumeros({ numeros: [21, 22, 23], id_sorteo, id_cliente });
        const mockReq = { body: { numeros: 10, id_sorteo } };

        // Act
        await numerosController.liberarNumeros(mockReq, mockRes, mockNext);

        // Assert
        const error = mockNext.mock.calls[0][0];
        expect(error.message).toBe('El campo "numeros" debe ser un arreglo.');
    });

    // LBN-012: Probar que no se libere ningún número si se proporcionan datos no numéricos en el parámetro numeros.
    it('no debería liberar ningún número si se proporcionan datos no numéricos', async () => {
        // Arrange
        await numerosDAO.apartarNumeros({ numeros: [21, 22, 23], id_sorteo, id_cliente });
        const mockReq = { body: { numeros: [21, "A"], id_sorteo } };

        // Act
        await numerosController.liberarNumeros(mockReq, mockRes, mockNext);

        // Assert
        const error = mockNext.mock.calls[0][0];
        expect(error.message).toBe('Solo se permiten números enteros.');
    });

    // LBN-013: Probar que no se libere ningún número si el arreglo de números está vacío.
    it('no debería liberar ningún número si se proporciona un arreglo vacío', async () => {
        // Arrange
        await numerosDAO.apartarNumeros({ numeros: [21, 22, 23], id_sorteo, id_cliente });
        const mockReq = { body: { numeros: [], id_sorteo } };

        // Act
        await numerosController.liberarNumeros(mockReq, mockRes, mockNext);

        // Assert
        const error = mockNext.mock.calls[0][0];
        expect(error.message).toBe('No se seleccionó ningún número.');
    });

    // LBN-014: Probar que no se libere ningún número si alguno de los números no está dentro del rango de números del sorteo.
    it('no debería liberar ningún número si se proporcionan números fuera del rango del sorteo', async () => {
        // Arrange
        await numerosDAO.apartarNumeros({ numeros: [21, 22, 23], id_sorteo, id_cliente });
        const mockReq = { body: { numeros: [-1, 0, 999], id_sorteo } };

        // Act
        await numerosController.liberarNumeros(mockReq, mockRes, mockNext);

        // Assert
        const error = mockNext.mock.calls[0][0];
        expect(error.message).toBe('Los siguientes números están fuera del rango permitido (1-100): -1, 0, 999');
    });

    // LBN-015: Probar que no se libere ningún número de un sorteo que ya finalizó.
    it('no debería liberar ningún número si el sorteo ya finalizó', async () => {
        // Arrange
        await numerosDAO.apartarNumeros({ numeros: [21, 22, 23], id_sorteo, id_cliente });
        // Actualizamos la fecha de realización del sorteo
        const datosActualizados = { fecha_realizacion: "2025-11-17" };
        await sorteosDAO.actualizarSorteo(id_sorteo, datosActualizados);
        const mockReq = { body: { numeros: [21, 22, 23], id_sorteo } };

        // Act
        await numerosController.liberarNumeros(mockReq, mockRes, mockNext);

        // Assert
        const error = mockNext.mock.calls[0][0];
        expect(error.message).toBe('El sorteo ya finalizó.');
    });
});