'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrganizadorSorteo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      OrganizadorSorteo.belongsTo(models.Organizador, {
        foreignKey: 'id_organizador',
        targetKey: 'id_usuario'
      });

      OrganizadorSorteo.belongsTo(models.Sorteo, {
        foreignKey: 'id_sorteo',
        targetKey: 'id'
      });
    }
  }
  OrganizadorSorteo.init({
    id_organizador: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },

    id_sorteo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    }
  }, {
    sequelize,
    modelName: 'OrganizadorSorteo',
    tableName: 'OrganizadoresSorteos'
  });
  return OrganizadorSorteo;
};