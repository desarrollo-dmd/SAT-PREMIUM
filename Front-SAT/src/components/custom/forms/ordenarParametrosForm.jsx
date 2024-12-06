import { useLocation } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { Button } from '../../shadcn/button';
import { Label } from '../../shadcn/label';
import { Input } from '../../shadcn/input';
import { Card, CardContent, CardFooter } from '../../shadcn/card';
import { useAxiosInstance } from '../../../axiosInstance';
import CustomToast from '../CustomToast';
import { useToast } from '../../../hooks/use-toast';

const OrdenarParametrosForm = () => {
  const { state } = useLocation();
  const axiosInstance = useAxiosInstance();
  const { toast, showToast } = useToast();
  const paramsData = state?.paramsData || [];

  const [ordenNumeros, setOrdenNumeros] = useState(
    paramsData.reduce((acc, item) => {
      acc[item.id_param] = item.OrdenNumero || ''; // Inicializamos con el valor de OrdenNumero si existe
      return acc;
    }, {})
  );
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado para el botón de guardar

  // Maneja el cambio en el número ingresado
  const handleChange = (e, id_param) => {
    const { value } = e.target;

    setOrdenNumeros((prev) => ({
      ...prev,
      [id_param]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
  
    // Preparar el array con todos los datos de actualización
    const dataToUpdate = paramsData.map((item) => ({
      id_param: item.id_param,
      OrdenNumero: ordenNumeros[item.id_param],
    }));

    try {
      // Enviar el array completo de una vez
      await handleUpdate(dataToUpdate);
      showToast('Todos los parámetros se actualizaron correctamente.', 'success');
    } catch (error) {
      console.error('Error al actualizar parámetros:', error);
      showToast('Error al actualizar algunos parámetros.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleUpdate = useCallback(async (newData) => {
    try {
      const response = await axiosInstance.post(`/parametros/updateParamsOrder`, newData);
      showToast('Parámetro actualizado exitosamente.', 'success');
    } catch (error) {
      console.error('Error en handleUpdate:', error);
      const errorMessage =
        error.response?.data?.error || 'Error al actualizar el parámetro. Inténtalo de nuevo más tarde.';
      showToast(`Error: ${errorMessage}`, 'error');
      throw error;
    }
  }, []);

  return (
    <form
    onSubmit={(e) => {
      handleSubmit(e);
    }}
    className="max-w-4xl mx-auto mt-16 w-full"
  >
    <CustomToast message={toast.message} type={toast.type} />
    <Card className="shadow-xl border-2 border-gray-200 rounded-lg">
      <CardContent className="space-y-8 p-10 bg-gradient-to-r from-indigo-50 via-blue-50 to-gray-100">
        <h2 className="text-4xl font-extrabold text-gray-800 text-center tracking-tight">
          Ordenar Parámetros
        </h2>
        <p className="text-4xl text-gray-800 text-center tracking-tight">{state?.sistema}</p>
        <p className="text-lg text-center text-gray-600 mb-8">
          Ingresa los números de orden para cada parámetro. Estos serán utilizados para ordenar la información en el sistema.
        </p>
  
        {paramsData.map((item) => (
          <div
            key={item.id_param}
            className="flex flex-col lg:flex-row items-center space-y-4 lg:space-x-6 lg:space-y-0"
          >
            <Label
              htmlFor={`orden-${item.id_param}`}
              className="w-full lg:w-1/3 text-lg font-medium text-gray-700"
            >
              {item.nombre_parametro}
            </Label>
            <div className="w-full lg:w-2/3">
              <Input
                type="number"
                id={`orden-${item.id_param}`}
                value={ordenNumeros[item.id_param] || ''}
                onChange={(e) => handleChange(e, item.id_param)}
                className="w-full border-2 border-gray-300 p-4 rounded-xl text-gray-900 shadow-md focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-transform transform hover:scale-105 hover:border-indigo-500"
                placeholder="Ingrese un número"
              />
            </div>
          </div>
        ))}
      </CardContent>
  
      <CardFooter className="bg-gradient-to-r from-gray-200 via-white to-gray-100 p-6 flex justify-between items-center space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setOrdenNumeros({});
          }}
          className="bg-red-600 text-white font-bold py-2 px-4 rounded hover:bg-red-700 transition duration-300"
          disabled={isSubmitting}
        >
          Resetear
        </Button>
        <Button
          type="submit"
          className="bg-sky-900 text-white font-bold py-2 px-4 rounded hover:bg-sky-950 transition duration-300"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </Button>
      </CardFooter>
    </Card>
  </form>
  
  );
};

export default OrdenarParametrosForm;
