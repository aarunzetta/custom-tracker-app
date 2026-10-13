import { LayoutGrid, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type PageEmptyStateProps = {
  onOpenData: () => void;
};

export function PageEmptyState({ onOpenData }: PageEmptyStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-(--color-surface-2) flex items-center justify-center mx-auto mb-4">
          <LayoutGrid className="w-8 h-8 text-(--color-text-faint)" />
        </div>
        <h3 className="text-base font-semibold text-(--color-text-primary) mb-1">
          No data yet
        </h3>
        <p className="text-sm text-(--color-text-muted) mb-6">
          Open the data panel to add columns and start tracking your items.
        </p>
        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={onOpenData}
        >
          Add columns
        </Button>
      </div>
    </div>
  );
}
