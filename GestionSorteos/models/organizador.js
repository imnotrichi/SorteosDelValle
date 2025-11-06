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
      Organizador.belongsTo(models.Usuario, { foreignKey: 'id_usuario' });
      Organizador.hasMany(models.OrganizadorSorteo, {
        foreignKey: 'id_organizador'
      });
      Organizador.belongsToMany(models.Sorteo, {
        through: models.OrganizadorSorteo,
        foreignKey: 'id_organizador'
      });
    }
  }
  Organizador.init({
    id_usuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Organizador',
    tableName: 'Organizadores'
  });
  return Organizador;
};