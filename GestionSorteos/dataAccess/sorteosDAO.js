const { sequelize } = require('../models');
const { Sorteo } = require('../models');
const { Premio } = require('../models');
const { OrganizadorSorteo } = require('../models/');
const { Configuracion } = require('../models/');
const { Organizador } = require('../models/');
const { Usuario } = require('../models/');
const { Op } = require('sequelize');

class SorteosDAO {

    constructor() { }

    async crearSorteo(sorteoData) {
        if (!sorteoData.Premios || sorteoData.Premios.length === 0) {
            throw new Error('Los datos de los premios son requeridos para crear un sorteo.');
        }
        if (!sorteoData.OrganizadorSorteos || sorteoData.OrganizadorSorteos.length === 0) {
            throw new Error('Se requiere al menos un organizador para crear un sorteo.');
        }
        try {
            const sorteoCreado = await Sorteo.create(
                sorteoData,
                {
                    include: [{
                        model: Premio,
                        as: 'Premios'
                    },
                    {
                        model: OrganizadorSorteo,
                        as: 'OrganizadorSorteos'
                    }]
                }
            );

            const sorteo = await this.obtenerSorteoPorId(sorteoCreado.id);
            return sorteo;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async obtenerSorteoPorId(id) {
        try {
            const sorteo = await Sorteo.findOne({
                where: {
                    id: id
                },
                include: [{
                    model: Premio,
                    as: 'Premios'
                },
                {
                    model: OrganizadorSorteo,
                    as: 'OrganizadorSorteos',
                    include: [{
                        model: Organizador,
                        as: 'Organizador',
                        include: [{
                            model: Usuario,
                            as: 'Usuario'
                        }]
                    }]
                },
                {
                    model: Configuracion,
                    as: 'Configuracion'
                }]
            });

            return sorteo;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async obtenerSorteoPorTitulo(titulo) {
        try {
            const sorteo = await Sorteo.findOne({
                where: {
                    titulo: {
                        [Op.eq]: titulo
                    }
                },
                include: [{
                    model: Premio,
                    as: 'Premios'
                },
                {
                    model: OrganizadorSorteo,
                    as: 'OrganizadorSorteos',
                    include: [{
                        model: Organizador,
                        as: 'Organizador',
                        include: [{
                            model: Usuario,
                            as: 'Usuario'
                        }]
                    }]
                },
                {
                    model: Configuracion,
                    as: 'Configuracion'
                }]
            });

            return sorteo;
        } catch (error) {
            throw error;
        }
    }

    async obtenerSorteosPorOrganizador(idOrganizador) {
        try {
            const sorteos = await Sorteo.findAll({
                include: [{
                    model: OrganizadorSorteo,
                    required: true,
                    where: {
                        id_organizador: {
                            [Op.eq]: idOrganizador
                        }
                    }
                },
                {
                    model: Premio,
                    as: 'Premios'
                },
                {
                    model: OrganizadorSorteo,
                    include: [{
                        model: Organizador,
                        as: 'Organizador',
                        include: [{
                            model: Usuario,
                            as: 'Usuario'
                        }]
                    }]
                },
                {
                    model: Configuracion,
                    as: 'Configuracion'
                }]
            });

            return sorteos;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async obtenerSorteosActivos() {
        try {
            const fechaActual = new Date();
            const sorteos = await Sorteo.findAll({
                where: {
                    fecha_realizacion: {
                        [Op.gt]: fechaActual
                    }
                },
                include: [{
                    model: Premio,
                    as: 'Premios'
                },
                {
                    model: OrganizadorSorteo,
                    as: 'OrganizadorSorteos',
                    include: [{
                        model: Organizador,
                        as: 'Organizador',
                        include: [{
                            model: Usuario,
                            as: 'Usuario'
                        }]
                    }]
                },
                {
                    model: Configuracion,
                    as: 'Configuracion'
                }]
            });

            return sorteos;
        } catch (error) {
            throw error;
        }
    }

    async obtenerSorteosFinalizados() {
        try {
            const fechaActual = new Date();
            const sorteos = await Sorteo.findAll({
                where: {
                    fecha_realizacion: {
                        [Op.lte]: fechaActual
                    }
                },
                include: [{
                    model: Premio,
                    as: 'Premios'
                },
                {
                    model: OrganizadorSorteo,
                    as: 'OrganizadorSorteos',
                    include: [{
                        model: Organizador,
                        as: 'Organizador',
                        include: [{
                            model: Usuario,
                            as: 'Usuario'
                        }]
                    }]
                },
                {
                    model: Configuracion,
                    as: 'Configuracion'
                }]
            });

            return sorteos;
        } catch (error) {
            throw error;
        }
    }

    async actualizarSorteo(idSorteo, sorteoData) {
        try {
            const sorteoBuscado = await this.obtenerSorteoPorId(idSorteo);

            if (!sorteoBuscado) {
                throw new Error('El sorteo no existe.');
            }

            const {
                descripcion,
                imagen_url,
                rango_numeros,
                inicio_periodo_venta,
                fin_periodo_venta,
                fecha_realizacion,
                id_configuracion,
                OrganizadorSorteos
            } = sorteoData;

            await OrganizadorSorteo.destroy({
                where: {
                    id_sorteo: idSorteo
                }
            });

            const nuevosRegistros = OrganizadorSorteos.map(organizador => ({
                id_sorteo: idSorteo,
                id_organizador: organizador.id_organizador
            }));

            if (nuevosRegistros.length > 0) {
                await OrganizadorSorteo.bulkCreate(nuevosRegistros);
            }

            await sorteoBuscado.update(sorteoData, { new: true });
            const sorteo = await this.obtenerSorteoPorId(idSorteo);
            return sorteo;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async eliminarSorteo(idSorteo) {
        try {
            const sorteoObtenido = await this.obtenerSorteoPorId(idSorteo);

            if (!sorteoObtenido) {
                throw new Error('El sorteo no existe.');
            }

            await sorteoObtenido.destroy();
            return 'Se eliminó el sorteo correctamente.';
        } catch (error) {
            throw error;
        }
    }

}

module.exports = new SorteosDAO();