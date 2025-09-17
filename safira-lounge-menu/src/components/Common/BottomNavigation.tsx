import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
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
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px) saturate(120%);
  -webkit-backdrop-filter: blur(20px) saturate(120%);
  padding: 6px 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 60px;
  width: 100%;
  position: relative;
`;

const NavButton = styled(motion.button)<{ $active?: boolean }>`
  background: ${props => props.$active 
    ? 'rgba(255, 65, 251, 0.08)'
    : 'transparent'};
  border: none;
  color: ${props => props.$active ? '#FF41FB' : 'rgba(255, 255, 255, 0.7)'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 8px 6px;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: 'Aldrich', sans-serif;
  font-size: 0.6rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  min-width: 65px;
  position: relative;
  overflow: hidden;

  &:hover {
    color: ${props => props.$active ? '#FF41FB' : 'rgba(255, 255, 255, 0.9)'};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(-1px);
  }

  svg {
    width: 18px;
    height: 18px;
    margin-bottom: 2px;
    transition: all 0.3s ease;
  }
  
  &:hover svg {
    transform: scale(1.05);
  }

  span {
    font-size: 0.6rem;
    font-weight: 600;
    opacity: ${props => props.$active ? '1' : '0.7'};
    transition: all 0.3s ease;
  }

  @media (max-width: 480px) {
    min-width: 60px;
    padding: 10px 6px;
    font-size: 0.65rem;
    
    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1999;
  pointer-events: auto;
`;

const DropupMenu = styled(motion.div)<{ $buttonIndex?: number }>`
  position: fixed;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  width: 280px;
  max-width: 90vw;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px) saturate(120%);
  -webkit-backdrop-filter: blur(20px) saturate(120%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: none;
  border-radius: 12px 12px 0 0;
  z-index: 1001;
  transform-origin: bottom center;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h3 {
    color: white;
    font-size: 20px;
    margin: 0;
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 8px;
  border-radius: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 65, 251, 0.1);
    color: #FF41FB;
    transform: scale(1.1);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
`;

const CategoryCard = styled.button<{ $active?: boolean }>`
  background: ${props => props.$active ? 
    'linear-gradient(135deg, #fb923c 0%, #f97316 100%)' : 
    'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.$active ? '#fb923c' : 'rgba(255, 255, 255, 0.1)'};
  color: white;
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.$active ? 
      'linear-gradient(135deg, #fb923c 0%, #f97316 100%)' : 
      'rgba(255, 255, 255, 0.1)'};
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(251, 146, 60, 0.3);
  }
  
  svg {
    font-size: 24px;
  }
  
  span {
    font-size: 12px;
    font-weight: 500;
  }
`;

const LanguageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;

const LanguageButton = styled.button<{ $active?: boolean }>`
  background: ${props => props.$active ? 
    'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 
    'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.$active ? '#3b82f6' : 'rgba(255, 255, 255, 0.1)'};
  color: white;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  font-size: 14px;
  
  &:hover {
    background: ${props => props.$active ? 
      'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 
      'rgba(255, 255, 255, 0.1)'};
    transform: translateY(-2px);
  }
  
  .flag {
    font-size: 20px;
  }
`;

const WifiCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
`;

const WifiInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const WifiLabel = styled.span`
  color: #94a3b8;
  font-size: 14px;
`;

const WifiValue = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  span {
    color: white;
    font-weight: 500;
    font-size: 14px;
  }
`;

const CopyButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #94a3b8;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }
`;

const SocialLinks = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
`;

const SocialButton = styled.a`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 12px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  text-decoration: none;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
    
    &.instagram {
      background: linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%);
    }
    
    &.facebook {
      background: #1877f2;
    }
    
    &.twitter {
      background: #1da1f2;
    }
    
    &.youtube {
      background: #ff0000;
    }
  }
  
  svg {
    font-size: 20px;
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

const languages = [
  { code: 'de' as const, name: 'Deutsch', flag: '🇩🇪' },
  { code: 'en' as const, name: 'English', flag: '🇬🇧' },
  { code: 'da' as const, name: 'Dansk', flag: '🇩🇰' },
  { code: 'tr' as const, name: 'Türkçe', flag: '🇹🇷' },
  { code: 'it' as const, name: 'Italiano', flag: '🇮🇹' }
];

const socialMedia = [
  { name: 'Instagram', icon: <Instagram />, url: 'https://instagram.com/safiralounge', className: 'instagram' },
  { name: 'Facebook', icon: <Facebook />, url: 'https://facebook.com/safiralounge', className: 'facebook' },
  { name: 'Twitter', icon: <Twitter />, url: 'https://twitter.com/safiralounge', className: 'twitter' },
  { name: 'YouTube', icon: <Youtube />, url: 'https://youtube.com/safiralounge', className: 'youtube' }
];

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
  followUs: { de: 'Folgen Sie uns', en: 'Follow us', da: 'Følg os', tr: 'Bizi Takip Edin', it: 'Seguici' }
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
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  const dropupVariants = {
    hidden: { 
      scaleY: 0,
      opacity: 0,
      y: 20,
      transformOrigin: "bottom center"
    },
    visible: { 
      scaleY: 1,
      opacity: 1,
      y: 0,
      transformOrigin: "bottom center",
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 200,
        mass: 0.8
      }
    },
    exit: { 
      scaleY: 0,
      opacity: 0,
      y: 10,
      transformOrigin: "bottom center",
      transition: {
        duration: 0.15,
        ease: "easeIn"
      }
    }
  };

  return (
    <>
      <NavContainer>
        <NavBar>
          <div style={{ position: 'relative', flex: 1, display: 'flex', justifyContent: 'center' }}>
            <NavButton 
              onClick={() => setShowCategories(true)} 
              aria-label={getTranslation('menu')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Menu />
              <span>Kategorien</span>
            </NavButton>
            
            <AnimatePresence>
              {showCategories && (
                <>
                  <ModalOverlay
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowCategories(false)}
                  />
                  <DropupMenu
                    $buttonIndex={0}
                    variants={dropupVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div style={{ padding: '16px' }}>
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
                    </div>
                  </DropupMenu>
                </>
              )}
            </AnimatePresence>
          </div>
          
          <div style={{ position: 'relative', flex: 1, display: 'flex', justifyContent: 'center' }}>
            <NavButton 
              onClick={() => setShowLanguages(true)} 
              aria-label={getTranslation('language')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Globe2 />
              <span>Sprache</span>
            </NavButton>
            
            <AnimatePresence>
              {showLanguages && (
                <>
                  <ModalOverlay
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowLanguages(false)}
                  />
                  <DropupMenu
                    $buttonIndex={1}
                    variants={dropupVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div style={{ padding: '16px' }}>
                      <ModalHeader>
                        <h3>{getTranslation('selectLanguage')}</h3>
                        <CloseButton onClick={() => setShowLanguages(false)}>
                          <X />
                        </CloseButton>
                      </ModalHeader>
                      
                      <LanguageGrid>
                        {languages.map((lang) => (
                          <LanguageButton
                            key={lang.code}
                            $active={language === lang.code}
                            onClick={() => handleLanguageSelect(lang.code)}
                          >
                            <span className="flag">{lang.flag}</span>
                            <span>{lang.name}</span>
                          </LanguageButton>
                        ))}
                      </LanguageGrid>
                    </div>
                  </DropupMenu>
                </>
              )}
            </AnimatePresence>
          </div>
          
          <div style={{ position: 'relative', flex: 1, display: 'flex', justifyContent: 'center' }}>
            <NavButton 
              onClick={() => setShowWifi(true)} 
              aria-label="WiFi"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Wifi />
              <span>WiFi</span>
            </NavButton>
            
            <AnimatePresence>
              {showWifi && (
                <>
                  <ModalOverlay
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowWifi(false)}
                  />
                  <DropupMenu
                    $buttonIndex={2}
                    variants={dropupVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div style={{ padding: '16px' }}>
                      <ModalHeader>
                        <h3>WiFi {getTranslation('information')}</h3>
                        <CloseButton onClick={() => setShowWifi(false)}>
                          <X />
                        </CloseButton>
                      </ModalHeader>
                      
                      <WifiCard>
                        <WifiInfo>
                          <WifiLabel>{getTranslation('network')}:</WifiLabel>
                          <WifiValue>
                            <span>Safira_Guest</span>
                            <CopyButton onClick={() => handleCopyToClipboard('Safira_Guest', 'network')}>
                              {copiedField === 'network' ? <Check /> : <Copy />}
                            </CopyButton>
                          </WifiValue>
                        </WifiInfo>
                        
                        <WifiInfo>
                          <WifiLabel>{getTranslation('password')}:</WifiLabel>
                          <WifiValue>
                            <span>Safira2024!</span>
                            <CopyButton onClick={() => handleCopyToClipboard('Safira2024!', 'password')}>
                              {copiedField === 'password' ? <Check /> : <Copy />}
                            </CopyButton>
                          </WifiValue>
                        </WifiInfo>
                      </WifiCard>
                      
                      <p style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', margin: 0 }}>
                        {getTranslation('freeWifiGuests')}
                      </p>
                    </div>
                  </DropupMenu>
                </>
              )}
            </AnimatePresence>
          </div>
          
          <div style={{ position: 'relative', flex: 1, display: 'flex', justifyContent: 'center' }}>
            <NavButton 
              onClick={() => setShowSocial(true)} 
              aria-label={getTranslation('social')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Share2 />
              <span>Social</span>
            </NavButton>
            
            <AnimatePresence>
              {showSocial && (
                <>
                  <ModalOverlay
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowSocial(false)}
                  />
                  <DropupMenu
                    $buttonIndex={3}
                    variants={dropupVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div style={{ padding: '16px' }}>
                      <ModalHeader>
                        <h3>{getTranslation('followUs')}</h3>
                        <CloseButton onClick={() => setShowSocial(false)}>
                          <X />
                        </CloseButton>
                      </ModalHeader>
                      
                      <SocialLinks>
                        {socialMedia.map((social) => (
                          <SocialButton
                            key={social.name}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={social.className}
                            aria-label={social.name}
                          >
                            {social.icon}
                          </SocialButton>
                        ))}
                      </SocialLinks>
                      
                      <p style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', marginTop: '20px' }}>
                        @safiralounge
                      </p>
                    </div>
                  </DropupMenu>
                </>
              )}
            </AnimatePresence>
          </div>
        </NavBar>
      </NavContainer>

    </>
  );
};

export default BottomNavigation;