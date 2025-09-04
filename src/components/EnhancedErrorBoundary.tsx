import React, { Component, ErrorInfo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  maxRetries?: number;
}

export class EnhancedErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call onError prop if provided
    this.props.onError?.(error, errorInfo);

    // Auto-retry for network errors
    if (this.isNetworkError(error) && this.state.retryCount < (this.props.maxRetries || 3)) {
      this.retryTimeoutId = setTimeout(() => {
        this.handleRetry();
      }, 2000);
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  isNetworkError = (error: Error): boolean => {
    return error.message.toLowerCase().includes('network') ||
           error.message.toLowerCase().includes('fetch') ||
           error.message.toLowerCase().includes('connection');
  };

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: prevState.retryCount + 1,
    }));
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportBug = () => {
    // In a real app, this would send error reports to your monitoring service
    const subject = `Bug Report: ${this.state.error?.name || 'Error'}`;
    const body = `
Error: ${this.state.error?.message}
Stack: ${this.state.error?.stack}
Component Stack: ${this.state.errorInfo?.componentStack}
User Agent: ${navigator.userAgent}
URL: ${window.location.href}
Timestamp: ${new Date().toISOString()}
    `;
    
    const mailtoUrl = `mailto:support@borrowpal.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent 
            error={this.state.error!} 
            retry={this.handleRetry} 
          />
        );
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-lg card-modern">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Oops! Something went wrong
                </h1>
                <p className="text-muted-foreground">
                  We're sorry, but something unexpected happened. 
                  {this.isNetworkError(this.state.error!) && 
                    " This might be a network connectivity issue."}
                </p>
              </div>

              {/* Error details for development */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mb-6 p-4 bg-muted rounded-lg text-left">
                  <h3 className="font-semibold text-sm mb-2">Error Details:</h3>
                  <p className="text-xs font-mono text-muted-foreground break-all">
                    {this.state.error?.message}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={this.handleRetry}
                  className="gradient-primary"
                  disabled={this.state.retryCount >= (this.props.maxRetries || 3)}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                
                <Button 
                  onClick={this.handleReload}
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
                
                <Button 
                  onClick={this.handleGoHome}
                  variant="outline"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <Button
                  onClick={this.handleReportBug}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                >
                  <Bug className="h-3 w-3 mr-2" />
                  Report this issue
                </Button>
              </div>

              {this.state.retryCount > 0 && (
                <p className="mt-4 text-xs text-muted-foreground">
                  Retry attempt: {this.state.retryCount}/{this.props.maxRetries || 3}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}