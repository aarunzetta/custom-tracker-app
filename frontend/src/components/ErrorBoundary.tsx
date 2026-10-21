import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-sm">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "var(--color-danger-bg)" }}
            >
              <AlertTriangle
                className="w-7 h-7"
                style={{ color: "var(--color-danger)" }}
              />
            </div>
            <h3
              className="text-base font-semibold mb-1"
              style={{ color: "var(--color-text-primary)" }}
            >
              Something went wrong
            </h3>
            <p
              className="text-sm mb-1"
              style={{ color: "var(--color-text-muted)" }}
            >
              This section crashed unexpectedly.
            </p>
            {this.state.error && (
              <p
                className="text-xs font-mono mb-4 px-3 py-2 rounded-lg"
                style={{
                  background: "var(--color-surface-2)",
                  color: "var(--color-text-faint)",
                }}
              >
                {this.state.error.message}
              </p>
            )}
            <Button
              variant="secondary"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={this.handleReset}
            >
              Try again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
