const TypeDocumentParams = require('../Models/TypeDocumentParamsModel');
const TypeEquipment = require('../Models/TypeEquimentModel.js');
const Document = require('../Models/DocumentModel.js');
const { GetDocumentsNamesIds } = require('./DocumentController.js');
const { GetTypeEquipmentNamesIds } = require('./TypeEquipmentController.js');
const updateModel = require('../Utils/ModelsUtils');


/// <summary>
/// Crea relaciones entre parámetros, documentos y tipos de equipo.
/// </summary>
/// <param name="data">Los datos que contienen los parámetros a relacionar.</param>
/// <param name="parametros">Los parámetros existentes con sus IDs.</param>
/// <returns>Un objeto con el estado y los datos de la relación creada, o un mensaje de error.</returns>
const CreateTypeDocumentParams = async (data, parametros) => {
    const documentos = await GetDocumentsNamesIds();
    const equipos = await GetTypeEquipmentNamesIds();

    const equipMap = equipos.reduce((acc, equipo) => {
        acc[equipo.nombre_tipo_equipo] = equipo.id_tipo_equipo;
        return acc;
    }, {});

    const docMap = documentos.reduce((acc, documento) => {
        acc[documento.nombre_documento] = documento.id_documento;
        return acc;
    }, {});

    
    const paramMap = parametros.reduce((acc, parametro) => {
        const cleanedName = parametro.nombre_parametro.trim();
        acc[cleanedName] = parametro.id_parametro;
        return acc;
    }, {});

    const nombreParametro = data[0].nombre_parametro.trim();
   
    const idParametro = paramMap[nombreParametro];
  

    if (!idParametro) {
        console.error(`ID_PARAMETRO not found for: "${nombreParametro}"`);
        return;
    }

    const relationData = data
        .filter(item => item.fila)
        .flatMap(item => {

            const equipId = equipMap[item.fila];


            if (!equipId) return [];

            return Object.keys(item)
                .filter(key => key !== 'fila' && item[key])
                .map(key => {
                    const idDocumento = docMap[key];
                    if (!idDocumento) return null;
                    return {
                        id_tipo_equipo: equipId,
                        id_documento: idDocumento,
                        id_parametro: idParametro
                    };
                })
                .filter(item => item !== null);
        });

    const hasUndefined = relationData.some(item =>
        item.id_tipo_equipo === undefined ||
        item.id_documento === undefined ||
        item.id_parametro === undefined
    );

    if (hasUndefined) {
        return { status: 400, message: 'All fields must have a value.' };
    }
   
    const resultRelationData = await updateModel.createModel(TypeDocumentParams, relationData);

    if (resultRelationData.status !== 201) {
        return { status: resultRelationData.status, message: resultRelationData.message };
    }

    return { status: 201, data: resultRelationData };
};

/// <summary>
/// Elimina registros de la tabla TypeDocumentParams que coinciden con el id_parametro dado.
/// </summary>
/// <param name="id_parametro">El ID del parámetro para eliminar los registros relacionados.</param>
/// <returns>Un objeto con el estado y el mensaje de la operación de eliminación.</returns>
const DeleteByIdParametro = async (id_parametro) => {
    try {
        const result = await TypeDocumentParams.destroy({
            where: { id_parametro }
        });

        if (result === 0) {
            return {
                status: 200,
                message: `${result}`
            };
        } else {
            return {
                status: 200,
                message: `Se eliminaron ${result} registros exitosamente.`
            };
        }
    } catch (error) {
        console.error(`Error al eliminar registros: ${error.message}`);
        return {
            status: 500,
            message: `No se pudieron eliminar los registros: ${error.message}`
        };
    }
};

/// <summary>
/// Obtiene los registros relacionados con un id_parametro específico y devuelve los nombres de los tipos de equipo y documentos asociados.
/// </summary>
/// <param name="req">La solicitud HTTP.</param>
/// <param name="res">La respuesta HTTP.</param>
const GetRecordsByIdParametro = async (req, res) => {
    const { id_parametro } = req.params;
    try {
        if (!id_parametro) {
            return res.status(400).json({ error: 'id_parametro is required' });
        }
        const records = await TypeDocumentParams.findAll({
            where: { id_parametro },
            attributes: ['id_tipo_equipo', 'id_documento'],
        });

        if (!records || records.length === 0) {
            return res.status(404).json({ error: 'No records found for the given id_parametro' });
        }

        const idsTipoEquipo = records.map(record => record.id_tipo_equipo);
        const idsDocumento = records.map(record => record.id_documento);

        const tiposEquipo = await TypeEquipment.findAll({
            where: { id_tipo_equipo: idsTipoEquipo },
            attributes: ['id_tipo_equipo', 'nombre_tipo_equipo'],
        });

        const documentos = await Document.findAll({
            where: { id_documento: idsDocumento },
            attributes: ['id_documento', 'nombre_documento'],
        });

        const tipoEquipoMap = {};
        tiposEquipo.forEach(te => {
            tipoEquipoMap[te.id_tipo_equipo] = te.nombre_tipo_equipo;
        });

        const documentoMap = {};
        documentos.forEach(doc => {
            documentoMap[doc.id_documento] = doc.nombre_documento;
        });

        const result = records.map(record => ({
            tipo_equipo_nombre: tipoEquipoMap[record.id_tipo_equipo],
            documento_nombre: documentoMap[record.id_documento],
        }));
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error in GetRecordsByIdParametro:", error.message);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    CreateTypeDocumentParams,
    DeleteByIdParametro,
    GetRecordsByIdParametro
}; 