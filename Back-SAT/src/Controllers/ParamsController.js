const Param = require('../Models/ParamsModel');
const TypeSystem = require('../Models/SystemTypeModel');
const Document = require('../Models/DocumentModel.js');
const TypeEquipment = require('../Models/TypeEquimentModel.js');
const TypeDocumentParams = require('../Models/TypeDocumentParamsModel.js');
const StageParam = require('../Models/ParamsStagesModel.js');
const Unit = require('../Models/UnidadDeMedidaModel.js');
const { CreateTypeDocumentParams, DeleteByIdParametro } = require('./TypeDocumentParamsController.js');
const { GetSystemTypesIds } = require('./SystemTYpeController.js');
const { GetUnitIds } = require('./UnidadDeMedidaController.js');
const { GetStagesIds } = require('./ParamsStagesController.js');
const updateModel = require('../Utils/ModelsUtils');
const { getPool } = require('../Config/dbPool');

/// <summary>
/// Actualiza un parámetro existente en la base de datos por su ID.
/// </summary>
/// <param name="req">La solicitud del cliente, que debe incluir el ID del parámetro en los parámetros de la URL y los nuevos datos en el cuerpo.</param>
/// <param name="res">La respuesta que se enviará al cliente.</param>
/// <returns>Un objeto JSON que indica el éxito de la actualización y los datos del parámetro actualizado, o un mensaje de error.</returns>
const UpdateParams = async (req, res) => {
  try {

    const { id_parametro } = req.params;
    const data = req.body;

    if (data[0].tipo_dato !== 'num') {
      data[0].unidad_medida = null;
    }

    const paramLoaded = await Param.buscarPorIdParametro(id_parametro);
    if (!paramLoaded) {
      console.error(`Parameter not found for id_parametro: ${id_parametro}`);
      return res.status(404).json({ error: 'Parameter not found' });
    }

    try {
      data[0].sistema_parametro = await GetSystemTypesIds(data[0].sistema_parametro);
      data[0].unidad_medida = await GetUnitIds(data[0].unidad_medida);
      data[0].etapa = await GetStagesIds(data[0].etapa);
    } catch (error) {
      console.error("Error fetching related IDs:", error.message);
      return res.status(400).json({ error: "Invalid input data for related IDs" });
    }

    await paramLoaded.actualizarDatos(data[0]);

    const updatedParam = await Param.buscarPorIdParametro(id_parametro);

    const deleteResult = await DeleteByIdParametro(id_parametro);
    if (!deleteResult || deleteResult.status !== 200) {
      console.error("Failed to delete existing relationships:", deleteResult?.message || 'Unknown error');
      return res.status(deleteResult?.status || 500).json({ error: deleteResult?.message || 'Failed to delete relationships' });
    }

    const parametros = await GetParamsNamesIds();

    const relationData = await CreateTypeDocumentParams(data, parametros);
    if (!relationData || relationData.status !== 201) {
      console.error("Failed to create new relationships:", relationData?.message || 'Unknown error');
      return res.status(relationData?.status || 500).json({ error: relationData?.message || 'Failed to create relationships' });
    }

    res.status(200).json({ message: 'Update successful', data: updatedParam });
  } catch (error) {
    console.error("Error in UpdateParams function:", error.message);
    console.error("Stack trace:", error.stack);
    res.status(500).json({ error: "An unexpected error occurred: " + error.message });
  }
};

