import { useEffect, useState } from "react";
import { X, Table2, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useColumnsStore } from "@/stores/columnsStore";
import { useRowsStore } from "@/stores/rowsStore";
import { AddColumnPopover } from "@/components/column/AddColumnPopover";
import { ColumnList } from "@/components/column/ColumnList";
import { DataTable } from "@/components/table/DataTable";

type Tab = "table" | "columns";

type DataPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  pageId: string;
};

export function DataPanel({ isOpen, onClose, pageId }: DataPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("table");
  const { columns, isLoading: colsLoading, fetchColumns } = useColumnsStore();
  const { rows, isLoading: rowsLoading, fetchRows } = useRowsStore();

  useEffect(() => {
    if (isOpen && pageId) {
      fetchColumns(pageId);
      fetchRows(pageId);
    }
  }, [isOpen, pageId]);

  return (
    <div
      className={cn(
        "border-t border-gray-200 bg-white shrink-0",
        "transition-all duration-300 ease-in-out",
        isOpen ? "h-80" : "h-0",
      )}
    >
      {isOpen && (
        <div className="flex flex-col h-full">
          {/* Panel header */}
          <div className="flex items-center justify-between px-6 py-2.5 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-1">
              <TabButton
                label="Table"
                icon={<Table2 className="w-3.5 h-3.5" />}
                isActive={activeTab === "table"}
                onClick={() => setActiveTab("table")}
              />
              <TabButton
                label="Columns"
                icon={<Settings2 className="w-3.5 h-3.5" />}
                isActive={activeTab === "columns"}
                onClick={() => setActiveTab("columns")}
              />
              <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {rows.length} {rows.length === 1 ? "row" : "rows"}
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Table tab — scrollable */}
          {activeTab === "table" && (
            <div className="flex-1 overflow-auto px-6 py-4">
              <DataTable
                columns={columns}
                rows={rows}
                pageId={pageId}
                isLoading={colsLoading || rowsLoading}
              />
            </div>
          )}

          {/* Columns tab — split into scrollable list + fixed bottom button */}
          {activeTab === "columns" && (
            <div className="flex flex-col flex-1 min-h-0">
              {/* Scrollable columns list */}
              <div className="flex-1 overflow-y-auto px-6 pt-4">
                <ColumnList columns={columns} pageId={pageId} />
              </div>

              {/* Add column button sits OUTSIDE the scroll container */}
              {/* This means it's never clipped by overflow */}
              <div className="px-6 py-3 border-t border-gray-100 shrink-0">
                <AddColumnPopover pageId={pageId} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type TabButtonProps = {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
};

function TabButton({ label, icon, isActive, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors",
        isActive
          ? "bg-gray-100 text-gray-900 font-medium"
          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
