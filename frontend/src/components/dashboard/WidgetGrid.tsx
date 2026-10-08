import type { Widget } from "@/stores/widgetsStore";
import { WidgetCard } from "./WidgetCard";
import { WidgetRenderer } from "./WidgetRenderer";

type WidgetGridProps = {
  widgets: Widget[];
  onConfigure: (widget: Widget) => void;
};

export function WidgetGrid({ widgets, onConfigure }: WidgetGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 p-6">
      {widgets.map((widget) => (
        <WidgetCard key={widget.id} widget={widget} onConfigure={onConfigure}>
          <WidgetRenderer widget={widget} />
        </WidgetCard>
      ))}
    </div>
  );
}
