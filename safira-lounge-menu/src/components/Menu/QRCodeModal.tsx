/**
 * QR Code Modal Component
 * Displays WiFi QR codes and menu QR codes in a modal interface
 */

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useQRCode } from '../../hooks/useQRCode';
import { Language } from '../../types';

// Animations
const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

// Styled components
const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(10px);
  padding: 20px;
  box-sizing: border-box;
`;

const ModalCard = styled(motion.div)`
  background: linear-gradient(-45deg, 
    rgba(255, 255, 255, 0.95),
    rgba(255, 240, 250, 0.92),
    rgba(255, 245, 255, 0.95),
    rgba(250, 240, 255, 0.92),
    rgba(255, 255, 255, 0.95)
  );
  background-size: 400% 400%;
  animation: ${gradientShift} 8s ease infinite, ${fadeIn} 0.3s ease;
  border: 2px solid rgba(255, 65, 251, 0.4);
  border-radius: 25px;
  padding: 40px;
  max-width: 450px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  text-align: center;
  backdrop-filter: blur(20px);
  box-shadow: 
    0 10px 40px rgba(255, 65, 251, 0.15),
    0 0 60px rgba(255, 65, 251, 0.1),
    0 2px 20px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent,
      rgba(255, 65, 251, 0.03),
      transparent,
      rgba(255, 20, 147, 0.03),
      transparent
    );
    animation: ${shimmer} 3s linear infinite;
    pointer-events: none;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid rgba(255, 65, 251, 0.4);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #E91E63;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1;

  &:hover {
    background: #FF41FB;
    color: #FFFFFF;
    transform: rotate(90deg) scale(1.1);
    border-color: #FF41FB;
    box-shadow: 0 4px 12px rgba(255, 65, 251, 0.3);
  }
`;

const ModalTitle = styled.h3`
  font-family: 'Oswald', sans-serif;
  font-size: 2rem;
  background: linear-gradient(90deg, #FF41FB, #FF1493);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-transform: uppercase;
  margin-bottom: 30px;
  letter-spacing: 3px;
  z-index: 1;
  position: relative;
`;

const ModalInfo = styled.div`
  font-family: 'Aldrich', sans-serif;
  color: #666;
  margin: 20px 0;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
  z-index: 1;
  position: relative;
`;

const NetworkName = styled.div`
  font-family: 'Oswald', sans-serif;
  color: #1A1A2E;
  font-size: 1.3rem;
  margin: 20px 0;
  letter-spacing: 1px;
  font-weight: 700;
  z-index: 1;
  position: relative;
`;

const Password = styled.div`
  background: linear-gradient(145deg, 
    rgba(255, 65, 251, 0.08),
    rgba(255, 20, 147, 0.08)
  );
  border: 2px solid rgba(255, 65, 251, 0.5);
  border-radius: 15px;
  padding: 20px;
  margin: 25px 0;
  font-family: 'Oswald', sans-serif;
  font-size: 1.4rem;
  font-weight: bold;
  color: #E91E63;
  letter-spacing: 3px;
  z-index: 1;
  position: relative;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
  margin: 20px 0;
  flex-wrap: wrap;
  z-index: 1;
  position: relative;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  background: ${props => props.variant === 'primary' 
    ? 'linear-gradient(145deg, #FF41FB, #FF1493)'
    : 'linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(240, 240, 240, 0.9))'
  };
  border: ${props => props.variant === 'primary' 
    ? 'none'
    : '2px solid rgba(255, 65, 251, 0.3)'
  };
  border-radius: 25px;
  padding: 12px 30px;
  color: ${props => props.variant === 'primary' ? 'white' : '#333'};
  font-family: 'Aldrich', sans-serif;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 65, 251, 0.3);
  min-width: 120px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 65, 251, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const QRCodeContainer = styled(motion.div)`
  margin: 20px 0;
  padding: 20px;
  background: white;
  border-radius: 15px;
  display: inline-block;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1;
  position: relative;
  
  img {
    display: block;
    width: 200px;
    height: 200px;
  }
`;

const QRDescription = styled.div`
  margin-top: 10px;
  font-size: 0.9rem;
  color: #666;
  z-index: 1;
  position: relative;
`;

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 15px;
  padding: 4px;
  z-index: 1;
  position: relative;
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 12px 20px;
  border: none;
  background: ${props => props.$active 
    ? 'linear-gradient(145deg, #FF41FB, #FF1493)'
    : 'transparent'
  };
  color: ${props => props.$active ? 'white' : '#666'};
  border-radius: 12px;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.$active 
      ? 'linear-gradient(145deg, #FF41FB, #FF1493)'
      : 'rgba(255, 65, 251, 0.1)'
    };
  }
