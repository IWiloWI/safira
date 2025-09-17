/**
 * Session warning modal component
 * Shows warning when session is about to expire and allows extension
 */

import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaClock, FaSignOutAlt, FaRedo } from 'react-icons/fa';
import { useSessionManagement } from '../../hooks/useSessionManagement';
import ErrorBoundary from './ErrorBoundary';

// Animations
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const slideDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Styled components
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(8px);
`;

const Modal = styled.div`
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  border: 2px solid rgba(255, 65, 251, 0.5);
  border-radius: 20px;
  padding: 40px;
  max-width: 500px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(255, 65, 251, 0.3);
  animation: ${slideDown} 0.3s ease-out;
`;

const WarningIcon = styled(FaClock)`
  font-size: 3rem;
  color: #FFA500;
  margin-bottom: 20px;
  animation: ${pulse} 2s infinite;
`;

const Title = styled.h2`
  font-family: 'Oswald', sans-serif;
  font-size: 1.8rem;
  color: #FF41FB;
  margin-bottom: 15px;
  text-transform: uppercase;
  text-shadow: 0 0 10px rgba(255, 65, 251, 0.5);
`;

const Message = styled.p`
  color: #fff;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 30px;
`;

const CountdownText = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #FFA500;
  margin-bottom: 30px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
`;

const ActionButton = styled.button<{ variant: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 25px;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 140px;
  justify-content: center;

  ${props => props.variant === 'primary' ? `
    background: linear-gradient(135deg, #FF41FB, #FF6B6B);
    color: white;
    box-shadow: 0 4px 15px rgba(255, 65, 251, 0.3);

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 65, 251, 0.4);
    }
  ` : `
    background: transparent;
    color: #fff;
    border: 2px solid rgba(255, 255, 255, 0.3);

    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.5);
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  margin: 20px 0;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ percentage: number }>`
  height: 100%;
  background: linear-gradient(90deg, #FF6B6B, #FFA500);
  width: ${props => props.percentage}%;
  transition: width 1s ease;
  border-radius: 2px;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// Component props
interface SessionWarningProps {
  isVisible: boolean;
  onExtend: () => Promise<void>;
  onLogout: () => void;
  onClose?: () => void;
  customMessage?: string;
}

/**
 * Session Warning Modal Component
 */
const SessionWarning: React.FC<SessionWarningProps> = ({
  isVisible,
  onExtend,
  onLogout,
  onClose,
  customMessage
}) => {
  const { minutesRemaining, isRefreshing } = useSessionManagement();
  const [isExtending, setIsExtending] = useState(false);
  const [countdown, setCountdown] = useState<number>(0);

  // Update countdown every second
  useEffect(() => {
    if (!isVisible || !minutesRemaining) return;

    setCountdown(minutesRemaining * 60); // Convert to seconds

    const interval = setInterval(() => {
      setCountdown(prev => {
        const newCount = prev - 1;
        if (newCount <= 0) {
          clearInterval(interval);
          return 0;
        }
        return newCount;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, minutesRemaining]);

  // Format countdown display
  const formatCountdown = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Handle extend session
  const handleExtend = useCallback(async () => {
    setIsExtending(true);
    try {
      await onExtend();
      // Modal should close automatically when session is extended
    } catch (error) {
      console.error('Failed to extend session:', error);
      // Keep modal open on error
    } finally {
      setIsExtending(false);
    }
  }, [onExtend]);

  // Handle keyboard events
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          if (onClose) {
            onClose();
          }
          break;
        case 'Enter':
          if (!isExtending && !isRefreshing) {
            handleExtend();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, isExtending, isRefreshing, handleExtend, onClose]);

  // Auto-logout when countdown reaches zero
  useEffect(() => {
    if (countdown <= 0 && isVisible) {
      onLogout();
    }
  }, [countdown, isVisible, onLogout]);

  // Calculate progress percentage
  const progressPercentage = minutesRemaining ? ((countdown / (minutesRemaining * 60)) * 100) : 0;

  if (!isVisible) return null;

  return (
    <ErrorBoundary>
      <Overlay 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="session-warning-title"
        aria-describedby="session-warning-message"
      >
        <Modal>
          <WarningIcon 
            aria-hidden="true" 
            title="Session expiring warning"
          />
          
          <Title id="session-warning-title">
            Sitzung läuft ab
          </Title>

          <Message id="session-warning-message">
            {customMessage || 
             'Ihre Sitzung läuft in Kürze ab. Möchten Sie die Sitzung verlängern oder sich abmelden?'
            }
          </Message>

          <CountdownText 
            aria-live="polite" 
            aria-label={`Verbleibende Zeit: ${formatCountdown(countdown)}`}
          >
            {formatCountdown(countdown)}
          </CountdownText>

          <ProgressBar 
            role="progressbar" 
            aria-valuenow={progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Session expiry progress: ${Math.round(progressPercentage)}% remaining`}
          >
            <ProgressFill percentage={progressPercentage} />
          </ProgressBar>

          <ButtonGroup>
            <ActionButton
              variant="primary"
              onClick={handleExtend}
              disabled={isExtending || isRefreshing}
              aria-label="Extend session for 15 more minutes"
            >
              {isExtending || isRefreshing ? (
                <>
                  <LoadingSpinner />
                  Verlängern...
                </>
              ) : (
                <>
                  <FaRedo />
                  Verlängern
                </>
              )}
            </ActionButton>

            <ActionButton
              variant="secondary"
              onClick={onLogout}
              disabled={isExtending || isRefreshing}
              aria-label="Logout now"
            >
              <FaSignOutAlt />
              Abmelden
            </ActionButton>
          </ButtonGroup>

          {onClose && (
            <ActionButton
              variant="secondary"
              onClick={onClose}
              disabled={isExtending || isRefreshing}
              style={{ marginTop: '15px' }}
              aria-label="Dismiss this warning"
            >
              Ignorieren
            </ActionButton>
          )}
        </Modal>
      </Overlay>
    </ErrorBoundary>
  );
};

export default SessionWarning;