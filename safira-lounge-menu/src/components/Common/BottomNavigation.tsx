import React, { useState, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import axios from 'axios';
import { useLanguage } from '../../contexts/LanguageContext';
import { Language } from '../../types/common.types';
import {
  Menu,
  Globe2,
  Info,
  Share2,
  X,
  ChevronRight,
  Wifi,
  Instagram,
  MessageCircle,
  Phone,
  MapPin,
  Home,
  Coffee,
  Wine,
  Sandwich,
  Copy,
  Check,
  Facebook,
  Twitter,
  Youtube
} from 'lucide-react';
import { FlexibleText } from '../../types/common.types';

// Simple category interface for navigation
interface SimpleCategory {
  id: string;
  name: FlexibleText;
  icon?: string;
}

interface BottomNavigationProps {
  categories: SimpleCategory[];
  currentCategory?: string;
  onCategoryChange: (categoryId: string) => void;
  onLanguageChange?: (language: Language) => void;
}

const NavContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 40;
  width: 100%;
`;

const NavBar = styled.nav`
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(20px) saturate(120%);
  -webkit-backdrop-filter: blur(20px) saturate(120%);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding: 8px 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 65px;
  width: 100%;
  position: relative;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);

  @media (max-width: 480px) {
    height: 70px;
    padding: 10px 0;
  }
`;

const NavButton = styled(motion.button)<{ $active?: boolean }>`
  background: ${props => props.$active
    ? 'rgba(255, 65, 251, 0.1)'
    : 'transparent'};
  border: none;
  color: ${props => props.$active ? '#FF41FB' : 'rgba(255, 255, 255, 0.7)'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: 'Aldrich', sans-serif;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 70px;
  position: relative;
  overflow: hidden;

  &:hover {
    color: #FF41FB;
    background: rgba(255, 65, 251, 0.05);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    width: 22px;
    height: 22px;
    transition: all 0.3s ease;
  }

  &:hover svg {
    transform: scale(1.1);
  }

  span {
    font-size: 0.65rem;
    font-weight: 600;
    opacity: ${props => props.$active ? '1' : '0.8'};
    transition: all 0.3s ease;
  }

  @media (max-width: 480px) {
    min-width: 65px;
    padding: 10px 8px;
    gap: 6px;

    svg {
      width: 24px;
      height: 24px;
    }

    span {
      font-size: 0.6rem;
    }
  }
`;

// Full-width modal overlay for mobile
const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 2000;
  pointer-events: auto;
  backdrop-filter: blur(4px);
`;

// Full-width modal for mobile and tablet devices
const FullWidthModal = styled(motion.div)`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-height: 85vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16161f 100%);
  border-radius: 24px 24px 0 0;
  z-index: 2001;
  transform-origin: center bottom;
  overflow-y: auto;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.5);

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 65, 251, 0.3);
    border-radius: 3px;

    &:hover {
      background: rgba(255, 65, 251, 0.5);
    }
  }

  /* Tablet: Volle Breite beibehalten */
  @media (min-width: 768px) and (max-width: 1023px) {
    max-height: 80vh;
    border-radius: 24px 24px 0 0;
  }

  /* Desktop: Zentriert mit max-width */
  @media (min-width: 1024px) {
    max-width: 500px;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 24px;
    bottom: 80px;
    max-height: 70vh;
  }
`;

const ModalContent = styled.div`
  padding: 24px 20px 32px;

  @media (max-width: 480px) {
    padding: 20px 16px 28px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  h3 {
    color: white;
    font-size: 22px;
    font-weight: 700;
    margin: 0;
    font-family: 'Oswald', sans-serif;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  @media (max-width: 480px) {
    margin-bottom: 20px;
    padding-bottom: 12px;

    h3 {
      font-size: 20px;
    }
  }
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 10px;
  border-radius: 12px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 65, 251, 0.1);
    color: #FF41FB;
    transform: rotate(90deg) scale(1.1);
  }

  svg {
    width: 22px;
    height: 22px;
  }

  @media (max-width: 480px) {
    padding: 8px;

    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;

  @media (max-width: 480px) {
    gap: 12px;
  }
`;

const CategoryCard = styled(motion.button)<{ $active?: boolean }>`
  background: ${props => props.$active ?
    'linear-gradient(135deg, #FF41FB 0%, #E31A9C 100%)' :
    'rgba(255, 255, 255, 0.03)'};
  border: 2px solid ${props => props.$active ? '#FF41FB' : 'rgba(255, 255, 255, 0.08)'};
  color: white;
  padding: 20px 16px;
  border-radius: 16px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #FF41FB 0%, #E31A9C 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    background: ${props => props.$active ?
      'linear-gradient(135deg, #FF41FB 0%, #E31A9C 100%)' :
      'rgba(255, 255, 255, 0.08)'};
    transform: translateY(-4px);
    box-shadow: 0 8px 24px ${props => props.$active ? 'rgba(255, 65, 251, 0.3)' : 'rgba(0, 0, 0, 0.3)'};
    border-color: ${props => props.$active ? '#FF41FB' : 'rgba(255, 65, 251, 0.3)'};

    &::before {
      opacity: ${props => props.$active ? 0 : 0.05};
    }
  }

  &:active {
    transform: translateY(-2px);
  }

  svg {
    font-size: 28px;
    position: relative;
    z-index: 1;
    transition: transform 0.3s ease;
  }

  &:hover svg {
    transform: scale(1.15) rotate(5deg);
  }

  span {
    font-size: 13px;
    font-weight: 600;
    position: relative;
    z-index: 1;
    text-align: center;
    font-family: 'Aldrich', sans-serif;
  }

  @media (max-width: 480px) {
    padding: 18px 14px;
    gap: 8px;

    svg {
      font-size: 26px;
    }

    span {
      font-size: 12px;
    }
  }
`;

const LanguageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 480px) {
    gap: 12px;
  }
