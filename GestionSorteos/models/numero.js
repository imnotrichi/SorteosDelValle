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
      Numero.belongsTo(models.Sorteo, { foreignKey: 'id_sorteo' });
      Numero.belongsTo(models.Pago, { foreignKey: 'id_pago' });
      Numero.belongsTo(models.Cliente, { foreignKey: 'id_cliente' });
    }
  }
  Numero.init({
    numero: DataTypes.INTEGER,
    estado: DataTypes.STRING,
    id_sorteo: DataTypes.INTEGER,
    id_cliente: DataTypes.INTEGER,
    id_pago: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Numero',
    /**
     * Declaramos también la restricción aquí por SI Sequelize recrea la tabla.
     * La DB manda, pero esto mantiene coherencia en el modelo.
     */
    indexes: [
      {
        unique: true,
        fields: ["numero", "id_sorteo"],
        name: "unique_numero_por_sorteo"
      }
    ]
  });
  return Numero;
};