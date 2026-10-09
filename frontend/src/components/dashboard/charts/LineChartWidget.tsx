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

type LineChartWidgetProps = {
  widget: Widget;
};

type LineDataPoint = {
  label: string;
  value: number;
};

export function LineChartWidget({ widget }: LineChartWidgetProps) {
  const { columns } = useColumnsStore();
  const { rows } = useRowsStore();
  const { xColumnId, yColumnId, aggregation = "sum" } = widget.config;

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

  // Build line chart data — group by date, aggregate Y values
  const data = buildLineData(rows, xColumnId, yColumnId, aggregation);

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
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#111827"
          strokeWidth={2}
          dot={{ fill: "#111827", r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function buildLineData(
  rows: TableRow[],
  xColumnId: string,
  yColumnId: string,
  aggregation: string,
): LineDataPoint[] {
  // Group rows by date value
  const groups: Record<string, number[]> = {};

  for (const row of rows) {
    const dateValue = row.cells[xColumnId]?.value;
    const numRaw = row.cells[yColumnId]?.value;
    const numValue = parseFloat(numRaw ?? "");

    if (!dateValue || isNaN(numValue)) continue;

    // Format date for display: "2024-01-15" → "Jan 15"
    // eslint-disable-next-line no-useless-assignment
    let label = dateValue;
    try {
      label = new Date(dateValue + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      label = dateValue;
    }

    if (!groups[label]) groups[label] = [];
    groups[label].push(numValue);
  }

  // Sort by original date string to keep chronological order
  const sortedEntries = Object.entries(groups).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  return sortedEntries.map(([label, values]) => {
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
    return { label, value: Math.round(value * 100) / 100 };
  });
}
