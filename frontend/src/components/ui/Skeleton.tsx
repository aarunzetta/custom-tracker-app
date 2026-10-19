import { cn } from "@/lib/utils";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md",
        "bg-(--color-surface-2)",
        className,
      )}
    />
  );
}

// Pre-built skeleton layouts for common use cases

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
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 border-b border-(--color-border)"
        style={{ background: "var(--color-surface-2)" }}
      >
        <Skeleton className="w-6 h-3" />
        <Skeleton className="w-24 h-3" />
        <Skeleton className="w-20 h-3 ml-4" />
        <Skeleton className="w-16 h-3 ml-4" />
      </div>
      {/* Rows */}
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRowSkeleton key={i} />
      ))}
    </div>
  );
}

export function WidgetSkeleton({ large = false }: { large?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-(--color-border) p-4",
        "bg-(--color-surface)",
        large ? "col-span-2" : "col-span-1",
      )}
    >
      {/* Widget header */}
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="w-32 h-4" />
        <Skeleton className="w-6 h-6 rounded-md" />
      </div>
      {/* Chart placeholder */}
      <div className="flex items-end gap-2 h-32 px-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t-sm"
            style={{
              height: `${30 + Math.random() * 70}%`,
            }}
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
