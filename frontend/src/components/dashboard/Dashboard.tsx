import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useWidgetsStore, type Widget } from "@/stores/widgetsStore";
import { useColumnsStore } from "@/stores/columnsStore";
import { useRowsStore } from "@/stores/rowsStore";
import { WidgetGrid } from "./WidgetGrid";
import { DashboardEmpty } from "./DashboardEmpty";
import { AddWidgetButton } from "./AddWidgetButton";
import { WidgetConfigModal } from "./WidgetConfigModal";

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

  useEffect(() => {
    if (pageId) {
      fetchWidgets(pageId);
      fetchColumns(pageId);
      fetchRows(pageId);
    }
  }, [pageId]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
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
      {/* Toolbar */}
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

      {/* Widget grid */}
      <div className="flex-1 overflow-y-auto">
        <WidgetGrid widgets={widgets} onConfigure={setConfiguringWidget} />
      </div>

      {/* Config modal */}
      <WidgetConfigModal
        widget={configuringWidget}
        onClose={() => setConfiguringWidget(null)}
      />
    </div>
  );
}
