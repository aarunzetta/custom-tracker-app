import { TrendingUp, Hash, Calculator } from "lucide-react";
import { useColumnsStore } from "@/stores/columnsStore";
import { useRowsStore } from "@/stores/rowsStore";
import type { Widget } from "@/stores/widgetsStore";
import { computeKpiValue } from "@/lib/chartData";
import { cn } from "@/lib/utils";

type KpiWidgetProps = {
  widget: Widget;
};

export function KpiWidget({ widget }: KpiWidgetProps) {
  const { columns } = useColumnsStore();
  const { rows } = useRowsStore();
  const { yColumnId, aggregation = "count" } = widget.config;

  const value = computeKpiValue(rows, widget.config);

  const yColumn = yColumnId ? columns.find((c) => c.id === yColumnId) : null;

  // Format number nicely
  // 1000 → "1,000" | 1234.5 → "1,234.5"
  const formattedValue = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);

  // Label below the number
  const label = buildLabel(aggregation, yColumn?.name);

  const Icon =
    aggregation === "count"
      ? Hash
      : aggregation === "sum"
        ? TrendingUp
        : Calculator;

  return (
    <div className="flex flex-col items-center justify-center h-32 gap-2">
      {/* Icon */}
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
        <Icon className="w-4 h-4 text-gray-500" />
      </div>

      {/* Big number */}
      <div
        className={cn(
          "font-bold text-gray-900 leading-none",
          formattedValue.length > 8 ? "text-2xl" : "text-3xl",
        )}
      >
        {formattedValue}
      </div>

      {/* Label */}
      <p className="text-xs text-gray-400 text-center">{label}</p>
    </div>
  );
}

function buildLabel(aggregation: string, columnName?: string): string {
  switch (aggregation) {
    case "count":
      return "Total rows";
    case "sum":
      return columnName ? `Total ${columnName}` : "Total";
    case "avg":
      return columnName ? `Average ${columnName}` : "Average";
    default:
      return "Value";
  }
}
