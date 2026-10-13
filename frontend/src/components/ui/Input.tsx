import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-medium text-(--color-text-secondary)">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full px-3 py-2 text-sm rounded-lg",
            "bg-(--color-surface)",
            "border border-(--color-border)",
            "text-(--color-text-primary)",
            "placeholder:text-(--color-text-faint)",
            "outline-none transition-colors",
            "focus:border-(--color-accent)",
            "focus:ring-2 focus:ring-(--color-accent) focus:ring-opacity-20",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-(--color-danger) focus:ring-(--color-danger)",
            className,
          )}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-(--color-text-faint)">{hint}</p>
        )}
        {error && <p className="text-xs text-(--color-danger)">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
