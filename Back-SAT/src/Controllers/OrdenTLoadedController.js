const StageParams = require('../Models/ParamsStagesModel')
const TypeSystem = require('../Models/SystemTypeModel')
const OrdenTLoaded = require('../Models/OrderTLoadedModel');
const OrdenT = require('../Models/OrdenTModel');
const Param = require('../Models/ParamsModel')
const Unit = require('../Models/UnidadDeMedidaModel')
const updateModel = require('../Utils/ModelsUtils');
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const logoPath = path.join(__dirname, '../logoDefinitivo.webp');
const logoBase64 = fs.readFileSync(logoPath, { encoding: 'base64' });
const { getPool } = require('../Config/dbPool');
const { ValidateOrders } = require('./OrderController');

/// <summary>
/// Función asíncrona para crear órdenes cargadas en la base de datos.
/// </summary>
/// <param name="req">Objeto de solicitud que contiene los datos de la orden a crear.</param>
/// <param name="res">Objeto de respuesta que permite enviar una respuesta al cliente.</param>
/// <returns>Un objeto JSON con un mensaje de éxito y los datos de la orden, o un mensaje de error.</returns>
const CrateLoadedOrders = async (req, res) => {
  try {
    const data = req.body;
  
    const result = await updateModel.createModel(OrdenTLoaded, data);
    if (result.status === 201) {
      res.status(result.status).json({ message: result.message, data: result.data });
    } else {
      res.status(result.status).json({ error: result.message });
    }
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      res.status(422).json({ error: 'Validation error: ' + error.message });
    } else if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(409).json({ error: 'Unique constraint error: ' + error.message });
    } else if (error.name === 'SequelizeDatabaseError') {
      res.status(500).json({ error: 'Database error: ' + error.message });
    } else {
      res.status(500).json({ error: 'Unexpected error: ' + error.message });
    }
  }
};

/// <summary>
/// Función asíncrona para eliminar órdenes cargadas de la base de datos.
/// </summary>
/// <param name="req">Objeto de solicitud que contiene el ID de la orden a eliminar en los parámetros de la URL.</param>
/// <param name="res">Objeto de respuesta que permite enviar una respuesta al cliente.</param>
/// <returns>Un objeto JSON con un mensaje de éxito si se elimina la orden, o un mensaje de error.</returns>
const DeleteLoadedOrders = async (req, res) => {
  try {
    const { id_ot } = req.params;
    const result = await updateModel.deleteModel(OrdenTLoaded, { id_ot });

    if (result.status === 200) {
      res.status(result.status).json({ message: result.message });
    } else {
      res.status(result.status).json({ error: result.message });
    }
  } catch (error) {
    console.error("Error al eliminar la orden:", error);
    if (error.name === 'CastError') {
      res.status(400).json({ error: 'ID no válido: ' + error.message });
    } else if (error.name === 'NotFoundError') {
      res.status(404).json({ error: 'Orden no encontrada' });
    } else {
      res.status(500).json({ error: 'Error inesperado: ' + error.message });
    }
  }
};

