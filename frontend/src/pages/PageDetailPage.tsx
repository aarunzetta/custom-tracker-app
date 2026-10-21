import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import { usePage } from "@/hooks/usePage";
import { useColumnsStore } from "@/stores/columnsStore";
import { useRowsStore } from "@/stores/rowsStore";
import { useWidgetsStore } from "@/stores/widgetsStore";
import { EditableTitle } from "@/components/page/EditableTitle";
import { IconPicker } from "@/components/page/IconPicker";
import { DataPanelToggle } from "@/components/page/DataPanelToggle";
import { DataPanel } from "@/components/page/DataPanel";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { HintBanner } from "@/components/page/HintBanner";
import { PageTransition } from "@/components/layout/PageTransition";

export function PageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { page, isLoading, error, updatePage } = usePage(id);
  const { columns } = useColumnsStore();
  const { rows } = useRowsStore();
  const { widgets } = useWidgetsStore();
  const [dataPanelOpen, setDataPanelOpen] = useState(false);
  const [addWidgetOpen, setAddWidgetOpen] = useState(false);

  useEffect(() => {
    return () => {
      useColumnsStore.setState({ columns: [] });
      useRowsStore.setState({ rows: [] });
      useWidgetsStore.setState({ widgets: [] });
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2
          className="w-5 h-5 animate-spin"
          style={{ color: "var(--color-text-faint)" }}
        />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle
            className="w-8 h-8 mx-auto mb-2"
            style={{ color: "var(--color-border-strong)" }}
          />
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Page not found
          </p>
        </div>
      </div>
    );
  }

  // Show hint when user has data but no charts
  const showHint =
    columns.length > 0 && rows.length > 0 && widgets.length === 0;

  return (
    <PageTransition>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Page header */}
        <div
          className="px-8 py-5 border-b shrink-0"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-surface)",
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <IconPicker
                value={page.icon}
                onChange={(icon) => updatePage({ icon })}
              />
              <EditableTitle
                value={page.name}
                onChange={(name) => updatePage({ name })}
              />
            </div>
            <div className="flex items-center gap-2 shrink-0 pt-1">
              <DataPanelToggle
                isOpen={dataPanelOpen}
                onToggle={() => setDataPanelOpen(!dataPanelOpen)}
              />
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Hint banner */}
          {showHint && <HintBanner onAddChart={() => setAddWidgetOpen(true)} />}

          {/* Dashboard */}
          <Dashboard
            pageId={page.id}
            onOpenData={() => setDataPanelOpen(true)}
            addWidgetOpen={addWidgetOpen}
            onAddWidgetOpenChange={setAddWidgetOpen}
          />

          {/* Data panel */}
          <DataPanel
            isOpen={dataPanelOpen}
            onClose={() => setDataPanelOpen(false)}
            pageId={page.id}
          />
        </div>
      </div>
    </PageTransition>
  );
}
