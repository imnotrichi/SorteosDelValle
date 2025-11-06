'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PagoEnLinea extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      PagoEnLinea.belongsTo(models.Pago,{foreignKey:'id_pago'});
    }
  }
  PagoEnLinea.init({
    id_pago: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    }
    
  }, {
    sequelize,
    modelName: 'PagoEnLinea',
    tableName: 'PagosEnLinea'
  });
  return PagoEnLinea;
};