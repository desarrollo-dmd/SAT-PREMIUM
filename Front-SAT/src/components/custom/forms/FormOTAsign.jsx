import { TableGeneric } from "../tables/TableGeneric";

/**
 * Componente que representa la vista de las órdenes de trabajo asignadas.
 * 
 * Este componente:
 * 1. Define una sección que utiliza estilos de Flexbox para centrar su contenido.
 * 2. Utiliza el componente `TableGeneric` para mostrar una tabla que 
 *    lista las órdenes de trabajo asignadas.
 * 3. Proporciona un endpoint para la obtención de datos, un filtro 
 *    para la búsqueda y una entidad para su identificación.
 * 
 * @returns {JSX.Element} - Retorna un elemento JSX que representa la 
 *    estructura del componente.
 */
export function FormOTAsignadas() {
  return (
    <section className="flex flex-col items-center min-h-screen w-full bg-white p-0 md:p-0 lg:p-0">
      <TableGeneric
        endpoint="ordenes/tablaOtAsignadas"
        filtro="titulo"
        entity="ordenes"
      />
    </section>
  );
}
