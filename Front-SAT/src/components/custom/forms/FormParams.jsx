import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "../../shadcn/button";
import { Input } from "../../shadcn/input";
import { Label } from "../../shadcn/label";
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAxiosInstance } from "../../../axiosInstance";
import CustomToast from '../CustomToast';
import { useToast } from '../../../hooks/use-toast';
import SignatureCanvas from "react-signature-canvas";
import { LoadingSpinner } from "../Spinner";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';







function FormParametros() {

  const [parametros, setParametros] = useState([]);
  const [valores, setValores] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSendButtonDisabled, setIsSendButtonDisabled] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [formSent, setFormSent] = useState(false);
  const { toast, showToast } = useToast();
  const [signature, setSignature] = useState('');
  const signatureRef = useRef();
  const { id, estado, idequipo } = useParams();
 
  const location = useLocation();
  const axiosInstance = useAxiosInstance();
  const navigate = useNavigate();
  const { formData } = location.state || {};
  const boolOptions = ["No Ok", "Ok"];
  let idlocalStorageOrden = id;




  /**
 * Efecto que se ejecuta al cambiar `formData`. 
 * Este efecto procesa los datos cargados, establece los parámetros y valores iniciales en el estado,
 * y carga la firma en el canvas si está disponible.
 * 
 * - Si `formData` contiene `ordenesCargadas`, se utiliza esa información. 
 * - Se inicializan los valores a partir de `dataToProcess` y se actualizan las observaciones y la firma.
 * - Habilita el botón de envío si hay datos válidos.
 * 
 * @returns {void}
 */
  useEffect(() => {
   if (formData) {
    const dataToProcess = formData.ordenesCargadas || formData.data;
    const firma = formData.firma;
    const cliente = formData.cliente;
    const aclaracion = formData.aclaracion;
    

    if (dataToProcess) {
      setParametros(dataToProcess);

      const initialValues = {};
      const data = localStorage.getItem('formularios') ? JSON.parse(localStorage.getItem('formularios')) : [];

      dataToProcess.forEach(field => {

        initialValues[field.id_param] = field.valor_cargado || '';
        initialValues[`observacion-${field.nombre_etapa_de_parametro}`] = field.observaciones || '';
        initialValues['observacion-Generales'] = field.observaciones_generales || '';
        initialValues['firma'] = firma;
        initialValues['aclaracion'] = aclaracion;
        initialValues[field.tipo_sistema] = field.tipo_sistema
        initialValues[`sistema-${field.tipo_sistema}`] = field.tipo_sistema;

        if(!formData.ordenesCargadas)
        {
          setearLocalStorage(data,field,initialValues)
        }

        // Establecer valores de observaciones y firma
        // initialValues[`observacion-${field.nombre_etapa_de_parametro}`] = field.observaciones || '';
        // initialValues['observacion-Generales'] = field.observaciones_generales || '';
        // initialValues['firma'] = firma || '';
        // initialValues['aclaracion'] = aclaracion || '';
      

      });

      setValores(initialValues);
      // Usa setValue para establecer los valores de react-hook-form
      Object.keys(initialValues).forEach((key) => {
        setValue(key, initialValues[key]); // Actualiza los valores del formulario
      });

      setIsSendButtonDisabled(false);
      initialValues['cliente'] = cliente;

      // Cargar la firma en el canvas
      if (firma) {
        signatureRef.current.fromDataURL(firma); // Carga la firma desde el base64
      }
    }
  }
  }, [formData]);




  /**
 * Maneja los cambios en los campos de entrada del formulario.
 * 
 * Esta función actualiza el estado local y el valor del formulario 
 * según el tipo de dato del campo. Si el tipo de dato es booleano, 
 * agrega o elimina opciones en función de si el checkbox está 
 * marcado o desmarcado. Para otros tipos de datos, simplemente 
 * actualiza el valor como cadena.
 * 
 * - `e`: El evento de entrada del formulario.
 * - `id`: El identificador del campo que se está actualizando.
 * - `tipo_dato`: El tipo de dato del campo ('bool' o cualquier otro).
 * 
 * @returns {void}
 */
  const handleInputChange = (e, id, tipo_dato) => {
    let { value, checked } = e.target;
  
    if (tipo_dato === 'bool') {
      // Si el tipo de dato es 'bool', se manejará con checked
      const updatedValue = checked ? value : ''; // Si se marca, guarda el valor, si no, lo vacía
  
      // Actualiza el estado local primero
      setValores((prevValues) => ({
        ...prevValues,
        [id]: updatedValue,
      }));
  
      // Actualiza el valor en el formulario usando setValue
      setValue(id, updatedValue, { shouldValidate: true }); // Asegura que el formulario se valide después de actualizar
    } else {
      // Si el tipo de dato no es 'bool', convierte el valor a cadena
      const newValue = value.toString();
  
      // Actualiza el estado local
      setValores((prevValues) => ({
        ...prevValues,
        [id]: newValue,
      }));
  
      // Actualiza el valor en el formulario
      setValue(id, newValue, { shouldValidate: true }); // Asegura que el formulario se valide
    }

    setTimeout(() => {
     let encontrado = false;
     let objetosGenerales = [];
      const objetos = {
        idequipo:idequipo,
        ideorden:idlocalStorageOrden,
        form:getValues()
      }
      const data = localStorage.getItem('formularios');
      if(Array.isArray(JSON.parse(data)))
      {
          objetosGenerales = JSON.parse(data).map(obj=>{
          if(obj.ideorden == idlocalStorageOrden && obj.idequipo == idequipo)
          {
            obj = objetos;
            encontrado = true;
          }
          return obj;
        })
      }
      if(!encontrado)
      {
        objetosGenerales.push(objetos)
      }
      localStorage.setItem('formularios', JSON.stringify(objetosGenerales))
    });
  };
  
  
  


  /*const newValue = Array.isArray(value) ? value.join(', ') : value;
setValores((prevValues) => ({
  ...prevValues,
  [id]: newValue,
}));
setValue(id, newValue);*/


  /**
   * Maneja la captura de la firma del canvas.
   * 
   * Esta función obtiene la firma del elemento canvas referenciado 
   * y la convierte en una cadena base64 en formato PNG. Luego, 
   * actualiza el estado de la firma con esta representación base64.
   * 
   * @returns {void}
   */
  const handleSignature = () => {
    setSignature(signatureRef.current.getTrimmedCanvas().toDataURL('image/png')); // Captura la firma como base64
  };

  /**
 * Hook que configura un temporizador para actualizar el tiempo transcurrido.
 * 
 * Este efecto se ejecuta una vez al montar el componente y establece un
 * intervalo que incrementa el estado `timeElapsed` cada segundo. Al 
 * desmontar el componente, se limpia el intervalo para evitar fugas de memoria.
 * 
 * @returns {void}
 */
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { control, formState: { errors }, handleSubmit, reset, setValue, getValues } = useForm({
    mode: "onChange",
  });


  /**
 * Formatea un número de segundos en una cadena de tiempo en formato HH:MM:SS.
 * 
 * @param {number} seconds - El número total de segundos a formatear.
 * @returns {string} - Una cadena que representa el tiempo en formato HH:MM:SS.
 * 
 * Esta función convierte los segundos en horas, minutos y segundos, 
 * asegurándose de que cada componente tenga dos dígitos, incluso si 
 * es menor a 10. El resultado se devuelve como una cadena en el formato 
 * deseado.
 */
  const formatTime = (seconds) => {
    const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${secs}`;
  };

  /**
 * Maneja el envío del formulario y realiza la lógica necesaria para 
 * procesar y enviar los datos a la API.
 * 
 * Esta función:
 * 1. Muestra un mensaje de éxito cuando el formulario es enviado.
 * 2. Prepara los datos generales (observaciones, firma y correo) 
 *    en un objeto separado.
 * 3. Mantiene el resto de los parámetros en un array, asegurándose 
 *    de no duplicar los datos generales.
 * 4. Crea un payload que contiene tanto los datos enviados como 
 *    los datos generales.
 * 5. Envía los datos a la API utilizando axios, con diferentes 
 *    rutas dependiendo del estado.
 * 6. Maneja la respuesta, reinicia el formulario, y navega a otra 
 *    ruta si el envío es exitoso.
 * 7. Muestra mensajes de error en caso de que falle el envío.
 * 
 * @returns {Promise<void>} - No retorna un valor, pero actualiza el estado 
 *    del componente y maneja el envío de datos.
 */
  const onSubmit = async () => {
    showToast('Formulario enviado exitosamente.', 'success', { duration: 2000 });

    // Separamos firma, mail y observaciones generales en un objeto independiente
    const datosGenerales = {
      observaciones_generales: valores[`observacion-Generales`] || '',
      firma: signature,
      mail: valores[`mail`] || '',
      cliente: valores.cliente || '',
      aclaracion: valores[`aclaracion`] || '',
    };

    // Mantenemos el resto de los parámetros en un array sin duplicar los datos generales
    const datosEnviados = parametros.map((field) => ({
      id_ot: parseInt(id, 10) || 1,
      id_param: field.id_param,
      nombre_parametro: field.nombre_parametro,
      nombre_etapa_de_parametro: field.nombre_etapa_de_parametro,
      nombre_unidad_de_medida: field.nombre_unidad_de_medida,
      tipo_dato: field.tipo_dato,
      valor_cargado: Array.isArray(valores[field.id_param]) ? valores[field.id_param].join(', ') : valores[field.id_param] || '', // Usa id_param
      idequipo: idequipo,
      observaciones: valores[`observacion-${field.nombre_etapa_de_parametro}`] || '',
      tiempo_transcurrido: formatTime(timeElapsed),
      sistema_parametro: field.sistema_parametro,
      id_parametro_tango: field.id_parametro_tango
    }));

    // Creación del payload donde solo se envían los datosGenerales una vez
    const payload = {
      datosEnviados,
      datosGenerales
    };
    console.log(payload);
    try {
      setIsLoading(true);
      let response;

      if (estado === "pendiente") {
        response = await axiosInstance.post("/ordenesCargadas/receiveAndCreateOrder", payload, {
          headers: { 'Content-Type': 'application/json' },
        });
      } else if (estado === "realizada") {
        response = await axiosInstance.post("/ordenesCargadas/modificar", payload, {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (response.status === 200) {
        console.log("hola");
        reset();
        setParametros([]);
        setValores({});
        setIsSendButtonDisabled(true);
        setFormSent(true); // Se marca el formulario como enviado
        showToast('Formulario enviado exitosamente.', 'success', { duration: 2000 });
        setTimeout(() => {
          navigate("/OTasignUsers");
        }, 400);
      } else {
        showToast('No se pudo enviar el formulario.', 'error');
      }
    } catch (error) {
      if (error.response) {

        const errorMessage = error.response.data?.message || 'Error en el servidor';
        showToast(`Error ${error.response.status}: ${errorMessage}`);
      } else {
        showToast(`${error}, 'error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const groupedParametros = parametros.reduce((acc, field) => {
    // Agrupar por etapa
    if (!acc[field.nombre_etapa_de_parametro]) {
      acc[field.nombre_etapa_de_parametro] = {};
    }
  
    // Agrupar por nombre_tipo_de_sistema dentro de cada etapa
    if (!acc[field.nombre_etapa_de_parametro][field.nombre_tipo_de_sistema || field.tipo_sistema]) {
      acc[field.nombre_etapa_de_parametro][field.nombre_tipo_de_sistema || field.tipo_sistema] = [];
    }
  
    // Convertir id_param a string para evitar conflictos con react-hook-form
    acc[field.nombre_etapa_de_parametro][field.nombre_tipo_de_sistema || field.tipo_sistema].push({
      ...field,
      id_param: field.id_param.toString(), // Convertir a string aquí
    });
  
    return acc;
  }, {});


  const etapaOrder = [
    "Revision antes de la puesta en marcha",
    "Revision durante el funcionamiento",
    "Resultados finales del ensayo"
  ];

  

  const setearLocalStorage = async (data,field,initialValues)=>{
         data.map(obj=>{
        if(obj.ideorden == idlocalStorageOrden && obj.idequipo == idequipo)
        {
        Object.entries(obj.form).forEach(([key, value]) => {
        if (field.id_param == key) {
          initialValues[field.id_param] = value;
        }
        if (key.toString() == 'aclaracion') {
          initialValues['aclaracion'] = value;
        }
        if (key.toString() == `observacion-Generales`) {
          initialValues[`observacion-Generales`] = value;
        }
        if (key.toString() == `observacion-${field.nombre_etapa_de_parametro}`) {
          initialValues[`observacion-${field.nombre_etapa_de_parametro}`] = value;
        }
      });
    }
     })
  }
  

  return (
    <div className="flex items-center justify-center p-8 bg-gray-100 min-h-screen">
      <CustomToast message={toast.message} type={toast.type} />
  
      {!formSent ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-8 rounded-xl shadow-lg space-y-6 w-full max-w-lg"
        >
          {etapaOrder.map((etapa) => {
            // Verifica si la etapa existe en groupedParametros
            if (!groupedParametros[etapa]) return null;
  
            return (
              <div key={etapa}>
                <h2 className="text-2xl font-semibold mb-6 text-center text-gray-700">
                  {etapa}
                </h2>
  
                {/* Subagrupación por sistema_parametro */}
                {Object.keys(groupedParametros[etapa]).map((sistema) => (
                  <div
                    key={sistema}
                    className="bg-gray-200 p-4 rounded-lg mb-4 shadow-sm border border-gray-300"
                  >
                    <h3 className="text-xl font-semibold mb-4 text-center text-gray-600">
                    {sistema}
                    </h3>
                    {groupedParametros[etapa][sistema].map((field) => (
                      <div key={field.id_param} className="mb-6">
                        <Label
                          htmlFor={field.id_param}
                          className="block text-sm font-medium text-gray-600 mb-2 text-center"
                        >
                          {field.nombre_parametro}
                        </Label>
                        <Controller
                          name={field.id_param}
                          control={control}
                          rules={{
                            required: `${field.nombre_parametro} es obligatorio`,
                          }}
                          render={({ field: inputField }) => {
                            if (field.tipo_dato === "num") {
                              return (
                                <div className="relative">
                                  <Input
                                    id={field.id_param}
                                    type="number"
                                    className="mt-1 p-3 pr-16 border border-gray-300 rounded-lg w-full focus:ring-indigo-500 focus:border-indigo-500 transition bg-gray-150"
                                    {...inputField}
                                    value={valores[field.id_param] || ""}
                                    onChange={(e) =>
                                      handleInputChange(e, field.id_param, "num")
                                    }
                                  />
                                  {field.nombre_unidad_de_medida && (
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                                      {field.nombre_unidad_de_medida}
                                    </span>
                                  )}
                                </div>
                              );
                            } else if (field.tipo_dato === "string") {
                              return (
                                <Input
                                  id={field.id_param}
                                  type="text"
                                  className="mt-1 p-3 border border-gray-300 rounded-lg w-full focus:ring-indigo-500 focus:border-indigo-500 transition bg-gray-150"
                                  {...inputField}
                                  value={valores[field.id_param] || ""}
                                  onChange={(e) =>
                                    handleInputChange(e, field.id_param, "string")
                                  }
                                  maxLength={50}
                                />
                              );
                            } else if (field.tipo_dato === "bool") {
                              return (
                                <div className="mt-2">
                                  {boolOptions.map((option) => (
                                    <div
                                      key={option}
                                      className="flex items-center space-x-2"
                                    >
                                      <Input
                                        type="radio"
                                        id={`${field.id_param}-${option}`}
                                        name={field.id_param}
                                        value={option}
                                        className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 transition bg-gray-150"
                                        checked={valores[field.id_param] === option}
                                        onChange={(e) =>
                                          handleInputChange(e, field.id_param, "bool")
                                        }
                                      />
                                      <Label
                                        htmlFor={`${field.id_param}-${option}`}
                                        className="text-sm font-medium text-gray-700"
                                      >
                                        {option}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              );
                            }
                          }}
                        />
                        {errors[field.id_param] && (
                          <p className="text-red-500 text-sm">
                            {errors[field.id_param]?.message}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
  
                <div className="mt-6">
                  <Label
                    htmlFor={`observacion-${etapa}`}
                    className="block text-sm font-medium text-gray-600 mb-2 text-center"
                  >
                    Observaciones {etapa}:
                  </Label>
                  <Input
                    id={`observacion-${etapa}`}
                    type="text"
                    className="mt-1 p-3 border border-gray-300 rounded-lg w-full focus:ring-indigo-500 focus:border-indigo-500 transition"
                    value={valores[`observacion-${etapa}`] || ""}
                    onChange={(e) =>
                      handleInputChange(e, `observacion-${etapa}`, "string")
                    }
                    maxLength={50}
                  />
                </div>
              </div>
            );
          })}
  
          <hr className="my-5 border-0 h-0.5 bg-black shadow-lg" />
          <div className="mt-6">
            <Label
              htmlFor="observacion-Generales"
              className="block text-sm font-medium text-gray-600 mb-2 text-center"
            >
              Observaciones Generales:
            </Label>
            <Input
              id="observacion-Generales"
              type="text"
              className="mt-1 p-3 border border-gray-300 rounded-lg w-full focus:ring-indigo-500 focus:border-indigo-500 transition"
              value={valores["observacion-Generales"] || ""}
              onChange={(e) =>
                handleInputChange(e, "observacion-Generales", "string")
              }
              maxLength={200}
            />
            <Label
              htmlFor="mail"
              className="block text-sm font-medium text-gray-600 mb-2 text-center"
            >
              Mail:
            </Label>
            <Input
              id="mail"
              type="email"
              className="mt-1 p-3 border border-gray-300 rounded-lg w-full focus:ring-indigo-500 focus:border-indigo-500 transition"
              value={valores["mail"] || ""}
              onChange={(e) => handleInputChange(e, "mail", "string")}
              required
            />
          </div>
  
          <div className="mb-6">
            <Label
              htmlFor="firma"
              className="block text-sm font-medium text-gray-600 mb-2 text-center"
            >
              Firma del Cliente:
            </Label>
            <SignatureCanvas
              ref={signatureRef}
              penColor="black"
              canvasProps={{
                className: "border border-gray-300 rounded-lg w-full h-40 md:h-52",
                width: 400,
                height: 200,
              }}
              onEnd={handleSignature}
            />
            <span
              onClick={() => {
                signatureRef.current.clear();
                setSignature('');
              }}
              className="mt-2 inline-block text-sm text-sky-900 cursor-pointer hover:underline"
            >
              Limpiar Firma
            </span>
          </div>
  
          <div className="mb-6">
            <Label
              htmlFor="aclaracion"
              className="block text-sm font-medium text-gray-600 mb-2 text-center"
            >
              Aclaración del Cliente:
            </Label>
            <Input
              id="aclaracion"
              type="text"
              className="mt-1 p-3 border border-gray-300 rounded-lg w-full focus:ring-indigo-500 focus:border-indigo-500 transition"
              value={valores['aclaracion'] || ''}
              onChange={(e) => handleInputChange(e, 'aclaracion', 'string')}
              maxLength={200}
              required
            />
          </div>
  
          <div className="mt-6 flex justify-between items-center">
            <Button
              type="submit"
              className="bg-sky-900 hover:bg-sky-950 text-white p-3 rounded-lg w-full"
            >
              {isLoading ? 'Enviando...' : 'Enviar'}
            </Button>
            <p className="text-sm text-gray-500 text-center">{`Tiempo transcurrido: ${formatTime(timeElapsed)}`}</p>
          </div>
        </form>
      ) : (
        <div className="flex justify-center items-center h-32">
          <LoadingSpinner size="150px" className="w-8 h-8 text-blue-600" />
        </div>
      )}
    </div>
  );
  
  
}


export default FormParametros;