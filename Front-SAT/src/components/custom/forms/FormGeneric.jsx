import React, { useState } from 'react';

/**
 * Componente de formulario genérico que permite la creación dinámica de campos.
 * 
 * Este componente acepta una lista de campos y genera un formulario con los 
 * tipos de entrada especificados. Permite manejar cambios en los campos de 
 * entrada y envía los datos al ser enviado.
 * 
 * Props:
 * @param {Array} fields - Un array de objetos que define los campos del formulario, 
 *                         cada objeto debe contener `type`, `name`, `label` 
 *                         y, si es un campo de tipo `select`, `options`.
 * 
 * Contiene:
 * - Manejo del estado del formulario.
 * - Función para manejar cambios en los campos.
 * - Función para manejar el envío del formulario.
 */
export function FormGeneric({ fields }) {
    const [formData, setFormData] = useState({});

    /*
     *
     * Maneja el evento de cambio en los campos del formulario.
     * 
     * Esta función se activa cada vez que un usuario cambia el valor de un campo de entrada. 
     * Extrae el nombre y el valor del campo modificado, y actualiza el estado del formulario 
     * con el nuevo valor, manteniendo los valores anteriores.
     * 
     * @param {Event} e - El evento de cambio que se genera al modificar un campo de entrada.
    */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    /**
     * Maneja el evento de envío del formulario.
     * 
     * Esta función se activa cuando el usuario intenta enviar el formulario. 
     * Evita el comportamiento por defecto del navegador (que es refrescar la página) 
     * para permitir un manejo personalizado de la lógica de envío, como 
     * la validación de datos o el envío a un servidor.
     * 
     * @param {Event} e - El evento de envío que se genera al intentar enviar el formulario.
     */
    const handleSubmit = (e) => {
        e.preventDefault();
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Nombre:</label>
                <input
                    type="text"
                    name="nombre"
                    onChange={handleChange}
                />
            </div>
            <div>
                <label>Edad:</label>
                <input
                    type="number"
                    name="edad"
                    onChange={handleChange}
                />
            </div>

            {fields.map((field, index) => {
                switch (field.type) {
                    case 'text':
                        return (
                            <div key={index}>
                                <label>{field.label}</label>
                                <input
                                    type="text"
                                    name={field.name}
                                    onChange={handleChange}
                                />
                            </div>
                        );
                    case 'number':
                        return (
                            <div key={index}>
                                <label>{field.label}</label>
                                <input
                                    type="number"
                                    name={field.name}
                                    onChange={handleChange}
                                />
                            </div>
                        );
                    case 'email':
                        return (
                            <div key={index}>
                                <label>{field.label}</label>
                                <input
                                    type="email"
                                    name={field.name}
                                    onChange={handleChange}
                                />
                            </div>
                        );
                    case 'select':
                        return (
                            <div key={index}>
                                <label>{field.label}</label>
                                <select name={field.name} onChange={handleChange}>
                                    {field.options.map((option, idx) => (
                                        <option key={idx} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        );
                    default:
                        return null;
                }
            })}
            <button type="submit">Enviar</button>
        </form>
    );
};
