import { describe, it, expect, beforeAll, afterAll } from "vitest";
const sorteosDAO = require('../dataAccess/sorteosDAO.js');
const numerosDAO = require('../dataAccess/numerosDAO.js');
const pagosDAO = require('../dataAccess/pagosDAO.js');
const { Sorteo, Configuracion, Premio, Organizador, Usuario, OrganizadorSorteo, Cliente, Numero, Pago, PagoConComprobante } = require("../models/index.js");

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
        correo: "eltiomaschill@gmail.com"
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
    id_sorteos.push(id_sorteo);

    // Creamos un cliente
    const datosCliente = {
        nombres: "tio chillardo",
        apellido_paterno: "Sánchez",
        apellido_materno: "Guerrero",
        correo: "estetiotambioeneschill@gmail.com"
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
    await Premio.destroy({ where: { id_sorteo: id_sorteos } });
    await Sorteo.destroy({ where: { id: id_sorteos } });
    await Configuracion.destroy({ where: { id: configGlobalId } });
    await PagoConComprobante.destroy({ where: { id_pago: id_pagos } });
    await Pago.destroy({ where: { id: id_pagos } });
});

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

describe('apartarNumero (DAO)', () => {
    //APN-001: Probar que funcione correctamente la funcionalidad de apartar número.
    it('debería apartar un número', async () => {
        //Arrange
        const numeros = [21];

        //Act
        const resultado = await numerosDAO.apartarNumeros({ numeros, id_sorteo, id_cliente });

        //Assert
        expect(resultado.exito).toBe(true);
    });

    //APN-002: Probar que no se pueda apartar un número de un sorteo que no existe.
    it('no debería apartar un número', async () => {
        //arrange
        const numeros = [21];

        //Act
        let resultado;
        try {
            await numerosDAO.apartarNumeros({ numeros, id_sorteo: 102, id_cliente });
        } catch (error) {
            resultado = error;
        }

        //Assert
        expect(resultado).toBeInstanceOf(Error);
    });

    //APN-003: Probar que no se pueda apartar un número que no tiene dueño.
    it('no debería apartar un número', async () => {
        //arrange
        const numeros = [10];

        //Act
        let resultado
        try {
            await numerosDAO.apartarNumeros({ numeros, id_sorteo, id_cliente: 102 });
        } catch (error) {
            resultado = error;
        }

        //Assert
        expect(resultado).toBeInstanceOf(Error);
    });

    //APN-004: Probar que no se pueda apartar un número que ya está apartado.
    it('no debería apartar un número', async () => {
        //arrange
        const numeros = [21];
        await numerosDAO.apartarNumeros({ numeros, id_sorteo, id_cliente });

        //Act
        const resultado = await numerosDAO.apartarNumeros({ numeros, id_sorteo, id_cliente });


        //Assert
        expect(resultado.exito).toBe(false);
        expect(resultado.noDisponibles).toEqual([21]);
    });

    //APN-005: Probar que se pueda apartar más de un número a la vez.
    it('debería apartar los números', async () => {
        //arrange
        const numeros = [13, 14, 15];

        //Act
        const resultado = await numerosDAO.apartarNumeros({ numeros, id_sorteo, id_cliente });

        //Assert
        expect(resultado.exito).toBe(true);
    });

    //APN-007: Probar que se consulten correctamente los números apartados de un sorteo.
    it('debería consultar los números', async () => {
        //arrange
        let resultado;

        //Act
        resultado = await numerosDAO.obtenerNumerosApartados(id_sorteo);

        //Assert
        expect(resultado[0].numero).toEqual(21);
    });

    //APN-008: Probar que el sistema no falle al consultar numeros de un sorteo que no existe.
    it('no debería fallar al consultar los números', async () => {
        //arrange
        let resultado;
        const id_sorteo = 1021;

        //Act
        resultado = await numerosDAO.obtenerNumerosApartados(id_sorteo);

        //Assert
        expect(resultado).toEqual([]);
    });
});

