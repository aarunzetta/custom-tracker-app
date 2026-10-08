import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

type CheckboxCellProps = {
  value: string | null;
  onSave: (value: string) => void;
};

export function CheckboxCell({ value, onSave }: CheckboxCellProps) {
  // We store "true" or "false" as strings in the cell value
  const isChecked = value === "true";

  function handleToggle() {
    onSave(isChecked ? "false" : "true");
  }

  return (
    <div className="flex items-center px-1">
      <button
        onClick={handleToggle}
        className={cn(
          "w-4 h-4 rounded border-2 flex items-center justify-center",
          "transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200",
          isChecked
            ? "bg-gray-900 border-gray-900"
            : "bg-white border-gray-300 hover:border-gray-400",
        )}
      >
        {isChecked && (
          <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
        )}
      </button>
    </div>
  );
}
