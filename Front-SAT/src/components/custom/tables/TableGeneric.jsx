import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Button } from '@/components/shadcn/button';
import { DataTable } from './DataTable';
import { LoadingSpinner } from '../Spinner';
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import DropDownMenuTable from './DropdownMenuTable';
import { useAxiosInstance } from '../../../axiosInstance';
import CustomToast from '../CustomToast';
import { useToast } from '../../../hooks/use-toast';


/**
 * Convierte un objeto JSON que contiene un buffer en un ArrayBuffer.
 * 
 * @param {Object} bufferJson - Objeto JSON que contiene un buffer de datos.
 * @returns {ArrayBuffer} - Un ArrayBuffer que representa los datos del buffer.
 */
const jsonBufferToArrayBuffer = (bufferJson) => {
  return new Uint8Array(bufferJson.data).buffer;
};

/**
 * Convierte un buffer en una URL de objeto (Data URL) utilizando un tipo MIME específico.
 * 
 * @param {ArrayBuffer|Blob} buffer - El buffer que se desea convertir a una URL de objeto.
 * @param {string} mimeType - El tipo MIME que se asignará al blob.
 * @returns {string} - Una URL de objeto que representa el buffer.
 */
const bufferToDataUrl = (buffer, mimeType) => {
  const blob = new Blob([buffer], { type: mimeType });
  return URL.createObjectURL(blob);
};

/**
 * Recupera datos de un endpoint y configura columnas para una tabla.
 * 
 * @param {string} endpoint - La URL del endpoint para obtener los datos.
 * @param {Object} axiosInstance - Instancia de Axios para realizar la solicitud.
 * @param {Function} handleAdd - Función para manejar la adición de elementos.
 * @param {Function} handleEdit - Función para manejar la edición de elementos.
 * @param {Function} handleDeleteConfirm - Función para manejar la confirmación de eliminación.
 * @param {string} entity - El tipo de entidad que se está gestionando.
 * @returns {Promise<{ elements: Array, columns: Array }>} - Un objeto con los elementos y columnas configuradas.
 */
