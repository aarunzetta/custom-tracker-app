import { useEffect, useState } from "react";
import { useWidgetsStore, type Widget } from "@/stores/widgetsStore";
import { useColumnsStore } from "@/stores/columnsStore";
import { useRowsStore } from "@/stores/rowsStore";
import { WidgetGrid } from "./WidgetGrid";
import { DashboardEmpty } from "./DashboardEmpty";
import { AddWidgetButton } from "./AddWidgetButton";
import { WidgetConfigModal } from "./WidgetConfigModal";
import { DashboardSkeleton } from "@/components/ui/Skeleton";

type DashboardProps = {
  pageId: string;
  onOpenData: () => void;
};

export function Dashboard({ pageId, onOpenData }: DashboardProps) {
  const { widgets, isLoading, fetchWidgets } = useWidgetsStore();
  const { columns, fetchColumns } = useColumnsStore();
  const { rows, fetchRows } = useRowsStore();
  const [addWidgetOpen, setAddWidgetOpen] = useState(false);
  const [configuringWidget, setConfiguringWidget] = useState<Widget | null>(
    null,
  );

  // Initial fetch
  useEffect(() => {
    if (pageId) {
      fetchWidgets(pageId);
      fetchColumns(pageId);
      fetchRows(pageId);
    }
  }, [pageId]);

  // Auto-refresh rows whenever the data panel makes changes
  // The rows store updates optimistically, so charts re-render automatically
  // No extra fetch needed — Zustand reactivity handles it

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto">
        <DashboardSkeleton />
      </div>
    );
  }

  if (widgets.length === 0) {
    return (
      <div className="flex-1 flex flex-col">
        <DashboardEmpty
          hasColumns={columns.length > 0}
          onAddWidget={() => setAddWidgetOpen(true)}
          onOpenData={onOpenData}
        />
        <div className="absolute">
          <AddWidgetButton
            pageId={pageId}
            open={addWidgetOpen}
            onOpenChange={setAddWidgetOpen}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white shrink-0">
        <p className="text-xs text-gray-400">
          {widgets.length} {widgets.length === 1 ? "widget" : "widgets"} —{" "}
          {rows.length} {rows.length === 1 ? "row" : "rows"}
        </p>
        <AddWidgetButton
          pageId={pageId}
          open={addWidgetOpen}
          onOpenChange={setAddWidgetOpen}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <WidgetGrid widgets={widgets} onConfigure={setConfiguringWidget} />
      </div>

      <WidgetConfigModal
        widget={configuringWidget}
        onClose={() => setConfiguringWidget(null)}
      />
    </div>
  );
}
