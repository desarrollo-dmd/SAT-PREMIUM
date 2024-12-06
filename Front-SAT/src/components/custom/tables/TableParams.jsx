import { TableGeneric } from './TableGeneric'

/**
 * Componente TablaDinamica
 *
 * Este componente se encarga de renderizar una sección que contiene
 * una tabla dinámica. La tabla obtiene sus datos de un endpoint específico
 * y permite filtrar los parámetros según el nombre del parámetro.
 * Se adapta a diferentes tamaños de pantalla y está diseñado para ocupar
 * toda la altura de la pantalla.
 */
export function TablaDinamica() {
  return (
    <section className="flex flex-col items-center min-h-screen w-full bg-white p-0 md:p-0 lg:p-0">
      <TableGeneric
        endpoint="parametros/tablaParametros"
        filtro="nombre_parametro"
        entity="parametros"
      />
    </section>
  );
}



