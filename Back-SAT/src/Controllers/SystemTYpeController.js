const TypeSystem = require("../Models/SystemTypeModel");
const updateModel = require("../Utils/ModelsUtils");

/// <summary>
/// Crea un nuevo tipo de sistema en la base de datos utilizando los datos proporcionados en la solicitud.
/// </summary>
/// <param name="req">La solicitud del cliente, que debe incluir los datos del nuevo tipo de sistema en el cuerpo.</param>
/// <param name="res">La respuesta que se enviará al cliente.</param>
/// <returns>Un objeto JSON que indica el éxito de la creación o un mensaje de error si ocurre un problema.</returns>
const CreateSystem = async (req, res) => {
  try {
    const data = req.body;
    const result = await updateModel.createModel(TypeSystem, data);

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
      .json({ error: "Error al crear el tipo de sistema: " + error.message });
  }
};

/// <summary>
/// Actualiza un tipo de sistema existente en la base de datos utilizando el ID proporcionado y los nuevos datos.
/// </summary>
/// <param name="req">La solicitud del cliente, que debe incluir el ID del tipo de sistema en los parámetros de la URL y los nuevos datos en el cuerpo.</param>
/// <param name="res">La respuesta que se enviará al cliente.</param>
/// <returns>Un objeto JSON que indica el éxito de la actualización o un mensaje de error si ocurre un problema.</returns>
const UpdateSystem = async (req, res) => {
  try {
    const { id_tipo_de_sistema } = req.params;
    const data = req.body;
    const result = await updateModel.updateModel(TypeSystem, { id_tipo_de_sistema: id_tipo_de_sistema }, data);
    if (result.status === 200) {
      res.status(result.status).json({ message: result.message, data: result.data });
    } else {
      res.status(result.status).json({ error: result.message });
    }
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error al eliminar el tipo de sistema" + error.message });
  }
};

/// <summary>
/// Elimina un tipo de sistema de la base de datos utilizando el ID proporcionado.
/// </summary>
/// <param name="req">La solicitud del cliente, que debe incluir el ID del tipo de sistema en los parámetros de la URL.</param>
/// <param name="res">La respuesta que se enviará al cliente.</param>
/// <returns>Un objeto JSON que indica el éxito de la eliminación o un mensaje de error si ocurre un problema.</returns>
const DeleteSystem = async (req, res) => {
  try {
    const { id_tipo_de_sistema } = req.params;
    const result = await updateModel.deleteModel(TypeSystem, { id_tipo_de_sistema });

    if (result.status === 200) {
      res.status(result.status).json({ message: result.message });
    } else {
      res.status(result.status).json({ error: result.message });
    }
  } catch (err) {
    console.error("Error al eliminar el tipo de sistema:", err);
    res.status(500).json({ message: "Error al eliminar el tipo de sistema" });
  }
};

/// <summary>
/// Obtiene todos los tipos de sistema de la base de datos.
/// </summary>
/// <param name="req">La solicitud del cliente.</param>
/// <param name="res">La respuesta que se enviará al cliente.</param>
/// <returns>Un objeto JSON que contiene una lista de tipos de sistema o un mensaje de error si ocurre un problema.</returns>
const GetSystemTypes = async (req, res) => {
  try {
    const tiposDeSistema = await TypeSystem.findAll({
      attributes: ['nombre_tipo_de_sistema', 'id_tipo_de_sistema'] // Solo obtener el campo nombre_documento
    });

    res.status(200).json({ mensaje: "sistemas encontrados", tiposDeSistema });
  } catch (error) {
    console.error("Error al obtener los nombres de los sistemas:", error);
    res.status(500).json({ error: "Error al obtener los nombres de los documentos: " + error.message });
  }
};

/// <summary>
/// Obtiene el ID de un tipo de sistema basado en su nombre.
/// </summary>
/// <param name="name">El nombre del tipo de sistema para buscar.</param>
/// <returns>El ID del tipo de sistema si se encuentra, o null si no se encuentra.</returns>
const GetSystemTypesIds = async (name) => {
  const data = await TypeSystem.findOne({
    where: { nombre_tipo_de_sistema: name },
    attributes: ['id_tipo_de_sistema']
  });

  const systemId = data ? data.id_tipo_de_sistema : null;
  return systemId;
}

module.exports = {
  CreateSystem,
  UpdateSystem,
  DeleteSystem,
  GetSystemTypes,
  GetSystemTypesIds
};