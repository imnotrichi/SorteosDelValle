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
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      descripcion: {
        type: Sequelize.STRING,
        allowNull: false
      },
      imagen_url: {
        type: Sequelize.STRING,
        allowNull: false
      },
      rango_numeros: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      inicio_periodo_venta: {
        type: Sequelize.DATE,
        allowNull: false
      },
      fin_periodo_venta: {
        type: Sequelize.DATE,
        allowNull: false
      },
      fecha_realizacion: {
        type: Sequelize.DATE,
        allowNull: false
      },
      precio_numero: {
        type: Sequelize.DECIMAL,
        allowNull: false
      },
      id_configuracion: {
        type: Sequelize.INTEGER,
        references: { 
          model: 'Configuraciones',
          key: 'id'
        },
        allowNull: false,
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