import { BarChart2 } from "lucide-react";
import type { Widget } from "@/stores/widgetsStore";
import { BarChartWidget } from "./charts/BarChartWidget";
import { LineChartWidget } from "./charts/LineChartWidget";
import { KpiWidget } from "./charts/KpiWidget";
import { PieChartWidget } from "./charts/PieChartWidget";

type WidgetRendererProps = {
  widget: Widget;
};

export function WidgetRenderer({ widget }: WidgetRendererProps) {
  switch (widget.type) {
    case "bar":
      return <BarChartWidget widget={widget} />;
    case "line":
      return <LineChartWidget widget={widget} />;
    case "kpi":
      return <KpiWidget widget={widget} />;
    case "pie":
      return <PieChartWidget widget={widget} />;
    default:
      return (
        <div className="flex flex-col items-center justify-center h-32 gap-2">
          <BarChart2 className="w-8 h-8 text-gray-200" />
          <p className="text-xs text-gray-400 capitalize">
            {widget.type} — unsupported
          </p>
        </div>
      );
  }
}