`;

const LanguageButton = styled(motion.button)<{ $active?: boolean }>`
  background: ${props => props.$active ?
    'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' :
    'rgba(255, 255, 255, 0.03)'};
  border: 2px solid ${props => props.$active ? '#3b82f6' : 'rgba(255, 255, 255, 0.08)'};
  color: white;
  padding: 16px;
  border-radius: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.3s ease;
  font-size: 15px;
  font-weight: 600;
  font-family: 'Aldrich', sans-serif;

  &:hover {
    background: ${props => props.$active ?
      'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' :
      'rgba(255, 255, 255, 0.08)'};
    transform: translateY(-3px);
    box-shadow: 0 6px 20px ${props => props.$active ? 'rgba(59, 130, 246, 0.3)' : 'rgba(0, 0, 0, 0.3)'};
    border-color: ${props => props.$active ? '#3b82f6' : 'rgba(59, 130, 246, 0.3)'};
  }

  &:active {
    transform: translateY(-1px);
  }

  .flag {
    font-size: 24px;
  }

  @media (max-width: 480px) {
    padding: 14px;
    gap: 10px;
    font-size: 14px;

    .flag {
      font-size: 22px;
    }
  }
`;

const WifiCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;

  @media (max-width: 480px) {
    padding: 16px;
    margin-bottom: 20px;
  }
`;

const QRCodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 24px 0;
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);

  canvas {
    margin: 12px 0;
  }

  p {
    color: #333;
    font-size: 14px;
    text-align: center;
    margin-top: 10px;
    font-weight: 500;
  }

  @media (max-width: 480px) {
    margin: 20px 0;
    padding: 20px;
  }
`;

const WifiInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 480px) {
    margin-bottom: 12px;
  }
`;

const WifiLabel = styled.span`
  color: #94a3b8;
  font-size: 14px;
  font-weight: 500;

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const WifiValue = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  span {
    color: white;
    font-weight: 600;
    font-size: 15px;
    font-family: 'Aldrich', sans-serif;
  }

  @media (max-width: 480px) {
    gap: 8px;

    span {
      font-size: 14px;
    }
  }
`;

const CopyButton = styled.button`
  background: rgba(255, 255, 255, 0.08);
  border: none;
  color: #94a3b8;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 65, 251, 0.1);
    color: #FF41FB;
    transform: scale(1.1);
  }

  svg {
    width: 16px;
    height: 16px;
  }

  @media (max-width: 480px) {
    padding: 6px 8px;

    svg {
      width: 14px;
      height: 14px;
    }
  }
`;

