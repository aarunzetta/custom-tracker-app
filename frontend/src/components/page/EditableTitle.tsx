import { useState, useRef, useEffect } from "react";

type EditableTitleProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function EditableTitle({
  value,
  onChange,
  placeholder = "Untitled",
}: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep draft in sync if value changes externally
  useEffect(() => {
    if (!isEditing) setDraft(value);
  }, [value, isEditing]);

  // Auto focus when editing starts
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  function handleSubmit() {
    const trimmed = draft.trim();
    if (!trimmed) {
      setDraft(value);
      setIsEditing(false);
      return;
    }
    if (trimmed !== value) {
      onChange(trimmed);
    }
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
          if (e.key === "Escape") {
            setDraft(value);
            setIsEditing(false);
          }
        }}
        className="text-2xl font-bold text-gray-900 bg-transparent border-none outline-none w-full"
        placeholder={placeholder}
      />
    );
  }

  return (
    <h1
      onClick={() => setIsEditing(true)}
      className="text-2xl font-bold text-gray-900 cursor-text hover:bg-gray-100 rounded px-1 -mx-1 transition-colors"
      title="Click to edit"
    >
      {value || placeholder}
    </h1>
  );
}
