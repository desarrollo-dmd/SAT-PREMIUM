import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Checkbox } from "../../shadcn/checkbox";
import { Select, SelectTrigger, SelectContent, SelectItem } from '../../shadcn/select';
import { FileText } from 'lucide-react';
import { useAxiosInstance } from "../../../axiosInstance";
import CustomToast from '../CustomToast';
import { useToast } from '../../../hooks/use-toast';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../shadcn/table";

/**
 * Componente TableOT
 *
 * Este componente se encarga de mostrar una tabla de órdenes
 * asociadas a un usuario. Permite filtrar las órdenes por 
 * estado (todas, pendientes, realizadas) y manejar interacciones
 * como selección de órdenes, cambio de estado y navegación a
 * formularios específicos según el estado de la orden.
 */
export function TableOT() {
    const [ordenes, setOrdenes] = useState([]);
    const [selectedOption, setSelectedOption] = useState('Pendiente');
    const [errorFetching, setErrorFetching] = useState(false);
    const navigate = useNavigate();
    const axiosInstance = useAxiosInstance();
    const { toast, showToast } = useToast();

    /**
     * Maneja el cambio de selección en un componente de selección.
     *
     * Esta función se llama cuando el usuario selecciona una opción en el
     * menú desplegable. Actualiza el estado con la opción seleccionada.
     *
     * @param {any} value - El valor de la opción seleccionada.
     */
    const handleSelectChange = (value) => {
        setSelectedOption(value);
    };

    /**
     * Función para obtener órdenes por usuario.
     * 
     * Esta función realiza una solicitud a la API para obtener las órdenes
     * asociadas a un usuario específico. Permite filtrar las órdenes según 
     * su estado.
     * 
     * @param {string} estado - El estado de las órdenes a filtrar. Por defecto, 
     *                          se establece como una cadena vacía.
     */
    const fetchOrdenes = useCallback(async (estado = '') => {
        try {
            const response = await axiosInstance.get(`/ordenes/obtenerOrdenesPorUsuario`, {
                params: {
                    estado: estado !== 'Todas' ? estado : '',
                }
            });
            // console.log(response)
            if (response.data && response.data.length > 0) {
                setOrdenes(response.data);
                setErrorFetching(false);
            } else {
                setOrdenes([]);
                setErrorFetching(true);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Error. No se encontraron ordenes.";
            showToast(`${errorMessage}`, 'error');
            setErrorFetching(true);
        }
    }, [axiosInstance]);

    /**
     * Efecto que se ejecuta cuando `selectedOption` cambia.
     *
     * Este efecto llama a `fetchOrdenes` para obtener las órdenes
     * basadas en la opción seleccionada. Si la opción es 'Todas las órdenes',
     * se pasa un valor vacío para obtener todas las órdenes. De lo contrario,
     * se pasa la opción seleccionada.
     */
    useEffect(() => {
        fetchOrdenes(selectedOption === 'Todas las ordenes' ? '' : selectedOption);
    }, [selectedOption, fetchOrdenes]);

    /**
     * Maneja el clic en una fila de la tabla.
     *
     * Dependiendo del estado de la orden, realiza una solicitud
     * diferente para obtener los datos necesarios y luego navega
     * a la página correspondiente.
     *
     * @param {number} id - El ID de la orden.
     * @param {string} estado - El estado de la orden.
     * @param {number} idequipo - El ID del equipo asociado.
     * @param {string} tipo_servicio - El tipo de servicio relacionado.
     * @param {string} tipo_equipo - El tipo de equipo relacionado.
     */
    const handleRowClick = async (id, estado, idequipo, tipo_servicio, tipo_equipo, cliente) => {
        try {
            let response;
            if (estado === "pendiente") {
                response = await axiosInstance.post('/parametros/filtrarParams', {
                    tipo_servicio,
                    tipo_equipo,
                });
            } else {
                response = await axiosInstance.get(`/ordenesCargadas/listarOrdenesPorIdot/${id}`);
            }

            const formData = {
                ...response.data,
                cliente, // Agrega el cliente aquí
            };
            navigate(`/formParams/${id}/${estado}/${idequipo}`, { state: { formData } });
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Error. Intenta nuevamente.";
            showToast(`Error: ${errorMessage}`, 'error');
        }
    };

    /**
     * Maneja el cambio de estado de un checkbox.
     *
     * Actualiza el estado de la lista de órdenes para reflejar
     * si una orden ha sido aprobada o no.
     *
     * @param {number} id - El ID de la orden cuyo estado de aprobación se está cambiando.
     */
    const handleCheckboxChange = (id) => {
        setOrdenes((prevOrdenes) =>
            prevOrdenes.map((item) =>
                item.id === id
                    ? { ...item, aprobado: !item.aprobado }
                    : item
            )
        );
    };

    /**
     * Obtiene el color de fondo para una fila de acuerdo a su estado y aprobación.
     *
     * @param {string} estado - El estado de la orden (ej. 'pendiente', 'realizada').
     * @param {boolean} aprobado - Indica si la orden ha sido aprobada o no.
     * @returns {string} - Clase CSS que define el color de fondo de la fila.
     */
    const getRowColor = (estado, aprobado) => {
        if (estado === 'pendiente') return 'bg-red-300';
        if (estado === 'realizada') return aprobado ? 'bg-green-300' : 'bg-yellow-300';
        return '';
    };

    return (
        <>
            <CustomToast message={toast.message} type={toast.type} />
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
                <FileText size={48} />
            </h1>

            {/* Select */}
            <div className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3 mb-4">
                <Select value={selectedOption} onValueChange={handleSelectChange} className="w-full">
                    <SelectTrigger className="bg-white border rounded-md p-2 text-gray-800">
                        <span>{selectedOption}</span>
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-300 rounded-md">
                        <SelectItem value="Todas las ordenes">Todas las ordenes</SelectItem>
                        <SelectItem value="Pendiente">Pendiente</SelectItem>
                        <SelectItem value="Realizada">Realizada</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Formato tabla en pantallas grandes */}
            <div className="hidden md:block w-full max-w-4xl overflow-x-auto">
                {errorFetching || ordenes.length === 0 ? (
                    <div className="text-center text-gray-500">No hay órdenes disponibles.</div>
                ) : (
                    <Table className="border-separate border-spacing-[0px] w-full bg-white border rounded-md shadow-2xl">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-gray-600 text-center">ID ORDEN</TableHead>
                                <TableHead className="text-gray-600 text-center">ID EQUIPO</TableHead>
                                <TableHead className="text-gray-600 text-center">MODELO</TableHead>
                                <TableHead className="text-gray-600 text-center">TITULO</TableHead>
                                <TableHead className="text-gray-600 text-center">CLIENTE</TableHead>
                                <TableHead className="text-gray-600 text-center">ESTADO</TableHead>
                                <TableHead className="text-gray-600 text-center">APROBADO</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {ordenes.map((orden) => (
                                <TableRow
                                    key={orden.id}
                                    className={`cursor-pointer hover:bg-gray-100 rounded-md py-3 px-2 ${getRowColor(orden.estado, orden.aprobado)}`}
                                    onClick={() => handleRowClick(orden.id, orden.estado, orden.idequipo, orden.tipo_servicio, orden.tipo_equipo, orden.cliente)}
                                >
                                    <TableCell className="text-gray-700 text-center">{orden.id}</TableCell>
                                    <TableCell className="text-gray-700 text-center">{orden.idequipo}</TableCell>
                                    <TableCell className="text-gray-700 text-center">{orden.tipo_equipo}</TableCell>
                                    <TableCell className="text-gray-700 text-center">{orden.titulo}</TableCell>
                                    <TableCell className="text-gray-700 text-center">{orden.cliente}</TableCell>
                                    <TableCell className="text-gray-700 text-center">{orden.estado}</TableCell>
                                    <TableCell className="text-center">
                                        <Checkbox
                                            checked={orden.aprobado}
                                            onChange={() => handleCheckboxChange(orden.id)}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* Formato móvil - tarjetas */}
            <div className="block md:hidden w-full">
                {errorFetching || ordenes.length === 0 ? (
                    <div className="text-center text-gray-500">No hay órdenes disponibles.</div>
                ) : (
                    ordenes.map((orden) => (
                        <div
                            key={orden.id}
                            className={`border border-gray-300 rounded-xl shadow-lg p-4 mb-4 cursor-pointer transition-transform transform hover:scale-105 ${orden.estado === 'pendiente' && !orden.aprobado ? 'bg-red-300' :
                                orden.estado === 'realizada' && orden.aprobado ? 'bg-green-300' : 'bg-yellow-300'
                                }`}
                            onClick={() => handleRowClick(orden.id, orden.estado, orden.idequipo, orden.tipo_servicio, orden.tipo_equipo)}
                        >
                            <div className="flex justify-between items-center">
                                <div className="text-sm font-semibold text-gray-800">ID Equipo: {orden.idequipo}</div>
                                <Checkbox
                                    checked={orden.aprobado}
                                    onChange={(e) => e.stopPropagation() || handleCheckboxChange(orden.id)}
                                    className="focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="text-gray-700 text-sm mt-2 space-y-1">
                                <p><strong>ID orden:</strong> {orden.id}</p>
                                <p><strong>Equipo:</strong> {orden.tipo_equipo}</p>
                                <p><strong>Servicio:</strong> {orden.tipo_servicio}</p>
                                <p><strong>Cliente:</strong> {orden.cliente}</p>
                                <p className="flex items-center"><strong>Estado:</strong>
                                    {orden.estado === 'pendiente' && !orden.aprobado ? (
                                        <span className="text-red-800 ml-1">Pendiente</span>
                                    ) : orden.estado === 'realizada' && !orden.aprobado ? (
                                        <span className="text-red-800 ml-1">Pendiente (esperando aprobación)</span>
                                    ) : (
                                        <span className="text-green-800 ml-1">Realizada (aprobada)</span>
                                    )}
                                </p>

                            </div>
                        </div>
                    ))
                )}
            </div>

        </>
    );
}
