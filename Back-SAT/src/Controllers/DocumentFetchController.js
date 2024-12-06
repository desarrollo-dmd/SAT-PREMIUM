const DocumentModel = require('../Models/DocumentModel');
const DocumentFetch = require('../Models/DocumentFechModel');
const updateModel = require('../Utils/ModelsUtils');
const { Op } = require('sequelize');

/// <summary>
/// Crea y actualiza relaciones en la base de datos utilizando los datos proporcionados en la solicitud.
/// </summary>
/// <param name="req">La solicitud del cliente, que debe incluir un array de relaciones en el cuerpo.</param>
/// <param name="res">La respuesta que se enviará al cliente.</param>
/// <returns>Un objeto JSON que indica el éxito de la operación, incluyendo un mensaje sobre el estado de las relaciones.</returns>
const CreateRelations = async (req, res) => {
  try {
    const data = req.body;

    // Si no se reciben relaciones, eliminamos todas las relaciones existentes
    if (data.length === 0) {
      await DocumentFetch.destroy({ where: {} });
      return res.status(200).json({ message: 'Todas las relaciones han sido eliminadas.' });
    }

    // Mapeamos los datos recibidos para obtener las relaciones
    const relaciones = await Promise.all(
      data.map(async (rel) => {
        const idServicioLocal = await updateModel.SearchByOne(DocumentModel, 'nombre_documento', rel.ServicioLocal);
        return { id_documento: idServicioLocal.id_documento, cod_comp: rel.ServicioTango };
      })
    );

    // Iteramos sobre las relaciones y las procesamos con upsert
    for (const rel of relaciones) {
      // Usamos upsert para insertar o actualizar la relación
      await DocumentFetch.upsert({
        id_documento: rel.id_documento,
        cod_comp: rel.cod_comp,
        // Si deseas incluir otros campos, agregalos aquí
        fecha: new Date().toISOString() // ejemplo, si se debe actualizar la fecha
      });
    }

    // Obtenemos todos los cod_comp que recibimos y eliminamos las relaciones no enviadas
    const relacionesCods = relaciones.map(rel => rel.cod_comp);
    await DocumentFetch.destroy({
      where: {
        cod_comp: {
          [Op.not]: relacionesCods
        }
      }
    });

    res.status(200).json({ message: 'Relaciones actualizadas correctamente.' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};




/// <summary>
/// Obtiene todas las relaciones almacenadas en la base de datos.
/// </summary>
/// <param name="req">La solicitud del cliente.</param>
/// <param name="res">La respuesta que se enviará al cliente, que incluirá la lista de relaciones.</param>
/// <returns>Un objeto JSON que contiene la lista de relaciones o un mensaje de error si ocurre un problema.</returns>
const GetRelations = async (req, res) => {
  try {
    const relations = await DocumentFetch.findAll();
    res.status(200).json(relations);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/// <summary>
/// Elimina relaciones de la base de datos basándose en el código proporcionado en la consulta.
/// </summary>
/// <param name="req">La solicitud del cliente, que debe incluir el código de la relación a eliminar en la consulta.</param>
/// <param name="res">La respuesta que se enviará al cliente, confirmando la eliminación.</param>
/// <returns>Un objeto JSON que indica el éxito de la eliminación o un mensaje de error si ocurre un problema.</returns>
const DeleteRelations = async (req, res) => {
  try {
    const obj = req.query
    const response = await DocumentFetch.destroy({
      where: {
        cod_comp: obj.obj
      }
    })
    res.status(200).json({ message: 'Eliminado exitosamente' })
  } catch (error) {
    res.status(200).json({ error: error.message })
  }
}

module.exports = {
  CreateRelations,
  DeleteRelations,
  GetRelations
};
