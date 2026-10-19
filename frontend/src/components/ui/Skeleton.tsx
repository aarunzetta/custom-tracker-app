import { cn } from "@/lib/utils";

type SkeletonProps = {
  className?: string;
  style?: React.CSSProperties;
};

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md",
        "bg-(--color-surface-2)",
        className,
      )}
      style={style}
    />
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-(--color-border)">
      <Skeleton className="w-6 h-3" />
      <Skeleton className="flex-1 h-3" />
      <Skeleton className="w-20 h-3" />
      <Skeleton className="w-16 h-3" />
      <Skeleton className="w-24 h-3" />
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="rounded-lg border border-(--color-border) overflow-hidden">
      <div
        className="flex items-center gap-3 px-4 py-2.5 border-b border-(--color-border)"
        style={{ background: "var(--color-surface-2)" }}
      >
        <Skeleton className="w-6 h-3" />
        <Skeleton className="w-24 h-3" />
        <Skeleton className="w-20 h-3 ml-4" />
        <Skeleton className="w-16 h-3 ml-4" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRowSkeleton key={i} />
      ))}
    </div>
  );
}

// Pre-computed heights — never call Math.random() during render
const WIDGET_BAR_HEIGHTS = [65, 85, 45, 90, 55, 70];

export function WidgetSkeleton({ large = false }: { large?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-(--color-border) p-4",
        "bg-(--color-surface)",
        large ? "col-span-2" : "col-span-1",
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="w-32 h-4" />
        <Skeleton className="w-6 h-6 rounded-md" />
      </div>
      <div className="flex items-end gap-2 h-32 px-2">
        {WIDGET_BAR_HEIGHTS.map((height, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t-sm"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 p-6">
      <WidgetSkeleton large />
      <WidgetSkeleton />
      <WidgetSkeleton />
    </div>
  );
}
