const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbconfig.js');
const documento = require('../Models/DocumentModel.js');

// Define el modelo Usuario
const DocumentFetch = sequelize.define('documentFetch', {
  // Define los atributos del modelo
  id_documentoFetch: {
    type: DataTypes.INTEGER,
    primaryKey:true,
    autoIncrement:true,
    allowNull:false,
  },
  id_documento:{
    type:DataTypes.INTEGER,
    allowNull:false,
    references:{
      model:documento,
      key:'id_documento'
    }
  },
  cod_comp: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      // Valida que el valor sea una cadena de texto
      esString(value) {
        if (typeof value !== 'string') {
          throw new Error('El campo titulo debe ser una cadena de texto.');
        }
      }
    }
  },
  fecha: {
    type: DataTypes.DATE, // Usar DATEONLY para almacenar solo fechas
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  schema: 'parametros',
  tableName: 'documentFetch', // Asegúrate de que este nombre coincida con el de tu tabla en la base de datos
  timestamps: false // Cambia esto si estás usando timestamps
});

DocumentFetch.belongsTo(documento, {
  foreignKey: 'id_documento', // Clave foránea en DocumentFetch
  targetKey: 'id_documento',   // Clave primaria en Documento
});
module.exports = DocumentFetch;
