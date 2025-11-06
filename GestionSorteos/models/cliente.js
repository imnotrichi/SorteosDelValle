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
      Cliente.belongsTo(models.Usuario, { foreignKey: "id_usuario" });
    }
  }
  Cliente.init({
    id_usuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    }

  }, {
    sequelize,
    modelName: 'Cliente',
    tableName: 'Clientes'
  });
  return Cliente;
};