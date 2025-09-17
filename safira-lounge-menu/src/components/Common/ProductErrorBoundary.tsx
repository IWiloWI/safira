/**
 * Error Boundary component for crash prevention
 * Catches and handles React component errors gracefully
 */

import React, { Component, ReactNode } from 'react';
import styled from 'styled-components';
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: rgba(244, 67, 54, 0.1);
  border: 2px solid rgba(244, 67, 54, 0.3);
  border-radius: 15px;
  margin: 20px;
  text-align: center;
`;

const ErrorIcon = styled(FaExclamationTriangle)`
  font-size: 3rem;
  color: #f44336;
  margin-bottom: 20px;
`;

const ErrorTitle = styled.h2`
  font-family: 'Oswald', sans-serif;
  color: #f44336;
  font-size: 1.8rem;
  margin-bottom: 15px;
  text-transform: uppercase;
`;

const ErrorMessage = styled.p`
  font-family: 'Aldrich', sans-serif;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 20px;
  max-width: 600px;
`;

const ErrorDetails = styled.details`
  margin: 20px 0;
  padding: 15px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  border: 1px solid rgba(244, 67, 54, 0.2);
  max-width: 100%;
  
  summary {
    font-family: 'Aldrich', sans-serif;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    margin-bottom: 10px;
    
    &:hover {
      color: #f44336;
    }
  }
`;

const ErrorStack = styled.pre`
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(0, 0, 0, 0.3);
  padding: 10px;
  border-radius: 5px;
  overflow: auto;
  max-height: 200px;
  text-align: left;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const RetryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 25px;
  background: linear-gradient(135deg, #f44336, #d32f2f);
  border: none;
  border-radius: 10px;
  color: white;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #d32f2f, #b71c1c);
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(244, 67, 54, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 20px;
`;

const ReportButton = styled.button`
  padding: 10px 20px;
  background: transparent;
  border: 2px solid rgba(244, 67, 54, 0.5);
  border-radius: 8px;
  color: #f44336;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(244, 67, 54, 0.1);
    border-color: #f44336;
  }
`;

class ProductErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ProductErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
    
    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Log to external error reporting service if available
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error: Error, errorInfo: React.ErrorInfo) => {
    try {
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };
      
      console.log('Error report:', errorReport);
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleReportError = () => {
    const { error, errorInfo } = this.state;
    if (!error) return;
    
    const subject = encodeURIComponent('Product Manager Error Report');
    const body = encodeURIComponent(
      `Error Details:\n\n` +
      `Message: ${error.message}\n\n` +
      `Stack Trace:\n${error.stack}\n\n` +
      `Component Stack:\n${errorInfo?.componentStack}\n\n` +
      `Timestamp: ${new Date().toISOString()}\n` +
      `URL: ${window.location.href}\n` +
      `User Agent: ${navigator.userAgent}`
    );
    
    const mailtoUrl = `mailto:support@safira-lounge.com?subject=${subject}&body=${body}`;
    window.open(mailtoUrl);
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      const { error, errorInfo } = this.state;
      
      return (
        <ErrorContainer role="alert">
          <ErrorIcon aria-hidden="true" />
          
          <ErrorTitle>Oops! Something went wrong</ErrorTitle>
          
          <ErrorMessage>
            The Product Manager encountered an unexpected error. 
            Don't worry - your data is safe. You can try refreshing 
            the page or contact support if the problem persists.
          </ErrorMessage>
          
          {error && (
            <ErrorDetails>
              <summary>Technical Details</summary>
              <ErrorStack>
                <strong>Error:</strong> {error.message}

                <strong>Stack Trace:</strong>
{error.stack}

                {errorInfo && (
                  <>
                    <strong>Component Stack:</strong>
{errorInfo.componentStack}
                  </>
                )}
              </ErrorStack>
            </ErrorDetails>
          )}
          
          <ActionButtons>
            <RetryButton onClick={this.handleRetry} type="button">
              <FaRedo />
              Try Again
            </RetryButton>
            
            <ReportButton onClick={this.handleReportError} type="button">
              Report Issue
            </ReportButton>
          </ActionButtons>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ProductErrorBoundary;

/**
 * Higher-order component for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ProductErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ProductErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}