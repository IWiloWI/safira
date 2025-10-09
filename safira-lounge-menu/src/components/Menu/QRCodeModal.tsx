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
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;

  /* Ensure modal is always scrollable and centered */
  @supports (-webkit-touch-callout: none) {
    /* iOS specific */
    min-height: -webkit-fill-available;
  }

  @media (max-width: 480px) {
    padding: 12px;
    align-items: flex-start;
    padding-top: max(12px, env(safe-area-inset-top));
    padding-bottom: max(12px, env(safe-area-inset-bottom));
  }
`;

const ModalCard = styled(motion.div)`
  position: relative;
  background: linear-gradient(-45deg,
    rgba(255, 255, 255, 0.98),
    rgba(255, 240, 250, 0.96),
    rgba(255, 245, 255, 0.98),
    rgba(250, 240, 255, 0.96),
    rgba(255, 255, 255, 0.98)
  );
  background-size: 400% 400%;
  animation: ${gradientShift} 8s ease infinite, ${fadeIn} 0.3s ease;
  border: 2px solid rgba(255, 65, 251, 0.5);
  border-radius: 24px;
  padding: 32px 28px;
  width: 100%;
  max-width: 460px;
  max-height: 85vh;
  overflow-y: auto;
  overflow-x: hidden;
  text-align: center;
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow:
    0 20px 60px rgba(255, 65, 251, 0.25),
    0 0 80px rgba(255, 65, 251, 0.15),
    0 4px 30px rgba(0, 0, 0, 0.15);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin: auto;

  /* Smooth scrolling */
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 65, 251, 0.1);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 65, 251, 0.4);
    border-radius: 3px;

    &:hover {
      background: rgba(255, 65, 251, 0.6);
    }
  }

  /* Tablet optimizations */
  @media (min-width: 481px) and (max-width: 768px) {
    max-width: 440px;
    padding: 28px 24px;
    max-height: 82vh;
    border-radius: 20px;
  }

  /* Mobile optimizations */
  @media (max-width: 480px) {
    padding: 24px 20px;
    max-width: calc(100vw - 24px);
    max-height: calc(100vh - 24px - env(safe-area-inset-top) - env(safe-area-inset-bottom));
    border-radius: 20px;
    margin-top: 12px;
    margin-bottom: 12px;
  }

  /* Extra small mobile */
  @media (max-width: 360px) {
    padding: 20px 16px;
    max-width: calc(100vw - 20px);
  }

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
      rgba(255, 65, 251, 0.04),
      transparent,
      rgba(255, 20, 147, 0.04),
      transparent
    );
    animation: ${shimmer} 3s linear infinite;
    pointer-events: none;
    z-index: 0;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid rgba(255, 65, 251, 0.5);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #E91E63;
  font-size: 1.3rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;

  &:hover {
    background: #FF41FB;
    color: #FFFFFF;
    transform: rotate(90deg) scale(1.1);
    border-color: #FF41FB;
    box-shadow: 0 4px 16px rgba(255, 65, 251, 0.4);
  }

  &:active {
    transform: rotate(90deg) scale(0.95);
  }

  @media (max-width: 480px) {
    top: 12px;
    right: 12px;
    width: 34px;
    height: 34px;
    font-size: 1.2rem;
  }
`;

const ModalTitle = styled.h3`
  font-family: 'Oswald', sans-serif;
  font-size: clamp(1.6rem, 4.5vw, 2.2rem);
  background: linear-gradient(90deg, #FF41FB, #FF1493);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-transform: uppercase;
  margin: 0 0 20px 0;
  padding: 0;
  letter-spacing: 2.5px;
  z-index: 1;
  position: relative;
  word-wrap: break-word;
  overflow-wrap: break-word;
  width: 100%;
  box-sizing: border-box;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 1.7rem;
    letter-spacing: 2px;
    margin-bottom: 16px;
  }

  @media (max-width: 480px) {
    font-size: 1.5rem;
    letter-spacing: 1.8px;
    margin-bottom: 14px;
  }

  @media (max-width: 360px) {
    font-size: 1.3rem;
    letter-spacing: 1.5px;
  }
`;

const WiFiInfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  box-sizing: border-box;
  z-index: 1;
  position: relative;
  margin-bottom: 8px;

  @media (max-width: 768px) {
    gap: 14px;
  }

  @media (max-width: 480px) {
    gap: 12px;
    margin-bottom: 6px;
  }
`;

