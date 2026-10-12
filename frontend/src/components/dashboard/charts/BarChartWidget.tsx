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
import { transformChartData } from "@/lib/chartData";

type BarChartWidgetProps = {
  widget: Widget;
};

export function BarChartWidget({ widget }: BarChartWidgetProps) {
  const { columns } = useColumnsStore();
  const { rows } = useRowsStore();

  const data = transformChartData({
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

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
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
          cursor={{ fill: "#f9fafb" }}
        />
        <Bar
          dataKey="value"
          fill="#111827"
          radius={[4, 4, 0, 0]}
          maxBarSize={48}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
