'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Numeros', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      numero: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      estado: {
        type: Sequelize.STRING
      },
      id_sorteo: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Sorteos',
          key: 'id'
        },
        allowNull: false,
      },
      id_cliente: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Clientes',
          key: 'id_usuario'
        },
        allowNull: false,
      },
      id_pago: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Pagos',
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

    /**
     * Evita que se inserte un número repetido dentro del mismo sorteo.
     * Equivalentemente: UN número SOLO puede existir UNA VEZ por sorteo.
     */
    await queryInterface.addConstraint("Numeros", {
      fields: ["numero", "id_sorteo"],
      type: "unique",
      name: "unique_numero_por_sorteo"
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Numeros');
  }
};