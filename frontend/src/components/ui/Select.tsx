import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, children, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-medium text-(--color-text-secondary)">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            "w-full px-3 py-2 text-sm rounded-lg",
            "bg-(--color-surface)",
            "border border-(--color-border)",
            "text-(--color-text-primary)",
            "outline-none transition-colors cursor-pointer",
            "focus:border-(--color-accent)",
            "focus:ring-2 focus:ring-(--color-accent) focus:ring-opacity-20",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-(--color-danger)",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-xs text-(--color-danger)">{error}</p>}
      </div>
    );
  },
);

Select.displayName = "Select";
