const OrdenT = require('../Models/OrdenTModel');
const updateModel = require('../Utils/ModelsUtils');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { getPool } = require('../Config/dbPool');
const multer = require("multer");
const { where } = require('sequelize');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const DocumentFetch = require('../Models/DocumentFechModel');
const DocumentModel = require('../Models/DocumentModel');

/// <summary>
/// Función para crear una nueva orden de trabajo.
/// </summary>
/// <param name="req">Objeto de solicitud que contiene la información de la orden y el archivo adjunto.</param>
/// <param name="res">Objeto de respuesta que se utilizará para enviar la respuesta al cliente.</param>
/// <returns>Respuesta JSON con el resultado de la creación de la orden.</returns>
const CreateOrder = async (req, res) => {
  try {
    const data = req.body;
    // Aplicar trim a cada propiedad del objeto data
    for (const key in data) {
      if (typeof data[key] === 'string') {
        data[key] = data[key].trim();
      }
    }

    if (req.file) {
      data.archivo = req.file.buffer;
    }
    const nombreSeteado = await DocumentFetch.findAll({
      where: { cod_comp: data.tipo_servicio },
      include: [
        {
          model: DocumentModel,
          attributes: ['nombre_documento'],
        }
      ]
    });
    if (data && nombreSeteado[0] && nombreSeteado[0].dataValues.documento && nombreSeteado[0].dataValues.documento.dataValues.nombre_documento) {
      data.tipo_servicio = nombreSeteado[0].dataValues.documento.dataValues.nombre_documento;
    } else {
      return res.status(400).json({
        error: `Debe relacionar el tipo de servicio ${data.tipo_servicio} con un servicio local.`
      });
    }
    // Verificar si la orden ya existe usando idequipo y titulo
    const existingOrder = await OrdenT.findOne({
      where: {
        idequipo: data.idequipo,
        titulo: data.titulo
      }
    });

    if (existingOrder) {
      return res.status(409).json({ error: 'La orden ya existe para este equipo y título.' });
    }
    const result = await updateModel.createModel(OrdenT, data);
    if (result.status === 201) {
      res.status(result.status).json({ message: result.message, data: result.data });
    } else {
      res.status(result.status).json({ error: result.message });
    }

  } catch (error) {
    res.status(400).json({ error: 'Error al crear la orden: ' + error.message });
  }
};

/// <summary>
/// Función para obtener las órdenes de trabajo, con opción de filtrar por estado.
/// </summary>
/// <param name="req">Objeto de solicitud que contiene parámetros de consulta para filtrar las órdenes.</param>
/// <param name="res">Objeto de respuesta que se utilizará para enviar la respuesta al cliente.</param>
/// <returns>Respuesta JSON con la lista de órdenes de trabajo.</returns>
const GetOrders = async (req, res) => {
  try {

    const { estado } = req.query;

    let whereClause = {};

    if (estado) {
      const estadosValidos = ["pendiente", "realizada"];

      if (!estadosValidos.includes(estado.toLowerCase())) {
        return res.status(400).json({ error: "Estado inválido" });
      }

      whereClause.estado = estado.toLowerCase();
    }
    const ordenes = await OrdenT.findAll({
      where: whereClause,
      attributes: ["id", "titulo", "cliente", "estado", "aprobado", "archivo", "idequipo", "tipo_servicio", "tipo_equipo"],
    });
    if (ordenes.length > 0) {
      res.status(200).json(ordenes);
    } else {
      res
        .status(404)
        .json({
          error: estado
            ? `No se encontraron órdenes con estado ${estado}`
            : "No se encontraron órdenes",
        });
    }
  } catch (error) {
    res
      .status(400)
      .json({
        error: "Error al obtener las órdenes de trabajo: " + error.message,
      });
  }
};

