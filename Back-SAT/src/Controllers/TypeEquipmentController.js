const TypeEquipment = require("../Models/TypeEquimentModel");
const updateModel = require("../Utils/ModelsUtils");
const { getPool } = require('../Config/dbPool');
/// <summary>
/// Crea un nuevo tipo de equipo utilizando la información proporcionada.
/// </summary>
/// <param name="req">La solicitud HTTP, que incluye el cuerpo con los datos del nuevo equipo.</param>
/// <param name="res">La respuesta HTTP que se enviará al cliente.</param>
/// <returns>Un objeto JSON con un mensaje de éxito y los datos del nuevo equipo, o un error si la creación falla.</returns>
const CreateEquipment = async (req, res) => {
  try {
    const data = req.body;
    const result = await updateModel.createModel(TypeEquipment, data);

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
/// Elimina un tipo de equipo específico basado en su ID.
/// </summary>
/// <param name="req">La solicitud HTTP, que incluye los parámetros.</param>
/// <param name="res">La respuesta HTTP que se enviará al cliente.</param>
/// <returns>Un objeto JSON con un mensaje de éxito o un error si la eliminación falla.</returns>
const DeleteEquipment = async (req, res) => {
  try {
    const { id_tipo_equipo } = req.params;
    const result = await updateModel.deleteModel(TypeEquipment, { id_tipo_equipo });
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
/// Actualiza la información de un tipo de equipo específico.
/// </summary>
/// <param name="req">La solicitud HTTP, que incluye los parámetros y el cuerpo de la solicitud.</param>
/// <param name="res">La respuesta HTTP que se enviará al cliente.</param>
/// <returns>Un objeto JSON con un mensaje y los datos actualizados, o un error si la actualización falla.</returns>
const UpdateEquipment = async (req, res) => {
  try {
    const { id_tipo_equipo } = req.params;
    const data = req.body;
    const result = await updateModel.updateModel(TypeEquipment, { id_tipo_equipo: id_tipo_equipo }, data);
    if (result.status === 200) {
      res.status(result.status).json({ message: result.message, data: result.data });
    } else {
      res.status(result.status).json({ error: result.message });
    }
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error al actualizar el tipo de equipo" + error.message });
  }
};

/// <summary>
/// Obtiene los tipos de equipo disponibles y devuelve sus nombres.
/// </summary>
/// <param name="req">La solicitud HTTP.</param>
/// <param name="res">La respuesta HTTP.</param>
/// <returns>Un objeto JSON con un mensaje y un array de tipos de equipo.</returns>
const GetEquipmentsTypes = async (req, res) => {

  syncTiposDeEquipo();
  try {
    const tiposDeEquipo = await TypeEquipment.findAll({
      attributes: ['id_tipo_equipo', 'nombre_tipo_equipo']
    });

    res.status(200).json({ mensaje: "Documentos encontrados", tiposDeEquipo });
  } catch (error) {
    console.error("Error al obtener los nombres de los documentos:", error);
    res.status(500).json({ error: "Error al obtener los nombres de los documentos: " + error.message });
  }
};
/// <summary>
/// Obtiene los IDs y nombres de los tipos de equipos disponibles.
/// </summary>
/// <returns>Un array de objetos que contienen el id_tipo_equipo y nombre_tipo_equipo.</returns>
const GetTypeEquipmentNamesIds = async () => {

  syncTiposDeEquipo();

  try {
    const equipment = await TypeEquipment.findAll({
      attributes: ['id_tipo_equipo', 'nombre_tipo_equipo']
    });

    if (!equipment || equipment.length === 0) {
      throw new Error('No se encontraron tipos de equipos.');
    }

    const equipmentResult = equipment.map(equipo => ({
      id_tipo_equipo: equipo.id_tipo_equipo,
      nombre_tipo_equipo: equipo.nombre_tipo_equipo.trim()
    }));

    return equipmentResult;
  } catch (error) {
    console.error('Error al obtener los tipos de equipos:', error.message);

    if (error instanceof SomeDatabaseError) {
      throw new Error('Error de base de datos: ' + error.message);
    } else if (error.message === 'No se encontraron tipos de equipos.') {
      throw new Error('No se encontraron tipos de equipos disponibles.');
    } else {
      throw new Error('Error interno al obtener los tipos de equipos. Intente de nuevo más tarde.');
    }
  }
};

async function syncTiposDeEquipo() {
  try {
    const pool = getPool();

    const result = await pool.request().query(`
      SELECT [Esquemas]
      FROM dbo.CZSTA11_DATOS_ADICIONALES_DMD
      WHERE [Esquemas] IS NOT NULL AND LTRIM(RTRIM([Esquemas])) <> ''
    `);

    const tangoTiposDeEquipo = result.recordset;

    for (let tangoTipoEquipo of tangoTiposDeEquipo) {
      await TypeEquipment.upsert({
        nombre_tipo_equipo: tangoTipoEquipo['Esquemas'],
      });
    }
  } catch (error) {
    console.error('Error sincronizando datos:', error);
  }
}



module.exports = {
  GetEquipmentsTypes,
  GetTypeEquipmentNamesIds,
  CreateEquipment,
  DeleteEquipment,
  UpdateEquipment
};