import { useState, useRef, useEffect } from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

type UrlCellProps = {
  value: string | null;
  onSave: (value: string | null) => void;
};

export function UrlCell({ value, onSave }: UrlCellProps) {
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

  function getHref(url: string) {
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `https://${url}`;
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="url"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        placeholder="https://"
        className={cn(
          "w-full min-w-32 px-1.5 py-0.5 text-sm rounded",
          "border border-blue-400 outline-none",
          "focus:ring-2 focus:ring-blue-200",
        )}
      />
    );
  }

  return (
    <div className="min-h-7 min-w-32 flex items-center gap-1.5 px-1 rounded group">
      {value ? (
        <>
          <a
            href={getHref(value)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-sm text-blue-600 hover:underline truncate max-w-32"
          >
            {value}
          </a>
          <ExternalLink className="w-3 h-3 text-gray-400 shrink-0" />
          <button
            onClick={handleEdit}
            className="text-xs text-gray-400 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity ml-1"
          >
            Edit
          </button>
        </>
      ) : (
        <div
          onClick={handleEdit}
          className="cursor-text w-full hover:bg-gray-100 transition-colors rounded px-0.5"
        >
          <span className="text-gray-300">—</span>
        </div>
      )}
    </div>
  );
}
