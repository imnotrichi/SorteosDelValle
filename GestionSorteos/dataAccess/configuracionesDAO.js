const { Configuracion } = require('../models');
const { Op } = require('sequelize');

class ConfiguracionesDAO {

    constructor() { }

    async crearConfiguracion(configuracionData) {
        try {
            const {
                global,
                tiempo_limite_apartado,
                tiempo_recordatorio_pago
            } = configuracionData;

            let configuracionCreada;
            if (global) {
                configuracionCreada = await Configuracion.create(configuracionData);
            } else {
                configuracionCreada = await Configuracion.create(configuracionData);
            }

            return configuracionCreada;
        } catch (error) {
            throw error;
        }
    }

    async obtenerConfiguracionGlobal() {
        try {
            const configuracion = await Configuracion.findByPk(process.env.CONFIG_GLOBAL);

            return configuracion;
        } catch (error) {

        }
    }

    async obtenerConfiguracionGlobalOrganizador(idOrganizador) {
        try {
            if (!idOrganizador) {
                throw new Error('Se debe proporcionar el id del organizador para la búsqueda.');
            }

            const configuracion = await Configuracion.findOne({
                where: {
                    id_organizador: {
                        [Op.eq]: idOrganizador
                    }
                }
            });

            return configuracion;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new ConfiguracionesDAO();