import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2, Home, ChevronDown, ChevronUp } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleClearCacheAndReload = () => {
    try {
      localStorage.removeItem('uruvela_dana_schedules');
      localStorage.removeItem('uruvela_dana_pricing_overrides');
      localStorage.removeItem('admin_active_tab');
    } catch (e) {
      console.error('Failed to clear storage:', e);
    }
    window.location.reload();
  };

  private handleReload = () => {
    window.location.reload();
  };

  private toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#fff8f5] text-[#231a15] flex flex-col items-center justify-center p-4 sm:p-6 select-none font-sans">
          <div className="max-w-xl w-full bg-white border border-[#e8dcd5] rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col items-center text-center animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mb-4 shadow-sm">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h2 className="font-serif text-2xl font-bold text-[#231a15] tracking-tight mb-2">
              {this.props.fallbackTitle || 'Something Went Wrong'}
            </h2>

            <p className="text-sm text-[#705d53] leading-relaxed mb-6">
              The application encountered an unexpected error while rendering this view. This can sometimes occur if local cache data from an earlier version is incompatible with recent updates.
            </p>

            <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mb-6">
              <button
                onClick={this.handleClearCacheAndReload}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#8c3c0b] hover:bg-[#703100] text-white text-sm font-semibold rounded-xl shadow transition-colors active:scale-95 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Reset Cache & Reload
              </button>

              <button
                onClick={this.handleReload}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#ede3db] hover:bg-[#dfd3cb] text-[#231a15] text-sm font-semibold rounded-xl transition-colors active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>

              {this.props.onReset && (
                <button
                  onClick={this.props.onReset}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-[#d6c7be] hover:bg-[#faf4f0] text-[#705d53] text-sm font-medium rounded-xl transition-colors active:scale-95 cursor-pointer"
                >
                  <Home className="w-4 h-4" />
                  Return Home
                </button>
              )}
            </div>

            {/* Collapsible Error Technical Details */}
            {this.state.error && (
              <div className="w-full text-left border-t border-[#f0e6e0] pt-4 mt-2">
                <button
                  onClick={this.toggleDetails}
                  className="flex items-center justify-between w-full text-xs font-semibold text-[#8c7365] hover:text-[#231a15] uppercase tracking-wider py-1 cursor-pointer"
                >
                  <span>Technical Diagnostics</span>
                  {this.state.showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {this.state.showDetails && (
                  <div className="mt-3 p-3 bg-red-50/50 border border-red-100 rounded-xl text-xs font-mono text-red-900 break-words max-h-48 overflow-y-auto">
                    <p className="font-bold text-red-800 mb-1">{this.state.error.name}: {this.state.error.message}</p>
                    {this.state.error.stack && (
                      <pre className="text-[11px] text-red-700 whitespace-pre-wrap leading-tight mt-2 opacity-80">
                        {this.state.error.stack}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
