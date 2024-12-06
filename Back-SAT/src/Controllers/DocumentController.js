const Document = require("../Models/DocumentModel");
const updateModel = require("../Utils/ModelsUtils");

/// <summary>
/// Crea un nuevo documento utilizando la información proporcionada.
/// </summary>
/// <param name="req">La solicitud HTTP, que incluye el cuerpo con los datos del nuevo documento.</param>
/// <param name="res">La respuesta HTTP que se enviará al cliente.</param>
/// <returns>Un objeto JSON con un mensaje de éxito y los datos del nuevo documento, o un error si la creación falla.</returns>
const CreateDocument = async (req, res) => {
  try {
    const data = req.body;
    const result = await updateModel.createModel(Document, data);

    if (result.status === 201) {

      res.status(result.status).json({ message: result.message, data: result.data });
    } else {
      res.status(result.status).json({ error: result.message });
    }

  } catch (error) {
    res
      .status(400)
      .json({ error: "Error al crear el equipo: " + error.message });
  }
};

/// <summary>
/// Elimina un documento específico basado en su ID.
/// </summary>
/// <param name="req">La solicitud HTTP, que incluye los parámetros con el ID del documento.</param>
/// <param name="res">La respuesta HTTP que se enviará al cliente.</param>
/// <returns>Un objeto JSON con un mensaje de éxito o un error si la eliminación falla.</returns>
const DeleteDocument = async (req, res) => {
  try {
    const { id_documento } = req.params;
    const result = await updateModel.deleteModel(Document, { id_documento });
    if (result.status === 200) {
      res.status(result.status).json({ message: result.message });
    } else {
      res.status(result.status).json({ error: result.message });
    }
  } catch (err) {
    console.error("Error el tipo de equipo:", err);
    res.status(500).json({ message: "Error al eliminar el tipo de equipo" });
  }
};

/// <summary>
/// Actualiza la información de un documento específico basado en su ID.
/// </summary>
/// <param name="req">La solicitud HTTP, que incluye los parámetros y el cuerpo con los datos actualizados.</param>
/// <param name="res">La respuesta HTTP que se enviará al cliente.</param>
/// <returns>Un objeto JSON con un mensaje de éxito y los datos actualizados, o un error si la actualización falla.</returns>
const UpdateDocument = async (req, res) => {
  try {
    const { id_documento } = req.params;
    const data = req.body;
    const result = await updateModel.updateModel(Document, { id_documento: id_documento }, data);
    if (result.status === 200) {
      res.status(result.status).json({ message: result.message, data: result.data });
    } else {
      res.status(result.status).json({ error: result.message });
    }
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error al actualizar el tipo de servicio" + error.message });
  }
};

/// <summary>
/// Función asíncrona para obtener los nombres de los documentos desde la base de datos.
/// </summary>
/// <param name="req">Objeto de solicitud que contiene información sobre la solicitud HTTP.</param>
/// <param name="res">Objeto de respuesta que permite enviar una respuesta al cliente.</param>
/// <returns>Un objeto JSON con un mensaje y una lista de documentos, o un mensaje de error.</returns>
const GetDocumentsNames = async (req, res) => {
  try {
    const documentos = await Document.findAll({
      attributes: ['nombre_documento', 'id_documento']
    });

    if (!documentos || documentos.length === 0) {
      return res.status(404).json({ error: "No se encontraron documentos." });
    }

    res.status(200).json({ mensaje: "Documentos encontrados", documentos });
  } catch (error) {
    console.error("Error al obtener los nombres de los documentos:", error);

    if (error.name === 'SequelizeDatabaseError') {
      res.status(500).json({ error: "Error de base de datos: " + error.message });
    } else if (error.name === 'SequelizeValidationError') {
      res.status(422).json({ error: "Error de validación: " + error.message });
    } else {
      res.status(500).json({ error: "Error inesperado: " + error.message });
    }
  }
};

/// <summary>
/// Función asíncrona para obtener los IDs y nombres de los documentos desde la base de datos.
/// </summary>
/// <returns>Una lista de objetos con los IDs y nombres de los documentos, o lanza un error si no se encuentran.</returns>
const GetDocumentsNamesIds = async () => {
  try {

    const documentos = await Document.findAll({
      attributes: ['id_documento', 'nombre_documento']
    });


    if (!documentos || documentos.length === 0) {
      throw new Error('No se encontraron tipos de documentos.');
    }

    const documentsResult = documentos.map(doc => ({
      id_documento: doc.id_documento,
      nombre_documento: doc.nombre_documento.trim()
    }));

    return documentsResult;
  } catch (error) {

    console.error('Error al obtener los tipos de documentos:', error.message);

    if (error instanceof SomeDatabaseError) {
      throw new Error('Error de base de datos: ' + error.message);
    } else if (error.message === 'No se encontraron tipos de documentos.') {
      throw new Error('No se encontraron tipos de documentos disponibles.');
    } else {
      throw new Error('Error interno al obtener los tipos de documentos. Intente de nuevo más tarde.');
    }
  }
};

module.exports = {
  GetDocumentsNames,
  GetDocumentsNamesIds,
  CreateDocument,
  DeleteDocument,
  UpdateDocument
};