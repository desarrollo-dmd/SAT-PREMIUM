import { TableGeneric } from "./TableGeneric";

/**
 * Componente TableUsers
 *
 * Este componente se encarga de renderizar una sección que contiene
 * una tabla con información sobre los usuarios. La tabla obtiene
 * sus datos de un endpoint específico y permite filtrar los usuarios
 * según su nombre de usuario. Está diseñado para ocupar toda la altura
 * de la pantalla y se adapta a diferentes tamaños de pantalla.
 */
export function TableUsers() {
  return (
    <section className="flex flex-col items-center min-h-screen w-full bg-white p-0 md:p-0 lg:p-0">
      <TableGeneric
        endpoint="usuarios/tablaUsuarios"
        filtro="usuario"
        entity="usuarios"
      />
    </section>
  );
}
