import React, { ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { FaWifi, FaRedo } from 'react-icons/fa';
import styled from 'styled-components';

interface AsyncErrorBoundaryProps {
  children: ReactNode;
  onRetry?: () => void;
}

const AsyncErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  min-height: 200px;
  text-align: center;
`;

const AsyncErrorIcon = styled(FaWifi)`
  font-size: 2.5rem;
  color: #FF6B6B;
  margin-bottom: 20px;
  opacity: 0.5;
`;

const AsyncErrorTitle = styled.h3`
  font-family: 'Oswald', sans-serif;
  color: #FF41FB;
  font-size: 1.2rem;
  margin-bottom: 15px;
  text-transform: uppercase;
`;

const AsyncErrorMessage = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 20px;
  max-width: 400px;
  line-height: 1.5;
`;

const RetryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #FF41FB, #FF6B6B);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// Custom error types for better error handling
export class NetworkError extends Error {
  constructor(message: string = 'Netzwerkfehler aufgetreten') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  constructor(message: string = 'Validierungsfehler') {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentifizierungsfehler') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

// Async Error Fallback Component
const AsyncErrorFallback: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <AsyncErrorContainer>
    <AsyncErrorIcon />
    <AsyncErrorTitle>Verbindungsfehler</AsyncErrorTitle>
    <AsyncErrorMessage>
      Die Daten konnten nicht geladen werden. 
      Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.
    </AsyncErrorMessage>
    {onRetry && (
      <RetryButton onClick={onRetry}>
        <FaRedo />
        Erneut laden
      </RetryButton>
    )}
  </AsyncErrorContainer>
);

// Higher-order component for async operations
export const withAsyncErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  onRetry?: () => void
) => {
  const WithAsyncErrorBoundaryComponent = (props: P) => (
    <ErrorBoundary 
      fallback={<AsyncErrorFallback onRetry={onRetry} />}
      onError={(error, errorInfo) => {
        // Enhanced logging for async errors
        console.group('🌐 Async Error Boundary');
        console.error('Component:', WrappedComponent.name || 'Unknown');
        console.error('Error:', error);
        console.error('Error Info:', errorInfo);
        console.groupEnd();
      }}
    >
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  WithAsyncErrorBoundaryComponent.displayName = 
    `withAsyncErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithAsyncErrorBoundaryComponent;
};

// Hook for error throwing (to trigger error boundaries)
export const useErrorHandler = () => {
  return React.useCallback((error: Error) => {
    // In development, log the error
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Thrown Error:', error);
    }
    
    // Throw error to be caught by nearest error boundary
    throw error;
  }, []);
};

// Async wrapper component
const AsyncErrorBoundary: React.FC<AsyncErrorBoundaryProps> = ({ 
  children, 
  onRetry 
}) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log async-specific errors
    console.group('🔄 Async Operation Error');
    console.error('Error Type:', error.constructor.name);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();
  };

  return (
    <ErrorBoundary 
      fallback={<AsyncErrorFallback onRetry={onRetry} />}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  );
};

export default AsyncErrorBoundary;