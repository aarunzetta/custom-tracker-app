import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useColumnsStore } from "@/stores/columnsStore";
import { AddColumnPopover } from "@/components/column/AddColumnPopover";
import { ColumnList } from "@/components/column/ColumnList";

type DataPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  pageId: string;
};

export function DataPanel({ isOpen, onClose, pageId }: DataPanelProps) {
  const { columns, isLoading, fetchColumns } = useColumnsStore();

  // Fetch columns when panel opens
  useEffect(() => {
    if (isOpen && pageId) {
      fetchColumns(pageId);
    }
  }, [isOpen, pageId]);

  return (
    <div
      className={cn(
        "border-t border-gray-200 bg-white shrink-0",
        "transition-all duration-300 ease-in-out",
        isOpen ? "h-72" : "h-0",
      )}
    >
      {/* Panel header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-900">Data</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {columns.length} {columns.length === 1 ? "column" : "columns"}
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Panel content */}
      <div className="px-6 py-4 overflow-visible">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Columns list */}
            <ColumnList columns={columns} pageId={pageId} />

            {/* Add column button */}
            <AddColumnPopover pageId={pageId} />
          </div>
        )}
      </div>
    </div>
  );
}
