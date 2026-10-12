import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import {
  type Widget,
  type WidgetType,
  useWidgetsStore,
} from "@/stores/widgetsStore";
import { useColumnsStore } from "@/stores/columnsStore";
import { useRowsStore } from "@/stores/rowsStore";
import { COLUMN_TYPES } from "@/config/columnTypes";
import { WidgetRenderer } from "./WidgetRenderer";
import { cn } from "@/lib/utils";

type WidgetConfigModalProps = {
  widget: Widget | null;
  onClose: () => void;
};

export function WidgetConfigModal({ widget, onClose }: WidgetConfigModalProps) {
  const { updateWidget } = useWidgetsStore();
  const { columns } = useColumnsStore();
  const { rows } = useRowsStore();

  // Local state — pre-filled from widget
  const [title, setTitle] = useState("");
  const [type, setType] = useState<WidgetType>("bar");
  const [xColumnId, setXColumnId] = useState("");
  const [yColumnId, setYColumnId] = useState("");
  const [aggregation, setAggregation] = useState<"count" | "sum" | "avg">(
    "count",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill form when widget changes
  useEffect(() => {
    if (!widget) return;
    setTitle(widget.title);
    setType(widget.type);
    setXColumnId(widget.config.xColumnId ?? "");
    setYColumnId(widget.config.yColumnId ?? "");
    setAggregation(widget.config.aggregation ?? "count");
    setError(null);
  }, [widget]);

  const numberColumns = columns.filter((c) => c.type === "NUMBER");
  const dateColumns = columns.filter((c) => c.type === "DATE");

  // Build a preview widget with the current form state
  // This is what makes the live preview work
  const previewWidget: Widget | null = widget
    ? {
        ...widget,
        title,
        type,
        config: {
          xColumnId: xColumnId || undefined,
          yColumnId: yColumnId || undefined,
          aggregation,
          size: widget.config.size,
        },
      }
    : null;

  async function handleSave() {
    if (!widget) return;
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if ((type === "bar" || type === "line" || type === "pie") && !xColumnId) {
      setError("Please select a column for the X axis");
      return;
    }
    if (type === "line" && !yColumnId) {
      setError("Line charts require a number column for the Y axis");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await updateWidget(widget.id, {
        title: title.trim(),
        type,
        config: {
          xColumnId: xColumnId || undefined,
          yColumnId: yColumnId || undefined,
          aggregation,
          size: widget.config.size,
        },
      });
      onClose();
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal
      isOpen={!!widget}
      onClose={onClose}
      title="Configure widget"
      width="lg"
    >
      <div className="flex gap-0 divide-x divide-gray-100">
        {/* Left side — form */}
        <div className="flex-1 p-6 space-y-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            Settings
          </p>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Widget title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          {/* Chart type */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Chart type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { value: "bar", label: "Bar chart" },
                  { value: "line", label: "Line chart" },
                  { value: "pie", label: "Pie chart" },
                  { value: "kpi", label: "KPI card" },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    const newType = option.value;

                    // Only clear xColumnId if switching to KPI (which doesn't use X)
                    if (newType === "kpi") {
                      setXColumnId("");
                    }

                    // Only clear xColumnId if switching TO line and current X isn't a date column
                    if (newType === "line") {
                      const currentXColumn = columns.find(
                        (c) => c.id === xColumnId,
                      );
                      if (currentXColumn && currentXColumn.type !== "DATE") {
                        setXColumnId("");
                      }
                    }

                    // Keep yColumnId and aggregation — they're compatible across all types
                    setType(newType);
                  }}
                  className={cn(
                    "px-3 py-2 text-sm rounded-lg border text-left transition-colors",
                    type === option.value
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* X column */}
          {(type === "bar" || type === "line" || type === "pie") && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                {type === "line" ? "Date column (X axis)" : "Group by (X axis)"}
              </label>
              <select
                value={xColumnId}
                onChange={(e) => setXColumnId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="">Select column...</option>
                {(type === "line" ? dateColumns : columns).map((col) => {
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
              {type === "line" && dateColumns.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  No date columns found. Add a Date column first.
                </p>
              )}
            </div>
          )}

          {/* Aggregation */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Aggregation
            </label>
            <select
              value={aggregation}
              onChange={(e) =>
                setAggregation(e.target.value as "count" | "sum" | "avg")
              }
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="count">Count rows</option>
              <option value="sum">Sum values</option>
              <option value="avg">Average values</option>
            </select>
          </div>

          {/* Y column */}
          {(aggregation !== "count" || type === "line") && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                {type === "kpi" ? "Number column" : "Value column (Y axis)"}
              </label>
              <select
                value={yColumnId}
                onChange={(e) => setYColumnId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="">Select number column...</option>
                {numberColumns.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.name}
                  </option>
                ))}
              </select>
              {numberColumns.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  No number columns found. Add a Number column first.
                </p>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}
        </div>

        {/* Right side — live preview */}
        <div className="flex-1 p-6">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">
            Preview
          </p>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-sm font-medium text-gray-900 mb-3 truncate">
              {title || "Untitled"}
            </p>
            {previewWidget ? (
              <WidgetRenderer widget={previewWidget} />
            ) : (
              <div className="h-32 flex items-center justify-center text-sm text-gray-400">
                Configure settings to see preview
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </Modal>
  );
}
