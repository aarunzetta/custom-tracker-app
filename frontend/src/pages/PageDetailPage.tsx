import { useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import { usePage } from "@/hooks/usePage";
import { useColumnsStore } from "@/stores/columnsStore";
import { EditableTitle } from "@/components/page/EditableTitle";
import { IconPicker } from "@/components/page/IconPicker";
import { DataPanelToggle } from "@/components/page/DataPanelToggle";
import { DataPanel } from "@/components/page/DataPanel";
import { PageEmptyState } from "@/components/page/PageEmptyState";

export function PageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { page, isLoading, error, updatePage } = usePage(id);
  const { columns } = useColumnsStore();
  const [dataPanelOpen, setDataPanelOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Page not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Page header */}
      <div className="px-8 py-5 border-b border-gray-200 bg-white shrink-0">
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
        <div className="flex-1 overflow-y-auto">
          {columns.length === 0 ? (
            <PageEmptyState onOpenData={() => setDataPanelOpen(true)} />
          ) : (
            // Dashboard goes here in Week 4
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              Dashboard coming in Week 4
            </div>
          )}
        </div>

        <DataPanel
          isOpen={dataPanelOpen}
          onClose={() => setDataPanelOpen(false)}
          pageId={page.id}
        />
      </div>
    </div>
  );
}
