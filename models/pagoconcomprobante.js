'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PagoConComprobante extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      PagoConComprobante.belongsTo(models.Pago,{foreignKey:'id_pago'});
    }
  }
  PagoConComprobante.init({
    
    img_comprobante_url: DataTypes.STRING,
    id_pago: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'PagoConComprobante',
    tableName: 'PagosConComprobante'
  });
  return PagoConComprobante;
};