/// <summary>
/// Función para obtener las órdenes de trabajo asignadas a un usuario específico, con opción de filtrar por estado.
/// </summary>
/// <param name="req">Objeto de solicitud que contiene parámetros de consulta para filtrar las órdenes.</param>
/// <param name="res">Objeto de respuesta que se utilizará para enviar la respuesta al cliente.</param>
/// <returns>Respuesta JSON con la lista de órdenes de trabajo asignadas al usuario.</returns>
const GetOrdersByUsuario = async (req, res) => {
  try {
    const { estado, usuario } = req.query;
    const tokenSinFormatear = req.headers['authorization'];
    const decoded = jwt.verify(tokenSinFormatear.split(' ')[1], process.env.secretKey);


    let whereClause = {};
    whereClause.responsable = decoded.userId;

    if (estado) {
      const estadosValidos = ["pendiente", "realizada"];
      if (!estadosValidos.includes(estado.toLowerCase())) {
        return res.status(400).json({ error: "Estado inválido" });
      }

      whereClause.estado = estado.toLowerCase();
    }
    const ordenes = await OrdenT.findAll({
      where: whereClause,
      attributes: ["id", "titulo", "cliente", "estado", "aprobado", "archivo", "idequipo", "tipo_servicio", "tipo_equipo"],
    });
    if (ordenes.length > 0) {
      res.status(200).json(ordenes);
    } else {
      res
        .status(404)
        .json({
          error: estado
            ? `No se encontraron órdenes con estado ${estado}`
            : "No se encontraron órdenes",
        });
    }
  } catch (error) {
    res
      .status(400)
      .json({
        error: "Error al obtener las órdenes de trabajo: " + error.message,
      });
  }
};

/// <summary>
/// Obtiene una orden de trabajo por su ID.
/// </summary>
/// <param name="req">La solicitud del cliente, que debe incluir el ID de la orden en la consulta.</param>
/// <param name="res">La respuesta que se enviará al cliente.</param>
/// <returns>Un objeto JSON que representa la orden de trabajo solicitada o un mensaje de error.</returns>
const GetOrderForId = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "ID es requerido" });
    }

    const orden = await OrdenT.findByPk(id, {
      attributes: ["id", "titulo", "cliente", "estado", "aprobado"],
    });

    if (orden) {
      res.status(200).json(orden);
    } else {
      res.status(404).json({ error: "Orden de trabajo no encontrada" });
    }
  } catch (error) {
    res
      .status(400)
      .json({
        error: "Error al obtener la orden de trabajo: " + error.message,
      });

  };
}

/// <summary>
/// Actualiza una orden de trabajo existente por su ID.
/// </summary>
/// <param name="req">La solicitud del cliente, que debe incluir el ID de la orden en los parámetros y los nuevos datos en el cuerpo.</param>
/// <param name="res">La respuesta que se enviará al cliente.</param>
/// <returns>Un objeto JSON que indica el éxito de la actualización y los datos de la orden actualizada, o un mensaje de error.</returns>
const UpdateOders = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {

      return res.status(400).json({ error: 'ID inválido' });
    }

    const data = req.body;
    const order = await OrdenT.buscarPorId_ot(id);
    if (!order) {

      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    await order.actualizarDatos(data);
    const updatedOrder = await OrdenT.buscarPorId_ot(id);
    res.status(200).json({ message: 'Actualización exitosa', data: updatedOrder });
  } catch (error) {
    console.error('Error en la función UpdateOders:', error);
    res.status(500).json({ error: "Error al actualizar la orden: " + error.message });
  }
};

/// <summary>
/// Valida y actualiza el estado de una orden de trabajo según el ID y la validación proporcionados.
/// </summary>
/// <param name="id">El ID de la orden que se va a validar.</param>
/// <param name="validacion">El valor booleano que indica si la orden es aprobada o no.</param>
/// <returns>Una promesa que resuelve cuando la orden ha sido actualizada.</returns>
const ValidateOrders = async (id, validacion) => {
  try {
    if (isNaN(id)) {
      console.error("Id no valido");
    }

    const order = await OrdenT.buscarPorId_ot(id);
    if (!order) {
      console.error("Orden no encontrada")
    }

    order.aprobado = validacion;

    await order.actualizarDatos({ aprobado: order.aprobado });
  } catch (error) {
    console.error('Error en la función ValidateOders:', error);
  }
};

/// <summary>
/// Elimina una orden de trabajo por su ID.
/// </summary>
/// <param name="req">La solicitud del cliente, que debe incluir el ID de la orden en los parámetros de la URL.</param>
/// <param name="res">La respuesta que se enviará al cliente.</param>
/// <returns>Un objeto JSON que indica el resultado de la eliminación, o un mensaje de error.</returns>
const DeleteOrders = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await updateModel.deleteModel(OrdenT, { id });

    if (result.status === 200) {
      res.status(result.status).json({ message: result.message });
    } else {
      res.status(result.status).json({ error: result.message });
    }
  } catch (err) {
    console.error("Error al eliminar usuario:", err);
    res.status(500).json({ message: "Error al eliminar la orden" });
  }

}

