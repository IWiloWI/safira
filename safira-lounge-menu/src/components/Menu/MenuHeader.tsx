/**
 * Menu Header Component
 * Displays header with logo, language selector, and navigation controls
 */

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import LanguageToggle from '../Common/LanguageToggle';
import { Language } from '../../types';
import { useResponsive } from '../../hooks/useResponsive';

// Styled components
const HeaderContainer = styled(motion.header)`
  position: relative;
  z-index: 100;
  width: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: transparent;
`;

const LogoSection = styled(motion.div)`
  text-align: center;
  margin-bottom: 20px;
  position: relative;
  z-index: 10;
`;

const LogoImg = styled.img`
  height: 200px;
  width: auto;
  filter: drop-shadow(0 5px 15px rgba(0, 0, 0, 0.3));
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    height: 150px;
  }
  
  @media (max-width: 480px) {
    height: 120px;
  }
  
  &:hover {
    filter: drop-shadow(0 8px 20px rgba(255, 65, 251, 0.3));
    transform: scale(1.02);
  }
`;

const TopBar = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  gap: 15px;
  z-index: 101;
  
  @media (max-width: 768px) {
    top: 5px;
    right: 5px;
    gap: 10px;
  }
`;

const BackButton = styled(motion.button)`
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.85), rgba(255, 240, 255, 0.90));
  border: 2px solid rgba(233, 30, 99, 0.3);
  border-radius: 25px;
  padding: 12px 24px;
  font-family: 'Aldrich', sans-serif;
  font-size: 1rem;
  color: #1A1A2E;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(25px);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;

  &::before {
    content: '←';
    font-size: 1.2rem;
    transition: transform 0.3s ease;
  }

  &:hover {
    border-color: rgba(233, 30, 99, 0.5);
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(255, 240, 255, 0.98));
    transform: translateY(-2px);
    color: #E91E63;
    box-shadow: 0 5px 15px rgba(233, 30, 99, 0.3);
    
    &::before {
      transform: translateX(-2px);
    }
  }

  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    padding: 10px 20px;
    font-size: 0.9rem;
    
    &::before {
      font-size: 1.1rem;
    }
  }
`;

const NavigationHint = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 65, 251, 0.3);
  border-radius: 15px;
  padding: 8px 16px;
  margin-top: 10px;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 0.7rem;
    padding: 6px 12px;
  }
`;

const CategoryTitle = styled(motion.h1)`
  font-family: 'Oswald', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: #FFFFFF;
  text-align: center;
  margin: 20px 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  letter-spacing: 2px;
  text-transform: uppercase;
  
  @media (max-width: 768px) {
    font-size: 2rem;
    margin: 15px 0;
  }
  
  @media (max-width: 480px) {
    font-size: 1.6rem;
    margin: 10px 0;
  }
`;


// Component interfaces
export interface MenuHeaderProps {
  /** Whether to show the logo */
  showLogo?: boolean;
  /** Whether to show back button */
  showBackButton?: boolean;
  /** Back button click handler */
  onBack?: () => void;
  /** Current language */
  language: Language;
  /** Language change handler */
  onLanguageChange: (language: Language) => void;
  /** Category information to display */
  category?: {
    name: string;
    icon?: string;
  };
  /** Navigation hint text */
  navigationHint?: string;
  /** Whether header is in mobile mode */
  isMobile?: boolean;
  /** CSS class name */
  className?: string;
  /** Test ID */
  testId?: string;
}

/**
 * Menu Header Component
 * Displays responsive header with logo, navigation, and language selector
 */
export const MenuHeader: React.FC<MenuHeaderProps> = React.memo(({
  showLogo = true,
  showBackButton = false,
  onBack,
  language,
  onLanguageChange,
  category,
  navigationHint,
  isMobile,
  className,
  testId = 'menu-header'
}) => {
  const { isBelow } = useResponsive();
  const effectiveIsMobile = isMobile ?? isBelow('md');

  /**
   * Get back button text based on language
   */
  const getBackButtonText = () => {
    const texts = {
      de: 'Zurück',
      da: 'Tilbage',
      en: 'Back',
      tr: 'Geri',
      it: 'Indietro'
    };
    return texts[language] || texts.de;
  };

  /**
   * Animation variants
   */
  const headerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <HeaderContainer
      className={className}
      data-testid={testId}
      variants={headerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Top bar with language selector */}
      <TopBar>
        <LanguageToggle />
      </TopBar>

      {/* Logo section */}
      {showLogo && (
        <LogoSection
          variants={itemVariants}
        >
          <LogoImg 
            src="/images/safira_logo.png" 
            alt="Safira Lounge"
            loading="eager"
          />
          
          {navigationHint && (
            <NavigationHint
              variants={itemVariants}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.4 }}
            >
              {navigationHint}
            </NavigationHint>
          )}
        </LogoSection>
      )}

      {/* Back button */}
      {showBackButton && onBack && (
        <BackButton
          onClick={onBack}
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          aria-label={getBackButtonText()}
        >
          {getBackButtonText()}
        </BackButton>
      )}

      {/* Category title */}
      {category && (
        <CategoryTitle
          variants={itemVariants}
        >
          {category.name}
        </CategoryTitle>
      )}
    </HeaderContainer>
  );
});

/**
 * Default export
 */
export default MenuHeader;