import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type DataPanelProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function DataPanel({ isOpen, onClose }: DataPanelProps) {
  return (
    <div
      className={cn(
        "border-t border-gray-200 bg-white overflow-hidden",
        "transition-all duration-300 ease-in-out",
        isOpen ? "h-80" : "h-0",
      )}
    >
      {/* Panel header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">Data</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            0 rows
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Panel content — table goes here in Week 3 */}
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Table coming in Week 3
      </div>
    </div>
  );
}
