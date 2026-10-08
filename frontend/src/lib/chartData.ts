import type { Column } from "@/stores/columnsStore";
import type { TableRow } from "@/stores/rowsStore";
import type { WidgetConfig } from "@/stores/widgetsStore";

export type ChartDataPoint = {
  label: string;
  value: number;
};

type TransformOptions = {
  columns: Column[];
  rows: TableRow[];
  config: WidgetConfig;
};

export function transformChartData({
  columns,
  rows,
  config,
}: TransformOptions): ChartDataPoint[] {
  const { xColumnId, yColumnId, aggregation = "count" } = config;

  // Need at least an X column to render anything
  if (!xColumnId) return [];

  const xColumn = columns.find((c) => c.id === xColumnId);
  if (!xColumn) return [];

  const yColumn = yColumnId ? columns.find((c) => c.id === yColumnId) : null;

  // Apply filter if configured
  let filteredRows = rows;
  if (config.filter?.columnId && config.filter?.value) {
    filteredRows = rows.filter((row) => {
      const cellValue = row.cells[config.filter!.columnId]?.value;
      return cellValue === config.filter!.value;
    });
  }

  // Group rows by X column value
  // accumulator is a map of label → array of Y values
  const groups = filteredRows.reduce(
    (acc, row) => {
      const xValue = row.cells[xColumnId]?.value;

      // Skip rows with no X value
      if (xValue === null || xValue === undefined || xValue === "") return acc;

      // For checkbox columns, convert "true"/"false" to readable labels
      const label =
        xColumn.type === "CHECKBOX"
          ? xValue === "true"
            ? "Checked"
            : "Unchecked"
          : xValue;

      if (!acc[label]) acc[label] = [];

      // Get the Y value for this row
      if (yColumn && yColumnId) {
        const yRaw = row.cells[yColumnId]?.value;
        const yNum = parseFloat(yRaw ?? "0");
        acc[label].push(isNaN(yNum) ? 0 : yNum);
      } else {
        // No Y column — just count occurrences
        acc[label].push(1);
      }

      return acc;
    },
    {} as Record<string, number[]>,
  );

  // Aggregate each group into a single value
  const data: ChartDataPoint[] = Object.entries(groups).map(
    ([label, values]) => {
      let value = 0;

      switch (aggregation) {
        case "count":
          value = values.length;
          break;
        case "sum":
          value = values.reduce((a, b) => a + b, 0);
          break;
        case "avg":
          value =
            values.length > 0
              ? values.reduce((a, b) => a + b, 0) / values.length
              : 0;
          break;
      }

      return { label, value: Math.round(value * 100) / 100 };
    },
  );

  // Sort by value descending for bar charts
  return data.sort((a, b) => b.value - a.value);
}

// ─── KPI helpers ──────────────────────────────────────────────────────────────

export function computeKpiValue(
  rows: TableRow[],
  config: WidgetConfig,
): number {
  const { yColumnId, aggregation = "count" } = config;

  if (aggregation === "count") return rows.length;

  if (!yColumnId) return rows.length;

  const values = rows
    .map((r) => parseFloat(r.cells[yColumnId]?.value ?? ""))
    .filter((v) => !isNaN(v));

  if (values.length === 0) return 0;

  switch (aggregation) {
    case "sum":
      return values.reduce((a, b) => a + b, 0);
    case "avg":
      return (
        Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) /
        100
      );
    default:
      return values.length;
  }
}