/// <summary>
/// Función asíncrona para actualizar órdenes cargadas en la base de datos.
/// </summary>
/// <param name="req">Objeto de solicitud que contiene los datos de la orden a actualizar.</param>
/// <param name="res">Objeto de respuesta que permite enviar una respuesta al cliente.</param>
/// <returns>Un objeto JSON con un mensaje de éxito y los datos actualizados de la orden, o un mensaje de error.</returns>
const UpdateLoadedOrders = async (req, res) => {
  try {
    const data = req.body;

    const datosEnviados = data.datosEnviados;
    const datosGenerales = data.datosGenerales;

    const combinedData = datosEnviados.map(item => ({
      ...item,
      observaciones_generales: datosGenerales.observaciones_generales
    }));

    if (!Array.isArray(combinedData) || combinedData.length === 0) {
      console.error("Los datos recibidos no son válidos.");
      return res.status(400).json({ error: 'Los datos deben ser un arreglo no vacío' });
    }

    const firstElement = combinedData[0];


    const { id_ot } = firstElement;

    if (id_ot === undefined) {
      console.error("id_ot es undefined en el primer elemento.");
      return res.status(400).json({ error: 'id_ot es requerido en el cuerpo de la solicitud' });
    }

    const orderTLoaded = await OrdenTLoaded.buscarPorIdOt(id_ot);
    if (!orderTLoaded) {
      console.error(`OrderTLoadedModel no encontrado para id_ot: ${id_ot}`);
      return res.status(404).json({ error: 'OrderTLoadedModel no encontrado' });
    }

    await orderTLoaded.actualizarDatos(firstElement);

    const html = GenerateHTML(combinedData, datosGenerales);
    const pdfBuffer = await CreatePDF(html);

    const updateResult = await OrdenT.update(
      { archivo: pdfBuffer, firma: datosGenerales.firma },
      { where: { id: id_ot } }
    );

    if (updateResult[0] === 0) {
      console.error(`No se pudo actualizar la orden con id_ot: ${id_ot}`);
      return res.status(404).json({ error: 'No se encontró la orden para actualizar' });
    }

    const updatedOrderT = await OrdenTLoaded.buscarPorIdOt(id_ot);

    res.status(200).json({ message: 'Actualización exitosa', data: updatedOrderT });
  } catch (error) {
    console.error("Error en la función UpdateLoadedOrders:", error.message);
    console.error("Stack trace:", error.stack);

    if (error.name === 'SequelizeValidationError') {
      res.status(422).json({ error: 'Error de validación: ' + error.message });
    } else if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(409).json({ error: 'Conflicto en la base de datos: ' + error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ error: 'Error inesperado: ' + error.message });
    } else {
      res.status(500).json({ error: 'Error inesperado: ' + error });
    }
  }
};

/// <summary>
/// Función asíncrona para listar las columnas del modelo OrdenTLoaded.
/// </summary>
/// <param name="req">Objeto de solicitud que contiene información sobre la solicitud HTTP.</param>
/// <param name="res">Objeto de respuesta que permite enviar una respuesta al cliente.</param>
/// <returns>Un objeto JSON con una lista de nombres de columnas del modelo.</returns>
const ListColumn = async (req, res) => {
  try {
    const listacolumnas = Object.keys(OrdenTLoaded.getAttributes());
    res.status(200).json({ listacolumnas });
  } catch (error) {
    console.error("Error en la función ListColumn:", error.message);
    console.error("Stack trace:", error.stack);

    if (error.name === 'SequelizeDatabaseError') {
      res.status(500).json({ error: 'Error de base de datos: ' + error.message });
    } else {
      res.status(500).json({ error: 'Error inesperado: ' + error.message });
    }
  }
};

/// <summary>
/// Función asíncrona para listar las órdenes de trabajo cargadas en la base de datos.
/// </summary>
/// <param name="req">Objeto de solicitud que contiene información sobre la solicitud HTTP.</param>
/// <param name="res">Objeto de respuesta que permite enviar una respuesta al cliente.</param>
/// <returns>Un objeto JSON con un mensaje y una lista de órdenes de trabajo.</returns>
const ListLoadedOrders = async (req, res) => {
  try {
    const elementosEncontrado = await OrdenTLoaded.findAll();
    res.status(200).json({ mensaje: "Ordenes de Trabajo", elementosEncontrado });
  } catch (error) {
    console.error("Error en la función ListLoadedOrders:", error.message);
    console.error("Stack trace:", error.stack);

    if (error.name === 'SequelizeDatabaseError') {
      res.status(500).json({ error: 'Error de base de datos: ' + error.message });
    } else if (error.name === 'SequelizeConnectionError') {
      res.status(503).json({ error: 'Error de conexión a la base de datos: ' + error.message });
    } else {
      res.status(500).json({ error: 'Error inesperado: ' + error.message });
    }
  }
};

