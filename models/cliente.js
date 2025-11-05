'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Cliente extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Cliente.belongsTo(models.Usuario,{foreignKey:"id"});
    }
  }
  Cliente.init({
  }, {
    sequelize,
    modelName: 'Cliente',
    tableName: 'Clientes'
  });
  return Cliente;
};