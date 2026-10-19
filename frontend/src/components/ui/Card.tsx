import { cn } from "@/lib/utils";

type CardProps = {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
};

export function Card({ children, className, padding = "md" }: CardProps) {
  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-5",
    lg: "p-6",
  };

  return (
    <div
      className={cn(
        "bg-(--color-surface)",
        "border border-(--color-border)",
        "rounded-xl",
        "shadow-(--shadow-sm)",
        paddings[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}

// Card sub-components for structured layouts
export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between",
        "pb-4 mb-4",
        "border-b border-(--color-border)",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={cn(
        "text-sm font-semibold text-(--color-text-primary)",
        className,
      )}
    >
      {children}
    </h3>
  );
}
