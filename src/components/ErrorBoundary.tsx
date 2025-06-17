
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Log error to Supabase
    this.logError(error, errorInfo);
  }

  async logError(error: Error, errorInfo: ErrorInfo) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      await supabase.from('error_logs').insert({
        user_id: session?.user?.id || null,
        error_message: error.message,
        error_stack: error.stack || null,
        page_url: window.location.href,
        user_agent: navigator.userAgent
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Alert className="max-w-md">
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription className="mt-2">
              An unexpected error occurred. Please refresh the page and try again.
            </AlertDescription>
            <Button 
              className="mt-4" 
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
