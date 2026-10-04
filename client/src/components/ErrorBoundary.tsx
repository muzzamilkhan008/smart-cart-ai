import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6 text-center">
          <div className="max-w-md space-y-4 bg-slate-800 border border-slate-700 p-8 rounded-2xl shadow-2xl">
            <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              !
            </div>
            <h1 className="text-xl font-bold">SmartCart AI</h1>
            <p className="text-slate-300 text-sm">
              {this.state.error?.message || 'An unexpected application error occurred.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl text-sm transition shadow-lg"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
