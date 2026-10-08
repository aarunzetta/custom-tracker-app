import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { Trash2, Plus, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Column } from "@/stores/columnsStore";
import { type TableRow, useRowsStore } from "@/stores/rowsStore";
import { CellEditor } from "./CellEditor";

type DataTableProps = {
  columns: Column[];
  rows: TableRow[];
  pageId: string;
  isLoading: boolean;
};

export function DataTable({
  columns,
  rows,
  pageId,
  isLoading,
}: DataTableProps) {
  const { createRow, getCellState } = useRowsStore();

  const tableColumns = useMemo<ColumnDef<TableRow>[]>(() => {
    // Row number column
    const cols: ColumnDef<TableRow>[] = [
      {
        id: "_rownum",
        header: "#",
        cell: ({ row }) => (
          <span className="text-xs text-gray-400 select-none px-1">
            {row.index + 1}
          </span>
        ),
      },
    ];

    // Data columns
    columns.forEach((col, colIndex) => {
      cols.push({
        id: col.id,
        accessorFn: (row: TableRow) => row.cells[col.id]?.value ?? null,
        header: col.name,
        cell: ({ row, table }) => {
          const allRows = table.getRowModel().rows;
          const rowIndex = allRows.findIndex((r) => r.id === row.id);
          const cellState = getCellState(row.original.id, col.id);

          // Tab next — move to next column, or first column of next row
          function handleTabNext() {
            const nextColIndex = colIndex + 1;
            if (nextColIndex < columns.length) {
              // Focus next column in same row — handled by browser naturally
            } else if (rowIndex + 1 < allRows.length) {
              // Last column — would move to next row (future enhancement)
            }
          }

          // Tab prev — move to previous column
          function handleTabPrev() {
            // Browser handles naturally when we prevent default and don't override
          }

          return (
            <CellWrapper state={cellState}>
              <CellEditor
                column={col}
                rowId={row.original.id}
                value={row.original.cells[col.id]?.value ?? null}
                onTabNext={handleTabNext}
                onTabPrev={handleTabPrev}
              />
            </CellWrapper>
          );
        },
      });
    });

    // Delete column
    cols.push({
      id: "_actions",
      header: "",
      cell: ({ row }) => <RowDeleteButton rowId={row.original.id} />,
    });

    return cols;
  }, [columns, getCellState]);

  const table = useReactTable({
    data: rows,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
      </div>
    );
  }

  if (columns.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-gray-400">
        Add columns first to start tracking data.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="bg-gray-50 border-b border-gray-200"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      "px-3 py-2 text-left text-xs font-medium text-gray-500",
                      "border-r border-gray-200 last:border-r-0",
                      header.id === "_rownum" && "w-8",
                      header.id === "_actions" && "w-10",
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={tableColumns.length}
                  className="px-3 py-8 text-center text-sm text-gray-400"
                >
                  No rows yet. Click "Add row" to get started.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-gray-100 last:border-b-0",
                    "hover:bg-gray-50 transition-colors group",
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-3 py-1.5 border-r border-gray-100 last:border-r-0"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add row button */}
      <button
        onClick={() => createRow(pageId)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm w-fit",
          "text-gray-500 hover:text-gray-900 hover:bg-gray-100",
          "transition-colors",
        )}
      >
        <Plus className="w-3.5 h-3.5" />
        Add row
      </button>
    </div>
  );
}

// ─── Cell wrapper — shows saving/error state ─────────────────────────────────

type CellWrapperProps = {
  state: "idle" | "saving" | "error";
  children: React.ReactNode;
};

function CellWrapper({ state, children }: CellWrapperProps) {
  return (
    <div className="relative">
      {children}
      {/* Saving spinner — top right corner */}
      {state === "saving" && (
        <div className="absolute top-0.5 right-0.5 pointer-events-none">
          <Loader2 className="w-2.5 h-2.5 text-gray-400 animate-spin" />
        </div>
      )}
      {/* Error indicator */}
      {state === "error" && (
        <div
          className="absolute top-0.5 right-0.5 pointer-events-none"
          title="Failed to save"
        >
          <AlertCircle className="w-2.5 h-2.5 text-red-400" />
        </div>
      )}
    </div>
  );
}

// ─── Row delete button ────────────────────────────────────────────────────────

function RowDeleteButton({ rowId }: { rowId: string }) {
  const { deleteRow } = useRowsStore();

  return (
    <button
      onClick={() => deleteRow(rowId)}
      className={cn(
        "w-6 h-6 flex items-center justify-center rounded",
        "text-gray-300 hover:text-red-500 hover:bg-red-50",
        "opacity-0 group-hover:opacity-100 transition-all",
      )}
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
}
