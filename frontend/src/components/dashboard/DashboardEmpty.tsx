import { BarChart2, Plus } from "lucide-react";

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
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <BarChart2 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            No data yet
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Add columns and rows to your data first, then create charts to
            visualize it.
          </p>
          <button
            onClick={onOpenData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <BarChart2 className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-1">
          No charts yet
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Create your first chart to start visualizing your data.
        </p>
        <button
          onClick={onAddWidget}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add chart
        </button>
      </div>
    </div>
  );
}
