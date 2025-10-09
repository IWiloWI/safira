import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Unlock } from 'lucide-react';
import { useKiosk } from '../../contexts/KioskContext';

const ExitButtonContainer = styled(motion.div)`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  opacity: 0.3;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }
`;

const ExitButton = styled(motion.button)`
  background: rgba(255, 65, 251, 0.9);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(255, 65, 251, 0.3);
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 65, 251, 1);
    box-shadow: 0 6px 30px rgba(255, 65, 251, 0.5);
  }

  svg {
    color: white;
    width: 28px;
    height: 28px;
  }
`;

const PinModal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
`;

const PinCard = styled(motion.div)`
  background: linear-gradient(180deg, #1a1a2e 0%, #16161f 100%);
  border: 2px solid rgba(255, 65, 251, 0.3);
  border-radius: 24px;
  padding: 40px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
`;

const PinTitle = styled.h2`
  color: white;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 12px;
  text-align: center;
  font-family: 'Oswald', sans-serif;
  text-transform: uppercase;
`;

const PinSubtitle = styled.p`
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  text-align: center;
  margin-bottom: 30px;
`;

const PinInput = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  color: white;
  font-size: 18px;
  text-align: center;
  letter-spacing: 8px;
  font-weight: 600;
  margin-bottom: 20px;

  &:focus {
    outline: none;
    border-color: #FF41FB;
    box-shadow: 0 0 0 3px rgba(255, 65, 251, 0.1);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
    letter-spacing: normal;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled(motion.button)<{ $primary?: boolean }>`
  flex: 1;
  padding: 14px 24px;
  border-radius: 12px;
  border: 2px solid ${props => props.$primary ? '#FF41FB' : 'rgba(255, 255, 255, 0.1)'};
  background: ${props => props.$primary ?
    'linear-gradient(135deg, #FF41FB 0%, #E31A9C 100%)' :
    'rgba(255, 255, 255, 0.05)'};
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${props => props.$primary ?
      'rgba(255, 65, 251, 0.3)' :
      'rgba(255, 255, 255, 0.1)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled(motion.div)`
  color: #ff4444;
  font-size: 14px;
  text-align: center;
  margin-top: 12px;
  font-weight: 600;
`;

const InactivityIndicator = styled.div`
  position: fixed;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  padding: 8px 16px;
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  z-index: 9998;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const KioskExitButton: React.FC = () => {
  const { isKioskMode, settings, disableKioskMode, inactivityTime } = useKiosk();
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  if (!isKioskMode || !settings.showExitButton) {
    return null;
  }

  const handleExitClick = () => {
    setShowPinModal(true);
    setError('');
    setPin('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const success = disableKioskMode(pin);

    if (success) {
      setShowPinModal(false);
      setPin('');
      setError('');
    } else {
      setError('Falscher PIN-Code!');
      setPin('');
    }
  };

  const handleCancel = () => {
    setShowPinModal(false);
    setPin('');
    setError('');
  };

  const formatInactivityTime = (seconds: number) => {
    const remaining = (settings.inactivityTimeout * 60) - seconds;
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Inactivity indicator */}
      {settings.autoRefresh && inactivityTime > 0 && (
        <InactivityIndicator>
          <Lock />
          Auto-Reset: {formatInactivityTime(inactivityTime)}
        </InactivityIndicator>
      )}

      {/* Exit button */}
      <ExitButtonContainer
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
      >
        <ExitButton
          onClick={handleExitClick}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Unlock />
        </ExitButton>
      </ExitButtonContainer>

      {/* PIN Modal */}
      <AnimatePresence>
        {showPinModal && (
          <PinModal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) handleCancel();
            }}
          >
            <PinCard
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: 'spring', damping: 25 }}
            >
              <PinTitle>Kiosk-Modus beenden</PinTitle>
              <PinSubtitle>Bitte Admin-PIN eingeben</PinSubtitle>

              <form onSubmit={handleSubmit}>
                <PinInput
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setError('');
                  }}
                  placeholder="••••"
                  autoFocus
                />

                <ButtonGroup>
                  <Button type="button" onClick={handleCancel}>
                    Abbrechen
                  </Button>
                  <Button $primary type="submit" disabled={pin.length < 4}>
                    Entsperren
                  </Button>
                </ButtonGroup>

                <AnimatePresence>
                  {error && (
                    <ErrorMessage
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      {error}
                    </ErrorMessage>
                  )}
                </AnimatePresence>
              </form>
            </PinCard>
          </PinModal>
        )}
      </AnimatePresence>
    </>
  );
};
