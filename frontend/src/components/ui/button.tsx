import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "secondary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseStyles = cn(
      "inline-flex items-center justify-center gap-2",
      "font-medium rounded-lg transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      "select-none",
    );

    const variants: Record<ButtonVariant, string> = {
      primary: cn(
        "bg-[var(--color-accent)] text-[var(--color-accent-fg)]",
        "hover:bg-[var(--color-accent-hover)]",
        "focus-visible:ring-[var(--color-accent)]",
      ),
      secondary: cn(
        "bg-[var(--color-surface)] text-[var(--color-text-secondary)]",
        "border border-[var(--color-border)]",
        "hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)]",
        "focus-visible:ring-[var(--color-border-strong)]",
      ),
      ghost: cn(
        "text-[var(--color-text-muted)]",
        "hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)]",
        "focus-visible:ring-[var(--color-border-strong)]",
      ),
      danger: cn(
        "bg-[var(--color-danger)] text-[var(--color-danger-fg)]",
        "hover:bg-[var(--color-danger-hover)]",
        "focus-visible:ring-[var(--color-danger)]",
      ),
    };

    const sizes: Record<ButtonSize, string> = {
      sm: "px-2.5 py-1.5 text-xs",
      md: "px-3.5 py-2 text-sm",
      lg: "px-5 py-2.5 text-sm",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
        ) : leftIcon ? (
          <span className="shrink-0">{leftIcon}</span>
        ) : null}
        {children}
        {rightIcon && !isLoading && (
          <span className="shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
