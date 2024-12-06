const StageParams = require("../Models/ParamsStagesModel");
const updateModel = require("../Utils/ModelsUtils");

/// <summary>
/// Crea una nueva etapa de parámetro en la base de datos utilizando los datos proporcionados en la solicitud.
/// </summary>
/// <param name="req">La solicitud del cliente, que debe incluir los datos de la nueva etapa en el cuerpo.</param>
/// <param name="res">La respuesta que se enviará al cliente.</param>
/// <returns>Un objeto JSON que indica el éxito de la creación o un mensaje de error si ocurre un problema.</returns>
const CreateParamStage = async (req, res) => {
  try {
    const data = req.body;

    const result = await updateModel.createModel(StageParams, data);

    if (result.status === 201) {
      res
        .status(result.status)
        .json({ message: result.message, data: result.data });
    } else {
      res.status(result.status).json({ error: result.message });
    }

  } catch (error) {
    res
      .status(400)
      .json({ error: "Error al crear la etapa del parametro: " + error.message });
  }
};

/// <summary>
/// Actualiza una etapa de parámetro existente en la base de datos utilizando el ID proporcionado y los nuevos datos.
/// </summary>
/// <param name="req">La solicitud del cliente, que debe incluir el ID de la etapa en los parámetros de la URL y los nuevos datos en el cuerpo.</param>
/// <param name="res">La respuesta que se enviará al cliente.</param>
/// <returns>Un objeto JSON que indica el éxito de la actualización o un mensaje de error si ocurre un problema.</returns>
const UpdateParamStage = async (req, res) => {
  try {
    const { id_etapa_de_parametro } = req.params;
    const data = req.body;

    const result = await updateModel.updateModel(StageParams, { id_etapa_de_parametro: id_etapa_de_parametro }, data);
    if (result.status === 200) {
      res.status(result.status).json({ message: result.message, data: result.data });
    } else {
      res.status(result.status).json({ error: result.message });
    }
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error al actualizar la etapa del parametro: " + error.message });
  }
};

/// <summary>
/// Elimina una etapa de parámetro de la base de datos utilizando el ID proporcionado.
/// </summary>
/// <param name="req">La solicitud del cliente, que debe incluir el ID de la etapa en los parámetros de la URL.</param>
/// <param name="res">La respuesta que se enviará al cliente.</param>
/// <returns>Un objeto JSON que indica el éxito de la eliminación o un mensaje de error si ocurre un problema.</returns>
const DeleteParamStage = async (req, res) => {
  try {
    const { id_etapa_de_parametro } = req.params;

    const result = await updateModel.deleteModel(StageParams, { id_etapa_de_parametro });
    if (result.status === 200) {
      res.status(result.status).json({ message: result.message });
    } else {
      res.status(result.status).json({ error: result.message });
    }
  } catch (err) {
    console.error("Error al eliminar la etapa del parametro:", err);
    res.status(500).json({ message: "Error al eliminar la etapa del parametro" });
  }
};

/// <summary>
/// Obtiene todas las etapas de parámetro de la base de datos.
/// </summary>
/// <param name="req">La solicitud del cliente.</param>
/// <param name="res">La respuesta que se enviará al cliente.</param>
/// <returns>Un objeto JSON que contiene las etapas de parámetro encontradas o un mensaje de error si ocurre un problema.</returns>
const GetParamStage = async (req, res) => {
  try {
    const tiposDeEstadosDeParametro = await StageParams.findAll({
      attributes: ['nombre_etapa_de_parametro', 'id_etapa_de_parametro'] // Solo obtener el campo nombre_documento
    });
    res.status(200).json({ mensaje: "sistemas encontrados", tiposDeEstadosDeParametro });
  } catch (error) {
    console.error("Error al obtener los nombres de los sistemas:", error);
    res.status(500).json({ error: "Error al obtener los nombres de los documentos: " + error.message });
  }
};

/// <summary>
/// Obtiene el ID de una etapa de parámetro a partir de su nombre.
/// </summary>
/// <param name="name">El nombre de la etapa de parámetro cuyo ID se desea obtener.</param>
/// <returns>El ID de la etapa de parámetro si se encuentra, o null si no se encuentra.</returns>
const GetStagesIds = async (name) => {
  const data = await StageParams.findOne({
    where: { nombre_etapa_de_parametro: name },
    attributes: ['id_etapa_de_parametro']
  });

  const stageId = data ? data.id_etapa_de_parametro : null;

  return stageId;
}


module.exports = {
  CreateParamStage,
  UpdateParamStage,
  DeleteParamStage,
  GetParamStage,
  GetStagesIds

};