const SocialLinks = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;

  @media (max-width: 480px) {
    gap: 12px;
  }
`;

const SocialButton = styled.a`
  background: rgba(255, 255, 255, 0.03);
  border: 2px solid rgba(255, 255, 255, 0.08);
  color: white;
  padding: 16px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  text-decoration: none;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);

    &.instagram {
      background: linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%);
      border-color: #833ab4;
    }

    &.facebook {
      background: #1877f2;
      border-color: #1877f2;
    }

    &.twitter {
      background: #1da1f2;
      border-color: #1da1f2;
    }

    &.youtube {
      background: #ff0000;
      border-color: #ff0000;
    }
  }

  &:active {
    transform: translateY(-2px);
  }

  svg {
    font-size: 24px;
  }

  @media (max-width: 480px) {
    padding: 14px;

    svg {
      font-size: 22px;
    }
  }
`;

const InfoText = styled.p`
  color: #94a3b8;
  font-size: 14px;
  text-align: center;
  margin: 24px 0 0;
  font-weight: 500;

  @media (max-width: 480px) {
    font-size: 13px;
    margin: 20px 0 0;
  }
`;

const categoryIcons: { [key: string]: React.ReactNode } = {
  'speisen': <Sandwich />,
  'getraenke': <Wine />,
  'shisha': <Coffee />,
  'kaffee': <Coffee />,
  'desserts': <Coffee />,
  'home': <Home />
};

interface DynamicLanguage {
  code: string;
  name: string;
  flag: string;
  enabled: boolean;
}

interface DynamicWifi {
  ssid: string;
  password: string;
  enabled: boolean;
}

interface DynamicSocial {
  id: string;
  name: string;
  url: string;
  icon: string;
  enabled: boolean;
}

// Simple fallback translations
const fallbackTranslations = {
  menu: { de: 'Menü', en: 'Menu', da: 'Menu', tr: 'Menü', it: 'Menu' },
  language: { de: 'Sprache', en: 'Language', da: 'Sprog', tr: 'Dil', it: 'Lingua' },
  social: { de: 'Social Media', en: 'Social Media', da: 'Social Media', tr: 'Sosyal Medya', it: 'Social Media' },
  selectCategory: { de: 'Kategorie wählen', en: 'Select Category', da: 'Vælg kategori', tr: 'Kategori Seç', it: 'Seleziona Categoria' },
  selectLanguage: { de: 'Sprache wählen', en: 'Select Language', da: 'Vælg sprog', tr: 'Dil Seç', it: 'Seleziona Lingua' },
  information: { de: 'Information', en: 'Information', da: 'Information', tr: 'Bilgi', it: 'Informazioni' },
  network: { de: 'Netzwerk', en: 'Network', da: 'Netværk', tr: 'Ağ', it: 'Rete' },
  password: { de: 'Passwort', en: 'Password', da: 'Adgangskode', tr: 'Şifre', it: 'Password' },
  freeWifiGuests: { de: 'Kostenloses WLAN für Gäste', en: 'Free WiFi for Guests', da: 'Gratis WiFi for gæster', tr: 'Misafirler için Ücretsiz WiFi', it: 'WiFi Gratuito per Ospiti' },
  followUs: { de: 'Folgen Sie uns', en: 'Follow us', da: 'Følg os', tr: 'Bizi Takip Edin', it: 'Seguici' },
  scanQR: { de: 'QR Code scannen zum Verbinden', en: 'Scan QR code to connect', da: 'Scan QR-kode for at oprette forbindelse', tr: 'Bağlanmak için QR kodu tarayın', it: 'Scansiona il codice QR per connetterti' },
  scanCamera: { de: 'Scannen Sie mit Ihrer Kamera', en: 'Scan with your camera', da: 'Scan med dit kamera', tr: 'Kameranızla tarayın', it: 'Scansiona con la tua fotocamera' }
};

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  categories,
  currentCategory,
  onCategoryChange,
  onLanguageChange
}) => {
  const { language, setLanguage, t } = useLanguage();

  // Helper function to get translation with fallback
  const getTranslation = (key: keyof typeof fallbackTranslations) => {
    return fallbackTranslations[key][language] || fallbackTranslations[key]['de'];
  };

  const [showCategories, setShowCategories] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const [showWifi, setShowWifi] = useState(false);
  const [showSocial, setShowSocial] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const qrCodeCanvasRef = useRef<HTMLCanvasElement>(null);

  // Dynamic settings from API
  const [dynamicLanguages, setDynamicLanguages] = useState<DynamicLanguage[]>([]);
  const [dynamicWifi, setDynamicWifi] = useState<DynamicWifi>({
    ssid: 'Safira Lounge',
    password: 'Safira123',
    enabled: true
  });
  const [dynamicSocial, setDynamicSocial] = useState<DynamicSocial[]>([]);

  const handleCopyToClipboard = useCallback((text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  }, []);

  const handleLanguageSelect = useCallback((langCode: 'de' | 'da' | 'en' | 'tr' | 'it') => {
    setLanguage(langCode);
    onLanguageChange?.(langCode);
    setShowLanguages(false);
  }, [setLanguage, onLanguageChange]);

  const handleCategorySelect = useCallback((categoryId: string) => {
    onCategoryChange(categoryId);
    setShowCategories(false);
  }, [onCategoryChange]);

  // Load dynamic settings from API
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'https://test.safira-lounge.de/safira-api-fixed.php';

        const [languagesRes, wifiRes, socialRes] = await Promise.all([
          axios.get(`${API_URL}?action=get_active_languages`),
          axios.get('/api/settings/wifi').catch(() => ({ data: { success: false } })),
          axios.get('/api/settings/social').catch(() => ({ data: { success: false } }))
        ]);

        if (languagesRes.data.success) {
          setDynamicLanguages(languagesRes.data.data.active_languages || []);
        }
        if (wifiRes.data.success) {
          setDynamicWifi(wifiRes.data.data);
        }
        if (socialRes.data.success) {
          setDynamicSocial(socialRes.data.data);
        }
      } catch (error) {
        console.error('Error loading navigation settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Generate WiFi QR Code when modal opens
  useEffect(() => {
    if (showWifi && qrCodeCanvasRef.current && dynamicWifi.enabled) {
      const wifiString = `WIFI:T:WPA;S:${dynamicWifi.ssid};P:${dynamicWifi.password};;`;

      QRCode.toCanvas(qrCodeCanvasRef.current, wifiString, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }, (error) => {
        if (error) console.error('QR Code generation error:', error);
      });
    }
  }, [showWifi, dynamicWifi]);

  // Close modals on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowCategories(false);
        setShowLanguages(false);
        setShowWifi(false);
        setShowSocial(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.15,
        ease: "easeIn"
      }
    }
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      y: 100,
      scale: 0.95,
      transformOrigin: "center bottom"
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transformOrigin: "center bottom",
      transition: {
        type: "spring",
        damping: 30,
        stiffness: 300,
        mass: 0.8
      }
    },
    exit: {
      opacity: 0,
      y: 100,
      scale: 0.95,
      transformOrigin: "center bottom",
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  return (
    <>
      <NavContainer>
        <NavBar>
          <NavButton
            onClick={() => setShowCategories(true)}
            aria-label={getTranslation('menu')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Menu />
            <span>Kategorien</span>
          </NavButton>

          <NavButton
            onClick={() => setShowLanguages(true)}
            aria-label={getTranslation('language')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Globe2 />
            <span>Sprache</span>
          </NavButton>

          <NavButton
            onClick={() => setShowWifi(true)}
            aria-label="WiFi"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Wifi />
            <span>WiFi</span>
          </NavButton>

          <NavButton
            onClick={() => setShowSocial(true)}
            aria-label={getTranslation('social')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Share2 />
            <span>Social</span>
          </NavButton>
        </NavBar>
      </NavContainer>

      {/* Categories Modal */}
      <AnimatePresence>
        {showCategories && (
          <>
            <ModalOverlay
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setShowCategories(false)}
            />
            <FullWidthModal
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <ModalContent>
                <ModalHeader>
                  <h3>{getTranslation('selectCategory')}</h3>
                  <CloseButton onClick={() => setShowCategories(false)}>
                    <X />
                  </CloseButton>
                </ModalHeader>

                <CategoryGrid>
                  {categories.map((category) => (
                    <CategoryCard
                      key={category.id}
                      $active={currentCategory === category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {categoryIcons[category.id] || <Sandwich />}
                      <span>
                        {typeof category.name === 'string'
                          ? category.name
                          : category.name[language] || category.name.de || category.name.en || 'Category'}
                      </span>
                    </CategoryCard>
                  ))}
                </CategoryGrid>
              </ModalContent>
            </FullWidthModal>
          </>
        )}
      </AnimatePresence>

      {/* Languages Modal */}
      <AnimatePresence>
        {showLanguages && (
          <>
            <ModalOverlay
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setShowLanguages(false)}
            />
            <FullWidthModal
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <ModalContent>
                <ModalHeader>
                  <h3>{getTranslation('selectLanguage')}</h3>
                  <CloseButton onClick={() => setShowLanguages(false)}>
                    <X />
                  </CloseButton>
                </ModalHeader>

                <LanguageGrid>
                  {dynamicLanguages.map((lang) => (
                    <LanguageButton
                      key={lang.code}
                      $active={language === lang.code}
                      onClick={() => handleLanguageSelect(lang.code as any)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="flag">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </LanguageButton>
                  ))}
                </LanguageGrid>
              </ModalContent>
            </FullWidthModal>
          </>
        )}
      </AnimatePresence>

      {/* WiFi Modal */}
      <AnimatePresence>
        {showWifi && (
          <>
            <ModalOverlay
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setShowWifi(false)}
            />
            <FullWidthModal
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <ModalContent>
                <ModalHeader>
                  <h3>WiFi {getTranslation('information')}</h3>
                  <CloseButton onClick={() => setShowWifi(false)}>
                    <X />
                  </CloseButton>
                </ModalHeader>

                {dynamicWifi.enabled ? (
                  <>
                    <WifiCard>
                      <WifiInfo>
                        <WifiLabel>{getTranslation('network')}:</WifiLabel>
                        <WifiValue>
                          <span>{dynamicWifi.ssid}</span>
                          <CopyButton onClick={() => handleCopyToClipboard(dynamicWifi.ssid, 'network')}>
                            {copiedField === 'network' ? <Check /> : <Copy />}
                          </CopyButton>
                        </WifiValue>
                      </WifiInfo>

                      <WifiInfo>
                        <WifiLabel>{getTranslation('password')}:</WifiLabel>
                        <WifiValue>
                          <span>{dynamicWifi.password}</span>
                          <CopyButton onClick={() => handleCopyToClipboard(dynamicWifi.password, 'password')}>
                            {copiedField === 'password' ? <Check /> : <Copy />}
                          </CopyButton>
                        </WifiValue>
                      </WifiInfo>
                    </WifiCard>

                    <QRCodeContainer>
                      <p style={{ color: '#666', fontWeight: 600, marginBottom: '10px' }}>
                        {getTranslation('scanQR')}
                      </p>
                      <canvas ref={qrCodeCanvasRef} />
                      <p style={{ color: '#999', fontSize: '12px', marginTop: '5px' }}>
                        {getTranslation('scanCamera')}
                      </p>
                    </QRCodeContainer>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 20px' }}>
                    WiFi ist derzeit nicht verfügbar
                  </div>
                )}

                <InfoText>{getTranslation('freeWifiGuests')}</InfoText>
              </ModalContent>
            </FullWidthModal>
          </>
        )}
      </AnimatePresence>

      {/* Social Modal */}
      <AnimatePresence>
        {showSocial && (
          <>
            <ModalOverlay
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setShowSocial(false)}
            />
            <FullWidthModal
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <ModalContent>
                <ModalHeader>
                  <h3>{getTranslation('followUs')}</h3>
                  <CloseButton onClick={() => setShowSocial(false)}>
                    <X />
                  </CloseButton>
                </ModalHeader>

                <SocialLinks>
                  {dynamicSocial.map((social) => (
                    <SocialButton
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={social.id}
                      aria-label={social.name}
                    >
                      <span style={{ fontSize: '20px' }}>{social.icon}</span>
                    </SocialButton>
                  ))}
                </SocialLinks>

                <InfoText>@safiralounge</InfoText>
              </ModalContent>
            </FullWidthModal>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default BottomNavigation;
