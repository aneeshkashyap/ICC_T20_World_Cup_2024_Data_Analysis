import React, { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production, send to an error reporting service
    console.error('[ICC Dashboard Error]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="flex flex-col items-center justify-center min-h-[200px] gap-4 p-8 card-base rounded-xl"
        >
          <span className="text-3xl" aria-hidden="true">⚠️</span>
          <div className="text-center">
            <p className="text-sm font-bold text-white">Something went wrong</p>
            <p className="text-xs text-icc-muted mt-1">
              {this.props.fallbackMessage || 'This section failed to load. Please refresh the page.'}
            </p>
          </div>
          <button
            className="btn-outline-gold text-xs px-4 py-2"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
