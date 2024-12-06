// utils/helpers.js

/**
 * Formatea segundos en formato HH:MM:SS
 * @param {number} seconds - Número total de segundos
 * @returns {string} Tiempo formateado como "HH:MM:SS"
 */
export const formatTime = (seconds) => {
    const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${secs}`;
  };
  
  /**
   * Valida un email usando una expresión regular
   * @param {string} email - Email a validar 
   * @returns {boolean} true si el email es válido, false si no
   */
  export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  /**
   * Procesa los datos iniciales del formulario
   * @param {Array} dataToProcess - Datos a procesar
   * @param {Object} formData - Datos del formulario
   * @returns {Object} Valores iniciales procesados
   */
  export const processInitialFormData = (dataToProcess, formData) => {
    const initialValues = {};
    
    dataToProcess.forEach(field => {
      initialValues[field.nombre_parametro] = field.valor_cargado;
      initialValues[`observacion-${field.nombre_etapa_de_parametro}`] = field.observaciones || '';
      initialValues['observacion-Generales'] = field.observaciones_generales || '';
      initialValues['firma'] = formData.firma;
      initialValues['aclaracion'] = formData.aclaracion;
      initialValues['cliente'] = formData.cliente;
    });
  
    return initialValues;
  };
  
  /**
   * Crea el payload para enviar al servidor
   * @param {Object} valores - Valores del formulario
   * @param {Array} parametros - Parámetros del formulario
   * @param {string} signature - Firma en base64
   * @param {number} timeElapsed - Tiempo transcurrido
   * @param {string|number} id - ID de la orden
   * @param {string|number} idequipo - ID del equipo
   * @returns {Object} Payload formateado para el servidor
   */
  export const createFormPayload = (valores, parametros, signature, timeElapsed, id, idequipo) => {
    const datosGenerales = {
      observaciones_generales: valores['observacion-Generales'] || '',
      firma: signature,
      mail: valores['mail'] || '',
      cliente: valores['cliente'] || '',
      aclaracion: valores['aclaracion'] || '',
    };
  
    const datosEnviados = parametros.map((field) => ({
      id_ot: parseInt(id, 10) || 1,
      id_param: field.id_param,
      nombre_parametro: field.nombre_parametro,
      nombre_etapa_de_parametro: field.nombre_etapa_de_parametro,
      nombre_unidad_de_medida: field.nombre_unidad_de_medida,
      tipo_dato: field.tipo_dato,
      valor_cargado: Array.isArray(valores[field.nombre_parametro]) 
        ? valores[field.nombre_parametro].join(', ') 
        : valores[field.nombre_parametro] || '',
      idequipo,
      observaciones: valores[`observacion-${field.nombre_etapa_de_parametro}`] || '',
      tiempo_transcurrido: formatTime(timeElapsed),
      sistema_parametro: field.sistema_parametro,
      id_parametro_tango: field.id_parametro_tango
    }));
  
    return {
      datosEnviados,
      datosGenerales
    };
  };
  
  /**
   * Maneja errores de envío del formulario
   * @param {Error} error - Error capturado
   * @param {Function} showToast - Función para mostrar notificaciones
   */
  export const handleSubmissionError = (error, showToast) => {
    if (error.response) {
      const errorMessage = error.response.data?.message || 'Error en el servidor';
      showToast(`Error ${error.response.status}: ${errorMessage}`, 'error');
    } else {
      showToast(`Error: ${error.message}`, 'error');
    }
  };
  
  /**
   * Valida un número dentro de un rango
   * @param {number} value - Valor a validar
   * @param {number} min - Valor mínimo
   * @param {number} max - Valor máximo
   * @returns {boolean} true si el valor está dentro del rango
   */
  export const validateNumberInRange = (value, min, max) => {
    const num = Number(value);
    return !isNaN(num) && num >= min && num <= max;
  };
  
  /**
   * Limpia y sanitiza un string para evitar XSS
   * @param {string} str - String a sanitizar
   * @returns {string} String sanitizado
   */
  export const sanitizeString = (str) => {
    if (!str) return '';
    return str
      .replace(/[<>]/g, '') // Remueve < y >
      .trim();
  };
  
  /**
   * Valida un archivo por tipo y tamaño
   * @param {File} file - Archivo a validar
   * @param {Array} allowedTypes - Tipos MIME permitidos
   * @param {number} maxSize - Tamaño máximo en bytes
   * @returns {boolean} true si el archivo es válido
   */
  export const validateFile = (file, allowedTypes, maxSize) => {
    if (!file) return false;
    return allowedTypes.includes(file.type) && file.size <= maxSize;
  };