/// <summary>
/// Obtiene la lista de columnas de la tabla de órdenes, excluyendo la columna 'archivo'.
/// </summary>
/// <param name="req">La solicitud del cliente.</param>
/// <param name="res">La respuesta que se enviará al cliente.</param>
/// <returns>Un objeto JSON que contiene la lista de columnas filtradas, o un mensaje de error.</returns>
const ListColumn = async (req, res) => {
  try {
    const filteredObject = Object.keys(OrdenT.getAttributes());
    const listacolumnas = filteredObject.filter(item => item !== 'archivo');
    res.status(200).json({ listacolumnas });
  } catch (error) {
    res.status(400).json({
      error: "error" + error.message,
    });
  }
};

/// <summary>
/// Obtiene una lista de todas las órdenes de trabajo, excluyendo la columna 'archivo'.
/// </summary>
/// <param name="req">La solicitud del cliente.</param>
/// <param name="res">La respuesta que se enviará al cliente.</param>
/// <returns>Un objeto JSON que contiene un mensaje y la lista de órdenes de trabajo filtradas, o un mensaje de error.</returns>
const ListOrders = async (req, res) => {
  try {
    const ordenesTrabajo = await OrdenT.findAll();
    const elementoEncontrado = ordenesTrabajo.map(e => {
      let primerOrden = e.toJSON();
      let { archivo, ...objetoFiltrado } = primerOrden;
      return objetoFiltrado;
    })
    res.status(200).json({ mensaje: "OrdenesTrabajo", elementoEncontrado });
  } catch (error) {
    res.status(400).json({
      error: "Error al devolver la lista Ordenes de trabajo: " + error.message,
    });
  }
};

