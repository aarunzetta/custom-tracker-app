import { BarChart2 } from "lucide-react";
import type { Widget } from "@/stores/widgetsStore";
import { BarChartWidget } from "./charts/BarChartWidget";

type WidgetRendererProps = {
  widget: Widget;
};

export function WidgetRenderer({ widget }: WidgetRendererProps) {
  switch (widget.type) {
    case "bar":
      return <BarChartWidget widget={widget} />;

    default:
      return (
        <div className="flex flex-col items-center justify-center h-32 gap-2">
          <BarChart2 className="w-8 h-8 text-gray-200" />
          <p className="text-xs text-gray-400 capitalize">
            {widget.type} chart — coming soon
          </p>
        </div>
      );
  }
}