const ModalInfo = styled.div`
  font-family: 'Aldrich', sans-serif;
  color: #666;
  padding: 0 4px;
  font-size: clamp(0.85rem, 2.5vw, 0.95rem);
  letter-spacing: 0.3px;
  line-height: 1.5;
  word-wrap: break-word;
  overflow-wrap: break-word;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;

const NetworkName = styled.div`
  font-family: 'Oswald', sans-serif;
  color: #1A1A2E;
  font-size: clamp(1.1rem, 3.5vw, 1.3rem);
  padding: 0 4px;
  letter-spacing: 0.8px;
  font-weight: 700;
  word-wrap: break-word;
  overflow-wrap: break-word;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const Password = styled.div`
  background: linear-gradient(145deg,
    rgba(255, 65, 251, 0.08),
    rgba(255, 20, 147, 0.08)
  );
  border: 2px solid rgba(255, 65, 251, 0.5);
  border-radius: 12px;
  padding: 16px 12px;
  font-family: 'Oswald', sans-serif;
  font-size: clamp(1.1rem, 3.5vw, 1.4rem);
  font-weight: bold;
  color: #E91E63;
  letter-spacing: 2px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  width: 100%;
  box-sizing: border-box;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 480px) {
    font-size: 1.1rem;
    padding: 14px 10px;
    letter-spacing: 1.5px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 14px;
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;
  box-sizing: border-box;
  z-index: 1;
  position: relative;
  margin-top: 20px;

  @media (max-width: 768px) {
    gap: 12px;
    margin-top: 16px;
  }

  @media (max-width: 480px) {
    gap: 10px;
    margin-top: 14px;
    flex-direction: column;
    align-items: stretch;
  }

  @media (max-width: 360px) {
    margin-top: 12px;
  }
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  background: ${props => props.variant === 'primary'
    ? 'linear-gradient(145deg, #FF41FB, #FF1493)'
    : 'linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(245, 245, 245, 0.95))'
  };
  border: ${props => props.variant === 'primary'
    ? 'none'
    : '2px solid rgba(255, 65, 251, 0.4)'
  };
  border-radius: 24px;
  padding: 12px 28px;
  color: ${props => props.variant === 'primary' ? 'white' : '#333'};
  font-family: 'Aldrich', sans-serif;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(255, 65, 251, ${props => props.variant === 'primary' ? '0.35' : '0.2'});
  min-width: 130px;
  max-width: 100%;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;

  @media (max-width: 768px) {
    font-size: 0.95rem;
    padding: 11px 26px;
    min-width: 120px;
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
    padding: 12px 24px;
    min-width: 100%;
    border-radius: 20px;
  }

  @media (max-width: 360px) {
    font-size: 0.85rem;
    padding: 10px 20px;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(255, 65, 251, ${props => props.variant === 'primary' ? '0.45' : '0.3'});
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const QRCodeContainer = styled(motion.div)`
  margin: 24px auto 0;
  padding: 20px;
  background: white;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(255, 65, 251, 0.1);
  z-index: 1;
  position: relative;
  width: fit-content;
  max-width: 100%;
  box-sizing: border-box;
  align-self: center;

  img {
    display: block;
    width: 220px;
    height: 220px;
    max-width: 100%;
    object-fit: contain;
    border-radius: 8px;
  }

  @media (max-width: 768px) {
    margin-top: 20px;
    padding: 18px;

    img {
      width: 200px;
      height: 200px;
    }
  }

  @media (max-width: 480px) {
    padding: 16px;
    margin-top: 18px;
    border-radius: 14px;

    img {
      width: 180px;
      height: 180px;
    }
  }

  @media (max-width: 360px) {
    padding: 14px;

    img {
      width: 160px;
      height: 160px;
    }
  }
`;

const QRDescription = styled.div`
  margin-top: 12px;
  font-size: clamp(0.8rem, 2vw, 0.9rem);
  font-family: 'Aldrich', sans-serif;
  color: #666;
  text-align: center;
  word-wrap: break-word;
  overflow-wrap: break-word;
  width: 100%;
  box-sizing: border-box;
  padding: 0 4px;

  @media (max-width: 480px) {
    font-size: 0.8rem;
    margin-top: 10px;
  }
`;

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  padding: 5px;
  z-index: 1;
  position: relative;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    margin-bottom: 18px;
    border-radius: 14px;
  }

  @media (max-width: 480px) {
    margin-bottom: 16px;
    border-radius: 12px;
    padding: 4px;
  }
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
  font-size: clamp(0.9rem, 2.2vw, 1rem);
  font-weight: ${props => props.$active ? '600' : '500'};
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-sizing: border-box;
  min-width: 0;

  @media (max-width: 768px) {
    font-size: 0.9rem;
    padding: 11px 18px;
  }

  @media (max-width: 480px) {
    font-size: 0.85rem;
    padding: 10px 14px;
    border-radius: 10px;
  }

  @media (max-width: 360px) {
    font-size: 0.8rem;
    padding: 9px 12px;
  }

  &:hover {
    background: ${props => props.$active
      ? 'linear-gradient(145deg, #FF41FB, #FF1493)'
      : 'rgba(255, 65, 251, 0.15)'
    };
  }

  &:active {
    transform: scale(0.98);
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

      <WiFiInfoSection>
        <ModalInfo>{getText('wifiInfo')}</ModalInfo>
        <NetworkName>📶 {wifiCredentials.ssid}</NetworkName>
        <Password>{wifiCredentials.password}</Password>
      </WiFiInfoSection>

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
            <img src={wifiQR} alt="WiFi QR Code" loading="lazy" />
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
            <img src={menuQR} alt="Menu QR Code" loading="lazy" />
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