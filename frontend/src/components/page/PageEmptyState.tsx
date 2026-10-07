import { LayoutGrid, Plus } from "lucide-react";

type PageEmptyStateProps = {
  onOpenData: () => void;
};

export function PageEmptyState({ onOpenData }: PageEmptyStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-sm">
        {/* Illustration */}
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <LayoutGrid className="w-8 h-8 text-gray-400" />
        </div>

        <h3 className="text-base font-semibold text-gray-900 mb-1">
          No data yet
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Open the data panel to add columns and start tracking your items.
        </p>

        <button
          onClick={onOpenData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add columns
        </button>
      </div>
    </div>
  );
}
