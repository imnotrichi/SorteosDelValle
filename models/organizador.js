'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Organizador extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Organizador.belongsTo(models.Usuario, {foreignKey: 'id'});
    }
  }
  Organizador.init({

  }, {
    sequelize,
    modelName: 'Organizador',
    tableName: 'Organizadores'
  });
  return Organizador;
};