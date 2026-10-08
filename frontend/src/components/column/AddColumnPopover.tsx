import { useState, useRef, useEffect } from "react";
import { Plus, X, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { COLUMN_TYPES } from "@/config/columnTypes";
import { type ColumnType, useColumnsStore } from "@/stores/columnsStore";
import { useRowsStore } from "@/stores/rowsStore";

type Step = "pick-type" | "configure";

type AddColumnPopoverProps = {
  pageId: string;
};

export function AddColumnPopover({ pageId }: AddColumnPopoverProps) {
  const { fetchRows } = useRowsStore();
  const { createColumn } = useColumnsStore();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("pick-type");
  const [selectedType, setSelectedType] = useState<ColumnType | null>(null);
  const [name, setName] = useState("");
  const [choices, setChoices] = useState<string[]>([""]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        handleClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function handleClose() {
    setOpen(false);
    resetState();
  }

  function resetState() {
    setStep("pick-type");
    setSelectedType(null);
    setName("");
    setChoices([""]);
    setError(null);
    setIsSaving(false);
  }

  function handleSelectType(type: ColumnType) {
    setSelectedType(type);
    setName(COLUMN_TYPES.find((t) => t.type === type)?.label ?? "");
    setStep("configure");
  }

  function handleAddChoice() {
    setChoices([...choices, ""]);
  }

  function handleChoiceChange(index: number, value: string) {
    setChoices(choices.map((c, i) => (i === index ? value : c)));
  }

  function handleRemoveChoice(index: number) {
    if (choices.length === 1) return;
    setChoices(choices.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!selectedType || !name.trim()) {
      setError("Column name is required");
      return;
    }

    if (selectedType === "SELECT") {
      const validChoices = choices.filter((c) => c.trim());
      if (validChoices.length === 0) {
        setError("Add at least one option");
        return;
      }
    }

    setIsSaving(true);
    setError(null);

    try {
      await createColumn(pageId, {
        name: name.trim(),
        type: selectedType,
        ...(selectedType === "SELECT" && {
          options: { choices: choices.filter((c) => c.trim()) },
        }),
      });
      // Refetch rows so existing rows show the new column's empty cell
      await fetchRows(pageId);
      handleClose();
    } catch {
      setError("Failed to create column. Try again.");
    } finally {
      setIsSaving(false);
    }
  }

  const selectedTypeConfig = COLUMN_TYPES.find((t) => t.type === selectedType);

  return (
    <div className="relative" ref={ref}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm",
          "text-gray-500 hover:text-gray-900 hover:bg-gray-100",
          "transition-colors border border-dashed border-gray-300",
          "hover:border-gray-400",
        )}
      >
        <Plus className="w-3.5 h-3.5" />
        Add column
      </button>

      {/* Popover panel */}
      {open && (
        <div
          className={cn(
            "absolute left-0 bottom-full mb-2 z-50 w-72",
            "bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden",
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              {step === "configure" && (
                <button
                  onClick={() => setStep("pick-type")}
                  className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              )}
              <span className="text-sm font-medium text-gray-900">
                {step === "pick-type"
                  ? "Add column"
                  : `New ${selectedTypeConfig?.label} column`}
              </span>
            </div>
            <button
              onClick={handleClose}
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Step 1 — Pick a type */}
          {step === "pick-type" && (
            <div className="p-2">
              {COLUMN_TYPES.map((colType) => (
                <button
                  key={colType.type}
                  onClick={() => handleSelectType(colType.type)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg",
                    "text-left hover:bg-gray-50 transition-colors",
                  )}
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 shrink-0">
                    {colType.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {colType.label}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {colType.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2 — Configure */}
          {step === "configure" && selectedType && (
            <div className="p-4 space-y-4">
              {/* Column name */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Column name
                </label>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && selectedType !== "SELECT")
                      handleSave();
                  }}
                  placeholder="Enter column name"
                  className={cn(
                    "w-full px-3 py-1.5 text-sm rounded-lg",
                    "border border-gray-200 outline-none",
                    "focus:ring-2 focus:ring-gray-900 focus:border-transparent",
                    "placeholder:text-gray-400",
                  )}
                />
              </div>

              {/* Select options */}
              {selectedType === "SELECT" && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Options
                  </label>
                  <div className="space-y-1.5">
                    {choices.map((choice, index) => (
                      <div key={index} className="flex items-center gap-1.5">
                        <input
                          value={choice}
                          onChange={(e) =>
                            handleChoiceChange(index, e.target.value)
                          }
                          placeholder={`Option ${index + 1}`}
                          className={cn(
                            "flex-1 px-3 py-1.5 text-sm rounded-lg",
                            "border border-gray-200 outline-none",
                            "focus:ring-2 focus:ring-gray-900 focus:border-transparent",
                            "placeholder:text-gray-400",
                          )}
                        />
                        <button
                          onClick={() => handleRemoveChoice(index)}
                          disabled={choices.length === 1}
                          className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={handleAddChoice}
                      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 mt-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add option
                    </button>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && <p className="text-xs text-red-600">{error}</p>}

              {/* Save */}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={cn(
                  "w-full py-2 rounded-lg text-sm font-medium",
                  "bg-gray-900 text-white hover:bg-gray-700",
                  "transition-colors disabled:opacity-50",
                )}
              >
                {isSaving ? "Adding..." : "Add column"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