`;

// Component interfaces
export interface QRCodeModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Current language */
  language: Language;
  /** WiFi credentials */
  wifiCredentials?: {
    ssid: string;
    password: string;
    security?: string;
  };
  /** Menu URL base */
  menuBaseUrl?: string;
  /** Table ID for menu QR */
  tableId?: string;
  /** CSS class name */
  className?: string;
  /** Test ID */
  testId?: string;
}

type QRModalTab = 'wifi' | 'menu';

/**
 * QR Code Modal Component
 * Displays WiFi and menu QR codes with multilingual support
 */
export const QRCodeModal: React.FC<QRCodeModalProps> = React.memo(({
  isOpen,
  onClose,
  language,
  wifiCredentials = {
    ssid: 'Safira_Guest',
    password: 'Safira2024',
    security: 'WPA'
  },
  menuBaseUrl,
  tableId,
  className,
  testId = 'qr-code-modal'
}) => {
  const [activeTab, setActiveTab] = useState<QRModalTab>('wifi');
  const [showQR, setShowQR] = useState(false);
  
  const {
    generateWiFiQR,
    generateMenuQR,
    downloadQR,
    isGenerating,
    error
  } = useQRCode();
  
  const [wifiQR, setWifiQR] = useState<string | null>(null);
  const [menuQR, setMenuQR] = useState<string | null>(null);

  /**
   * Get localized text
   */
  const getText = (key: string) => {
    const texts: Record<string, Record<Language, string>> = {
      wifiTitle: {
        de: 'WLAN • WiFi',
        da: 'WiFi • Trådløst',
        en: 'WiFi • Wireless',
        tr: 'WiFi • Kablosuz',
        it: 'WiFi • Wireless'
      },
      wifiInfo: {
        de: 'Kostenloses WLAN für unsere Gäste',
        da: 'Gratis WiFi til vores gæster',
        en: 'Free WiFi for our guests',
        tr: 'Misafirlerimiz için ücretsiz WiFi',
        it: 'WiFi gratuito per i nostri ospiti'
      },
      menuTitle: {
        de: 'Menü QR-Code',
        da: 'Menu QR-kode',
        en: 'Menu QR Code',
        tr: 'Menü QR Kodu',
        it: 'Codice QR del Menu'
      },
      menuInfo: {
        de: 'Scannen Sie den QR-Code für direkten Menüzugang',
        da: 'Scan QR-koden for direkte menuadgang',
        en: 'Scan QR code for direct menu access',
        tr: 'Doğrudan menü erişimi için QR kodunu tarayın',
        it: 'Scansiona il codice QR per accedere direttamente al menu'
      },
      showQR: {
        de: 'QR Code anzeigen',
        da: 'Vis QR-kode',
        en: 'Show QR Code',
        tr: 'QR Kodu Göster',
        it: 'Mostra Codice QR'
      },
      hideQR: {
        de: 'QR Code ausblenden',
        da: 'Skjul QR-kode',
        en: 'Hide QR Code',
        tr: 'QR Kodu Gizle',
        it: 'Nascondi Codice QR'
      },
      download: {
        de: 'Herunterladen',
        da: 'Download',
        en: 'Download',
        tr: 'İndir',
        it: 'Scarica'
      },
      qrDescription: {
        de: 'QR Code scannen für automatische Verbindung',
        da: 'Scan QR-kode for automatisk tilslutning',
        en: 'Scan QR code for automatic connection',
        tr: 'Otomatik bağlantı için QR kodu tarayın',
        it: 'Scansiona il codice QR per la connessione automatica'
      },
      menuDescription: {
        de: 'QR Code scannen für Menüzugang',
        da: 'Scan QR-kode for menuadgang',
        en: 'Scan QR code for menu access',
        tr: 'Menü erişimi için QR kodu tarayın',
        it: 'Scansiona il codice QR per accedere al menu'
      },
      wifi: {
        de: 'WiFi',
        da: 'WiFi',
        en: 'WiFi',
        tr: 'WiFi',
        it: 'WiFi'
      },
      menu: {
        de: 'Menü',
        da: 'Menu',
        en: 'Menu',
        tr: 'Menü',
        it: 'Menu'
      }
    };
    
    return texts[key]?.[language] || texts[key]?.de || key;
  };

  /**
   * Generate WiFi QR code
   */
  const handleGenerateWiFiQR = async () => {
    try {
      const qrData = await generateWiFiQR(
        wifiCredentials.ssid,
        wifiCredentials.password,
        wifiCredentials.security
      );
      setWifiQR(qrData.qrCode);
      setShowQR(true);
    } catch (error) {
      console.error('Failed to generate WiFi QR:', error);
    }
  };

  /**
   * Generate menu QR code
   */
  const handleGenerateMenuQR = async () => {
    try {
      const qrData = await generateMenuQR(tableId, menuBaseUrl);
      setMenuQR(qrData.qrCode);
      setShowQR(true);
    } catch (error) {
      console.error('Failed to generate menu QR:', error);
    }
  };

  /**
   * Handle QR download
   */
  const handleDownload = () => {
    const qrCode = activeTab === 'wifi' ? wifiQR : menuQR;
    if (qrCode) {
      const filename = `${activeTab}-qr-code.png`;
      downloadQR(qrCode, filename);
    }
  };

  /**
   * Reset state when modal closes
   */
  useEffect(() => {
    if (!isOpen) {
      setShowQR(false);
      setActiveTab('wifi');
    }
  }, [isOpen]);

  /**
   * Handle tab change
   */
  const handleTabChange = (tab: QRModalTab) => {
    setActiveTab(tab);
    setShowQR(false);
  };

  /**
   * Render WiFi tab content
   */
  const renderWiFiContent = () => (
    <>
      <ModalTitle>{getText('wifiTitle')}</ModalTitle>
      <ModalInfo>{getText('wifiInfo')}</ModalInfo>
      <NetworkName>📶 {wifiCredentials.ssid}</NetworkName>
      <Password>{wifiCredentials.password}</Password>
      
      <ButtonGroup>
        <ActionButton
          variant="primary"
          onClick={showQR ? () => setShowQR(false) : handleGenerateWiFiQR}
          disabled={isGenerating}
        >
          {showQR ? getText('hideQR') : getText('showQR')}
        </ActionButton>
        
        {showQR && wifiQR && (
          <ActionButton
            variant="secondary"
            onClick={handleDownload}
          >
            {getText('download')}
          </ActionButton>
        )}
      </ButtonGroup>
      
      <AnimatePresence>
        {showQR && wifiQR && (
          <QRCodeContainer
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <img src={wifiQR} alt="WiFi QR Code" />
            <QRDescription>{getText('qrDescription')}</QRDescription>
          </QRCodeContainer>
        )}
      </AnimatePresence>
    </>
  );

  /**
   * Render Menu tab content
   */
  const renderMenuContent = () => (
    <>
      <ModalTitle>{getText('menuTitle')}</ModalTitle>
      <ModalInfo>{getText('menuInfo')}</ModalInfo>
      
      <ButtonGroup>
        <ActionButton
          variant="primary"
          onClick={showQR ? () => setShowQR(false) : handleGenerateMenuQR}
          disabled={isGenerating}
        >
          {showQR ? getText('hideQR') : getText('showQR')}
        </ActionButton>
        
        {showQR && menuQR && (
          <ActionButton
            variant="secondary"
            onClick={handleDownload}
          >
            {getText('download')}
          </ActionButton>
        )}
      </ButtonGroup>
      
      <AnimatePresence>
        {showQR && menuQR && (
          <QRCodeContainer
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <img src={menuQR} alt="Menu QR Code" />
            <QRDescription>{getText('menuDescription')}</QRDescription>
          </QRCodeContainer>
        )}
      </AnimatePresence>
    </>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className={className}
          data-testid={testId}
        >
          <ModalCard
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <CloseButton onClick={onClose} aria-label="Close modal">
              ✕
            </CloseButton>
            
            <TabContainer>
              <Tab
                $active={activeTab === 'wifi'}
                onClick={() => handleTabChange('wifi')}
              >
                {getText('wifi')}
              </Tab>
              <Tab
                $active={activeTab === 'menu'}
                onClick={() => handleTabChange('menu')}
              >
                {getText('menu')}
              </Tab>
            </TabContainer>
            
            {activeTab === 'wifi' ? renderWiFiContent() : renderMenuContent()}
            
            {error && (
              <ModalInfo style={{ color: '#ff4444', marginTop: 10 }}>
                {error}
              </ModalInfo>
            )}
          </ModalCard>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
});

// Default export
export default QRCodeModal;