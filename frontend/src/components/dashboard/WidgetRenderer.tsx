import { BarChart2 } from "lucide-react";
import type { Widget } from "@/stores/widgetsStore";

type WidgetRendererProps = {
  widget: Widget;
};

export function WidgetRenderer({ widget }: WidgetRendererProps) {
  // Placeholder — real chart components in Days 2 and 3
  return (
    <div className="flex flex-col items-center justify-center h-32 gap-2">
      <BarChart2 className="w-8 h-8 text-gray-200" />
      <p className="text-xs text-gray-400 capitalize">
        {widget.type} chart — coming Day 2
      </p>
    </div>
  );
}
