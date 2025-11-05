'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Configuracion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Configuracion.init({
    tiempo_limite_apartado: DataTypes.DATE,
    tiempo_recordatorio_pago: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Configuracion',
    tableName: 'Configuraciones'
  });
  return Configuracion;
};