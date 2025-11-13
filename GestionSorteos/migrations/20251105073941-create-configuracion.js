'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Configuraciones', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tiempo_limite_apartado: {
        type: Sequelize.TIME,
        allowNull: false
      },
      tiempo_recordatorio_pago: {
        type: Sequelize.TIME,
        allowNull: false
      },
      id_organizador: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Organizadores',
          key: 'id_usuario'
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
    await queryInterface.dropTable('Configuraciones');
  }
};