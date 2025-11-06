'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Premio extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Premio.belongsTo(models.Sorteo, {foreignKey: 'id_sorteo'});
    }
  }
  Premio.init({
    titulo: DataTypes.STRING,
    imagen_premio_url: DataTypes.STRING,
    id_sorteo: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Premio',
  });
  return Premio;
};