import { useState } from "react";
import { Trash2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Column, useColumnsStore } from "@/stores/columnsStore";
import { COLUMN_TYPES } from "@/config/columnTypes";

type ColumnListProps = {
  columns: Column[];
  pageId: string;
};

export function ColumnList({ columns, pageId }: ColumnListProps) {
  if (columns.length === 0) {
    return (
      <p className="text-xs text-gray-400 px-1 py-2">
        No columns yet. Add one above.
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {columns.map((column) => (
        <ColumnListItem key={column.id} column={column} pageId={pageId} />
      ))}
    </div>
  );
}

type ColumnListItemProps = {
  column: Column;
  pageId: string;
};

function ColumnListItem({ column }: ColumnListItemProps) {
  const { deleteColumn } = useColumnsStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const typeConfig = COLUMN_TYPES.find((t) => t.type === column.type);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteColumn(column.id);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2 py-1.5 rounded-lg group",
        "hover:bg-gray-50 transition-colors",
      )}
    >
      {/* Drag handle — visual only for now, drag in Week 3 */}
      <GripVertical className="w-3.5 h-3.5 text-gray-300 shrink-0 cursor-grab" />

      {/* Type icon */}
      <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
        {typeConfig?.icon}
      </div>

      {/* Column name and type */}
      <div className="flex-1 min-w-0">
        <span className="text-sm text-gray-900 truncate block">
          {column.name}
        </span>
      </div>

      {/* Type label */}
      <span className="text-xs text-gray-400 shrink-0">
        {typeConfig?.label}
      </span>

      {/* Delete */}
      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className={cn(
            "w-6 h-6 flex items-center justify-center rounded",
            "text-gray-300 hover:text-red-500 hover:bg-red-50",
            "opacity-0 group-hover:opacity-100 transition-all",
          )}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      ) : (
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setShowConfirm(false)}
            className="text-xs text-gray-500 hover:text-gray-700 px-1.5 py-0.5 rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-xs text-white bg-red-500 hover:bg-red-600 px-1.5 py-0.5 rounded disabled:opacity-50"
          >
            {isDeleting ? "..." : "Delete"}
          </button>
        </div>
      )}
    </div>
  );
}
