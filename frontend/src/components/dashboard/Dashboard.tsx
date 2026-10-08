import { useEffect, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWidgetsStore } from "@/stores/widgetsStore";
import { useColumnsStore } from "@/stores/columnsStore";
import { useRowsStore } from "@/stores/rowsStore";
import type { Widget } from "@/stores/widgetsStore";
import { WidgetGrid } from "./WidgetGrid";
import { DashboardEmpty } from "./DashboardEmpty";

type DashboardProps = {
  pageId: string;
  onOpenData: () => void;
};

export function Dashboard({ pageId, onOpenData }: DashboardProps) {
  const { widgets, isLoading, fetchWidgets } = useWidgetsStore();
  const { columns, fetchColumns } = useColumnsStore();
  const { rows, fetchRows } = useRowsStore();
  const [configuringWidget, setConfiguringWidget] = useState<Widget | null>(
    null,
  );

  useEffect(() => {
    if (pageId) {
      fetchWidgets(pageId);
      fetchColumns(pageId);
      fetchRows(pageId);
    }
  }, [pageId]);

  function handleAddWidget() {
    // Widget creation modal — built in Day 4
    console.log("Add widget — coming Day 4");
  }

  function handleConfigure(widget: Widget) {
    setConfiguringWidget(widget);
    console.log("Configure widget — coming Day 4", widget);
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (widgets.length === 0) {
    return (
      <DashboardEmpty
        hasColumns={columns.length > 0}
        onAddWidget={handleAddWidget}
        onOpenData={onOpenData}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Dashboard toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white shrink-0">
        <p className="text-xs text-gray-400">
          {widgets.length} {widgets.length === 1 ? "widget" : "widgets"} —{" "}
          {rows.length} {rows.length === 1 ? "row" : "rows"}
        </p>
        <button
          onClick={handleAddWidget}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm",
            "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
            "transition-colors border border-gray-200",
          )}
        >
          <Plus className="w-3.5 h-3.5" />
          Add chart
        </button>
      </div>

      {/* Widget grid — scrollable */}
      <div className="flex-1 overflow-y-auto">
        <WidgetGrid widgets={widgets} onConfigure={handleConfigure} />
      </div>
    </div>
  );
}
