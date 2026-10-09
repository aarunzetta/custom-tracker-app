import { useState } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWidgetsStore, type WidgetType } from "@/stores/widgetsStore";
import { useColumnsStore } from "@/stores/columnsStore";
import { COLUMN_TYPES } from "@/config/columnTypes";

type AddWidgetButtonProps = {
  pageId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function AddWidgetButton({
  pageId,
  open: controlledOpen,
  onOpenChange,
}: AddWidgetButtonProps) {
  const { createWidget } = useWidgetsStore();
  const { columns } = useColumnsStore();
  const [internalOpen, setInternalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<WidgetType>("bar");
  const [xColumnId, setXColumnId] = useState("");
  const [yColumnId, setYColumnId] = useState("");
  const [aggregation, setAggregation] = useState<"count" | "sum" | "avg">(
    "count",
  );
  const [isSaving, setIsSaving] = useState(false);

  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;

  function setOpen(value: boolean) {
    if (onOpenChange) {
      onOpenChange(value);
    } else {
      setInternalOpen(value);
    }
  }

  const numberColumns = columns.filter((c) => c.type === "NUMBER");

  async function handleCreate() {
    if (!title.trim()) return;

    // X column required for bar, line, pie — not for kpi
    if ((type === "bar" || type === "line" || type === "pie") && !xColumnId)
      return;

    // Y column always required for line chart
    if (type === "line" && !yColumnId) return;

    setIsSaving(true);
    try {
      await createWidget(pageId, {
        title: title.trim(),
        type,
        config: {
          xColumnId: xColumnId || undefined,
          yColumnId: yColumnId || undefined,
          aggregation,
        },
      });
      setOpen(false);
      resetForm();
    } finally {
      setIsSaving(false);
    }
  }

  function resetForm() {
    setTitle("");
    setType("bar");
    setXColumnId("");
    setYColumnId("");
    setAggregation("count");
  }

  if (columns.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm",
          "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
          "transition-colors border border-gray-200",
        )}
      >
        <Plus className="w-3.5 h-3.5" />
        Add chart
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-80 bg-white border border-gray-200 rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-900">Add chart</span>
            <button
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Tasks completed over time"
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            {/* Chart type */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Chart type
              </label>
              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value as WidgetType);
                  // Reset column selections when type changes
                  setXColumnId("");
                  setYColumnId("");
                  setAggregation("count");
                }}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="bar">Bar chart</option>
                <option value="line">Line chart</option>
                <option value="pie">Pie chart</option>
                <option value="kpi">KPI card</option>
              </select>
            </div>

            {/* X column — bar and line charts only */}
            {(type === "bar" || type === "line" || type === "pie") && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {type === "line"
                    ? "Date column (X axis)"
                    : "Group by (X axis)"}
                </label>
                <select
                  value={xColumnId}
                  onChange={(e) => setXColumnId(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="">Select column...</option>
                  {/* Line chart — only show date columns for X */}
                  {type === "line"
                    ? columns
                        .filter((c) => c.type === "DATE")
                        .map((col) => (
                          <option key={col.id} value={col.id}>
                            {col.name}
                          </option>
                        ))
                    : columns.map((col) => {
                        const typeConfig = COLUMN_TYPES.find(
                          (t) => t.type === col.type,
                        );
                        return (
                          <option key={col.id} value={col.id}>
                            {col.name} ({typeConfig?.label})
                          </option>
                        );
                      })}
                </select>
              </div>
            )}

            {/* Aggregation */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Aggregation
              </label>
              <select
                value={aggregation}
                onChange={(e) =>
                  setAggregation(e.target.value as "count" | "sum" | "avg")
                }
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="count">Count rows</option>
                <option value="sum">Sum values</option>
                <option value="avg">Average values</option>
              </select>
            </div>

            {/* Y column — for sum/avg on any type, or always for line */}
            {(aggregation !== "count" || type === "line") && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {type === "kpi" ? "Number column" : "Value column (Y axis)"}
                </label>
                <select
                  value={yColumnId}
                  onChange={(e) => setYColumnId(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="">Select number column...</option>
                  {numberColumns.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Validation hint for line chart */}
            {type === "line" &&
              columns.filter((c) => c.type === "DATE").length === 0 && (
                <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                  Line charts need a Date column. Add one in the Columns tab
                  first.
                </p>
              )}

            {/* Create button */}
            <button
              onClick={handleCreate}
              disabled={
                !title.trim() ||
                ((type === "bar" || type === "line" || type === "pie") &&
                  !xColumnId) ||
                (type === "line" && !yColumnId) ||
                isSaving
              }
              className={cn(
                "w-full py-2 rounded-lg text-sm font-medium",
                "bg-gray-900 text-white hover:bg-gray-700",
                "transition-colors disabled:opacity-50 mt-2",
              )}
            >
              {isSaving ? "Creating..." : "Create chart"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
