import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useColumnsStore } from "@/stores/columnsStore";
import { useRowsStore } from "@/stores/rowsStore";
import type { Widget } from "@/stores/widgetsStore";
import { useMemo } from "react";
import { safeTransformChartData } from "@/lib/chartData";

type BarChartWidgetProps = {
  widget: Widget;
};

export function BarChartWidget({ widget }: BarChartWidgetProps) {
  const columns = useColumnsStore((s) => s.columns);
  const rows = useRowsStore((s) => s.rows);
  const config = widget.config;

  const data = useMemo(
    () => safeTransformChartData({ columns, rows, config }),
    [columns, rows, config],
  );

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-gray-400">
        No data to display. Check your widget configuration.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
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
          cursor={{ fill: "var(--color-surface-2)" }}
        />
        <Bar
          dataKey="value"
          fill="var(--color-accent)"
          radius={[4, 4, 0, 0]}
          maxBarSize={48}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