describe('liberarNumero (DAO)', () => {
    // LBN-001: Probar que funcione correctamente la funcionalidad de liberar un número apartado.
    it('debería liberar un número apartado', async () => {
        // Arrange
        const numeros = [21];
        await numerosDAO.apartarNumeros({ numeros, id_sorteo, id_cliente });

        // Act
        const resultado = await numerosDAO.liberarNumeros({ numeros, id_sorteo });

        // Assert
        expect(resultado.exito).toBe(true);
    });

    // LBN-002: Probar que funcione correctamente la funcionalidad de liberar varios números apartados.
    it('debería liberar varios números apartados', async () => {
        // Arrange
        const numeros = [21, 22, 23];
        await numerosDAO.apartarNumeros({ numeros, id_sorteo, id_cliente });

        // Act
        const resultado = await numerosDAO.liberarNumeros({ numeros, id_sorteo });

        // Assert
        expect(resultado.exito).toBe(true);
    });

    // LBN-003: Probar que no se libere ningún número si se proporcionan números que no estén apartados.
    it('no debería liberar los números que no estén apartados', async () => {
        // Arrange
        const numeros = [21, 22, 23];
        await numerosDAO.apartarNumeros({ numeros, id_sorteo, id_cliente });

        // Act
        const resultado = await numerosDAO.liberarNumeros({ numeros: [21, 67, 68], id_sorteo });

        // Assert
        expect(resultado.exito).toBe(false);
        expect(resultado.faltantes).toStrictEqual([67, 68]);
    });

    // LBN-004: Probar que manejen bien los errores de concurrencia.
    it('debería liberar los números, pero sí debe mostrar un error de concurrencia', async () => {
        // Arrange
        const numeros = [21, 22, 23];
        await numerosDAO.apartarNumeros({ numeros, id_sorteo, id_cliente });

        // Act
        // Mandamos a liberar los números simultáneamente (sin await).
        const promesa1 = numerosDAO.liberarNumeros({ numeros: [21, 22, 23], id_sorteo });
        const promesa2 = numerosDAO.liberarNumeros({ numeros: [21, 22, 23], id_sorteo });

        // Usamos Promise.allSettled para asegurar que obtenemos ambos resultados,
        const [res1, res2] = await Promise.allSettled([promesa1, promesa2]);

        // Assert
        // Extraemos los valores de éxito.
        const resultado1 = res1.status === 'fulfilled' ? res1.value : res1.reason;
        const resultado2 = res2.status === 'fulfilled' ? res2.value : res2.reason;

        // No sabemos cuál se ejecutó correctamente, así que solo verificamos que una tuvo éxito y la otra falló.
        const exitos = [resultado1.exito, resultado2.exito].filter(e => e === true).length;
        const fallos = [resultado1.exito, resultado2.exito].filter(e => e === false).length;

        expect(exitos).toBe(1);
        expect(fallos).toBe(1);

        // Verificamos que el error de fallo sea el que esperamos.
        const resultadoFallido = resultado1.exito === false ? resultado1 : resultado2;
        expect(resultadoFallido.exito).toBe(false);
        expect(resultadoFallido.faltantes).toEqual([21, 22, 23]);
    });
});

describe('marcarNumerosComoPagados (DAO)', () => {
    // MNP-001
    it('debería marcar los números como pagados', async () => {
        // Arrange
        await numerosDAO.apartarNumeros({ numeros: [50, 51, 52], id_sorteo, id_cliente });
        await pagosDAO.registrarComprobantePago({ id_sorteo, numeros: [50, 51, 52], monto: 3000, url_comprobante: "http:comprobante.com/comp-pago-mnp1" });

        // Act
        const response = await numerosDAO.marcarNumerosComoPagados({ id_sorteo, numeros: [50, 51, 52] });
        // Assert
        expect(response).toBe("Se registró completó la operación correctamente.");
        const numeros = await numerosDAO.obtenerNumerosPorSorteo(id_sorteo);
        id_pagos.push(numeros[0].id_pago);
    });

    // MNP-002
    it('no debería marcar los números como pagados si no se proporciona el ID del sorteo', async () => {
        // Act + Assert
        await expect(numerosDAO.marcarNumerosComoPagados({ numeros: [40, 50, 60] })
        ).rejects.toThrow('Se debe proporcionar el id del sorteo para realizar la operación.');
    });

    // MNP-003
    it('no debería marcar los números como pagados si no se proporciona ningún número', async () => {
        // Act + Assert
        await expect(numerosDAO.marcarNumerosComoPagados({
            id_sorteo: id_sorteo_local,
        })
        ).rejects.toThrow('Se debe proporcionar al menos un número para realizar la operación.');
    });
});