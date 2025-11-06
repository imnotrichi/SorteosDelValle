'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Sorteos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      titulo: {
        type: Sequelize.STRING
      },
      descripcion: {
        type: Sequelize.STRING
      },
      imagen_sorte_url: {
        type: Sequelize.STRING
      },
      rango_numeros: {
        type: Sequelize.INTEGER
      },
      inicio_periodo_venta: {
        type: Sequelize.DATE
      },
      fin_periodo_venta: {
        type: Sequelize.DATE
      },
      fecha_realizacion: {
        type: Sequelize.DATE
      },
      precio_numero: {
        type: Sequelize.DECIMAL
      },
      id_configuracion: {
        type: Sequelize.INTEGER,
        references: { 
          model: 'Configuraciones',
          key: 'id'
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Sorteos');
  }
};