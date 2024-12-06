const Unit = require("../Models/UnidadDeMedidaModel");
const updateModel = require("../Utils/ModelsUtils");

/// <summary>
/// Crea una nueva unidad de medida en la base de datos.
/// </summary>
/// <param name="req">La solicitud HTTP que contiene los datos de la unidad.</param>
/// <param name="res">La respuesta HTTP que se enviará al cliente.</param>
/// <returns>Un objeto JSON con el mensaje de éxito y los datos de la unidad creada, o un mensaje de error.</returns>
const CreateUnit = async (req, res) => {
  try {
    const data = req.body;
    const result = await updateModel.createModel(Unit, data);

    if (result.status === 201) {

      res.status(result.status).json({ message: result.message, data: result.data });
    } else {
      res.status(result.status).json({ error: result.message });
    }

  } catch (error) {
    res
      .status(400)
      .json({ error: "Error al crear la unidad de medida: " + error.message });
  }
};

/// <summary>
/// Obtiene todas las unidades de medida disponibles en la base de datos.
/// </summary>
/// <param name="req">La solicitud HTTP.</param>
/// <param name="res">La respuesta HTTP que se enviará al cliente.</param>
/// <returns>Un objeto JSON con un mensaje de éxito y un arreglo de unidades encontradas, o un mensaje de error si falla la búsqueda.</returns>
const GetUnit = async (req, res) => {
  try {
    const tiposDeUnidades = await Unit.findAll({
      attributes: ['nombre_unidad_de_medida', 'id_unidad_de_medida'] // Solo obtener el campo nombre_documento
    });

    res.status(200).json({ mensaje: "unidades encontrados", tiposDeUnidades });
  } catch (error) {
    console.error("Error al obtener los nombres de los unidades:", error);
    res.status(500).json({ error: "Error al obtener los nombres de los documentos: " + error.message });
  }
};

/// <summary>
/// Actualiza una unidad de medida existente en la base de datos.
/// </summary>
/// <param name="req">La solicitud HTTP que contiene los nuevos datos de la unidad de medida.</param>
/// <param name="res">La respuesta HTTP que se enviará al cliente.</param>
/// <returns>Un objeto JSON con un mensaje de éxito y los datos actualizados, o un mensaje de error si falla la actualización.</returns>
const UpdateUnit = async (req, res) => {
  try {
    const { id_unidad_de_medida } = req.params;
    const data = req.body;
    const result = await updateModel.updateModel(Unit, { id_unidad_de_medida: id_unidad_de_medida }, data);
    if (result.status === 200) {
      res.status(result.status).json({ message: result.message, data: result.data });
    } else {
      res.status(result.status).json({ error: result.message });
    }
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error al actualizar la Unidad de Medida" + error.message });
  }
};

/// <summary>
/// Elimina una unidad de medida existente de la base de datos.
/// </summary>
/// <param name="req">La solicitud HTTP que contiene el ID de la unidad de medida a eliminar.</param>
/// <param name="res">La respuesta HTTP que se enviará al cliente.</param>
/// <returns>Un objeto JSON con un mensaje de éxito si la eliminación es exitosa, o un mensaje de error si falla la eliminación.</returns>
const DeleteUnit = async (req, res) => {
  try {
    const { id_unidad_de_medida } = req.params;
    const result = await updateModel.deleteModel(Unit, { id_unidad_de_medida });
    if (result.status === 200) {
      res.status(result.status).json({ message: result.message });
    } else {
      res.status(result.status).json({ error: result.message });
    }
  } catch (err) {
    console.error("Error la unidad de medida:", err);
    res.status(500).json({ message: "Error al eliminar la unidad de medida" });
  }
};

/// <summary>
/// Obtiene el ID de una unidad de medida dado su nombre.
/// </summary>
/// <param name="name">El nombre de la unidad de medida cuyo ID se desea obtener.</param>
/// <returns>El ID de la unidad de medida si se encuentra, o null si no se encuentra.</returns>
const GetUnitIds = async (name) => {
  const data = await Unit.findOne({
    where: { nombre_unidad_de_medida: name },
    attributes: ['id_unidad_de_medida']
  });

  const unitId = data ? data.id_unidad_de_medida : null;

  return unitId;
}

module.exports = {
  CreateUnit,
  UpdateUnit,
  DeleteUnit,
  GetUnit,
  GetUnitIds
};