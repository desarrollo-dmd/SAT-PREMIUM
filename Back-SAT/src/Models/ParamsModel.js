const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbconfig.js');
const Etapa_parametro = require('../Models/ParamsStagesModel.js');
const Unidad_de_medida = require('../Models/UnidadDeMedidaModel.js');
const Tipo_de_sistema = require('../Models/SystemTypeModel.js');

const Parametros = sequelize.define('parametro', {
  id_parametro: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  id_parametro_tango: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  nombre_parametro: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,
    validate: {
      notEmpty: {
        msg: 'El campo nombre_parametro no puede estar vacío.'
      },
      len: {
        args: [1, 255],
        msg: 'El campo nombre_parametro debe tener entre 1 y 255 caracteres.'
      }
    }
  },
  sistema_parametro: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  tipo_dato: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      esString(value) {
        if (typeof value !== 'string') {
          throw new Error('El campo tipo_dato debe ser una cadena de texto.');
        }
      }
    }
  },
  unidad_medida: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  etapa: {
    type: DataTypes.INTEGER,
    allowNull: true

  },
  OrdenNumero: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
  }
},
  {
    schema: 'parametros',   // Mover 'schema' y 'tableName' a las opciones del modelo
    tableName: 'parametro',
    timestamps: false       // Desactiva los campos 'createdAt' y 'updatedAt'
  });

// Método personalizado para buscar por ID
Parametros.buscarPorIdParametro = async function (id_parametro) {
  try {
    const result = await this.findOne({
      where: { id_parametro },
      // Optionally include associated models here
      // include: [{ model: RelatedModel }]
    });

    if (!result) {
      throw new Error(`Parámetro con ID ${id_parametro} no encontrado.`);
    }

    return result;
  } catch (error) {
    // Puedes manejar el error aquí (ej. registrar el error, lanzar una excepción específica, etc.)
    throw new Error(`Error al buscar el parámetro: ${error.message}`);
  }
};

// Método para actualizar la información del Parametro
Parametros.prototype.actualizarDatos = async function (datosActualizados) {
  const { id_parametro, ...restData } = datosActualizados; // No actualizar el 'id_parametro'
  this.set(restData); // Establecer nuevos datos
  await this.save();  // Guardar los cambios
};

Parametros.belongsTo(Etapa_parametro, {
  foreignKey: 'etapa', // Este es el campo en ParamsModel que contiene la referencia
  targetKey: 'id_etapa_de_parametro' // Este es el campo en Etapa_parametro que se está referenciando
});


Parametros.belongsTo(Unidad_de_medida, {
  foreignKey: 'unidad_medida', // Este es el campo en ParamsModel que contiene la referencia
  targetKey: 'id_unidad_de_medida' // Este es el campo en Etapa_parametro que se está referenciando
});

Parametros.belongsTo(Tipo_de_sistema, {
  foreignKey: 'sistema_parametro', // Este es el campo en Param que contiene la referencia
  targetKey: 'id_tipo_de_sistema' // Este es el campo en Tipo_de_sistema que se está referenciando
});



module.exports = Parametros;