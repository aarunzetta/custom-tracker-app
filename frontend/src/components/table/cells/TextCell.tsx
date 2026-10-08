import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

type TextCellProps = {
  value: string | null;
  onSave: (value: string | null) => void;
};

export function TextCell({ value, onSave }: TextCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  function handleEdit() {
    // Reset draft to latest value when entering edit mode
    setDraft(value ?? "");
    setIsEditing(true);
  }

  function handleSave() {
    const trimmed = draft.trim();
    onSave(trimmed || null);
    setIsEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") setIsEditing(false);
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={cn(
          "w-full min-w-24 px-1.5 py-0.5 text-sm rounded",
          "border border-blue-400 outline-none",
          "focus:ring-2 focus:ring-blue-200",
        )}
      />
    );
  }

  return (
    <div
      onClick={handleEdit}
      className="min-h-7 min-w-24 flex items-center text-sm text-gray-900 px-1 cursor-text rounded hover:bg-gray-100 transition-colors"
    >
      {value ?? <span className="text-gray-300">—</span>}
    </div>
  );
}
