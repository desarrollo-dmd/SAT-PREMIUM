import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAxiosInstance } from '../../axiosInstance';
import CustomToast from '../custom/CustomToast';
import { useToast } from '../../hooks/use-toast';
import Instructions from '../custom/Instruction';

const DragAndDropList = () => {
    const { state } = useLocation();
    const axiosInstance = useAxiosInstance();
    const { toast, showToast } = useToast();
    const paramsData = state?.paramsData || [];

    const instructions = [
        { action: "Arrastra", description: "Arrastra los elementos para reordenarlos." },
        { action: "Suelta", description: "Suelta el elemento en el lugar deseado." },
        { action: "Guardar", description: "Haz clic en 'Guardar cambios' para confirmar el nuevo orden." }
    ];

    // Función para ordenar los parámetros
    const sortParams = (params) => {
        return params.sort((a, b) => {
            // Si ambos tienen OrdenNumero, se compara por OrdenNumero
            if (a.OrdenNumero !== null && b.OrdenNumero !== null) {
                // Si OrdenNumero es igual, ordenamos por id_param
                if (a.OrdenNumero === b.OrdenNumero) {
                    return a.id_param - b.id_param;
                }
                return a.OrdenNumero - b.OrdenNumero;
            }

            // Si uno tiene OrdenNumero y el otro no, el que tiene OrdenNumero va primero
            if (a.OrdenNumero !== null) return -1;
            if (b.OrdenNumero !== null) return 1;

            return a.id_param - b.id_param;
        });
    };

    const [orderedItems, setOrderedItems] = useState(sortParams(paramsData));

    const handleDragStart = (event, index) => {
        event.dataTransfer.setData('index', index);
    };

    const handleDrop = (event, targetIndex) => {
        const draggedIndex = event.dataTransfer.getData('index');
        const draggedItem = orderedItems[draggedIndex];
        const updatedItems = [...orderedItems];

        updatedItems.splice(draggedIndex, 1);
        updatedItems.splice(targetIndex, 0, draggedItem);

        updatedItems.forEach((item, index) => {
            item.OrdenNumero = index + 1;
        });

        setOrderedItems(updatedItems);
        console.log('Nuevo orden de items:', updatedItems);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const handleSave = async () => {
        console.log('Guardando los cambios...');
        console.log('Nuevo orden de items:', orderedItems);

        try {
            const response = await axiosInstance.post('/parametros/ordenarParametros', {
                orderedItems
            });
            showToast(response.data.message, 'success');
        } catch (error) {
            showToast(`Error al ordenar los parametros. Inténtalo de nuevo más tarde.`, 'error');
        }
    };

    return (
        <div className="flex flex-col items-center mt-12 mb-12 px-4">
            <div className='flex flex-row items-center gap-8'>
                <div>
                    <h1 className="text-4xl font-semibold text-gray-900 mb-2">Ordenar parámetros</h1>
                    <h2 className="text-xl font-medium text-gray-700 mb-6">Sistema de gestión de parámetros</h2>
                </div>
                <Instructions instructions={instructions} />

            </div>



            <div className="flex flex-col gap-4 p-6 max-w-lg w-full bg-white border-2 border-gray-300 rounded-xl">
                {orderedItems.map((item, index) => (
                    <div
                        key={item.id_param}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragOver={handleDragOver}
                        className="flex items-center bg-white p-4 mb-3 border-2 hover:border-gray-300 rounded-lg shadow-xl transition-all duration-300 ease-in-out cursor-move hover:bg-gray-50"
                    >
                        <span className="font-medium text-gray-800 text-lg">#{item.OrdenNumero} - {item.nombre_parametro} ({item.id_param})</span>
                    </div>
                ))}
            </div>

            <button
                onClick={handleSave}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-sky-900 to-sky-950 text-white rounded-xl shadow-md hover:from-sky-950 hover:to-sky-900 transition-all duration-300"
            >
                Guardar cambios
            </button>

            <CustomToast message={toast.message} type={toast.type} />
        </div>
    );
};

export default DragAndDropList;