/// <summary>
/// Función asíncrona para enviar un correo electrónico con una orden de trabajo en formato PDF.
/// </summary>
/// <param name="destinatario">Dirección de correo electrónico del destinatario.</param>
/// <param name="pdfBuffer">Buffer del archivo PDF que se adjuntará al correo.</param>
/// <returns>No retorna ningún valor, pero envía un correo electrónico.</returns>
const SendAutoMail = async (destinatario, pdfBuffer) => {
  try {
    // Configuración del transportador
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const GenerateMail = () => {
      return `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            margin: 0;
                            padding: 20px;
                            background-color: #f4f4f4;
                        }
                        .container {
                            background-color: #ffffff;
                            border-radius: 8px;
                            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                            padding: 30px;
                            max-width: 600px;
                            margin: auto;
                        }
                        h1 {
                            color: #004080;
                            font-size: 24px;
                            margin-bottom: 20px;
                        }
                        p {
                            line-height: 1.6;
                            color: #333;
                        }
                        .footer {
                            margin-top: 30px;
                            font-size: 0.9em;
                            color: #777;
                        }
              
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Orden de Trabajo</h1>
                        <p>Estimado/a Cliente,</p>
                        <p>Adjunto encontrarás la orden de trabajo en formato PDF. Si tienes alguna duda o necesitas más información, no dudes en contactarnos.</p>
                        <p>Saludos cordiales,</p>
                        <div class="footer">
                            <p><strong>DMD Compresores</strong></p>
                            <p>Teléfono: 1159380570</p>
                            <p>Email: info@dmdcompresores.com</p>
                        </div>
                    </div>
                </body>
                </html>
            `;
    };
    // Configurar el correo
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: destinatario,
      subject: 'Orden de Trabajo',
      html: GenerateMail(),
      attachments: [
        {
          filename: 'orden_trabajo.pdf',
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    await transporter.sendMail(mailOptions);


  } catch (error) {
    console.error('Error al enviar el correo:', error);
  }
};

/// <summary>
/// Función asíncrona para recibir parámetros y crear órdenes cargadas en la base de datos.
/// </summary>
/// <param name="req">Objeto de solicitud que contiene los datos necesarios para crear las órdenes.</param>
/// <param name="res">Objeto de respuesta que permite enviar una respuesta al cliente.</param>
/// <returns>Un objeto JSON con un mensaje de éxito y detalles sobre la actualización, o un mensaje de error.</returns>
const ReceiveParamsandCreateLoadedOrders = async (req, res) => {
  try {
    const data = req.body;
    const datosEnviados = data.datosEnviados;
    const datosGenerales = data.datosGenerales;
    const validationErrors = [];
    const pool = getPool();

    for (const item of datosEnviados) {
      const { id_parametro_tango, valor_cargado, idequipo } = item;

      const limits = await pool.request()
        .input('id_parametro_tango', id_parametro_tango)
        .input('idequipo', idequipo)
        .query('SELECT d_val_ref, d_lim_sup, d_lim_inf FROM dbo.CZAS53_DMD_SAT WHERE id_atr_cp = @id_parametro_tango AND cod_per_cp = @idequipo');

      if (limits.recordset.length > 0) {
        const { d_val_ref, d_lim_sup, d_lim_inf } = limits.recordset[0];

        if (valor_cargado !== d_val_ref) {
          validationErrors.push(`El valor ${valor_cargado} no coincide con el valor de referencia (${d_val_ref}).`);
        }

        item.d_lim_sup = d_lim_sup;
        item.d_lim_inf = d_lim_inf;
        item.d_val_ref = d_val_ref;
      } else {
        validationErrors.push(`No se encontraron límites para el id_parametro_tango ${id_parametro_tango} y equipo ${idequipo}.`);
      }
    }

    const combinedData = datosEnviados.map(item => ({
      ...item,
      observaciones_generales: datosGenerales.observaciones_generales
    }));

    const result = await OrdenTLoaded.bulkCreate(combinedData);

    if (result) {
      const modificarOt = await updateModel.updateModel(
        OrdenT,
        { id: datosGenerales.id_ot || datosEnviados[0].id_ot },
        { estado: 'realizada' }
      );

      const sistemaIds = datosEnviados.map(item => item.sistema_parametro);
      const sistemas = await TypeSystem.findAll({
        where: { id_tipo_de_sistema: sistemaIds },
        attributes: ['id_tipo_de_sistema', 'nombre_tipo_de_sistema'],
      });

      const sistemasMap = sistemas.reduce((acc, sistema) => {
        acc[sistema.id_tipo_de_sistema] = sistema.nombre_tipo_de_sistema;
        return acc;
      }, {});

      const dataWithSystemNames = datosEnviados.map(item => ({
        ...item,
        sistema_parametro: sistemasMap[item.sistema_parametro] || 'Sistema desconocido'
      }));
      const html = GenerateHTML(dataWithSystemNames, datosGenerales);
      const htmlClient = GenerateHTML(dataWithSystemNames, datosGenerales, true);
      const pdfBuffer = await CreatePDF(html);
      const pdfBufferClient = await CreatePDF(htmlClient);

      await OrdenT.update(
        { archivo: pdfBuffer, firma: datosGenerales.firma, aclaracion:datosGenerales.aclaracion },
        { where: { id: datosGenerales.id_ot || datosEnviados[0].id_ot } },
      );

      res.status(200).json({
        msg: 'Datos insertados y actualizados correctamente, incluyendo el PDF',
        modificarOt
      });

      await SendAutoMail(datosGenerales.mail, pdfBufferClient);
      await SendAutoMail('matiasezequielsmania@gmail.com', pdfBuffer);
      // await SendAutoMail(process.env.EMAIL_DMD, pdfBuffer);  

    } else {
      res.status(400).json({ error: 'Error, información no actualizada' });
    }

  } catch (error) {
    console.error(error);
    if (error.name === 'SequelizeValidationError') {
      res.status(422).json({ error: 'Error de validación: ' + error.message });
    } else if (error.name === 'SequelizeDatabaseError') {
      res.status(500).json({ error: 'Error de base de datos: ' + error.message });
    } else {
      res.status(500).json({ error: 'Error inesperado: ' + error.message });
    }
  }
};

/// <summary>
/// Función para calcular el porcentaje de elementos validados respecto al total de elementos.
/// </summary>
/// <param name="data">Array que contiene los elementos totales.</param>
/// <param name="parametrosValidados">Array que contiene los elementos validados.</param>
/// <returns>El porcentaje de elementos validados, representado como un número decimal.</returns>
const GetValidationNumber = (data, parametrosValidados) => {
  const totalElementos = data.length;
  const validados = parametrosValidados.length;

  if (totalElementos === 0) {
    return 0;
  }

  const porcentajeValidados = parseFloat(((validados / totalElementos) * 100).toFixed(2));
  return porcentajeValidados;
};

const GenerateStyles = () => `
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 1px;
      color: #333;
      background-color: #fff;
      font-size: 12px;
    }
    h1 {
      text-align: center;
      font-size: 16px;
      margin-bottom: 5px;
    }
    h2 {
      font-size: 14px;
      margin-top: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      page-break-inside: auto;
    }
    tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }
    th {
      background-color: #a30505;
      color: white;
      padding: 8px;
      text-align: center;
      font-size: 12px;
    }
    td {
      border: 1px solid white;
      padding: 8px;
      text-align: left;
      font-size: 12px;
      color: black;
    }
    tr {
      background-color: #bbdefb;
    }
    .observaciones-generales {
      margin-top: 10px;
      padding: 8px;
      background-color: #f4f4f4;
      border: 1px solid #ddd;
      font-size: 12px;
      page-break-inside: avoid;
    }
    .container {
      display: flex;
      align-items: center; /* Alinea verticalmente */
    }
    .logo-container {
      margin-right: 20px; /* Espacio entre el logo y el texto */
    }
    .text-container {
      text-align: left; /* Alinea el texto a la izquierda */
    }
    .percentage-box {
      position: absolute;
      top: 10px; /* Margen superior */
      right: 10px; /* Margen derecho */
      padding: 15px 20px; /* Aumentar el padding para mayor tamaño */
      border: 2px solid #a30505; /* Aumentar el grosor del borde */
      background-color: #f4f4f4; /* Color de fondo del recuadro */
      font-size: 20px; /* Aumentar el tamaño de la letra */
      color: #a30505; /* Color del texto */
      border-radius: 5px; /* Esquinas redondeadas */
    }
    .high-percentage {
      color: #007700; /* Color verde */
      border-color: #007700; /* Cambiar el color del borde a verde */
    }
    .custom-checkbox {
      display: none;
    }
    .checkbox-label {
      display: inline-block;
      width: 24px;
      height: 24px;
      border: 2px solid #ccc;
      border-radius: 50%;
      position: relative;
      cursor: pointer;
      text-align: center;
      line-height: 24px;
      transition: background-color 0.3s, border-color 0.3s;
    }
    .checkbox-label.checked {
      background-color: #4CAF50;
      border-color: #4CAF50;
      color: white;
    }
    .checkbox-label.crossed {
      background-color: #f44336;
      border-color: #f44336;
      color: white;
    }
    .checkbox-label i {
      font-size: 16px;
      line-height: 24px;
      display: none;
    }
    .checkbox-label.checked i.fa-check {
      display: block;
    }
    .checkbox-label.crossed i.fa-times {
      display: block;
    }
    .ocultar-columna {
      display: none;
    }
    .signature {
      text-align: center; /* Centra el texto y la imagen */
      margin-top: 20px;  /* Añade un poco de margen superior */
    }
  </style>
`;


const TableObservations = (groupedByStageAndSystem) => {


  return `
    <table>
      <thead>
        <tr>
          <th>Etapa</th>
          <th>Sistema</th>
          <th class="ocultar-columna">Parámetro</th>
          <th class="ocultar-columna">Valor</th>
          <th class="ocultar-columna">Validación</th>
          <th>Observaciones</th>
          <th>Validación por Sistema</th> <!-- Nueva columna -->
        </tr>
      </thead>
      <tbody>
        ${Object.keys(groupedByStageAndSystem).flatMap(stage => {
    const systems = Object.keys(groupedByStageAndSystem[stage]);
    const totalRowsForStage = systems.reduce((total, system) => total + groupedByStageAndSystem[stage][system].length, 0);

    return systems.flatMap((system, systemIndex) => {
      const items = groupedByStageAndSystem[stage][system];
      const systemObservations = items.map(item => item.observaciones).find(obs => obs) || 'No definidas';
      const allChecked = items.every(item => item.validacion === true);

      return items.map((item, itemIndex) => `
              <tr>
                ${itemIndex === 0 && systemIndex === 0 ? `<td rowspan="${totalRowsForStage}">${stage}</td>` : ''}
                ${itemIndex === 0 ? `<td rowspan="${items.length}">${system}</td>` : ''}
                <td class="ocultar-columna">${item.nombre_parametro || ''}</td>
                <td class="ocultar-columna">${item.valor_cargado || ''}</td>
                <td class="ocultar-columna">
                  <input type="checkbox" ${item.validacion === true ? 'checked' : ''}>
                </td>
                ${itemIndex === 0 ? `<td rowspan="${items.length}">${systemObservations}</td>` : ''}
                ${itemIndex === 0 ? `
                <td rowspan="${items.length}" style="text-align: center;">
                  <span class="checkbox-label ${allChecked ? 'checked' : 'crossed'}">
                    ${allChecked ? '<i class="fas fa-check"></i>' : '<i class="fas fa-times"></i>'}
                  </span>
                </td>` : ''}
              </tr>
            `).join('');
    }).join('');
  }).join('')}
      </tbody>
    </table>
`;

};

const TableParams = (groupedByStageAndSystem) => {

  return `
  <table>
    <thead>
      <tr>
        <th>Etapa</th>
        <th>Sistema</th>
        <th>Parámetro</th>
        <th>Valor</th>
        <th>Validación</th>
      </tr>
    </thead>
    <tbody>
    ${Object.keys(groupedByStageAndSystem).flatMap(stage => {
    const systems = Object.keys(groupedByStageAndSystem[stage]);
    const totalRowsForStage = systems.reduce((total, system) => total + groupedByStageAndSystem[stage][system].length, 0);

    return systems.flatMap((system, systemIndex) => {
      const items = groupedByStageAndSystem[stage][system];

      return items.map((item, itemIndex) => `
    <tr>
    ${itemIndex === 0 && systemIndex === 0 ? `<td rowspan="${totalRowsForStage}">${stage}</td>` : ''}
    ${itemIndex === 0 ? `<td rowspan="${items.length}">${system}</td>` : ''}
    <td>${item.nombre_parametro || ''}</td>
    <td>${item.valor_cargado || ''} ${item.nombre_unidad_de_medida || ''}</td>
    <td style="text-align: center;">
    <input type="checkbox" id="checkbox-${itemIndex}-${systemIndex}" class="custom-checkbox" ${item.validacion === true ? 'checked' : ''}>
    <label for="checkbox-${itemIndex}-${systemIndex}" class="checkbox-label ${item.validacion === true ? 'checked' : 'crossed'}">
    ${item.validacion === true ? '<i class="fas fa-check"></i>' : '<i class="fas fa-times"></i>'}
    </label>
    </td>
    </tr>
    `).join('');
    }).join('');
  }).join('')}
    </tbody>
  </table>

`;

};




const CreateTablePDF = (groupedByStageAndSystem, observacionesGenerales, porcentaje, datosGenerales, cliente) => {
  const styles = GenerateStyles();

  if (cliente) {

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Observaciones por Sistema</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
        ${styles}
      </head>
      <body>
        <div class="container">
          <div class="logo-container">
            <img src="data:image/webp;base64,${logoBase64}" alt="Logo de la empresa" class="logo" style="max-width: 100px;">
          </div>
          <div class="text-container">
            <h1><u>Informe de Orden de Trabajo</u></h1>
            <h2>Cliente: ${datosGenerales.cliente}</h2>
          </div> 
          <div class="percentage-box" id="percentageBox">
              ${porcentaje}%
          </div>
        </div>
    
        ${TableObservations(groupedByStageAndSystem)}
      
        <div class="observaciones-generales">
          <strong>Observaciones generales:</strong> ${observacionesGenerales}
        </div>

        <div class="signature">
          <p><strong>Firma:</strong></p>
          <img src="${datosGenerales.firma}" alt="Firma">
        </div>
      </body>

      <script>
        const porcentajeValidados = ${porcentaje};
        const percentageBox = document.getElementById('percentageBox');

        if (porcentajeValidados > 70) {
            percentageBox.classList.add('high-percentage');
        }
      </script>
      </html>
      `;
  }

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Detalles de Parámetros</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
      ${styles}
    </head>
    <body>
      <div class="container">
        <div class="logo-container">
          <img src="data:image/webp;base64,${logoBase64}" alt="Logo de la empresa" class="logo" style="max-width: 100px;">
        </div>
        <div class="text-container">
          <h1><u>Informe de Orden de Trabajo</u></h1>
          <h2>Cliente: ${datosGenerales.cliente}</h2>
        </div>
        <div class="percentage-box" id="percentageBox">
            ${porcentaje}%
        </div>
      </div>
      ${TableParams(groupedByStageAndSystem)}

      <h1 style="text-align: center;"><u>Observaciones por Sistema</u></h1>

      ${TableObservations(groupedByStageAndSystem)}

      <div class="observaciones-generales">
        <strong>Observaciones generales:</strong> ${observacionesGenerales}
      </div>

      <div class="signature">
        <p><strong>Firma:</strong></p>
        <img src="${datosGenerales.firma}" alt="Firma">
      </div>
    </body>

    <script>
      const porcentajeValidados = ${porcentaje};
      const percentageBox = document.getElementById('percentageBox');

      if (porcentajeValidados > 70) {
          percentageBox.classList.add('high-percentage');
      }
    </script>
    </html>
  `;
};

const GenerateHTML = (data, datosGenerales, cliente = false) => {
  const parametrosValidados = [];
  const parametrosRechazados = [];
  // Agrupar los datos por etapa y sistema
  const groupedByStageAndSystem = data.reduce((acc, item) => {

    // Validacion de los parametros
    if (item.d_lim_inf && item.d_lim_sup) {
      const valorCargado = parseFloat(item.valor_cargado);
      const limiteInferior = parseFloat(item.d_lim_inf);
      const limiteSuperior = parseFloat(item.d_lim_sup);

      if (valorCargado >= limiteSuperior || valorCargado <= limiteInferior) {
        item.validacion = false;
        parametrosRechazados.push(item);
      } else {
        item.validacion = true;
        parametrosValidados.push(item);
      }
    } else if (item.tipo_dato === 'bool') {
      if (item.valor_cargado != "Ok" && item.valor_cargado != "Daño superficial") {
        item.validacion = false;
        parametrosRechazados.push(item);
      } else {
        item.validacion = true;
        parametrosValidados.push(item);
      }

    } else {
      item.validacion = true;
      parametrosValidados.push(item);
    }

    const stage = item.nombre_etapa_de_parametro || 'Etapa desconocida';
    const system = item.sistema_parametro || 'Sistema desconocido';

    if (!acc[stage]) {
      acc[stage] = {};
    }

    if (!acc[stage][system]) {
      acc[stage][system] = [];
    }

    acc[stage][system].push(item);
    return acc;
  }, {});

  const porcentaje = GetValidationNumber(data, parametrosValidados);
  if (porcentaje > 70) {
    ValidateOrders(data[0].id_ot, true);
  }
  const observacionesGenerales = datosGenerales.observaciones_generales || 'No definidas';

  return CreateTablePDF(groupedByStageAndSystem, observacionesGenerales, porcentaje, datosGenerales, cliente)
};



/// <summary>
/// Función para crear un PDF a partir de contenido HTML utilizando Puppeteer.
/// </summary>
/// <param name="html">Cadena de texto que contiene el contenido HTML a convertir en PDF.</param>
/// <returns>Un buffer que representa el archivo PDF generado.</returns>
const CreatePDF = async (html) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--single-process",
        "--no-zygote",
      ],
      timeout: 0,
    });

    const page = await browser.newPage();
    await page.setContent(html, {
      waitUntil: 'networkidle2',
    });

    await page.addStyleTag({
      content: `
  @media print {
          .parameter {
  page -break-inside: avoid; /* Evita que los elementos se dividan entre páginas */
}
        }
`,
    });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
      printBackground: true,
    });

    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('Error al crear el PDF:', error);
    throw new Error(`Error al crear el PDF: ${error.message} \nStack: ${error.stack} `);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

