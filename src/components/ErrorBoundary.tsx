import { Component } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Props = {
  children: React.ReactNode;
};

type State = {
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: any) {
    // Keep this as a console log so devs can see stack traces.
    console.error("UI crashed:", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="container mx-auto px-4">
          <Card className="p-6 max-w-3xl mx-auto">
            <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
            <p className="text-sm text-muted-foreground mb-4">
              The page crashed while rendering. The exact error is shown below.
            </p>
            <pre className="text-xs whitespace-pre-wrap rounded-md bg-muted p-3 mb-4 overflow-auto">
              {this.state.error.message}
            </pre>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => this.setState({ error: null })}>
                Try again
              </Button>
              <Button onClick={() => window.location.reload()}>Reload</Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }
}

