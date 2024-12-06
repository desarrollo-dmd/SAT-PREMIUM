import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/shadcn/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, } from "@/components/shadcn/dialog";
import { MoreHorizontal } from "lucide-react";
import { Button } from "../../shadcn/button";
import { Input } from "../../shadcn/input";
import { Select, SelectTrigger, SelectContent, SelectItem } from "../../shadcn/select";
import { useState } from "react";
import { useAxiosInstance } from '../../../axiosInstance';
import CustomToast from '../CustomToast';
import { useToast } from '../../../hooks/use-toast';
import { TruthTable } from "./TruthTable";
import { z } from "zod";
import { PlusIcon } from '@heroicons/react/24/outline';
import { PencilIcon } from '@heroicons/react/24/outline';
import { TrashIcon } from '@heroicons/react/24/outline';
import { schemaOrders, schemaUsers, schemaParams, hasAtLeastOneTrue, schemaGenerico } from '../../../schemas/validationSchemas';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate
import { useEffect } from 'react';





export default function DropDownMenuTable({ onAdd, onEdit, onDelete, row, entity, fields, labels, hideAddOption, hideEditOption, hideDeleteOption }) {
  const [entityOrdenes, setentityOrdenes] = useState(entity == 'ordenes' ? true : false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [ValorEdit, setValorEdit] = useState(null);
  const [id_Etapa_parametro, setIdEliminar] = useState(null);
  const [ruta, setRuta] = useState(null);
  const [dialogDelete, setIsDialogDelete] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(null);
  const [method, setMethod] = useState(false);
  const [nombreGenerico, setNombreGenerico] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [fetchDeOrden, setFetchedOrden] = useState(null);
  const [isFetchSuccessful, setIsFetchSuccessful] = useState(false);



  const axiosInstance = useAxiosInstance();
  const { toast, showToast } = useToast();
  const [responsibleOptions, setResponsibleOptions] = useState([]);
  const [referencia, setReferencia] = useState([]);
  const [serviceOptions, setTipoServicioOptions] = useState([]);
  const [equipoOptions, setTipoEquipoOptions] = useState([]);
  const [sistemaOptions, setTipoSistemaOptions] = useState([]);
  const [unidadMedidaOptions, setTipoUnidadMedidaOptions] = useState([]);
  const [stagesOptions, setStagesOptions] = useState([]);
  const [fetchServices, setFetchServices] = useState([]);
  const [truthTable, setTruthTable] = useState([]);
  const [errors, setErrors] = useState({});
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '' });
  const [validationMessage, setValidationMessage] = useState('');
  const [dialogMessage, setDialogMessage] = useState("");
  const [tituloOptions, setTituloOptions] = useState([]); // Define el estado de tituloOptions
  const [isEditing, setIsEditing] = useState(false);
  const filteredFields = fields.filter((field) => {
    // Excluir 'autorizacionSAT' cuando no estamos en modo edición (es decir, cuando estamos creando)
    if (!isEditing && field === "autorizacionSAT") return false;

    return ![
      "id", "fecha_subida", "estado", "aprobado", "date", "fecha", "OrdenNumero",
      "archivo", "firma", "id_parametro", "id_parametro_tango",
      "nombre_parametro", "aclaracion", "numOrden", "tipo_servicio",
      "tipo_equipo", "autorizacionTDB", "autorizacionControlDeHoras",
      "autorizacionVariadores"
    ].includes(field);
  });
  const [editData, setEditData] = useState(filteredFields.reduce((acc, field) => ({ ...acc, [field]: '' }), {}));
  const [newEntityData, setNewEntityData] = useState(filteredFields.reduce((acc, field) => ({ ...acc, [field]: '' }), {}));
  const navigate = useNavigate();
  const [IsServiceDialogOpen, setisServiceDialogOpen] = useState("");


  /**
 * Maneja el envío de datos para crear un nuevo parámetro y actualizar la tabla de verdad.
 * 
 * @param {Array} data - Datos actuales de la tabla de verdad que se van a actualizar.
 */
  const handleDataSubmit = (data) => {
    // Crea un nuevo objeto para newEntityData
    const parameterData = {
      nombre_parametro: newEntityData.nombre_parametro,
      tipo_dato: newEntityData.tipo_dato,
      unidad_medida: newEntityData.unidad_medida,
      sistema_parametro: newEntityData.sistema_parametro,
      etapa: newEntityData.etapa
    };

    // Combina parameterData con los datos de la tabla de verdad
    const combinedData = [parameterData, ...data];

    setTruthTable(combinedData);
  };

  /**
   * Maneja el evento de clic en un ícono, configurando los estados necesarios 
   * para mostrar un diálogo de confirmación de eliminación.
   * 
   * @param {string} referencia - Referencia del elemento relacionado con el clic.
   * @param {string} ruta - Ruta asociada al elemento.
   * @param {string} message - Mensaje a mostrar en el diálogo.
   * @param {Object} obj - Objeto que contiene información del elemento a eliminar.
   * @param {Event} event - El evento del clic.
   */
  const handleIconClick = (referencia, ruta, message, obj, event) => {
    setReferencia(() => referencia);
    setIdEliminar(obj.id)
    event.stopPropagation();
    setDialogMessage(message)
    setRuta(ruta)
    setIsDialogDelete(true);
  };

  /**
 * Maneja el evento de clic en un ícono para modificar un elemento, 
 * configurando los estados necesarios para abrir un diálogo de edición.
 * 
 * @param {string} referencia - Referencia del elemento relacionado con el clic.
 * @param {string} ruta - Ruta asociada al elemento.
 * @param {string} message - Mensaje a mostrar en el diálogo.
 * @param {Object} obj - Objeto que contiene información del elemento a modificar.
 * @param {string} nombreGenrico - Nombre genérico para establecer en el estado.
 * @param {Event} event - El evento del clic.
 */
  const handleIconClickModificar = (referencia, ruta, message, obj, nombreGenrico, event) => {
    setNombreGenerico(nombreGenrico)
    setReferencia(() => referencia);
    setRuta(ruta)
    formData.name = '';
    setValorEdit(obj ? obj.label : '');
    setIdEliminar(obj ? obj.id : null);
    event.stopPropagation();
    setDialogMessage(message);
    if (obj) {
      setRuta(ruta + obj.id);
      setMethod('put')
    }
    else {
      setMethod('post')
    }
    setIsFormDialogOpen(true);
  }

  // Opciones para el rol
  const roles = [
    { value: 'admin', label: 'Administrador' },
    { value: 'usuario', label: 'Usuario' },
  ];
  const tipoDatoOptions = [
    { value: 'num', label: 'Número' },
    { value: 'string', label: 'Alfanumerico' },
    { value: 'bool', label: 'SI/NO' },
  ];

  /**
   * Recupera datos de una API y configura las opciones en el estado.
   * 
   * @param {string} url - La URL de la API desde donde se obtendrán los datos.
   * @param {Function} setOptions - Función para actualizar las opciones en el estado.
   * @param {string} dataKey - Clave en la respuesta de la API que contiene los datos.
   * @param {string} valueKey - Clave que se usará como valor en las opciones.
   * @param {string} labelKey - Clave que se usará como etiqueta en las opciones.
   * @param {string} errorMessage - Mensaje para mostrar en caso de error.
   * @param {string} idKey - Clave que se usará para el ID del elemento.
   */
  const fetchData = async (url, setOptions, dataKey, valueKey, labelKey, errorMessage, idKey) => {
    try {
      const response = await axiosInstance.get(url);

      if (response.data && response.data[dataKey]) {
        setOptions(response.data[dataKey].map(item => ({
          value: item[valueKey],
          label: item[labelKey],
          id: item[idKey]
        })));
      }
    } catch (error) {
      console.error(`Error al obtener ${errorMessage}:`, error);
      setIsAddDialogOpen(false);
      showToast(`Error al cargar ${errorMessage}. Inténtalo de nuevo más tarde.`, 'error');
    }
  };
  const BorrarRelacionDoc = async (obj) => {

    const response = await axiosInstance.delete(`/fetchServices/Delete`, { params: { obj } });
    await fetchTangoServices();

  }
  const fetchDataTango = async (url) => {
    const response = await axiosInstance.get(url);
    const array = await compararTango(response.data.message.recordset);
    setFetchServices(array.map(item => {
      return item
    }))

  }
  const compararTango = async (arra) => {
    const response = await axiosInstance.get('/ordenes/comparar', { params: { arra } });

    return response.data.objetos;
  }
  const setDocumenFetch = async (url, obj) => {
    try {
      const response = await axiosInstance.post(url,
        {
          ServicioLocal: newEntityData.tipoServicioLocal,
          ServicioTango: obj
        }
      );
      if (response) {
        showToast("Alta exitosa", 'success');
      }
    } catch (error) {
      showToast(error.response.data.error.name, error);
    }


  }

  // Usar la función genérica con las configuraciones específicas
  const fetchResponsibleOptions = () =>
    fetchData('/usuarios/obtenerTecnicos?rol=usuario', setResponsibleOptions, 'usuariosFiltrados', 'usuario', 'usuario', 'los técnicos');

  const fetchTiposDeServicio = () =>
    fetchData('/documentos/obtenerDocumentos', setTipoServicioOptions, 'documentos', 'nombre_documento', 'nombre_documento', 'los tipos de servicio', 'id_documento');

  const fetchTiposDeEquipo = () =>
    fetchData('/tiposDeEquipo/obtenerTipoEquipo', setTipoEquipoOptions, 'tiposDeEquipo', 'nombre_tipo_equipo', 'nombre_tipo_equipo', 'los tipos de equipo', 'id_tipo_equipo');

  const fetchTiposDeSistemas = () =>
    fetchData('/tiposDeSistema/obtenerTipoSistema', setTipoSistemaOptions, 'tiposDeSistema', 'nombre_tipo_de_sistema', 'nombre_tipo_de_sistema', 'los tipos de sistemas', 'id_tipo_de_sistema');

  const fetchUnidadesDeMedida = () =>
    fetchData('/tiposDeUnidades/obtenerTipoUnidadesDeMedida', setTipoUnidadMedidaOptions, 'tiposDeUnidades', 'nombre_unidad_de_medida', 'nombre_unidad_de_medida', 'las unidades de medida', 'id_unidad_de_medida');

  const fetchStagesOptions = () =>
    fetchData('/tiposDeStages/obtenerStages', setStagesOptions, 'tiposDeEstadosDeParametro', 'nombre_etapa_de_parametro', 'nombre_etapa_de_parametro', 'las etapas', 'id_etapa_de_parametro');

  const fetchdocumentFetch = (obj) =>
    setDocumenFetch('/fetchServices/crear', obj);

  const fetchTangoServices = () =>
    fetchDataTango('/ordenes/fetchServices', setFetchServices);
  /**
   * Maneja el clic en el botón de edición, configurando los datos a editar 
   * y abriendo el diálogo de edición correspondiente.
   */
  const handleEditClick = () => {
    // Primero actualizas el estado de edición
    setIsEditing(true);

    // Llamas a un useEffect para que se ejecute cuando `isEditing` cambie
    // Es importante usar `useEffect` para que el filtro se ejecute después de que `isEditing` cambie.

    setIsEditDialogOpen(true);
    if (entity === 'parametros') {
      fetchTiposDeSistemas();
      fetchUnidadesDeMedida();
      fetchStagesOptions();
    } else if (entity === 'ordenes') {
      fetchResponsibleOptions();
      fetchTiposDeServicio();
      fetchTiposDeEquipo();
    }
  };

  // useEffect para ejecutar el filtro después de que `isEditing` cambie
  useEffect(() => {
    if (isEditing) {
      const data = filteredFields.reduce((acc, field) => {

        if (field === 'password') {
          setPasswordSaved(row[field]);
          return { ...acc, [field]: '********' };
        }
        return { ...acc, [field]: row[field] };
      }, {});
      setEditData(data);

    }
  }, [isEditing]); // Este efecto solo se ejecutará cuando `isEditing` cambie a `true`


  /**
 * Maneja el clic en el botón de añadir, configurando los datos de la nueva 
 * entidad y abriendo el diálogo de adición correspondiente.
 */
  const handleAddClick = () => {
    setNewEntityData(filteredFields.reduce((acc, field) => ({ ...acc, [field]: '' }), {}));
    setIsAddDialogOpen(true);
    if (entity == 'ordenes') {

      fetchResponsibleOptions();
      fetchTiposDeServicio();
      fetchTiposDeEquipo();
    }
    else if (entity == 'parametros') {
      fetchTiposDeSistemas();
      fetchUnidadesDeMedida();
      fetchStagesOptions();

    }

  };

  /**
 * Maneja los cambios en los campos del formulario de edición, actualizando 
 * el estado con los nuevos valores.
 * 
 * @param {Event} e - El evento del cambio en el campo del formulario.
 */
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));

  };

  const fetchOrdenParams = async (sistema_parametro, etapa) => {
    try {
      const response = await axiosInstance.post('/parametros/filtrarParamsPorSistemaYEtapa', {
        sistema_parametro,
        etapa
      });

      if (response.data) {
        setFetchedOrden(response.data);  // Guarda la respuesta en el estado

        // Actualiza el estado de éxito
        setIsFetchSuccessful(true);
      }
    } catch (error) {
      console.error('Error al obtener datos:', error);
      showToast("Error al obtener datos desde la API", 'error');
      setIsFetchSuccessful(false);  // En caso de error, setear el estado como falso
    }
  };

  useEffect(() => {
  }, [isFetchSuccessful]);

  // const handleRedirection = () => {
  //   if (fetchDeOrden) {
  //     console.log(fetchDeOrden.data)
  //     navigate('/ordenar-parametros', { state: { paramsData: fetchDeOrden.data,sistema:editData.sistema_parametro } });
  //   }
  // };

  const handleRedirection = () => {
    if (fetchDeOrden) {
      navigate('/Drag', { state: { paramsData: fetchDeOrden.data , sistema:editData.sistema_parametro} });
    }
  };



  useEffect(() => {
    // Solo hacer la consulta cuando ambos valores estén definidos
    if (editData.sistema_parametro && editData.etapa) {
      fetchOrdenParams(editData.sistema_parametro, editData.etapa);
    }
  }, [editData.sistema_parametro, editData.etapa]); //

  /**
 * Maneja los cambios en los campos del formulario para una nueva entidad,
 * normalizando el valor del campo 'usuario' a minúsculas y actualizando 
 * el estado con los nuevos valores.
 * 
 * @param {Event} e - El evento del cambio en el campo del formulario.
 */
  const handleNewEntityChange = (e) => {
    if (e.target.id == 'usuario') {
      const lowerCaseValue = e.target.value.toLowerCase();
      e.target.value = lowerCaseValue;
    }
    const { name, value } = e.target;
    setNewEntityData((prev) => ({ ...prev, [name]: value }));
  };

  const traerServicios = (e) => {
    fetchTangoServices();
    setisServiceDialogOpen(true);
  }

  /**
 * Maneja la lógica para guardar los cambios en la edición de una entidad,
 * validando los datos y llamando a la función de edición correspondiente.
 */
  const handleSaveEdit = async () => {
    setErrors({});

    if (onEdit && row) {
      const id = row.id !== undefined ? row.id : row.id_ot !== undefined ? row.id_ot : row.id_parametro;

      const nombreParametro = row.nombre_parametro !== undefined ? row.nombre_parametro : row.nombre_ot !== undefined ? row.nombre_ot : row.nombre_parametro_default;
      let updatedData = { ...editData, id, nombre_parametro: nombreParametro };

      let combinedData = [updatedData, ...truthTable];

      try {
        if (entity === "parametros") {
          if (!hasAtLeastOneTrue(truthTable)) {
            setValidationMessage("No se puede guardar, debe elegir por lo menos una relación.");
            return;
          }
          setValidationMessage("");

          schemaParams.parse(updatedData);
          combinedData.splice(1, 1);
          await onEdit(combinedData);
        } else if (entity === "usuarios") {
          schemaUsers.parse(updatedData);
          if (updatedData.password === "********") {
            updatedData.password = passwordSaved;
          }
          updatedData.id = id;
          await onEdit(updatedData);
        } else if (entity === "ordenes") {
          schemaOrders.parse(updatedData);
          updatedData.id = id;
          await onEdit(updatedData);
        }

        setIsEditDialogOpen(false);
      } catch (error) {
        if (error instanceof z.ZodError) {

          const newErrors = error.errors.reduce((acc, err) => {
            acc[err.path[0]] = err.message;
            return acc;
          }, {});

          setErrors(newErrors);
        } else {
          setIsEditDialogOpen(false);
          showToast("Error al modificar", 'error');
        }
      }
    } else {
      showToast("No se pudo identificar la fila o el método de edición", 'error');
    }
  };

  /**
   * Maneja la lógica para guardar una nueva entidad, validando los datos 
   * y llamando a la función correspondiente para agregar la entidad.
   */
  const handleSaveNewEntity = async () => {
    if (onAdd) {
      try {
        if (entity === "parametros") {
          if (!hasAtLeastOneTrue(truthTable)) {
            setValidationMessage("No se puede guardar, debe elegir por lo menos una relación.");
            return;
          }
          setValidationMessage("");

          const parameterData = {
            nombre_parametro: newEntityData.nombre_parametro,
            tipo_dato: newEntityData.tipo_dato,
            unidad_medida: newEntityData.unidad_medida,
            sistema_parametro: newEntityData.sistema_parametro,
            etapa: newEntityData.etapa
          };
          let data = [parameterData, ...truthTable.slice(1)];
          setTruthTable(data);
          schemaParams.parse(newEntityData);
          await onAdd(data);
        } else if (entity === "usuarios") {
          schemaUsers.parse(newEntityData);
          await onAdd(newEntityData);
        } else if (entity === "ordenes") {
          schemaOrders.parse(newEntityData);
          await onAdd(newEntityData);
        }
        setIsAddDialogOpen(false);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const newErrors = error.errors.reduce((acc, err) => {
            acc[err.path[0]] = err.message;
            return acc;
          }, {});

          setErrors(newErrors);
        } else {
          setIsAddDialogOpen(false);
          showToast("Error al guardar", 'error');
        }
      }
    }
  };

  /**
 * Maneja la lógica para guardar un formulario, validando los datos 
 * y enviándolos a través de Axios.
 */
  const handleSaveForm = async () => {
    try {
      const formDataToValidate = { nombre_Generico: formData.name };
      schemaGenerico.parse(formDataToValidate)
      const response = await axiosInstance[method](`${ruta}`, {
        [nombreGenerico]: formData.name
      });
      if (response.data && (response.status == 200 || response.status == 201)) {
        await referencia();
        setErrors({})
        showToast('Se agrego la etapa correctamente !.', 'success');
      }
      setIsFormDialogOpen(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors = error.errors.reduce((acc, err) => {
          acc[err.path[0]] = err.message;
          return acc;
        }, {});
        setErrors(newErrors);
      } else {
        showToast("Error al modificar", 'error');
      }
    }
  };
  const SaveServices = async (obj) => {
    await fetchdocumentFetch(obj)
    await fetchTangoServices();
  }



  const handleIdequipoChange = async (e) => {
    const idequipoValue = e.target.value;

    if (idequipoValue) {
      try {
        // Realiza la solicitud para obtener cliente y títulos
        const response = await axiosInstance.get(`/ordenes/fetch/${idequipoValue}`);

        if (response.data) {
          const recordset = response.data.message || [];

          if (recordset.length > 0) {
            const { cliente } = recordset[0];

            if (!cliente) { // Verifica si cliente es null o vacío
              showToast("El equipo no tiene asignado un cliente aun", "error");
              clearFields();
              return;
            }

            if (isEditing) {
              setEditData((prev) => ({
                ...prev,
                cliente,
                titulo: "",
                numOrden: ""
              }));
            } else {
              setNewEntityData((prev) => ({
                ...prev,
                cliente,
                titulo: "",
                numOrden: ""
              }));
            }

            // Mapea los títulos y el número de orden correspondiente
            const tituloOptions = recordset.map((item) => ({
              value: item.titulo,
              label: `${item.titulo} - ${item.numeroDeOrden}`,
              numeroDeOrden: item.numeroDeOrden
            }));

            setTituloOptions(tituloOptions);
          } else {
            clearFields();
          }
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || `${error}`;
        showToast(`Error: ${errorMessage}`, 'error');
        clearFields();
      }
    } else {
      clearFields();
    }
  };
  const handleCopy = async () => {
    showToast(`Relaciones copiadas`, 'success');
  }

  const handleTituloChange = async (tituloValue, idequipoValue) => {
    if (tituloValue && idequipoValue) {
      try {
        const response = await axiosInstance.get(`/ordenes/fetchNumOrden/${tituloValue}/${idequipoValue}`);
        if (response.data) {
          const recordset = response.data.message?.recordset || [];
          if (recordset.length > 0) {
            const nOfValue = String(recordset[0].n_of);
            const t_compValue = String(recordset[0].t_comp);
            const tipo_equipoValue = String(recordset[0].tipo_equipo);

            if (isEditing) {
              setEditData((prev) => ({
                ...prev,
                numOrden: nOfValue,
                tipo_servicio: t_compValue,
                tipo_equipo: tipo_equipoValue
              }));
            } else {
              setNewEntityData((prev) => ({
                ...prev,
                numOrden: nOfValue,
                tipo_servicio: t_compValue,
                tipo_equipo: tipo_equipoValue
              }));
            }
          } else {

            clearFields();
          }
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || `${error}`;
        showToast(`Error: ${errorMessage}`, 'error');
        clearFields();
      }
    } else {
      clearFields();
    }
  };

  // Función para limpiar todos los campos
  const clearFields = () => {
    if (isEditing) {
      setEditData({
        cliente: "",
        titulo: "",
        numOrden: "",
        tipo_servicio: "",
        tipo_equipo: ""
      });
    } else {
      setNewEntityData({
        cliente: "",
        titulo: "",
        numOrden: "",
        tipo_servicio: "",
        tipo_equipo: ""
      });
    }
    setTituloOptions([]);
  };








  /**
 * Maneja la lógica para eliminar un elemento, enviando una solicitud 
 * de eliminación a través de Axios y actualizando el estado correspondiente.
 */
  const handleDeleteForm = async () => {
    try {
      const response = await axiosInstance.delete(`${ruta}${id_Etapa_parametro}`);
      showToast('Elemento eliminado exitosamente.', 'success');
      setIsDialogDelete(false);

      if (response.data && response.status == 200) {
        await fetchUnidadesDeMedida();
        showToast('Se eliminó correctamente !.', 'success');
        referencia((prev) => prev.filter((etapa) => etapa.id !== id_Etapa_parametro));
        setIsDialogDelete(false);
      }

    } catch (error) {
      if (error.response.data.error) {
        if (error.response.data.error.includes("foreign key")) {
          showToast('Error, esa etapa está vínculada a un parámetro.', 'error');
        }
      }
      else {
        alert("Error al enviar el formulario. Verifica la consola para detalles.");
      }
    }
  }

  return (
    <>
      <CustomToast message={toast.message} type={toast.type} />


      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {!hideAddOption && (
            <>
              <DropdownMenuItem onClick={handleAddClick}>Crear nuevo</DropdownMenuItem>
            </>
          )}
          {!hideEditOption && (
            <DropdownMenuItem onClick={handleEditClick}>Modificar</DropdownMenuItem>
          )}
          {/* {entity == 'parametros' && (
            <DropdownMenuItem onClick={handleCopy}>Pegar relaciones</DropdownMenuItem>
          )} */}
          {!hideDeleteOption && (
            <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>Eliminar</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className={`flex flex-col p-2 ${entity === 'parametros' ? 'max-w-3xl max-h-[80vh] overflow-auto' : ''}`}>
          <DialogHeader>
            <DialogTitle>Editar {entity.slice(0, -1).toUpperCase()}</DialogTitle>
            <DialogDescription>
              Modifica los detalles del {entity.slice(0, -1).toLowerCase()}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {filteredFields.map((field, index) => {
              const shouldHideUnidadMedida = field === "unidad_medida" && (editData.tipo_dato === "bool" || editData.tipo_dato === "string");

              if (shouldHideUnidadMedida) {
                return null;
              }

              return (
                <div key={index} className="flex flex-col">
                  <label htmlFor={field} className="text-sm font-medium text-gray-700 mb-1">
                    {labels[field] || field}
                  </label>

                  {field === "idequipo" ? ( // Input para idequipo
                    <Input
                      id="idequipo"
                      name="idequipo"
                      value={editData.idequipo}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleIdequipoChange(e); // Maneja el cambio en idequipo
                        handleEditChange(e); // Actualiza el estado para idequipo
                      }}
                      placeholder="ID Equipo"
                      type="text"
                    />
                  ) : field === "autorizacionSAT" && isEditing ? ( // Solo renderizar cuando estemos editando
                    <Select
                      name="autorizacionSAT"
                      value={editData.autorizacionSAT ? "true" : "false"} // Asegúrate de que el valor sea string ("true" o "false")
                      onValueChange={(value) =>
                        setEditData((prev) => ({
                          ...prev,
                          autorizacionSAT: value === "true" // Convertir a booleano cuando se cambia el valor
                        }))
                      }
                      className="input"
                    >
                      <SelectTrigger>
                        <span>{editData.autorizacionSAT ? "Autorizado" : "No autorizado"}</span>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Autorizado</SelectItem> {/* value como string */}
                        <SelectItem value="false">No autorizado</SelectItem> {/* value como string */}
                      </SelectContent>
                    </Select>
                  ) : field === "cliente" ? ( // Input para cliente
                    <Input
                      id="cliente"
                      name="cliente"
                      value={editData.cliente} // Mantiene el valor en editData
                      onChange={(e) => setEditData((prev) => ({ ...prev, cliente: e.target.value }))} // Permite cambios
                      placeholder="Cliente"
                      type="text"
                      readOnly
                    />
                  ) : field === "titulo" ? ( // Select para título
                    <Select
                      name="titulo"
                      value={editData.titulo}
                      onValueChange={(value) => {
                        setEditData((prev) => ({ ...prev, titulo: value }));
                        handleTituloChange(value, editData.idequipo); // Asegúrate de tener la ID del equipo en editData
                      }}
                      className="input"
                    >
                      <SelectTrigger>
                        <span>{editData.titulo || "Selecciona un título"}</span>
                      </SelectTrigger>
                      <SelectContent>
                        {tituloOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                  ) : field === "numOrden" ? ( // Select para numOrden
                    <Input
                      type="text"
                      name="numOrden"
                      placeholder="Número de Orden"
                      value={editData.numOrden} // Mantiene el valor en editData
                      onChange={(e) => setEditData((prev) => ({
                        ...prev,
                        numOrden: e.target.value, // Actualiza el estado al escribir
                      }))} // Permite cambios si es necesario
                      className="input"
                      readOnly // Solo de lectura, dependiendo de tu lógica
                    />
                  ) : field === "responsable" ? (
                    <Select
                      name="responsable"
                      value={editData.responsable}
                      onValueChange={(value) => handleEditChange({ target: { name: 'responsable', value } })}
                      className="input"
                    >
                      <SelectTrigger>
                        <span>{editData.responsable || "Selecciona un responsable"}</span>
                      </SelectTrigger>
                      <SelectContent>
                        {responsibleOptions.map((option) => (
                          <SelectItem key={option?.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field === "rol" ? (
                    <Select
                      name="rol"
                      value={editData.rol}
                      onValueChange={(value) => handleEditChange({ target: { name: 'rol', value } })}
                      className="input"
                    >
                      <SelectTrigger>
                        <span>{editData.rol || "Selecciona un rol"}</span>
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role?.value} value={role?.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field === "tipo_servicio" ? (
                    <Input
                      type="text"
                      name="tipo_servicio"
                      value={editData.tipo_servicio}
                      onChange={(e) => handleEditChange({ target: { name: 'tipo_servicio', value: e.target.value } })}
                      placeholder="Ingresa el tipo de servicio"
                      className="input"
                      readOnly
                    />
                  ) : field === "tipo_equipo" ? (
                    <Input
                      type="text"
                      name="tipo_equipo"
                      value={editData.tipo_equipo}
                      onChange={(e) => handleEditChange({ target: { name: 'tipo_equipo', value: e.target.value } })}
                      placeholder="Ingresa el tipo de equipo"
                      className="input"
                      readOnly
                    />
                  ) : field === "sistema_parametro" ? (
                    <div className="flex items-center justify-between">
                      <Select
                        name="sistema_parametro"
                        value={editData.sistema_parametro}
                        onValueChange={(value) => handleEditChange({ target: { name: 'sistema_parametro', value } })}
                        className="input"
                      >
                        <SelectTrigger>
                          <span>{editData.sistema_parametro || "Selecciona un tipo de sistema"}</span>
                        </SelectTrigger>
                        <SelectContent>
                          {sistemaOptions.map((option) => (
                            <div key={option.value} className="flex items-center justify-between w-full">
                              <SelectItem key={option?.value} value={option?.value}>
                                {option.label}
                              </SelectItem>
                              <div className="flex space-x-2 ml-4">
                                <PencilIcon onMouseDown={(event) => handleIconClickModificar(fetchTiposDeSistemas, '/tiposDeSistema/modificar/', 'Modificar Tipo de Sistema', option, 'nombre_tipo_de_sistema', event)} className="h-6 w-6 text-yellow-500 cursor-pointer" aria-hidden="true" />
                                <TrashIcon
                                  onMouseDown={(event) => handleIconClick(fetchTiposDeSistemas, '/tiposDeSistema/borrar/', 'Eliminar Tipo de Sistema', option, event)}
                                  className="h-6 w-6 text-red-500 cursor-pointer"
                                  aria-hidden="true"
                                />

                              </div>
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                      <PlusIcon onMouseDown={(event) => handleIconClickModificar(fetchTiposDeSistemas, '/tiposDeSistema/crear/', 'Agregar Tipo de Sistema', null, 'nombre_tipo_de_sistema', event)} className="h-6 w-6 text-blue-500 mr-2" aria-hidden="true" />
                    </div>
                  ) : field === "unidad_medida" ? (
                    <div className="flex items-center justify-between">
                      <Select
                        name="unidad_medida"
                        value={editData.unidad_medida}
                        onValueChange={(value) => handleEditChange({ target: { name: 'unidad_medida', value } })}
                        className="input"
                      >
                        <SelectTrigger>
                          <span>{editData.unidad_medida || "Selecciona un tipo de unidad de medida"}</span>
                        </SelectTrigger>
                        <SelectContent>
                          {unidadMedidaOptions.map((option) => (
                            <div key={option.value} className="flex items-center justify-between w-full"> {/* Contenedor adicional */}
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                              <div className="flex space-x-2 ml-4">
                                <PencilIcon onMouseDown={(event) => handleIconClickModificar(fetchUnidadesDeMedida, '/tiposDeUnidades/modificar/', 'Modificar Unidad de Medida', option, 'nombre_unidad_de_medida', event)} className="h-6 w-6 text-yellow-500 cursor-pointer" aria-hidden="true" />
                                {/* <PlusIcon onMouseDown={(event) => handleIconClickModificar(fetchUnidadesDeMedida,'/tiposDeUnidades/modificar/','Modificar Unidad de Medida',null,'nombre_unidad_de_medida', event)}   className="h-6 w-6 text-blue-500 mr-2"  aria-hidden="true" /> */}
                                <TrashIcon
                                  onMouseDown={(event) => handleIconClick(fetchUnidadesDeMedida, '/tiposDeUnidades/borrar/', 'Eliminar Unidad de Medida', option, event)}
                                  className="h-6 w-6 text-red-500 cursor-pointer"
                                  aria-hidden="true"
                                />

                              </div>
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                      <PlusIcon onMouseDown={(event) => handleIconClickModificar(fetchUnidadesDeMedida, '/tiposDeUnidades/crear/', 'Agregar Unidad de Medida', null, 'nombre_unidad_de_medida', event)} className="h-6 w-6 text-blue-500 mr-2" aria-hidden="true" />
                    </div>
                  ) : field === "tipo_dato" ? (
                    <Select
                      name="tipo_dato"
                      value={editData.tipo_dato}
                      onValueChange={(value) => handleEditChange({ target: { name: 'tipo_dato', value } })}
                      className="input"
                    >
                      <SelectTrigger>
                        <span>{editData.tipo_dato || "Selecciona un tipo de dato"}</span>
                      </SelectTrigger>
                      <SelectContent>
                        {tipoDatoOptions.map((option) => (
                          <SelectItem key={option?.value} value={option?.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field === "etapa" ? (
                    <div className="flex items-center justify-between">
                      <Select
                        name="etapa"
                        value={editData.etapa}
                        onValueChange={(value) => handleEditChange({ target: { name: 'etapa', value } })}
                        className="input"
                      >
                        <SelectTrigger>
                          <span>{editData.etapa || "Selecciona una etapa"}</span>
                        </SelectTrigger>
                        <SelectContent>
                          {stagesOptions.map((etapa) => (
                            <div key={etapa.value} className="flex items-center justify-between w-full"> {/* Contenedor adicional */}
                              <SelectItem value={etapa.value}>
                                <span>{etapa.label}</span>
                              </SelectItem>
                              <div className="flex space-x-2 ml-4">
                                <PencilIcon
                                  onClick={() => { setIsFormDialogOpen(true); setDialogMessage("Modificar Etapa"); }}
                                  onMouseDown={(event) => handleIconClickModificar(fetchStagesOptions, '/tiposDeStages/modificar/', 'Modificar Etapa', etapa, 'nombre_etapa_de_parametro', event)}
                                  className="h-6 w-6 text-yellow-500 cursor-pointer"
                                  aria-hidden="true"
                                />
                                <TrashIcon
                                  onMouseDown={(event) => handleIconClick(fetchStagesOptions, '/tiposDeStages/borrar/', 'Eliminar Etapa', etapa, event)}
                                  className="h-6 w-6 text-red-500 cursor-pointer"
                                  aria-hidden="true"
                                />


                              </div>
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                      <PlusIcon onMouseDown={(event) => handleIconClickModificar(fetchStagesOptions, '/tiposDeStages/crear/', 'Agregar Etapa', null, 'nombre_etapa_de_parametro', event)} className="h-6 w-6 text-blue-500 mr-2" aria-hidden="true" />
                    </div>
                  ) : (
                    <Input
                      id={field}
                      name={field}
                      value={editData[field]}
                      onChange={handleEditChange}
                      placeholder={labels[field] || field}
                      type={field === 'password' ? 'password' : 'text'} // Tipo de entrada dinámic
                    />
                  )}
                  {errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>}
                </div>
              );
            })}
            {entity === 'parametros' && (
              <>
                <TruthTable onDataSubmit={handleDataSubmit} id_parametro={row.id_parametro} />
                {validationMessage && (
                  <p className={`text-sm ${validationMessage.includes('No') ? 'text-red-500' : 'text-green-500'} mt-2`}>
                    {validationMessage}
                  </p>
                )}
              </>
            )}

          </div>

          <DialogFooter>
            {isFetchSuccessful && (
              <Button
                onClick={handleRedirection}
                className="bg-sky-900 text-white font-bold py-2 px-4 rounded hover:bg-sky-950 transition duration-300"
              >
                Ordenar Parámetros
              </Button>
            )}
            <Button className="bg-red-600 text-white font-bold py-2 px-4 rounded hover:bg-red-700 transition duration-300" variant="ghost" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-sky-900 text-white font-bold py-2 px-4 rounded hover:bg-sky-950 transition duration-300" variant="destructive" onClick={handleSaveEdit}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className={`flex flex-col p-2 ${entity === 'parametros' && 'max-w-3xl max-h-[80vh] overflow-auto'}`}>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Agregar {entity.slice(0, -1).toUpperCase()}</DialogTitle>
            <DialogDescription>
              Agrega un nuevo {entity.slice(0, -1).toLowerCase()}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {filteredFields.map((field, index) => {
              // Verifica si el campo es 'unidad_medida' y el tipo_dato es 'bool'
              const shouldHideUnidadMedida = field === "unidad_medida" && (newEntityData.tipo_dato === "bool" || newEntityData.tipo_dato === "string");


              // Si se debe ocultar, retorna null
              if (shouldHideUnidadMedida) {
                return null;
              }

              return (
                <div key={index} className="flex flex-col">
                  <label htmlFor={field} className="text-sm font-medium text-gray-700 mb-1">
                    {labels[field] || field}
                  </label>

                  {field === "idequipo" ? ( // Input para idequipo
                    <Input
                      id="idequipo"
                      name="idequipo"
                      onChange={(e) => {
                        handleIdequipoChange(e); // Maneja el cambio en idequipo
                        handleNewEntityChange(e); // Actualiza el estado para idequipo
                      }}
                      placeholder="ID Equipo"
                      type="text"
                    />
                  ) : field === "cliente" ? ( // Input para cliente
                    <Input
                      id="cliente"
                      name="cliente"
                      value={newEntityData.cliente} // Mantiene el valor en newEntityData
                      onChange={(e) => setNewEntityData((prev) => ({ ...prev, cliente: prev.cliente }))} // No permite cambios en el campo
                      placeholder="Cliente"
                      type="text"
                      readOnly // Solo de lectura
                    />
                  ) : field === "titulo" ? ( // Select para título
                    <Select
                      name="titulo"
                      value={newEntityData.titulo}
                      onValueChange={(value) => {
                        setNewEntityData((prev) => ({ ...prev, titulo: value }));
                        handleTituloChange(value, newEntityData.idequipo); // Asegúrate de tener la ID del equipo en newEntityData
                      }}
                      className="input"
                    >
                      <SelectTrigger>
                        <span>{newEntityData.titulo || "Selecciona un título"}</span>
                      </SelectTrigger>
                      <SelectContent>
                        {tituloOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                  ) : field === "numOrden" ? ( // Select para numOrden
                    <Input
                      type="text"
                      name="numOrden"
                      placeholder="Numero de Orden"
                      value={newEntityData.numOrden}
                      onChange={(e) => setNewEntityData((prev) => ({
                        ...prev,
                        numOrden: e.target.value, // Actualiza el estado al escribir
                      }))} // Actualiza el estado en función del input
                      className="input"
                      readOnly

                    />
                  ) : field === "tipo_servicio" ? ( // Select para tipo_servicio
                    <Input
                      type="text"
                      name="tipo_servicio"
                      placeholder="Tipo de servicio"
                      value={newEntityData.tipo_servicio}
                      onChange={(e) => setNewEntityData((prev) => ({
                        ...prev,
                        tipo_servicio: e.target.value, // Actualiza el estado al escribir
                      }))} // Actualiza el estado en función del input
                      className="input"
                      readOnly
                    />
                  ) : field === "tipo_equipo" ? (
                    <Input
                      type="text"
                      name="tipo_equipo"
                      placeholder="Tipo de equipo"
                      value={newEntityData.tipo_equipo}
                      onChange={(e) => setNewEntityData((prev) => ({
                        ...prev,
                        tipo_equipo: e.target.value, // Actualiza el estado al escribir
                      }))} // Actualiza el estado en función del input
                      className="input"
                      readOnly
                    />
                  ) : field === "responsable" ? (
                    <Select
                      name="responsable"
                      value={newEntityData.responsable}
                      onValueChange={(value) => handleNewEntityChange({ target: { name: 'responsable', value } })}
                      className="input"
                    >
                      <SelectTrigger>
                        <span>{newEntityData.responsable || "Selecciona un responsable"}</span>
                      </SelectTrigger>
                      <SelectContent>
                        {responsibleOptions.map((option) => (
                          <SelectItem key={option?.value} value={option?.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field === "rol" ? (
                    <Select
                      name="rol"
                      value={newEntityData.rol}
                      onValueChange={(value) => handleNewEntityChange({ target: { name: 'rol', value } })}
                      className="input"
                    >
                      <SelectTrigger>
                        <span>{newEntityData.rol || "Selecciona un rol"}</span>
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role?.value} value={role?.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field === "sistema_parametro" ? (
                    <div className="flex items-center justify-between">
                      <Select
                        name="sistema_parametro"
                        value={newEntityData.sistema_parametro}
                        onValueChange={(value) => handleNewEntityChange({ target: { name: 'sistema_parametro', value } })}
                        className="input"
                      >
                        <SelectTrigger>
                          <span>{newEntityData.sistema_parametro || "Selecciona un tipo de sistema"}</span>
                        </SelectTrigger>
                        <SelectContent>
                          {sistemaOptions.map((option) => (
                            <div key={option.value} className="flex items-center justify-between w-full">
                              <SelectItem key={option?.value} value={option?.value}>
                                {option.label}
                              </SelectItem>
                              <div className="flex space-x-2 ml-4">
                                <PencilIcon onMouseDown={(event) => handleIconClickModificar(fetchTiposDeSistemas, '/tiposDeSistema/modificar/', 'Modificar Tipo de Sistema', option, 'nombre_tipo_de_sistema', event)} className="h-6 w-6 text-yellow-500 cursor-pointer" aria-hidden="true" />
                                {/* <PlusIcon onMouseDown={(event) => handleIconClickModificar(fetchTiposDeSistemas,'/tiposDeSistema/modificar/','Modificar Tipo de Sistema',option,'nombre_tipo_de_sistema',event)}   className="h-6 w-6 text-blue-500 mr-2"  aria-hidden="true" /> */}
                                <TrashIcon
                                  onMouseDown={(event) => handleIconClick(fetchTiposDeSistemas, '/tiposDeSistema/borrar/', 'Eliminar Tipo de Sistema', option, event)}
                                  className="h-6 w-6 text-red-500 cursor-pointer"
                                  aria-hidden="true"
                                />

                              </div>
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                      <PlusIcon onMouseDown={(event) => handleIconClickModificar(fetchTiposDeSistemas, '/tiposDeSistema/crear/', 'Agregar Tipo de Sistema', null, 'nombre_tipo_de_sistema', event)} className="h-6 w-6 text-blue-500 mr-2" aria-hidden="true" />
                    </div>
                  ) : field === "unidad_medida" ? (
                    <div className="flex items-center justify-between">
                      <Select
                        name="unidad_medida"
                        value={newEntityData.unidad_medida}
                        onValueChange={(value) => handleNewEntityChange({ target: { name: 'unidad_medida', value } })}
                        className="input"
                      >
                        <SelectTrigger>
                          <span>{newEntityData.unidad_medida || "Selecciona un tipo de unidad de medida"}</span>
                        </SelectTrigger>
                        <SelectContent>
                          {unidadMedidaOptions.map((option) => (
                            <div key={option.value} className="flex items-center justify-between w-full"> {/* Contenedor adicional */}
                              <SelectItem key={option?.value} value={option?.value}>
                                {option.label}
                              </SelectItem>
                              <div className="flex space-x-2 ml-4">
                                <PencilIcon onMouseDown={(event) => handleIconClickModificar(fetchUnidadesDeMedida, '/tiposDeUnidades/modificar/', 'Modificar Unidad de Medida', option, 'nombre_unidad_de_medida', event)} className="h-6 w-6 text-yellow-500 cursor-pointer" aria-hidden="true" />
                                {/* <PlusIcon onMouseDown={(event) => handleIconClickModificar(fetchUnidadesDeMedida,'/tiposDeUnidades/modificar/','Modificar Unidad de Medida',null,'nombre_unidad_de_medida', event)}   className="h-6 w-6 text-blue-500 mr-2"  aria-hidden="true" /> */}
                                <TrashIcon
                                  onMouseDown={(event) => handleIconClick(fetchUnidadesDeMedida, '/tiposDeUnidades/borrar/', 'Eliminar Unidad de Medida', option, event)}
                                  className="h-6 w-6 text-red-500 cursor-pointer"
                                  aria-hidden="true"
                                />

                              </div>
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                      <PlusIcon onMouseDown={(event) => handleIconClickModificar(fetchUnidadesDeMedida, '/tiposDeUnidades/crear/', 'Agregar Unidad de Medida', null, 'nombre_unidad_de_medida', event)} className="h-6 w-6 text-blue-500 mr-2" aria-hidden="true" />
                    </div>
                  ) : field === "tipo_dato" ? (

                    <Select
                      name="tipo_dato"
                      value={newEntityData.tipo_dato}
                      onValueChange={(value) => handleNewEntityChange({ target: { name: 'tipo_dato', value } })}
                      className="input"
                    >
                      <SelectTrigger>
                        <span>{newEntityData.tipo_dato || "Selecciona un tipo de dato"}</span>
                      </SelectTrigger>
                      <SelectContent>
                        {tipoDatoOptions.map((option) => (
                          <SelectItem key={option?.value} value={option?.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field === "etapa" ?
                    (
                      <div className="flex items-center justify-between">
                        <Select
                          name="etapa"
                          value={newEntityData.etapa}
                          onValueChange={(value) => handleNewEntityChange({ target: { name: 'etapa', value } })}
                          className="input"
                        >
                          <SelectTrigger>
                            <span>{newEntityData.etapa || "Selecciona una etapa"}</span>
                          </SelectTrigger>
                          <SelectContent>
                            {stagesOptions.map((etapa) => (
                              <div key={etapa.value} className="flex items-center justify-between w-full"> {/* Contenedor adicional */}
                                <SelectItem value={etapa?.value}>
                                  <span>{etapa?.label}</span>
                                </SelectItem>
                                <div className="flex space-x-2 ml-4">
                                  <PencilIcon
                                    onClick={() => { setIsFormDialogOpen(true); setDialogMessage("Modificar Etapa"); }}
                                    onMouseDown={(event) => handleIconClickModificar(fetchStagesOptions, '/tiposDeStages/modificar/', 'Modificar Etapa', etapa, 'nombre_etapa_de_parametro', event)}
                                    className="h-6 w-6 text-yellow-500 cursor-pointer"
                                    aria-hidden="true"
                                  />
                                  <TrashIcon
                                    onMouseDown={(event) => handleIconClick(fetchStagesOptions, '/tiposDeStages/borrar/', 'Eliminar Etapa', etapa, event)}
                                    className="h-6 w-6 text-red-500 cursor-pointer"
                                    aria-hidden="true"
                                  />


                                </div>
                              </div>
                            ))}
                          </SelectContent>

                        </Select>
                        <PlusIcon onMouseDown={(event) => handleIconClickModificar(fetchStagesOptions, '/tiposDeStages/crear/', 'Agregar Etapa', null, 'nombre_etapa_de_parametro', event)} className="h-6 w-6 text-blue-500 mr-2" aria-hidden="true" />
                      </div>
                    ) : (
                      <Input
                        id={field}
                        name={field}
                        value={newEntityData[field]}

                        // onChange={handleNewEntityChange}

                        onChange={(e) => {
                          handleNewEntityChange(e);
                        }}

                        placeholder={labels[field] || field}
                        type={field === 'password' ? 'password' : 'text'}
                      />

                    )}
                  {errors[field] && <p className="text-red-500 text-sm mt-1"> {errors[field]} </p>}

                </div>
              );
            })}

            {entity === 'parametros' && (
              <>
                <TruthTable onDataSubmit={handleDataSubmit} />
                {validationMessage && (
                  <p className={`text-sm ${validationMessage.includes('No') ? 'text-red-500' : 'text-green-500'} mt-2`}>
                    {validationMessage}
                  </p>
                )}
              </>
            )}



          </div>

          <DialogFooter>
            <div className="flex space-x-2">

              <Button
                className="bg-red-600 text-white font-bold py-2 px-4 rounded hover:bg-red-700 transition duration-300"
                variant="destructive"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                className="bg-sky-900 text-white font-bold py-2 px-4 rounded hover:bg-sky-950 transition duration-300"
                variant="destructive"
                onClick={handleSaveNewEntity}
              >
                Guardar
              </Button>
            </div>
          </DialogFooter>

        </DialogContent>
      </Dialog>



      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg p-4 max-h-[80vh] overflow-auto"> {/* Ajustes de scroll */}
          <DialogHeader>
            <DialogTitle>Eliminar {entity.slice(0, -1).toUpperCase()}</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este {entity.slice(0, -1).toLowerCase()}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button className="bg-sky-900 text-white font-bold py-2 px-4 rounded hover:bg-sky-950 transition duration-300" variant="ghost" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-red-600 text-white font-bold py-2 px-4 rounded hover:bg-red-700 transition duration-300"
              variant="destructive"
              onClick={async () => {
                try {
                  await onDelete(row);
                  setIsDialogOpen(false); // Cierra el diálogo después de eliminar
                } catch (error) {
                  console.error("Error al eliminar el elemento:", error);
                }
              }}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>



      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMessage}</DialogTitle>
            <DialogDescription>
              {dialogMessage}
            </DialogDescription>
          </DialogHeader>

          <Input value={formData.name || ValorEdit || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          {errors.nombre_Generico && (
            <p className="text-red-500 text-sm mt-1">{errors.nombre_Generico}</p>
          )}
          {/* {<p className="text-red-500 text-sm mt-1">{errors.name} </p>} */}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsFormDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleSaveForm}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogDelete} onOpenChange={setIsDialogDelete}>
        <DialogContent className="max-w-lg p-4 max-h-[80vh] overflow-auto"> {/* Ajustes de scroll */}
          <DialogHeader>
            <DialogTitle>{dialogMessage}</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas {dialogMessage}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogDelete(false)}>
              Cancelar
            </Button>

            <Button
              variant="destructive"
              onClick={handleDeleteForm}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMessage}</DialogTitle>
            <DialogDescription>
              {dialogMessage}
            </DialogDescription>
          </DialogHeader>

          <Input value={formData.name || ValorEdit || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          {errors.nombre_Generico && (
            <p className="text-red-500 text-sm mt-1">{errors.nombre_Generico}</p>
          )}
          {/* {<p className="text-red-500 text-sm mt-1">{errors.name} </p>} */}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsFormDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleSaveForm}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <Dialog open={IsServiceDialogOpen} onOpenChange={setisServiceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-center">Vincular Servicios</DialogTitle>
            <DialogDescription>{dialogMessage}</DialogDescription>
          </DialogHeader>

          {/* Primer Select */}
          <label htmlFor="select1" className="block text-sm font-medium text-gray-700">
            Seleccione el tipo de servicio (Local)
          </label>
          <Select
            name="tipoServicioLocal"
            value={newEntityData.tipoServicioLocal}
            onValueChange={(value) => handleNewEntityChange({ target: { name: 'tipoServicioLocal', value } })}
            className="input"
          >
            <SelectTrigger>
              <span>{newEntityData.tipoServicioLocal || "Selecciona un tipo de servicio"}</span>
            </SelectTrigger>
            <SelectContent>
              {serviceOptions.map((tipo_servicio) => (
                <div key={tipo_servicio.value} className="flex items-center justify-between w-full">
                  <SelectItem value={tipo_servicio.value}>
                    <span>{tipo_servicio.label}</span>
                  </SelectItem>
                </div>
              ))}
            </SelectContent>
          </Select>

          {/* Segundo Select */}
          <label htmlFor="select2" className="block text-sm font-medium text-gray-700 mt-4">
            Seleccione el tipo de servicio (Tango)
          </label>
          <Select
            name="tipoServicioTango"
            value={newEntityData.tipoServicioTango}
            onValueChange={(value) => handleNewEntityChange({ target: { name: 'tipoServicioTango', value } })}
            className="input"
          >
            <SelectTrigger>
              <span>{newEntityData.tipoServicioTango || "Selecciona un tipo de equipo"}</span>
            </SelectTrigger>
            <SelectContent>
              {fetchServices.map((servicio) => (
                <div key={servicio.cod_comp} className="flex items-center justify-between w-full">
                  <SelectItem value={servicio.cod_comp}>
                    <span>{servicio.cod_comp}</span>
                  </SelectItem>
                  <div className="flex items-center">
                    {servicio.encontrado ? (
                      <>
                        <button className="">
                          <span className="text-green-500" >({servicio.grupo})✔️</span>
                        </button>
                        <TrashIcon onMouseDown={(event) => BorrarRelacionDoc(servicio.cod_comp)}
                          className="h-6 w-6 text-red-500 cursor-pointer"
                          aria-hidden="true" />
                      </>
                    ) : (
                      <button className="">
                        <span onClick={() => SaveServices(servicio.cod_comp)} className="cursor-pointer">   <PlusIcon className="h-5 w-5" /></span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </SelectContent>

          </Select>
        </DialogContent>
      </Dialog>
    </>
  );
}