/// <summary>
/// Función para obtener las columnas y elementos de la tabla de órdenes cargadas (OrdenTLoaded).
/// </summary>
/// <param name="req">El objeto de solicitud que contiene información sobre la solicitud HTTP.</param>
/// <param name="res">El objeto de respuesta que se utilizará para enviar la respuesta al cliente.</param>
/// <returns>Respuesta JSON que contiene un arreglo de columnas y un arreglo de elementos.</returns>
const TableOtCargadas = async (req, res) => {
  try {
    const columnArray = Object.keys(OrdenTLoaded.getAttributes());
    const elementsArray = await OrdenTLoaded.findAll();


    res.status(200).json({ columnArray, elementsArray });
  } catch (error) {

    console.error("Error al obtener datos:", error);
    res.status(500).json({
      error: "Error al obtener los datos. Por favor, intenta nuevamente más tarde.",
      details: error.message,
    });
  }
};

/// <summary>
/// Función para listar las órdenes cargadas por el ID de orden de trabajo (idot).
/// </summary>
/// <param name="req">Objeto de solicitud que contiene información sobre la solicitud HTTP.</param>
/// <param name="res">Objeto de respuesta que se utilizará para enviar la respuesta al cliente.</param>
/// <returns>Respuesta JSON con las órdenes cargadas y la firma asociada.</returns>
const ListLoadedOrdersByIdot = async (req, res) => {
  try {
    const { idot } = req.params;

    if (!idot) {
      return res.status(400).json({ mensaje: "Error, se debe pasar el idot" });
    }
    const ordenesCargadas = await OrdenTLoaded.findAll({
      where: { id_ot: idot },
      attributes: {
        exclude: ['id_ot_param_valor'],
        include: ['observaciones', 'observaciones_generales'],
      },
    });

    if (!ordenesCargadas || ordenesCargadas.length === 0) {
      return res.status(404).json({ mensaje: "Error, ese idot no existe" });
    }
    const objOrdenT = await OrdenT.findOne({
      where: { id: idot },
      attributes: ['firma','aclaracion'],
    });
    const idsParametros = ordenesCargadas.map(orden => orden.id_param).filter(Boolean);
    const parametros = await Param.findAll({
      where: { id_parametro: idsParametros },
      attributes: ['id_parametro', 'nombre_parametro', 'tipo_dato', 'unidad_medida', 'etapa', 'sistema_parametro'],
    });

    const idsUnidadesDeMedida = [...new Set(parametros.map(param => param.unidad_medida).filter(Boolean))];
    const idsEtapas = [...new Set(parametros.map(param => param.etapa).filter(Boolean))];
    const idsSistemas = [...new Set(parametros.map(param => param.sistema_parametro).filter(Boolean))];
    const [unidadesDeMedida, etapas, sistemas] = await Promise.all([
      idsUnidadesDeMedida.length > 0 ? Unit.findAll({
        where: { id_unidad_de_medida: idsUnidadesDeMedida },
        attributes: ['id_unidad_de_medida', 'nombre_unidad_de_medida'],
      }) : [],
      idsEtapas.length > 0 ? StageParams.findAll({
        where: { id_etapa_de_parametro: idsEtapas },
        attributes: ['id_etapa_de_parametro', 'nombre_etapa_de_parametro'],
      }) : [],
      idsSistemas.length > 0 ? TypeSystem.findAll({
        where: { id_tipo_de_sistema: idsSistemas },
        attributes: ['id_tipo_de_sistema', 'nombre_tipo_de_sistema'],
      }) : [],
    ]);

    const unidadesDeMedidaMap = Object.fromEntries(unidadesDeMedida.map(u => [u.id_unidad_de_medida, u.nombre_unidad_de_medida]));
    const etapasMap = Object.fromEntries(etapas.map(e => [e.id_etapa_de_parametro, e.nombre_etapa_de_parametro]));
    const sistemasMap = Object.fromEntries(sistemas.map(s => [s.id_tipo_de_sistema, s.nombre_tipo_de_sistema]));


    const parametrosMap = parametros.reduce((map, param) => {
      map[param.id_parametro] = {
        nombre_parametro: param.nombre_parametro,
        tipo_dato: param.tipo_dato,
        unidad_medida: unidadesDeMedidaMap[param.unidad_medida] || null,
        nombre_etapa: etapasMap[param.etapa] || null,
        tipo_sistema: sistemasMap[param.sistema_parametro] || null,
      };
      return map;
    }, {});

    const ordenesConNombresYTipo = ordenesCargadas.map(orden => {
      const paramData = parametrosMap[orden.id_param] || {};
      return {
        ...orden.dataValues,
        nombre_parametro: paramData.nombre_parametro || null,
        tipo_dato: paramData.tipo_dato || null,
        nombre_unidad_de_medida: paramData.unidad_medida || null,
        nombre_etapa_de_parametro: paramData.nombre_etapa || null,
        tipo_sistema: paramData.tipo_sistema || null,
      };
    });

    return res.status(200).json({
      mensaje: "OrdenesTrabajo",
      ordenesCargadas: ordenesConNombresYTipo,
      firma: objOrdenT.firma ? objOrdenT.firma : null,
      aclaracion:objOrdenT.aclaracion ? objOrdenT.aclaracion:null,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Error al devolver la lista de Ordenes de trabajo Cargadas por id: " + error.message,
    });
  }
};


