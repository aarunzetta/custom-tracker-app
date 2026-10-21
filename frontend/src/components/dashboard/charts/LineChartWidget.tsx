import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useColumnsStore } from "@/stores/columnsStore";
import { useRowsStore } from "@/stores/rowsStore";
import type { Widget } from "@/stores/widgetsStore";
import type { TableRow } from "@/stores/rowsStore";
import { useMemo } from "react";

type LineChartWidgetProps = {
  widget: Widget;
};

type LineDataPoint = {
  label: string;
  value: number;
};

export function LineChartWidget({ widget }: LineChartWidgetProps) {
  const columns = useColumnsStore((s) => s.columns);
  const rows = useRowsStore((s) => s.rows);
  const { xColumnId, yColumnId, aggregation = "sum" } = widget.config;

  const data = useMemo(() => {
    if (!xColumnId || !yColumnId) return [];
    return buildLineData(rows, xColumnId, yColumnId, aggregation);
  }, [rows, xColumnId, yColumnId, aggregation]);

  if (!xColumnId || !yColumnId) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-gray-400">
        Configure a date column (X) and number column (Y) to see this chart.
      </div>
    );
  }

  const xColumn = columns.find((c) => c.id === xColumnId);
  const yColumn = columns.find((c) => c.id === yColumnId);

  if (!xColumn || !yColumn) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-gray-400">
        Column not found. Reconfigure this widget.
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-gray-400">
        No data to display. Add rows with date and number values.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart
        data={data}
        margin={{ top: 4, right: 8, left: -20, bottom: 4 }}
        style={{ background: "transparent" }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "var(--color-text-faint)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--color-text-faint)" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            backgroundColor: "var(--color-surface)",
            color: "var(--color-text-primary)",
            boxShadow: "var(--shadow-md)",
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="var(--color-accent)"
          strokeWidth={2}
          dot={{ fill: "var(--color-accent)", r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function buildLineData(
  rows: TableRow[],
  xColumnId: string,
  yColumnId: string,
  aggregation: string,
): LineDataPoint[] {
  // Group by the RAW date string ("2026-10-07") so sorting is chronological
  const groups: Record<string, number[]> = {};

  for (const row of rows) {
    const dateValue = row.cells[xColumnId]?.value;
    const numValue = parseFloat(row.cells[yColumnId]?.value ?? "");
    if (!dateValue || isNaN(numValue)) continue;

    if (!groups[dateValue]) groups[dateValue] = [];
    groups[dateValue].push(numValue);
  }

  // ISO dates (YYYY-MM-DD) sort correctly as plain strings
  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, values]) => {
      let value = 0;
      switch (aggregation) {
        case "sum":
          value = values.reduce((a, b) => a + b, 0);
          break;
        case "avg":
          value = values.reduce((a, b) => a + b, 0) / values.length;
          break;
        case "count":
          value = values.length;
          break;
      }
      // Format for display only AFTER sorting
      return {
        label: formatDateLabel(date),
        value: Math.round(value * 100) / 100,
      };
    });
}