/// <summary>
/// Obtiene la estructura de la tabla de parámetros, incluyendo las columnas y los elementos existentes, junto con sus datos relacionados.
/// </summary>
/// <param name="req">La solicitud del cliente.</param>
/// <param name="res">La respuesta que se enviará al cliente.</param>
/// <returns>Un objeto JSON que contiene un array de columnas y un array de elementos de la tabla de parámetros, con los nombres correspondientes en lugar de los IDs, o un mensaje de error.</returns>
const TableParams = async (req, res) => {
  try {
    syncParametros();
    const columnArray = Object.keys(Param.getAttributes());
    const elementsArray = await Param.findAll();
    const [unidadesMedida, etapas, sistemas] = await Promise.all([
      Unit.findAll(),
      StageParam.findAll(),
      TypeSystem.findAll(),
    ]);
    const unidadMedidaMap = Object.fromEntries(unidadesMedida.map(item => [item.id_unidad_de_medida, item.nombre_unidad_de_medida]));
    const etapaMap = Object.fromEntries(etapas.map(item => [item.id_etapa_de_parametro, item.nombre_etapa_de_parametro]));
    const sistemaMap = Object.fromEntries(sistemas.map(item => [item.id_tipo_de_sistema, item.nombre_tipo_de_sistema]));


    elementsArray.sort((a, b) => a.id_parametro_tango - b.id_parametro_tango);
    const transformedElementsArray = elementsArray.map(element => {
      return {
        ...element.dataValues,
        unidad_medida: unidadMedidaMap[element.unidad_medida] || element.unidad_medida,
        etapa: etapaMap[element.etapa] || element.etapa,
        sistema_parametro: sistemaMap[element.sistema_parametro] || element.sistema_parametro,
      };
    });
    res.status(200).json({ columnArray, elementsArray: transformedElementsArray });
  } catch (error) {
    res.status(400).json({
      error: "Error: " + error.message,
    });
  }
};


/// <summary>
/// Obtiene los IDs y nombres de los parámetros desde la base de datos.
/// </summary>
/// <returns>Un array de objetos que contienen el ID y el nombre de cada parámetro, o lanza un error si no se encuentran parámetros o si ocurre un error interno.</returns>
const GetParamsNamesIds = async () => {
  try {
    const params = await Param.findAll({
      attributes: ['id_parametro', 'nombre_parametro']
    });

    if (!params || params.length === 0) {
      throw new Error('No se encontraron parámetros.');
    }

    const paramsResult = params.map(param => ({
      id_parametro: param.id_parametro,
      nombre_parametro: param.nombre_parametro.trim()
    }));

    return paramsResult;
  } catch (error) {
    console.error('Error al obtener los parámetros:', error.message);

    if (error instanceof SomeDatabaseError) {
      throw new Error('Error de base de datos: ' + error.message);
    } else if (error.message === 'No se encontraron parámetros.') {
      throw new Error('No se encontraron parámetros disponibles.');
    } else {
      throw new Error('Error interno al obtener los parámetros. Intente de nuevo más tarde.');
    }
  }
};

/// <summary>
/// Crea un nuevo parámetro en la base de datos con los datos proporcionados en la solicitud.
/// </summary>
/// <param name="req">La solicitud del cliente, que debe incluir los datos del nuevo parámetro en el cuerpo.</param>
/// <param name="res">La respuesta que se enviará al cliente.</param>
/// <returns>Un objeto JSON que indica el éxito de la creación o un mensaje de error si ocurre un problema.</returns>
const CreateParams = async (req, res) => {
  try {
    // Obtén los datos del cuerpo de la solicitud
    const data = req.body;

    // Verifica si los campos requeridos están presentes en el primer objeto de datos
    if (!data[0].nombre_parametro || !data[0].sistema_parametro || !data[0].tipo_dato || !data[0].etapa) {
      return res.status(400).json({ error: 'Faltan datos requeridos en la solicitud.' });
    }

    const systemId = await GetSystemTypesIds(data[0].sistema_parametro.trim());
    data[0].sistema_parametro = systemId;


    const unitId = await GetUnitIds(data[0].unidad_medida.trim());
    data[0].unidad_medida = unitId;


    const stageId = await GetStagesIds(data[0].etapa.trim());
    data[0].etapa = stageId;

    const existingParam = await Param.findOne({
      where: { nombre_parametro: data[0].nombre_parametro.trim() }
    });

    if (existingParam) {
      return res.status(409).json({ error: 'El parámetro ya existe.' });
    }

    const result = await updateModel.createModel(Param, data[0]);
    const parametros = await GetParamsNamesIds();
    const relationData = await CreateTypeDocumentParams(data, parametros);

    if (result.status !== 200) {
      return res.status(relationData.status).json({ error: relationData.message });
    }

    if (relationData.status !== 200) {
      return res.status(relationData.status).json({ error: relationData.message });
    }

  } catch (error) {
    console.error('Error al crear el parámetro:', error);
    res.status(500).json({ error: 'Error al crear el parámetro: ' + error.message });
  }
};

