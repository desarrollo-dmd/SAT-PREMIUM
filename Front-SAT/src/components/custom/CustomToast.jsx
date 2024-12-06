import React from 'react';
import { X } from 'lucide-react';

const toastStyles = {
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
  default: 'bg-gray-800 text-white',
};

/**
 * Componente CustomToast.
 *
 * Este componente muestra una notificación tipo toast en la esquina inferior
 * derecha de la pantalla. Incluye un mensaje y un botón para cerrarla. 
 * Utiliza el estado del tipo de toast para aplicar diferentes estilos, 
 * y se oculta si no hay mensaje que mostrar. El botón de cierre llama a 
 * una función proporcionada a través de props para manejar su eliminación.
 */
const CustomToast = ({ message, type, onClose }) => {
  if (!message) return null;

  return (
    <div
    style={{ zIndex: 9999 }}
      className={`fixed bottom-4 right-4 p-4 rounded shadow-lg flex items-center ${toastStyles[type]} `}
      role="alert"
    >
      <div className="flex-grow">{message}</div>
      <button onClick={onClose} className="ml-4 p-1" aria-label="Close">
        <X className="h-5 w-5" />
      </button>
    </div>
  );
};

export default CustomToast;
