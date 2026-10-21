import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="border-t border-(--color-border) bg-(--color-surface) shrink-0 flex flex-col"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 320, opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ overflow: "hidden" }}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-6 py-2.5 border-b border-(--color-border) shrink-0">
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
              <span
                className="ml-2 text-xs px-2 py-0.5 rounded-full"
                style={{
                  color: "var(--color-text-faint)",
                  background: "var(--color-surface-2)",
                }}
              >
                {rows.length} {rows.length === 1 ? "row" : "rows"}
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-(--color-surface-2) transition-colors"
              style={{ color: "var(--color-text-faint)" }}
              aria-label="Close data panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Table tab */}
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

          {/* Columns tab */}
          {activeTab === "columns" && (
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto px-6 pt-4">
                <ColumnList columns={columns} pageId={pageId} />
              </div>
              <div className="px-6 py-3 border-t border-(--color-border) shrink-0">
                <AddColumnPopover pageId={pageId} />
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Tab button ───────────────────────────────────────────────────────────────

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
        isActive ? "font-medium" : "",
      )}
      style={{
        background: isActive ? "var(--color-surface-2)" : "transparent",
        color: isActive
          ? "var(--color-text-primary)"
          : "var(--color-text-muted)",
      }}
    >
      {icon}
      {label}
    </button>
  );
}
