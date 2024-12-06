import { Input } from '../shadcn/input';
import { Label } from '../shadcn/label';

/**
 * Componente FieldInput.
 *
 * Este componente renderiza un campo de entrada que incluye una etiqueta y un
 * campo de texto. Recibe props para el texto de la etiqueta, el id del campo,
 * el tipo de entrada, el valor actual y una función para actualizar el valor. 
 * Permite a los usuarios ingresar información de manera controlada, 
 * manteniendo la accesibilidad al asociar la etiqueta con el campo de entrada.
 */
export function FieldInput({ label, id, type, value, setValor }) {
    return (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                type={type}
                value={value}
                onChange={(e) => setValor(e.target.value)}
                className="input-class"
            />
        </div>
    );
}