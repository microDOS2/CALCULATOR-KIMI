import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  name: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`Error in ${this.props.name}:`, error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-destructive rounded-lg bg-destructive/10 my-4">
          <h3 className="text-destructive font-semibold text-sm">{this.props.name} failed to render</h3>
          <pre className="text-xs mt-2 text-muted-foreground overflow-x-auto">
            {this.state.error?.message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
