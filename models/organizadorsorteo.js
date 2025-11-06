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
      OrganizadorSorteo.belongsTo(models.Sorteo, {
        foreignKey: 'id_sorteo'
      });
      OrganizadorSorteo.belongsTo(models.Organizador, {
        foreignKey: 'id_organizador'
      });
    }
  }
  OrganizadorSorteo.init({
    id_organizador: DataTypes.INTEGER,
    id_sorteo: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'OrganizadorSorteo',
    tableName: 'OrganizadoresSorteos'
  });
  return OrganizadorSorteo;
};