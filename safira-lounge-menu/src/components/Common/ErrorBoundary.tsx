import React, { Component, ReactNode } from 'react';
import styled from 'styled-components';
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorId: string;
}

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  min-height: 300px;
  background: rgba(255, 65, 251, 0.05);
  border: 2px solid rgba(255, 65, 251, 0.2);
  border-radius: 15px;
  margin: 20px;
  text-align: center;
`;

const ErrorIcon = styled(FaExclamationTriangle)`
  font-size: 3rem;
  color: #FF6B6B;
  margin-bottom: 20px;
`;

const ErrorTitle = styled.h2`
  font-family: 'Oswald', sans-serif;
  color: #FF41FB;
  font-size: 1.5rem;
  margin-bottom: 10px;
  text-transform: uppercase;
`;

const ErrorMessage = styled.p`
  color: #333;
  font-size: 1rem;
  margin-bottom: 20px;
  max-width: 500px;
  line-height: 1.6;
`;

const ErrorDetails = styled.details`
  margin-top: 20px;
  max-width: 600px;
  
  summary {
    cursor: pointer;
    color: #FF41FB;
    font-weight: 600;
    margin-bottom: 10px;
  }
  
  pre {
    background: rgba(0, 0, 0, 0.1);
    padding: 15px;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 0.8rem;
    text-align: left;
    white-space: pre-wrap;
    word-break: break-word;
  }
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #FF41FB, #FF6B6B);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Generate unique error ID for tracking
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error Boundary Caught Error [${this.state.errorId}]`);
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you could send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
      console.error('Production Error:', {
        error: error.message,
        stack: error.stack,
        errorId: this.state.errorId,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      });
    }
  }

  handleRefresh = () => {
    // Reset error boundary state
    this.setState({
      hasError: false,
      error: undefined,
      errorId: '',
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <ErrorContainer>
          <ErrorIcon />
          <ErrorTitle>Oops! Etwas ist schiefgelaufen</ErrorTitle>
          <ErrorMessage>
            Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.
            Falls das Problem weiterhin besteht, wenden Sie sich an den Support.
          </ErrorMessage>
          
          <RefreshButton onClick={this.handleRefresh}>
            <FaRedo />
            Erneut versuchen
          </RefreshButton>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <ErrorDetails>
              <summary>🔧 Entwickler-Details (nur im Development-Modus)</summary>
              <div>
                <strong>Error ID:</strong> {this.state.errorId}
                <br />
                <strong>Error:</strong> {this.state.error.message}
                <br />
                <strong>Stack Trace:</strong>
                <pre>{this.state.error.stack}</pre>
              </div>
            </ErrorDetails>
          )}
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;