const fetchData = async (endpoint, axiosInstance, handleAdd, handleEdit, handleDeleteConfirm, entity) => {
  try {
    const response = await axiosInstance.get(endpoint);
    const columnsArray = response.data.columnArray
   
      .map((item) => ({
        accessorKey: item,
        header: ({ column }) => (
          <Button
            className="text-xl text-left"
            variant="ghost"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          >
            {item.toUpperCase()}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: (row) => {
          const value = row.getValue();

          if (item === "archivo") {
            if (value && value.data && value.data.length > 0) {
              const arrayBuffer = jsonBufferToArrayBuffer(value);
              const dataUrl = bufferToDataUrl(arrayBuffer, 'application/pdf');
              return (
                <a href={dataUrl} target="_blank" rel="noopener noreferrer">
                  Ver PDF
                </a>
              );
            } else {
              return <div className="text-md text-red-500">No se cargaron archivos aún</div>;
            }
          }
          return <div className="text-lg text-blue">{value}</div>;
        },


        meta: { visible: item !== 'password' && item !== 'id' && item !== 'firma' && item !== 'id_parametro' && item !== 'OrdenNumero'
          && item !== 'aclaracion' && item !== 'autorizacionTDB' && item !== 'autorizacionControlDeHoras' && item !== 'autorizacionVariadores'},

      }))
      .concat({
        accessorKey: "actions",
        header: () => <div className="text-center text-xl">ACCIONES</div>,
        cell: ({ row }) => (
          <DropDownMenuTable 
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={() => handleDeleteConfirm(row.original)}
            row={row.original}
            entity={entity}
            fields={response.data.columnArray}
            labels={response.data.columnArray}
            hideAddOption={entity === "ordenesCargadas" || entity === "parametros"}
            hideDeleteOption={entity === "parametros"}

          />
        ),
      });

    const elements = response.data.elementsArray;
    
    return {
      elements,
      columns: columnsArray,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return { elements: [], columns: [] };
  }
};

/**
 * Componente de paginación que permite navegar entre páginas.
 * 
 * @param {number} page - La página actual.
 * @param {number} totalPages - El número total de páginas.
 * @param {Function} onPageChange - Función que se llama cuando se cambia de página.
 */
const Pagination = ({ page, totalPages, onPageChange }) => {
  const handlePageChange = useCallback(
    (newPage) => {
      onPageChange(newPage);
    },
    [onPageChange]
  );

  return (
    <div className="flex items-center justify-center mt-4 space-x-2">
      <Button
        className="px-3 py-2 rounded-l-md bg-gray-800 text-white hover:bg-blue-600"
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 1}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <span className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md">
        Page {page} of {totalPages}
      </span>
      <Button
        className="px-3 py-2 rounded-r-md bg-gray-800 text-white hover:bg-blue-600"
        onClick={() => handlePageChange(page + 1)}
        disabled={page === totalPages}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
};

const MemoPagination = React.memo(Pagination);

/**
 * Componente genérico para mostrar una tabla de datos con paginación.
 * 
 * @param {string} entity - El nombre de la entidad que se está manejando.
 * @param {string} endpoint - El endpoint para la API.
 * @param {function} filtro - Función para filtrar los datos.
 */
export default function TableGeneric({ entity, endpoint, filtro }) {
  const axiosInstance = useAxiosInstance();
  const { toast, showToast } = useToast();
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 30;
  

  const paginatedData = useMemo(
    () => data.slice((page - 1) * itemsPerPage, page * itemsPerPage),
    [data, page, itemsPerPage]
  );
  const totalPages = Math.ceil(data.length / itemsPerPage);

  /**
 * Maneja la adición de un nuevo elemento a la entidad.
 * 
 * Esta función se ejecuta al intentar añadir un nuevo dato. Realiza una
 * solicitud POST a la API y muestra un mensaje de éxito o error según 
 * el resultado de la operación.
 *
 * @param {Object} newData - El nuevo dato que se va a añadir.
 */
  const handleAdd = useCallback(async (newData) => {
    try {
      await axiosInstance.post(`${entity}/cargar`, newData);
      showToast('Elemento añadido exitosamente.', 'success');
      await processData(); // Actualiza los datos después de añadir
    } catch (error) {
      // Captura el mensaje de error específico del backend, si existe
      const errorMessage = error.response?.data?.error || 'Error al añadir el elemento. Inténtalo de nuevo más tarde.';
      showToast(`Error: ${errorMessage}`, 'error');
    }
  }, [entity, axiosInstance, showToast,]);

  /**
   * Maneja la edición de un elemento existente en la entidad.
   * 
   * Esta función se ejecuta al intentar editar un dato. Realiza una
   * solicitud PUT a la API y muestra un mensaje de éxito o error según
   * el resultado de la operación.
   *
   * @param {Object} editData - Los datos que se van a editar.
   */
  const handleEdit = useCallback(async (editData,) => {
    let id = parseInt(editData.id, 10);
    if (entity == "parametros") {
      id = parseInt(editData[0].id, 10);
    }
    if (isNaN(id)) {
      showToast('El ID no es un número válido', 'error');
      throw new Error("ID is not a valid number");
    }
    try {
      await axiosInstance.put(`${entity}/modificar/${id}`, editData);
      showToast('Elemento editado exitosamente.', 'success');
      await processData(); // Actualizar los datos después de editar

    } catch (error) {
      // Captura el mensaje de error específico del backend, si existe
      const errorMessage = error.response?.data?.error || 'Error al añadir el elemento. Inténtalo de nuevo más tarde.';
      showToast(`Error: ${errorMessage}`, 'error');
    }
  }, [entity, axiosInstance, showToast]);

  /**
 * Maneja la confirmación de eliminación de un elemento.
 * 
 * Esta función se ejecuta al intentar eliminar un dato. Realiza una
 * solicitud DELETE a la API y muestra un mensaje de éxito o error
 * según el resultado de la operación.
 *
 * @param {Object} deleteData - Los datos del elemento que se va a eliminar.
 */
  const handleDeleteConfirm = useCallback(async (deleteData) => {
    try {
      if (entity === "ordenesCargadas") {
        await axiosInstance.delete(`${entity}/borrar/${deleteData.id_ot}`);
        showToast('Elemento eliminado exitosamente.', 'success');
        await processData();
      } else if (entity === "parametros") {
        await axiosInstance.delete(`${entity}/borrar/${deleteData.id_parametro}`);
        showToast('Elemento eliminado exitosamente.', 'success');
        await processData();
      } else {
        await axiosInstance.delete(`${entity}/borrar/${deleteData.id}`);
        showToast('Elemento eliminado exitosamente.', 'success');
        await processData();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error al añadir el elemento. Inténtalo de nuevo más tarde.';
      showToast(`Error: ${errorMessage}`, 'error');
    }
  }, [entity, axiosInstance, showToast]);


  /**
 * Procesa los datos de la tabla.
 * 
 * Esta función realiza una solicitud para obtener los datos necesarios
 * y actualiza el estado del componente en consecuencia. Muestra un
 * mensaje de error si la operación falla.
 */
  const processData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchData(endpoint, axiosInstance, handleAdd, handleEdit, handleDeleteConfirm, entity);
      setColumns(result.columns);
      setData(result.elements);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error al añadir el elemento. Inténtalo de nuevo más tarde.';
      showToast(`Error: ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [endpoint, axiosInstance, handleAdd, handleEdit, handleDeleteConfirm, entity, showToast]);

  /**
 * Efecto que se ejecuta al montar el componente o cuando `processData` cambia.
 * 
 * Esta función se encarga de obtener y procesar los datos al cargar el componente.
 */
  useEffect(() => {
    processData();
  }, [processData]);

  /**
 * Función para manejar el cambio de página en la paginación.
 * 
 * Esta función se encarga de actualizar el estado de la página actual
 * cuando el usuario navega a una nueva página.
 * 
 * @param {number} newPage - El número de la nueva página a establecer.
 */
  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  return (
    <div className="w-[100%] max-w-[1950px] py-10 px-4">
      <CustomToast message={toast.message} type={toast.type} />

      {loading ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <LoadingSpinner size="100px" />
        </div>
      ) : error ? (
        <div className="text-red-500">{error.message}</div>
      ) : (
        <>
          <DataTable columns={columns} data={paginatedData} filtro={filtro} />
          <MemoPagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  );
}


export { TableGeneric };