/// <summary>
/// Descarga un archivo asociado a una orden de trabajo por su ID.
/// </summary>
/// <param name="req">La solicitud del cliente, que debe incluir el ID de la orden en la consulta.</param>
/// <param name="res">La respuesta que se enviará al cliente.</param>
/// <returns>Un archivo PDF para descargar, o un mensaje de error si hay problemas.</returns>
const DownloadFile = async (req, res) => {
  let id = null;
  try {
    id = req.query.id;
    if (!id) {

      return res.status(400).send('Falta el parámetro ID');
    }
    const orden = await OrdenT.findByPk(id);
    if (!orden) {

      return res.status(404).send('Orden no encontrada');
    }
    if (!orden.archivo) {
      return res.status(404).send('Archivo no encontrado');
    }
    const archivoBuffer = Buffer.from(orden.archivo);

    res.setHeader('Content-Disposition', 'attachment; filename="archivo.pdf"');
    res.setHeader('Content-Type', 'application/pdf');
    res.send(archivoBuffer);

  } catch (error) {
    console.error(`[ERROR] Error al descargar el archivo para la orden con ID: ${id}`, error);
    res.status(500).send('Error al descargar el archivo');
  }
};
/// <summary>
/// Obtiene la estructura de la tabla de órdenes, incluyendo las columnas y los elementos existentes.
/// </summary>
/// <param name="req">La solicitud del cliente.</param>
/// <param name="res">La respuesta que se enviará al cliente.</param>
/// <returns>Un objeto JSON que contiene un array de columnas y un array de elementos de la tabla de órdenes, o un mensaje de error.</returns>
const TableOrder = async (req, res) => {
  try {
    const columnArray = Object.keys(OrdenT.getAttributes());
    const elementsArray = await OrdenT.findAll();
    res.status(200).json({ columnArray, elementsArray });
  } catch {
    res.status(400).json({
      error: "error" + error.message,
    });
  }
};
/// <summary>
/// Obtiene datos específicos de una vista en la base de datos según los parámetros de equipo y código.
/// </summary>
/// <param name="req">La solicitud del cliente, que debe incluir los parámetros ideEquipo e ideCp en la URL.</param>
/// <param name="res">La respuesta que se enviará al cliente.</param>
/// <returns>Un objeto JSON que contiene los resultados de la consulta, o un mensaje de error en caso de fallos.</returns>
const FetchTango = async (req, res) => {
  try {
    const { idEquipo } = req.params;

    const idEquipoStr = String(idEquipo);

    if (typeof idEquipoStr !== 'string') {
      return res.status(400).json({ error: 'El idEquipo debe ser un string' });
    }
    const pool = getPool();
    const query = `
        SELECT  a.razon_Soci AS cliente, b.desc_tal AS titulo, a.n_of  FROM dbo.CZDB_DMD_VISTA_SEGUIMIENTO_OT a JOIN dbo.CZAP02 b ON a.t_comp = b.cod_comp 
        WHERE a.cod_articu = @idEquipoStr 
        AND estado IN ('G', 'F') 
        AND UPPER(t_comp) NOT LIKE 'P0%' 
        AND UPPER(cod_articu) LIKE 'Z%'`;

    const result = await pool.request()
      .input('idEquipoStr', idEquipoStr)
      .query(query);
    const respuestaFormateada = result.recordset.map(e => {
      e.titulo = e.titulo.trim();
      e.numOrden = `${e.n_of.trim()}`;
      const obj = { titulo: e.titulo, cliente: e.cliente, numeroDeOrden: e.numOrden }
      return obj;
    })
    res.status(200).json({ message: respuestaFormateada });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

/// <summary>
/// Obtiene información relacionada con un equipo y su título, consultando en varias tablas de la base de datos.
/// </summary>
/// <param name="req">La solicitud del cliente, que debe incluir 'titulo' y 'codEquipo' como parámetros en la URL.</param>
/// <param name="res">La respuesta que se enviará al cliente, que incluye los resultados de la consulta o un mensaje de error.</param>
/// <returns>Un objeto JSON que contiene los resultados de la consulta o un mensaje de error en caso de fallo.</returns>
const FetchTango2 = async (req, res) => {
  try {
    const { titulo, codEquipo } = req.params;


    const tituloStr = String(titulo).trim();
    if (!tituloStr) {
      return res.status(400).json({ error: 'El titulo es requerido y debe ser un string no vacío.' });
    }
    const pool = getPool();

    const query = `
        SELECT 
          b.n_of, 
          b.t_comp, 
          LTRIM(RTRIM(d.[Esquemas])) AS tipo_equipo  -- Eliminar espacios en ambos extremos
        FROM dbo.CZAP02 a 
        JOIN dbo.CZDB_DMD_VISTA_SEGUIMIENTO_OT b ON a.cod_comp = b.t_comp 
        JOIN dbo.CZSTA11_DATOS_ADICIONALES_DMD d ON b.cod_articu = d.cod_articu 
        WHERE a.desc_tal = @tituloStr 
        AND b.cod_articu = @codEquipo
        AND b.estado IN ('G', 'F') 
        AND UPPER(b.t_comp) NOT LIKE 'P0%' 
        AND UPPER(b.cod_articu) LIKE 'Z%'`;

    const result = await pool.request()
      .input('tituloStr', tituloStr)
      .input('codEquipo', codEquipo)
      .query(query);

    res.status(200).json({ message: result });
  } catch (error) {
    console.error('Error en FetchTango2:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

/// <summary>
/// Obtiene los servicios desde la base de datos y devuelve un listado de códigos de componentes.
/// </summary>
/// <param name="req">La solicitud del cliente, que no requiere parámetros específicos en este caso.</param>
/// <param name="res">La respuesta que se enviará al cliente, que incluirá los códigos de componentes obtenidos de la base de datos.</param>
/// <returns>Un objeto JSON que contiene un mensaje con los resultados de la consulta.</returns>
const getServicesTango = async (req, res) => {
  try {
    const pool = getPool();
    const query = `
        SELECT cod_comp
        FROM dbo.CZAP02 `;
    const result = await pool.request().query(query);
    res.status(200).json({ message: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }


}

/// <summary>
/// Compara un array de objetos proporcionado en la solicitud con los documentos almacenados en la base de datos.
/// </summary>
/// <param name="req">La solicitud del cliente, que debe incluir el array de objetos en la consulta como 'arra'. Cada objeto debe contener un 'cod_comp'.</param>
/// <param name="res">La respuesta que se enviará al cliente, que incluye el resultado de la comparación.</param>
/// <returns>Un objeto JSON que contiene el array original con información sobre si cada objeto fue encontrado y el nombre del documento correspondiente.</returns>
const compararArray = async (req, res) => {
  try {
    const arra = req.query.arra;
    const data = await DocumentFetch.findAll({
      attributes: ['cod_comp'],
      include: [
        {
          model: DocumentModel,
          attributes: ['nombre_documento'],
        }
      ]
    });
    const codCompArray = data.map(instance => instance.dataValues);

    const respuestaFiltrada = Object.values(arra).map(e => {
      codCompArray.map(ese => {
        if (e.cod_comp == ese.cod_comp.toString()) {
          e.encontrado = true;
          e.grupo = ese.documento.dataValues.nombre_documento;
        }
      })
      return e;
    });
    res.status(200).json({ objetos: respuestaFiltrada });
  } catch (error) {
    console.error(error)
  }
}
module.exports = {
  CreateOrder,
  GetOrders,
  GetOrderForId,
  UpdateOders,
  DeleteOrders,
  ListColumn,
  ListOrders,
  DownloadFile,
  TableOrder,
  GetOrdersByUsuario,
  FetchTango,
  FetchTango2,
  getServicesTango,
  compararArray,
  ValidateOrders
};