import { Table2 } from "lucide-react";
import { cn } from "@/lib/utils";

type DataPanelToggleProps = {
  isOpen: boolean;
  onToggle: () => void;
};

export function DataPanelToggle({ isOpen, onToggle }: DataPanelToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium",
        "transition-colors border",
        isOpen
          ? "bg-gray-900 text-white border-gray-900 hover:bg-gray-700"
          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50",
      )}
    >
      <Table2 className="w-4 h-4" />
      {isOpen ? "Close data" : "Open data"}
    </button>
  );
}
