import React from 'react';
import { AlertTriangle, ArrowLeft, RotateCcw, Home } from 'lucide-react';
import HeaderNav from './HeaderNav';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/projects';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-neutral-50 flex flex-col">
          <HeaderNav activeTab="projects" />

          <main className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-lg w-full rounded-3xl border border-black/10 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] text-center space-y-6">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-600">
                <AlertTriangle className="h-8 w-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-black">
                  Something went wrong
                </h2>
                <p className="text-sm text-black/60 leading-relaxed">
                  An unexpected error occurred while loading this workspace view. You can refresh the page or return to the Projects overview.
                </p>
              </div>

              {this.state.error?.message && (
                <div className="rounded-xl border border-black/5 bg-neutral-50 p-3 text-left">
                  <p className="font-mono text-xs text-red-600 font-medium break-words">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={this.handleReload}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-black/15 bg-white px-5 py-2.5 text-xs font-semibold text-black hover:bg-neutral-50 transition"
                >
                  <RotateCcw className="h-4 w-4" /> Reload page
                </button>

                <button
                  type="button"
                  onClick={this.handleReset}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 transition"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to Projects
                </button>
              </div>
            </div>
          </main>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
