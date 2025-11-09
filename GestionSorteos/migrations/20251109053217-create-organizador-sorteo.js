'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('OrganizadoresSorteos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_organizador: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references:{
          model: 'Organizadores',
          key: 'id_usuario'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      id_sorteo: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references:{
          model: 'Sorteos',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
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
    await queryInterface.dropTable('OrganizadoresSorteos');
  }
};