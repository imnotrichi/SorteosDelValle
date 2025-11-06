'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Numero extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Numero.init({
    numero: DataTypes.INTEGER,
    estado: DataTypes.STRING,
    id_sorteo: DataTypes.INTEGER,
    id_cliente: DataTypes.INTEGER,
    id_cliente: DataTypes.INTEGER,
    id_pago: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Numero',
  });
  return Numero;
};