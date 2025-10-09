import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Monitor, Lock, Clock, RefreshCw, Eye, EyeOff, Check, X } from 'lucide-react';
import { useKiosk } from '../../contexts/KioskContext';

const Container = styled.div`
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
`;

const Card = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 800px;
  margin: 0 auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid #f0f0f0;
`;

const HeaderIcon = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #FF41FB 0%, #E31A9C 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    color: white;
    width: 30px;
    height: 30px;
  }
`;

const HeaderText = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 8px 0;
  font-family: 'Oswald', sans-serif;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 14px;
  margin: 0;
`;

const StatusBadge = styled.div<{ $active?: boolean }>`
  padding: 8px 16px;
  border-radius: 20px;
  background: ${props => props.$active ?
    'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)' :
    'rgba(0, 0, 0, 0.05)'};
  color: ${props => props.$active ? 'white' : '#666'};
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const SettingGroup = styled.div`
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SettingLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 12px;

  svg {
    color: #FF41FB;
    width: 20px;
    height: 20px;
  }
`;

const SettingDescription = styled.p`
  color: #666;
  font-size: 14px;
  margin: 0 0 16px 32px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #FF41FB;
    box-shadow: 0 0 0 3px rgba(255, 65, 251, 0.1);
  }
`;

const PinInputGroup = styled.div`
  position: relative;
  display: flex;
  gap: 12px;
  align-items: center;
`;

const PinInput = styled(Input)`
  flex: 1;
  letter-spacing: 4px;
  font-weight: 600;
`;

const ToggleButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: #666;
  transition: color 0.3s ease;

  &:hover {
    color: #FF41FB;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const SwitchContainer = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-left: 32px;
`;

const SwitchTrack = styled.div<{ $checked?: boolean }>`
  width: 56px;
  height: 32px;
  background: ${props => props.$checked ?
    'linear-gradient(135deg, #FF41FB 0%, #E31A9C 100%)' :
    '#e0e0e0'};
  border-radius: 16px;
  position: relative;
  transition: all 0.3s ease;
`;

const SwitchThumb = styled(motion.div)`
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const SwitchInput = styled.input`
  display: none;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 32px;
  padding-top: 32px;
  border-top: 2px solid #f0f0f0;
`;

const Button = styled(motion.button)<{ $primary?: boolean; $danger?: boolean }>`
  flex: 1;
  padding: 16px 24px;
  border-radius: 12px;
  border: 2px solid ${props =>
    props.$primary ? '#FF41FB' :
    props.$danger ? '#ef4444' :
    '#e0e0e0'};
  background: ${props =>
    props.$primary ? 'linear-gradient(135deg, #FF41FB 0%, #E31A9C 100%)' :
    props.$danger ? '#ef4444' :
    'white'};
  color: ${props => (props.$primary || props.$danger) ? 'white' : '#1a1a2e'};
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${props =>
      props.$primary ? 'rgba(255, 65, 251, 0.3)' :
      props.$danger ? 'rgba(239, 68, 68, 0.3)' :
      'rgba(0, 0, 0, 0.1)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const InfoBox = styled.div`
  background: linear-gradient(135deg, rgba(255, 65, 251, 0.1) 0%, rgba(227, 26, 156, 0.1) 100%);
  border: 2px solid rgba(255, 65, 251, 0.2);
  border-radius: 12px;
  padding: 16px;
  margin-top: 32px;
  color: #1a1a2e;
  font-size: 14px;
  line-height: 1.6;

  strong {
    color: #FF41FB;
  }
`;

export const KioskSettings: React.FC = () => {
  const { settings, updateSettings, enableKioskMode, isKioskMode } = useKiosk();

  const [localSettings, setLocalSettings] = useState(settings);
  const [showPin, setShowPin] = useState(false);

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    updateSettings(localSettings);
    alert('Einstellungen gespeichert!');
  };

  const handleStartKiosk = async () => {
    updateSettings(localSettings);
    await enableKioskMode();
  };

  return (
    <Container>
      <Card
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Header>
          <HeaderIcon>
            <Monitor />
          </HeaderIcon>
          <HeaderText>
            <Title>Kiosk-Modus</Title>
            <Subtitle>Vollbild-Modus für Tablets und öffentliche Displays</Subtitle>
          </HeaderText>
          <StatusBadge $active={isKioskMode}>
            {isKioskMode ? (
              <>
                <Check size={16} />
                Aktiv
              </>
            ) : (
              <>
                <X size={16} />
                Inaktiv
              </>
            )}
          </StatusBadge>
        </Header>

        <SettingGroup>
          <SettingLabel>
            <Lock />
            Admin-PIN
          </SettingLabel>
          <SettingDescription>
            PIN-Code zum Beenden des Kiosk-Modus (4-6 Ziffern)
          </SettingDescription>
          <PinInputGroup>
            <PinInput
              type={showPin ? 'text' : 'password'}
              value={localSettings.adminPin}
              onChange={(e) => handleSettingChange('adminPin', e.target.value)}
              placeholder="Mindestens 4 Ziffern"
              maxLength={6}
            />
            <ToggleButton
              type="button"
              onClick={() => setShowPin(!showPin)}
            >
              {showPin ? <EyeOff /> : <Eye />}
            </ToggleButton>
          </PinInputGroup>
        </SettingGroup>

        <SettingGroup>
          <SettingLabel>
            <Clock />
            Inaktivitäts-Timeout
          </SettingLabel>
          <SettingDescription>
            Automatischer Reset nach X Minuten Inaktivität
          </SettingDescription>
          <Input
            type="number"
            min="1"
            max="60"
            value={localSettings.inactivityTimeout}
            onChange={(e) => handleSettingChange('inactivityTimeout', parseInt(e.target.value))}
          />
        </SettingGroup>

        <SettingGroup>
          <SettingLabel>
            <RefreshCw />
            Auto-Refresh aktivieren
          </SettingLabel>
          <SettingDescription>
            Seite automatisch neu laden bei Inaktivität
          </SettingDescription>
          <SwitchContainer>
            <SwitchInput
              type="checkbox"
              checked={localSettings.autoRefresh}
              onChange={(e) => handleSettingChange('autoRefresh', e.target.checked)}
            />
            <SwitchTrack $checked={localSettings.autoRefresh}>
              <SwitchThumb
                animate={{ x: localSettings.autoRefresh ? 24 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </SwitchTrack>
          </SwitchContainer>
        </SettingGroup>

        <SettingGroup>
          <SettingLabel>
            <Monitor />
            Exit-Button anzeigen
          </SettingLabel>
          <SettingDescription>
            Schaltfläche zum Beenden des Kiosk-Modus anzeigen
          </SettingDescription>
          <SwitchContainer>
            <SwitchInput
              type="checkbox"
              checked={localSettings.showExitButton}
              onChange={(e) => handleSettingChange('showExitButton', e.target.checked)}
            />
            <SwitchTrack $checked={localSettings.showExitButton}>
              <SwitchThumb
                animate={{ x: localSettings.showExitButton ? 24 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </SwitchTrack>
          </SwitchContainer>
        </SettingGroup>

        <SettingGroup>
          <SettingLabel>
            <Lock />
            Navigation sperren
          </SettingLabel>
          <SettingDescription>
            Zurück-Navigation verhindern (empfohlen für Kiosks)
          </SettingDescription>
          <SwitchContainer>
            <SwitchInput
              type="checkbox"
              checked={localSettings.lockNavigation}
              onChange={(e) => handleSettingChange('lockNavigation', e.target.checked)}
            />
            <SwitchTrack $checked={localSettings.lockNavigation}>
              <SwitchThumb
                animate={{ x: localSettings.lockNavigation ? 24 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </SwitchTrack>
          </SwitchContainer>
        </SettingGroup>

        <InfoBox>
          <strong>💡 Tipp:</strong> Für beste Ergebnisse installiere die App als Chrome PWA
          (Menü → "App installieren"). Im Kiosk-Modus wird die App dann im Vollbild ohne
          Browser-UI gestartet.
        </InfoBox>

        <ButtonGroup>
          <Button onClick={handleSave}>
            <Check />
            Einstellungen speichern
          </Button>
          <Button
            $primary
            onClick={handleStartKiosk}
            disabled={localSettings.adminPin.length < 4}
          >
            <Monitor />
            Kiosk-Modus starten
          </Button>
        </ButtonGroup>
      </Card>
    </Container>
  );
};
