'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pago extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Pago.hasOne(models.PagoConComprobante, {foreignKey: 'id_pago'});
      Pago.hasOne(models.PagoEnLinea,{foreignKey: 'id_pago'});
    }
  }
  Pago.init({
    monto_total: DataTypes.DECIMAL,
    fecha: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Pago',
    tableName: 'Pagos'
  });
  return Pago;
};