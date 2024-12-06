import { Checkbox } from "../../shadcn/checkbox";
import { useState, useEffect, useRef } from "react";
import { useAxiosInstance } from '../../../axiosInstance';
import { useToast } from '../../../hooks/use-toast';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../shadcn/table";
import { DocumentDuplicateIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Button } from "../../shadcn/button";
import CustomToast from '../CustomToast';
/**
 * Componente TruthTable
 *
 * Este componente presenta una tabla de verdad que permite seleccionar
 * diferentes tipos de servicio y tipos de equipo. La tabla permite
 * gestionar la selección de opciones a través de checkboxes. 
 * También se encarga de obtener datos existentes y de enviarlos al
 * componente padre mediante la función `onDataSubmit`.
 *
 * @param {function} onDataSubmit - Función que se llama al enviar los datos seleccionados.
 * @param {string} id_parametro - ID del parámetro que se utilizará para cargar datos existentes.
 */
export function TruthTable({ onDataSubmit, id_parametro }) {

    const axiosInstance = useAxiosInstance();
    const [copied, setCopied] = useState('');
    const [rows, setRows] = useState([]);
    const [checkboxes, setCheckboxes] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [selectedRow, setSelectedRow] = useState(null);
    const [updateDataStorage, setUpdateDataStorage] = useState([]); // Usar un array vacío

    const menuRef = useRef(null); // Referencia para detectar clics fuera del menú
    const { toast, showToast } = useToast();

    /**
     * Efecto que se ejecuta al montar el componente o cuando cambia el id_parametro.
     *
     * Esta función realiza las siguientes tareas:
     * 1. Obtiene los tipos de servicio disponibles.
     * 2. Obtiene los tipos de equipo disponibles.
     * 3. Si se proporciona un id_parametro, también obtiene los datos existentes
     *    relacionados con ese parámetro.
     */
    useEffect(() => {
        const fetchData = async () => {
            await fetchTiposDeServicio();
            await fetchTiposDeEquipo();
            if (id_parametro) {
                await fetchExistingData();
            }
        };

        fetchData();
    }, [id_parametro]);

    /**
     * Función asíncrona para obtener los tipos de servicio disponibles.
     *
     * Esta función realiza una solicitud a la API para recuperar los documentos
     * relacionados con los tipos de servicio. Si la respuesta es exitosa,
     * extrae los nombres de los documentos y actualiza el estado de checkboxes
     * con esos valores.
     */
    const fetchTiposDeServicio = async () => {
        try {
            const response = await axiosInstance.get('/documentos/obtenerDocumentos');
            if (response.data && response.data.documentos) {
                const tiposServicio = response.data.documentos.map(doc => doc.nombre_documento);
                setCheckboxes(tiposServicio);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Error. Intenta nuevamente.";
            showToast(`Error: ${errorMessage}`, 'error');
        }
    };

    /**
     * Función asíncrona para obtener los tipos de equipo disponibles.
     *
     * Esta función realiza una solicitud a la API para recuperar los tipos de
     * equipo. Si la respuesta es exitosa, extrae los nombres de los tipos de
     * equipo y actualiza el estado de rows con esos valores.
     */
    const fetchTiposDeEquipo = async () => {
        try {
            const response = await axiosInstance.get('/tiposDeEquipo/obtenerTipoEquipo');
            if (response.data && response.data.tiposDeEquipo) {
                const tiposEquipo = response.data.tiposDeEquipo.map(tipo => tipo.nombre_tipo_equipo);
                setRows(tiposEquipo);
            }
        } catch (error) {
            console.log("si")
            const errorMessage = error.response?.data?.message || "Error. Intenta nuevamente.";
            showToast(`Error: ${errorMessage}`, 'error');
        }
    };
    /**
     * Función asíncrona para obtener datos existentes relacionados con un parámetro específico.
     *
     * Esta función realiza una solicitud a la API para recuperar la tabla de verdad
     * asociada al ID de parámetro proporcionado. Si la respuesta es exitosa, 
     * los datos obtenidos se procesan y se almacenan en el estado correspondiente.
     */
    const fetchExistingData = async () => {
        try {
            const response = await axiosInstance.get(`/tiposDeDocumentosParametros/obtenerTablaDeVerdad/${id_parametro}`);
            if (response.data) {
                const fetchedData = Array.isArray(response.data) ? response.data : [response.data];
                populateSelectedOptions(fetchedData);
            }
        } catch (error) {
            if (error.response.data.error != 'No records found for the given id_parametro') {
                const errorMessage = error.response?.data?.message || "Error. Intenta nuevamente.";
                showToast(`Error: ${errorMessage}`, 'error');
            }
        }
    };

    /**
     * Procesa los datos obtenidos para poblar las opciones seleccionadas.
     *
     * Esta función toma un array de datos y organiza la información en un objeto
     * donde cada clave corresponde al nombre del tipo de equipo, y cada valor
     * es otro objeto que indica qué documentos están seleccionados para ese equipo.
     *
     * @param {Array} data - Array de objetos que contienen información sobre 
     *                       tipos de equipo y documentos.
     */
    const populateSelectedOptions = (data) => {
        const options = {};
        data.forEach(item => {
            const rowKey = item.tipo_equipo_nombre;
            const checkboxLabel = item.documento_nombre;

            if (!options[rowKey]) {
                options[rowKey] = {};
            }

            options[rowKey][checkboxLabel] = true;
        });

        setSelectedOptions(options);
    };

    /**
     * Efecto que se ejecuta cada vez que cambian las opciones seleccionadas.
     *
     * Esta función formatea los datos actuales basados en las opciones seleccionadas
     * y llama a la función `onDataSubmit` si hay opciones seleccionadas.
     */
    useEffect(() => {
        const updatedData = formatData(selectedOptions); // Formatea los datos correctamente.

        if (Object.keys(selectedOptions).length > 0) {
            onDataSubmit(updatedData);
            setUpdateDataStorage(updatedData)
        }

    }, [selectedOptions]);

    /**
     * Maneja el clic en una fila de la tabla.
     *
     * Esta función actualiza las opciones seleccionadas y la fila seleccionada
     * según la interacción del usuario. Si la fila ya está seleccionada, se
     * deselecciona; de lo contrario, se selecciona y se marcan todas las
     * opciones de checkbox correspondientes.
     *
     * @param {string} row - El nombre de la fila que ha sido clickeada.
     */
    const handleRowClick = (row) => {
        const newSelectedOptions = { ...selectedOptions };
        if (selectedRow === row) {
            delete newSelectedOptions[row];
            setSelectedRow(null);
        } else {
            newSelectedOptions[row] = {};
            checkboxes.forEach((checkboxLabel) => {
                newSelectedOptions[row][checkboxLabel] = true;
            });
            setSelectedRow(row);
        }
        //hola
        setSelectedOptions(newSelectedOptions);
    };

    /**
     * Maneja el cambio de estado de un checkbox en una fila.
     *
     * Esta función actualiza el estado de las opciones seleccionadas para
     * reflejar si un checkbox específico ha sido marcado o desmarcado.
     *
     * @param {string} checkboxLabel - La etiqueta del checkbox que ha cambiado.
     * @param {string} row - El nombre de la fila a la que pertenece el checkbox.
     */
    const handleCheckboxChange = (checkboxLabel, row) => {
        const newSelectedOptions = { ...selectedOptions };
        newSelectedOptions[row] = newSelectedOptions[row] || {};
        newSelectedOptions[row][checkboxLabel] = !newSelectedOptions[row][checkboxLabel]; // Toggle checkbox state
        setSelectedOptions(newSelectedOptions);
    };
    const pegarData = (e) => {
        e.preventDefault();
        let data = localStorage.getItem('tabla');
        if (data != null) {
            const informacion = JSON.parse(data).flatMap(item => {
                // Filtra las claves que tienen valor 'true' y que no son 'fila'
                return Object.keys(item)
                    .filter(key => item[key] === true)  // Filtra las claves que son 'true' (y no 'fila')
                    .map(key => ({
                        tipo_equipo_nombre: item.fila, // Asigna el valor de 'fila' a 'tipo_equipo_nombre'
                        documento_nombre: key         // La clave que es 'true' se asigna a 'documento_nombre'
                    }));
            });
            populateSelectedOptions(informacion)
        }
        else {
            showToast("¡No hay ninguna relacion copiada!", 'error');
        }

    }

    /**
     * Formatea los datos seleccionados en una estructura adecuada.
     *
     * Esta función transforma las opciones seleccionadas en un formato
     * que puede ser fácilmente enviado o procesado. Crea una fila para cada
     * tipo de equipo y establece el estado de cada checkbox correspondiente.
     *
     * @param {Object} currentSelectedOptions - Un objeto que contiene las
     *                                         opciones seleccionadas para cada fila.
     * @returns {Array} - Un arreglo de objetos que representan los datos formateados.
     */
    const formatData = (currentSelectedOptions) => {
        return rows.map(row => {
            const rowOptions = currentSelectedOptions[row] || {};
            const formattedRow = { fila: row };
            checkboxes.forEach(checkbox => {
                formattedRow[checkbox] = !!rowOptions[checkbox];
            });
            return formattedRow;
        });
    };

    /**
     * Alterna el estado de un checkbox en todas las filas de la tabla.
     *
     * Esta función cambia el estado del checkbox especificado para
     * cada fila de la tabla. Si el checkbox estaba marcado, se desmarca,
     * y viceversa.
     *
     * @param {string} checkboxLabel - El label del checkbox cuyo estado
     *                                 se desea alternar en todas las filas.
     */
    const toggleColumnCheckbox = (checkboxLabel) => {
        const newSelectedOptions = { ...selectedOptions };
        rows.forEach((item) => {
            newSelectedOptions[item] = newSelectedOptions[item] || {};
            newSelectedOptions[item][checkboxLabel] = !newSelectedOptions[item][checkboxLabel];
        });
        setSelectedOptions(newSelectedOptions);
    };
    const handleCopied = (e) => {
        localStorage.setItem("tabla", JSON.stringify(updateDataStorage));
        setCopied("¡Copied!")
        setTimeout(() => {
            setCopied("")
        }, 1000);
        showToast("¡Relaciones copiadas correctamente!", 'success');
    };

    return (
        <>
            <CustomToast message={toast.message} type={toast.type} />
            <div className="overflow-auto max-h-[400px] max-w-full !mt-2    ">
                <Table className="min-w-full text-center border shadow-2xl mt-6 mb-6">
                    <TableHeader   >
                        <TableRow className="mp-2">
                            <TableCell className="text-center text-xs flex items-center">
                                {/* Primer elemento (a la izquierda) */}
                                <button className="flex items-center mr-6" onClick={handleCopied} onContextMenu={(e) => pegarData(e)}>
                                    {!copied ? (
                                        <DocumentDuplicateIcon className="h-6 w-6 text-blue-500 hover:text-blue-700" />
                                    ) : (
                                        <CheckIcon className="h-6 w-6 text-blue-500 hover:text-blue-700" />
                                    )}
                                    {!copied ? 'Copy' : copied}
                                </button>

                                {/* Segundo elemento (en el centro) */}
                                <span className="flex-grow text-center mr-5">#</span>
                            </TableCell>
                            {checkboxes.map((label) => (
                                <TableCell key={label} onClick={() => toggleColumnCheckbox(label)} className="text-center text-xs max-w-[50px]">{label}</TableCell>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((item) => (
                            <TableRow
                                key={item}
                                className={`hover:bg-gray-100 ${selectedRow === item ? 'bg-blue-200' : ''}`}
                            >
                                <TableCell className="py-0.5 text-xs" onClick={() => handleRowClick(item)}>{item}</TableCell>
                                {checkboxes.map((checkboxLabel) => (
                                    <TableCell key={checkboxLabel} className="py-0.5 text-center text-xs max-w-[50px]">
                                        <Checkbox
                                            onCheckedChange={(checked) => handleCheckboxChange(checkboxLabel, item)}
                                            checked={!!selectedOptions[item]?.[checkboxLabel]}
                                        />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}
