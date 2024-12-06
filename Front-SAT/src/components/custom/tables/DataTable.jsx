"use client";
import { Input } from "../../shadcn/input";
import { CircleCheckBig, CircleX } from 'lucide-react';
import * as React from "react";
import {
  flexRender,
  getSortedRowModel,
  getFilteredRowModel,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../shadcn/table";
import CustomToast from '../CustomToast';
import { useToast } from '../../../hooks/use-toast';
/**
 * Componente DataTable que renderiza una tabla de datos con características 
 * de filtrado, ordenamiento y selección de filas.
 * 
 * @param {Object} props - Propiedades del componente.
 * @param {Array} props.columns - Definición de las columnas de la tabla.
 * @param {Array} props.data - Datos a mostrar en la tabla.
 * @param {string} props.filtro - Nombre de la propiedad por la cual se filtrará.
 * 
 * @returns {JSX.Element} - Elemento JSX que representa la tabla de datos.
 */
export function DataTable({ columns, data, filtro }) {
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [selectedRowId, setSelectedRowId] = React.useState(null);
  const { toast, showToast } = useToast();

  if (!columns || !data) {
    return <div className="text-red-500">Las columnas o los datos están faltando.</div>;
  }
  const filteredColumns = columns.filter(column => column.meta?.visible !== false);
  const processedData = React.useMemo(() => {
    return data.map(row => ({
      ...row,
      [filtro]: String(row[filtro]),
    }));
  }, [data, filtro]);


  const table = useReactTable({
    data: processedData,
    columns: filteredColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
  });

  // Obteniendo la columna para el filtro basado en el prop `filtro`
  const filterColumn = table.getColumn(filtro);

  /**
   * Maneja el evento de clic en una fila de la tabla.
   * 
   * Esta función se ejecuta cuando se hace clic en una fila, actualizando el estado
   * para almacenar el ID de la fila seleccionada. Esto permite realizar acciones adicionales
   * basadas en la fila seleccionada, como mostrar detalles o realizar ediciones.
   * 
   * @param {string|number} rowId - El ID de la fila que fue clicada.
   */
  const handleRowClick = (rowId) => {
    setSelectedRowId(rowId); // Actualiza el estado con el ID de la fila clicada
  };

  return (
    <>
      <CustomToast message={toast.message} type={toast.type} />
      <div className="">
        <div className="flex items-center py-4">
          {filterColumn && (
            <Input
              placeholder={`Buscar por ${filtro}...`}
              value={filterColumn.getFilterValue() ?? ""}
              onChange={(event) =>
                filterColumn.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          )}
        </div>

        <div className="flex flex-col h-auto max-h-[calc(100vh-4rem)] w-full rounded-md border shadow-2xl overflow-hidden">
          <Table className="flex-1 overflow-y-auto w-full">
            <TableHeader className="sticky top-0 z-10 bg-white">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="bg-white text-center">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={() => handleRowClick(row.id)}
                    data-state={selectedRowId === row.id ? "selected" : undefined}
                    className={`cursor-pointer ${selectedRowId === row.id ? "bg-blue-200" : ""} text-center`}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const cellValue = cell.getValue();
                      const isAprobadoColumn = cell.column.id === 'aprobado' || cell.column.id === 'autorizacionSAT' ||
                        cell.column.id === 'autorizacionTDB' || cell.column.id === 'autorizacionVariadores' || cell.column.id === 'autorizacionControlDeHoras';
                      const displayValue = isAprobadoColumn
                        ? cellValue === true
                          ? <CircleCheckBig className="text-green-600 ml-auto mr-auto" />
                          : cellValue === false
                            ? <CircleX className="text-red-600 ml-auto mr-auto" />
                            : ''
                        : flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        );

                      return (
                        <TableCell key={cell.id}>
                          {displayValue}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={table.getHeaderGroups().flatMap(group => group.headers).length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
