import { useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
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
import { TableSkeleton } from "@/components/ui/Skeleton";

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

  const parentRef = useRef<HTMLDivElement>(null);
  const tableRows = table.getRowModel().rows;

  const rowVirtualizer = useVirtualizer({
    count: tableRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 41, // approximate row height in px
    overscan: 8, // extra rows rendered above/below the visible area
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? rowVirtualizer.getTotalSize() - virtualRows[virtualRows.length - 1].end
      : 0;

  // IDs for the sortable context — only the data columns, not _rownum or _actions
  const sortableColumnIds = columns.map((c) => c.id);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const fromColumn = columns.find((c) => c.id === active.id);
    const toColumn = columns.find((c) => c.id === over.id);

    if (!fromColumn || !toColumn) return;

    await reorderColumns(fromColumn.order, toColumn.order);
  }

  if (isLoading) {
    return <TableSkeleton />;
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
        <div
          ref={parentRef}
          className="max-h-52 overflow-auto rounded-lg border border-(--color-border)"
        >
          <table className="w-full text-sm border-collapse">
            <thead
              className="sticky top-0 z-20"
              style={{ background: "var(--color-surface-2)" }}
            >
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b border-(--color-border)"
                  style={{ background: "var(--color-surface-2)" }}
                >
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={cn(
                        "px-3 py-2 text-left text-xs font-medium",
                        "text-(--color-text-muted)",
                        "border-r border-(--color-border) last:border-r-0",
                        header.id === "_rownum" &&
                          "w-8 sticky left-0 bg-gray-50 z-10",
                        header.id === "_actions" && "w-10",
                      )}
                      style={
                        header.id === "_rownum"
                          ? { background: "var(--color-surface-2)" }
                          : {}
                      }
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
              {tableRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={tableColumns.length}
                    className="px-3 py-12 text-center"
                  >
                    <p className="text-sm text-(--color-text-muted) mb-1">
                      No rows yet
                    </p>
                    <p className="text-xs text-(--color-text-faint)">
                      Click "Add row" below to get started
                    </p>
                  </td>
                </tr>
              ) : (
                <>
                  {paddingTop > 0 && (
                    <tr aria-hidden="true">
                      <td
                        colSpan={tableColumns.length}
                        style={{ height: paddingTop, padding: 0 }}
                      />
                    </tr>
                  )}

                  {virtualRows.map((virtualRow) => {
                    const row = tableRows[virtualRow.index];
                    return (
                      <tr
                        key={row.id}
                        className="border-b border-(--color-border) last:border-b-0 hover:bg-(--color-surface-2) transition-colors group"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className={cn(
                              "px-3 py-1.5 border-r border-(--color-border) last:border-r-0",
                              cell.column.id === "_rownum" &&
                                "sticky left-0 z-10",
                            )}
                            style={
                              cell.column.id === "_rownum"
                                ? { background: "var(--color-surface)" }
                                : undefined
                            }
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}

                  {paddingBottom > 0 && (
                    <tr aria-hidden="true">
                      <td
                        colSpan={tableColumns.length}
                        style={{ height: paddingBottom, padding: 0 }}
                      />
                    </tr>
                  )}
                </>
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
      aria-label="Delete row"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
}
