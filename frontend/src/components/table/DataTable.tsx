import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Trash2, Plus, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Column, useColumnsStore } from "@/stores/columnsStore";
import { type TableRow, useRowsStore } from "@/stores/rowsStore";
import { CellEditor } from "./CellEditor";
import { SortableHeader } from "./SortableHeader";

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
  const { reorderColumns } = useColumnsStore();

  // dnd-kit sensors — PointerSensor works for both mouse and touch
  // The activationConstraint requires moving 8px before drag starts
  // This prevents accidental drags when clicking
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const tableColumns = useMemo<ColumnDef<TableRow>[]>(() => {
    const cols: ColumnDef<TableRow>[] = [
      // Row number column — static, not draggable
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

    columns.forEach((col) => {
      cols.push({
        id: col.id,
        accessorFn: (row: TableRow) => row.cells[col.id]?.value ?? null,
        // Use SortableHeader for draggable column headers
        header: () => <SortableHeader column={col} />,
        cell: ({ row }) => {
          const cellState = getCellState(row.original.id, col.id);
          return (
            <CellWrapper state={cellState}>
              <CellEditor
                column={col}
                rowId={row.original.id}
                value={row.original.cells[col.id]?.value ?? null}
              />
            </CellWrapper>
          );
        },
      });
    });

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

  // IDs for the sortable context — only the data columns, not _rownum or _actions
  const sortableColumnIds = columns.map((c) => c.id);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const fromColumn = columns.find((c) => c.id === active.id);
    const toColumn = columns.find((c) => c.id === over.id);

    if (!fromColumn || !toColumn) return;

    await reorderColumns(pageId, fromColumn.order, toColumn.order);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
      </div>
    );
  }

  if (columns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2">
        <p className="text-sm text-gray-400">
          No columns yet. Switch to the Columns tab to add one.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
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
                        header.id === "_rownum" &&
                          "w-8 sticky left-0 bg-gray-50 z-10",
                        header.id === "_actions" && "w-10",
                      )}
                    >
                      {/* Wrap data column headers in SortableContext */}
                      {header.id !== "_rownum" && header.id !== "_actions" ? (
                        <SortableContext
                          items={sortableColumnIds}
                          strategy={horizontalListSortingStrategy}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </SortableContext>
                      ) : header.isPlaceholder ? null : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
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
                    className="px-3 py-12 text-center"
                  >
                    <p className="text-sm text-gray-400 mb-1">No rows yet</p>
                    <p className="text-xs text-gray-300">
                      Click "Add row" below to get started
                    </p>
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
                        className={cn(
                          "px-3 py-1.5 border-r border-gray-100 last:border-r-0",
                          cell.column.id === "_rownum" &&
                            "sticky left-0 bg-white group-hover:bg-gray-50 z-10",
                        )}
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
      </DndContext>

      {/* Add row */}
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

// ─── Cell wrapper ─────────────────────────────────────────────────────────────

type CellWrapperProps = {
  state: "idle" | "saving" | "error";
  children: React.ReactNode;
};

function CellWrapper({ state, children }: CellWrapperProps) {
  return (
    <div className="relative">
      {children}
      {state === "saving" && (
        <div className="absolute top-0.5 right-0.5 pointer-events-none">
          <Loader2 className="w-2.5 h-2.5 text-gray-400 animate-spin" />
        </div>
      )}
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

// ─── Row delete button with confirm ──────────────────────────────────────────

function RowDeleteButton({ rowId }: { rowId: string }) {
  const { deleteRow } = useRowsStore();
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-gray-400 hover:text-gray-600 px-1"
        >
          Cancel
        </button>
        <button
          onClick={() => deleteRow(rowId)}
          className="text-xs text-white bg-red-500 hover:bg-red-600 px-1.5 py-0.5 rounded"
        >
          Delete
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
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
