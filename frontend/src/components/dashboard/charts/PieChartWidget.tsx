import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useColumnsStore } from "@/stores/columnsStore";
import { useRowsStore } from "@/stores/rowsStore";
import type { Widget } from "@/stores/widgetsStore";
import { safeTransformChartData } from "@/lib/chartData";

// A palette of colors for the pie slices
const COLORS = [
  "#111827",
  "#374151",
  "#6b7280",
  "#9ca3af",
  "#d1d5db",
  "#1d4ed8",
  "#2563eb",
  "#3b82f6",
  "#60a5fa",
  "#93c5fd",
];

type PieChartWidgetProps = {
  widget: Widget;
};

export function PieChartWidget({ widget }: PieChartWidgetProps) {
  const { columns } = useColumnsStore();
  const { rows } = useRowsStore();

  const data = safeTransformChartData({
    columns,
    rows,
    config: widget.config,
  });

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-gray-400">
        No data to display. Check your widget configuration.
      </div>
    );
  }

  // Calculate total for percentage labels in tooltip
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart style={{ background: "transparent" }}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="label"
          cx="50%"
          cy="50%"
          innerRadius={40}
          outerRadius={75}
          paddingAngle={2}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            fontSize: 12,
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            backgroundColor: "var(--color-surface)",
            color: "var(--color-text-primary)",
            boxShadow: "var(--shadow-md)",
          }}
          formatter={(value: number, name: string) => [
            `${value} (${Math.round((value / total) * 100)}%)`,
            name,
          ]}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{
            fontSize: 11,
            color: "var(--color-text-muted)",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