/// <summary>
/// Elimina un parámetro de la base de datos junto con sus relaciones asociadas.
/// </summary>
/// <param name="req">La solicitud del cliente, que debe incluir el ID del parámetro en los parámetros de la URL.</param>
/// <param name="res">La respuesta que se enviará al cliente.</param>
/// <returns>Un objeto JSON que indica el éxito de la eliminación o un mensaje de error si ocurre un problema.</returns>
const DeleteParams = async (req, res) => {
  try {
    const { id_parametro } = req.params;

    if (!id_parametro) {
      return res.status(400).json({ error: 'El ID del parámetro es requerido.' });
    }

    const deletedRelations = await updateModel.deleteModel(TypeDocumentParams, { id_parametro });

    if (deletedRelations.status === 404) {
      console.warn(`No se encontraron relaciones para el parámetro ID: ${id_parametro}`);
    }

    const deletedParam = await updateModel.deleteModel(Param, { id_parametro });
    if (deletedParam.status === 404) {
      return res.status(404).json({ error: 'No se encontró el parámetro a eliminar.' });
    } else if (deletedParam.status !== 200) {
      return res.status(deletedParam.status).json({ error: deletedParam.message });
    }

    return res.status(200).json({ message: 'Parámetro eliminado exitosamente.' });

  } catch (error) {
    console.error('Error al eliminar el parámetro:', error.message);
    return res.status(500).json({ error: 'Error al eliminar el parámetro: ' + error.message });
  }
};

