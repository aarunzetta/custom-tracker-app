import { BarChart2 } from "lucide-react";
import type { Widget } from "@/stores/widgetsStore";
import { BarChartWidget } from "./charts/BarChartWidget";
import { LineChartWidget } from "./charts/LineChartWidget";
import { KpiWidget } from "./charts/KpiWidget";
import { PieChartWidget } from "./charts/PieChartWidget";
import { ErrorBoundary } from "@/components/ErrorBoundary";

type WidgetRendererProps = {
  widget: Widget;
};

export function WidgetRenderer({ widget }: WidgetRendererProps) {
  const fallback = (
    <div className="flex flex-col items-center justify-center h-32 gap-2">
      <BarChart2
        className="w-8 h-8"
        style={{ color: "var(--color-border-strong)" }}
      />
      <p className="text-xs" style={{ color: "var(--color-text-faint)" }}>
        Failed to render chart
      </p>
    </div>
  );

  const chart = (() => {
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
        return fallback;
    }
  })();

  return (
    <ErrorBoundary fallback={fallback}>
      <div role="figure" aria-label={`${widget.title}, ${widget.type} chart`}>
        {chart}
      </div>
    </ErrorBoundary>
  );
}
