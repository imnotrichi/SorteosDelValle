'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Sorteo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    static associate(models) {
      // define association here
      Sorteo.belongsToMany(models.Organizador, {
        through: models.OrganizadorSorteo,
        foreignKey: 'id_sorteo',
        otherKey: 'id_organizador'
      });

      Sorteo.hasMany(models.OrganizadorSorteo, { foreignKey: 'id_sorteo' });
      Sorteo.belongsTo(models.Configuracion, { foreignKey: 'id_configuracion' });
      Sorteo.hasMany(models.Premio, { foreignKey: 'id_sorteo' })
    }
  }
  Sorteo.init({
    titulo: DataTypes.STRING,
    descripcion: DataTypes.STRING,
    imagen_url: DataTypes.STRING,
    rango_numeros: DataTypes.INTEGER,
    inicio_periodo_venta: DataTypes.DATE,
    fin_periodo_venta: DataTypes.DATE,
    fecha_realizacion: DataTypes.DATE,
    precio_numero: DataTypes.DECIMAL,
    id_configuracion: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Sorteo',
    tableName: 'Sorteos'
  });
  return Sorteo;
};