const getLimits = async (req, res) => {
  try {
    const { id_parametro_tango, idequipo } = req.params; // Obtener parámetros de la ruta
    const pool = await getPool(); // Esperar a obtener el pool de conexiones

    // Realizar la consulta a la base de datos
    const limits = await pool.request()
      .input('id_parametro_tango', id_parametro_tango) // Asegúrate de usar el tipo correcto
      .input('idequipo',  idequipo) // Asegúrate de usar el tipo correcto
      .query('SELECT d_val_ref, d_lim_sup, d_lim_inf FROM dbo.CZAS53_DMD_SAT WHERE id_atr_cp = @id_parametro_tango AND cod_per_cp = @idequipo');

    // Verificar si se encontraron límites
    if (limits.recordset.length > 0) {
      res.status(200).json(limits.recordset[0]); // Devolver el primer resultado encontrado
    } else {
      res.status(404).json({ error: `No se encontraron límites para el id_parametro_tango ${id_parametro_tango} y equipo ${idequipo}.` });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error inesperado: ' + error.message });
  }
};



module.exports = {
  CrateLoadedOrders,
  DeleteLoadedOrders,
  UpdateLoadedOrders,
  ListColumn,
  ListLoadedOrders,
  ReceiveParamsandCreateLoadedOrders,
  TableOtCargadas,
  ListLoadedOrdersByIdot,
  CreatePDF,
  getLimits
};







