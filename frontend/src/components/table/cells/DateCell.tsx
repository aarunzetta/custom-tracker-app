import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

type DateCellProps = {
  value: string | null;
  onSave: (value: string | null) => void;
};

export function DateCell({ value, onSave }: DateCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      // Open the native date picker
      inputRef.current?.showPicker?.();
    }
  }, [isEditing]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    onSave(e.target.value || null);
    setIsEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") setIsEditing(false);
  }

  // Format date string for display: "2024-01-15" → "Jan 15, 2024"
  function formatDisplay(dateStr: string) {
    try {
      return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="date"
        defaultValue={value ?? ""}
        onChange={handleChange}
        onBlur={() => setIsEditing(false)}
        onKeyDown={handleKeyDown}
        className={cn(
          "w-full min-w-32 px-1.5 py-0.5 text-sm rounded",
          "border border-blue-400 outline-none",
          "focus:ring-2 focus:ring-blue-200",
        )}
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="min-h-7 min-w-32 flex items-center text-sm text-gray-900 px-1 cursor-pointer rounded hover:bg-gray-100 transition-colors"
    >
      {value ? formatDisplay(value) : <span className="text-gray-300">—</span>}
    </div>
  );
}
