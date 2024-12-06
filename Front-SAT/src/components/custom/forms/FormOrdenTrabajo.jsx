import { TableOT } from "../tables/TableOT";

/**
 * Componente que representa la vista del formulario de órdenes de trabajo.
 * 
 * Este componente:
 * 1. Define una sección con un diseño flexible para centrar su contenido.
 * 2. Aplica un padding de 6 unidades para el espaciado interior.
 * 3. Utiliza el componente `TableOT` para mostrar una tabla relacionada 
 *    con las órdenes de trabajo.
 * 
 * @returns {JSX.Element} - Retorna un elemento JSX que representa la 
 *    estructura del componente.
 */
export function FormOrdenTrabajo() {
  return (
    <section className="flex flex-col items-center min-h-screen w-full p-6">
      <TableOT />
    </section>
  );
}