/// <summary>
/// Filtra los parámetros basados en el tipo de servicio y tipo de equipo proporcionados en la solicitud.
/// </summary>
/// <param name="req">La solicitud del cliente, que debe incluir los criterios de filtrado en el cuerpo.</param>
/// <param name="res">La respuesta que se enviará al cliente.</param>
/// <returns>Un objeto JSON que contiene los parámetros filtrados o un mensaje de error si no se encuentran registros o si ocurre un problema.</returns>
const FilterParams = async (req, res) => {
  try {
    const filtrado = req.body;

    const documento = await updateModel.SearchByOne(Document, 'nombre_documento', filtrado.tipo_servicio);
    const equipo = await updateModel.SearchByOne(TypeEquipment, 'nombre_tipo_equipo', filtrado.tipo_equipo);


    const tablageneral = await TypeDocumentParams.findAll({
      where: {
        id_tipo_equipo: equipo.id_tipo_equipo,
        id_documento: documento.id_documento
      },
      include: [{
        model: Param,
        attributes: [
          'id_parametro', 'id_parametro_tango', 'nombre_parametro',
          'sistema_parametro', 'tipo_dato', 'unidad_medida',
          'etapa', 'OrdenNumero'
        ],
        include: [
          { model: StageParam, attributes: ['nombre_etapa_de_parametro'] },
          { model: Unit, attributes: ['nombre_unidad_de_medida'] },
          { model: TypeSystem, attributes: ['nombre_tipo_de_sistema'] }
        ]
      }]
    });

    tablageneral.forEach(item => {

      const etapa = item.parametro?.dataValues?.etapaparametro?.dataValues?.nombre_etapa_de_parametro;
      const unidadMedida = item.parametro?.dataValues?.unidadmedida?.dataValues?.nombre_unidad_de_medida;
      const tipoDeSistema = item.parametro?.dataValues?.unidad_de_medida?.dataValues?.nombre_tipo_de_sistema;

      item.parametro.dataValues.nombre_etapa_de_parametro = etapa;
      item.parametro.dataValues.nombre_unidad_de_medida = unidadMedida;
      item.parametro.dataValues.nombre_tipo_de_sistema = tipoDeSistema;

      delete item.parametro.dataValues.typesystem;
      delete item.parametro.dataValues.etapaparametro;
      delete item.parametro.dataValues.unidadmedida;
    });

    if (tablageneral && tablageneral.length > 0) {
      const results = tablageneral.map(item => ({
        id_param: item.parametro.id_parametro,
        nombre_parametro: item.parametro.nombre_parametro.trim(),
        sistema_parametro: item.parametro.sistema_parametro,
        nombre_tipo_de_sistema: item.parametro.dataValues.nombre_tipo_de_sistema,
        tipo_dato: item.parametro.tipo_dato,
        unidad_medida: item.parametro.unidad_medida,
        etapa: item.parametro.etapa,
        nombre_etapa_de_parametro: item.parametro.dataValues.nombre_etapa_de_parametro,
        nombre_unidad_de_medida: item.parametro.dataValues.nombre_unidad_de_medida,
        id_parametro_tango: item.parametro.id_parametro_tango,
        OrdenNumero: item.parametro.OrdenNumero
      }));

      const sortedResults = results.sort((a, b) => {
        // Primero, si ambos tienen OrdenNumero, los comparamos por OrdenNumero
        if (a.OrdenNumero !== null && b.OrdenNumero !== null) {
          if (a.OrdenNumero === b.OrdenNumero) {
            // Si OrdenNumero es el mismo, los ordenamos por id_param
            return a.id_param - b.id_param;
          }
          return a.OrdenNumero - b.OrdenNumero; // Si son diferentes, los ordenamos por OrdenNumero
        }

        // Si uno tiene OrdenNumero y el otro no, el que tiene OrdenNumero va primero
        if (a.OrdenNumero !== null) return -1;
        if (b.OrdenNumero !== null) return 1;

        // Si ambos tienen OrdenNumero null, los ordenamos por id_param
        return a.id_param - b.id_param;
      });

      res.status(200).json({ data: sortedResults });
    } else {
      res.status(404).json({ message: 'No se encontraron registros.' });
    }

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};



const FilterOrdenNumeroBySystemAndStage = async (req, res) => {
  try {
    // Obtener los filtros del cuerpo de la solicitud
    const { sistema_parametro, etapa } = req.body;

    // Buscar los IDs de sistema_parametro y etapa usando sus nombres
    const sistemaParam = await TypeSystem.findOne({
      where: {
        nombre_tipo_de_sistema: sistema_parametro // Buscar por el nombre del sistema
      },
      attributes: ['id_tipo_de_sistema'] // Solo traer el ID
    });


    const etapaParam = await StageParam.findOne({
      where: {
        nombre_etapa_de_parametro: etapa // Buscar por el nombre de la etapa
      },
      attributes: ['id_etapa_de_parametro'] // Solo traer el ID
    });


    // Verificar si se encontraron los registros
    if (!sistemaParam || !etapaParam) {
      return res.status(404).json({ message: 'Sistema o etapa no encontrados.' });
    }

    const sistemaParamId = sistemaParam.id_tipo_de_sistema; // ID del sistema
    const etapaParamId = etapaParam.id_etapa_de_parametro; // ID de la etapa

    // Verificar que los IDs no sean undefined
    if (!sistemaParamId || !etapaParamId) {
      return res.status(400).json({ message: 'IDs de sistema o etapa no válidos.' });
    }

    // Filtrar los parámetros con los IDs obtenidos de los nombres
    const tablageneral = await Param.findAll({
      where: {
        sistema_parametro: sistemaParamId, // Filtrar por ID de sistema_parametro
        etapa: etapaParamId // Filtrar por ID de etapa
      },
      attributes: ['id_parametro', 'nombre_parametro', 'OrdenNumero'], // Solo traer los campos relevantes
      include: [{
        model: StageParam,
        attributes: ['nombre_etapa_de_parametro']
      }]
    });

    // Modificar la respuesta eliminando los campos no necesarios
    const results = tablageneral.map((item) => {
      const parametro = item.dataValues;

      // Asegúrate de agregar los datos relacionados, como nombre_etapa_de_parametro
      parametro.nombre_etapa_de_parametro = parametro?.etapaparametro?.dataValues?.nombre_etapa_de_parametro;

      // Limpiar relaciones para evitar que se incluyan en la respuesta final
      delete parametro.etapaparametro;

      // Retornar el objeto en el formato esperado
      return {
        id_param: parametro.id_parametro,
        nombre_parametro: parametro.nombre_parametro.trim(),
        OrdenNumero: parametro.OrdenNumero // Solo devolver el campo OrdenNumero
      };
    });

    // Devolver los resultados como un array
    if (results.length > 0) {
      res.status(200).json({ data: results });
    } else {
      res.status(404).json({ message: 'No se encontraron registros.' });
    }
  } catch (error) {
    console.error("Error en el filtro:", error);
    res.status(500).json({ message: error.message });
  }
};

const updateParamsOrder = async (req, res) => {
  try {
    const parametros = req.body; // Array de objetos con id_param y OrdenNumero

    if (!Array.isArray(parametros) || parametros.length === 0) {
      return res.status(400).json({ error: 'Se debe proporcionar un array de parámetros para actualizar.' });
    }

    // Realiza actualizaciones en lote
    for (const parametro of parametros) {

      const { id_param, OrdenNumero } = parametro;

      if (!id_param || OrdenNumero === undefined) {
        return res
          .status(400)
          .json({ error: `Faltan datos para el parámetro con id_param: ${id_param || 'desconocido'}.` });
      }

      // Actualiza el parámetro en la base de datos
      await Param.update(
        { OrdenNumero }, // Campos a actualizar
        { where: { id_parametro: id_param } }  // Condición
      );
    }

    res.status(200).json({ message: 'Parámetros actualizados exitosamente.' });
  } catch (error) {
    console.error('Error al actualizar los parámetros:', error);
    res.status(500).json({ error: 'Hubo un error al actualizar los parámetros. Intenta de nuevo más tarde.' });
  }
};




async function syncParametros() {
  try {
    const pool = getPool();

    const result = await pool.request().query(`
      SELECT MIN(id_atr_cp) AS id_atr_cp, nom_atr_cp
      FROM dbo.CZAS50
      GROUP BY nom_atr_cp
    `);

    const tangoParametros = result.recordset;
    for (let tangoParametro of tangoParametros) {
      await Param.upsert({
        id_parametro_tango: tangoParametro.id_atr_cp,
        nombre_parametro: tangoParametro.nom_atr_cp,
      });
    }

  } catch (error) {
    console.error('Error sincronizando datos:', error);
  }
}
const sortParameters = async (req, res) => {
  const data = req.body;

  if (data.orderedItems) {
    try {
      // Usar Promise.all para realizar todas las actualizaciones simultáneamente
      await Promise.all(data.orderedItems.map(async (item) => {
        // Actualizar la base de datos
        await Param.update(
          { OrdenNumero: item.OrdenNumero }, // Establecer el valor de OrdenNumero
          { where: { id_parametro: item.id_param } } // Condición para identificar el registro
        );
      }));

      // Responder al cliente si todo se actualizó correctamente
      res.status(200).json({ message: 'Parámetros ordenados y guardados exitosamente.' });

    } catch (error) {
      // En caso de error, manejarlo adecuadamente
      console.error('Error al actualizar parámetros:', error);
      res.status(500).json({ message: 'Error al procesar la solicitud. Intenta nuevamente.' });
    }
  } else {
    res.status(400).json({ message: 'Error: No se pudo ordenar' });
  }
}


module.exports = {
  CreateParams,
  DeleteParams,
  UpdateParams,
  FilterParams,
  TableParams,
  FilterOrdenNumeroBySystemAndStage,
  updateParamsOrder,
  sortParameters

};  