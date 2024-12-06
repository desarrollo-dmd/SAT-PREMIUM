const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbconfig.js');

const Tipoequipo_Documento_Parametro = sequelize.define('tipoequipo_documento_parametro', {
  // Define los atributos del modelo
  id_tipo_equipo_documento_parametro: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    esEntero(value) {
      if (!Number.isInteger(value)) {
        throw new Error('El campo id_tipo_equipo_documento_parametro debe ser un entero.');
      }
    },
  },
  id_tipo_equipo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    esEntero(value) {
      if (!Number.isInteger(value)) {
        throw new Error('El campo id_tipo_equipo debe ser un entero.');
      }
    }
  },
  id_documento: {
    type: DataTypes.INTEGER,
    allowNull: false,
    esEntero(value) {
      if (!Number.isInteger(value)) {
        throw new Error('El campo id_documento debe ser un entero.');
      }
    }
  },
  id_parametro: {
    type: DataTypes.INTEGER,
    allowNull: false,
    esEntero(value) {
      if (!Number.isInteger(value)) {
        throw new Error('El campo id_parametro debe ser un entero.');
      }
    }
  },
}, {
  schema: 'parametros',
  tableName: 'tipoequipo_documento_parametro', // Asegúrate de que este nombre coincida con el de tu tabla en la base de datos
  timestamps: false, // Cambia esto si estás usando timestamps
  indexes: [
    {
      unique: true,  // Esto indica que el índice debe ser único
      fields: ['id_tipo_equipo', 'id_documento', 'id_parametro'],
      name: 'tipoequipo_documento_parametro_unique_index'
      
       // Definimos las columnas que deben ser únicas
    }
  ]
});

Tipoequipo_Documento_Parametro.associate = (models) => {
  Tipoequipo_Documento_Parametro.belongsTo(models.TipoEquipo, { foreignKey: 'id_tipo_equipo' });
  Tipoequipo_Documento_Parametro.belongsTo(models.Documento, { foreignKey: 'id_documento' });
  Tipoequipo_Documento_Parametro.belongsTo(models.Parametro, { foreignKey: 'id_parametro' });
};

module.exports = Tipoequipo_Documento_Parametro;

