import { BarChart2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type DashboardEmptyProps = {
  hasColumns: boolean;
  onAddWidget: () => void;
  onOpenData: () => void;
};

export function DashboardEmpty({
  hasColumns,
  onAddWidget,
  onOpenData,
}: DashboardEmptyProps) {
  if (!hasColumns) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-(--color-surface-2) flex items-center justify-center mx-auto mb-4">
            <BarChart2 className="w-8 h-8 text-(--color-text-faint)" />
          </div>
          <h3 className="text-base font-semibold text-(--color-text-primary) mb-1">
            No data yet
          </h3>
          <p className="text-sm text-(--color-text-muted) mb-6">
            Add columns and rows to your data first, then create charts to
            visualize it.
          </p>
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={onOpenData}
          >
            Add data
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-(--color-surface-2) flex items-center justify-center mx-auto mb-4">
          <BarChart2 className="w-8 h-8 text-(--color-text-faint)" />
        </div>
        <h3 className="text-base font-semibold text-(--color-text-primary) mb-1">
          No charts yet
        </h3>
        <p className="text-sm text-(--color-text-muted) mb-6">
          Create your first chart to start visualizing your data.
        </p>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={onAddWidget}
        >
          Add chart
        </Button>
      </div>
    </div>
  );
}
