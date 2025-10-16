/**
 * Menu Header Component
 * Displays header with logo, language selector, and navigation controls
 */

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
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

// Visually hidden text for accessibility (h1 requirement)
const VisuallyHidden = styled.span`
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
`;

const MainHeading = styled.h1`
  margin: 0;
  padding: 0;
  line-height: 0;
`;

const BackButton = styled(motion.button)`
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 65, 251, 0.3);
  border-radius: 50%;
  width: 60px;
  height: 60px;
  font-family: 'Aldrich', sans-serif;
  font-size: 1.8rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  position: fixed;
  top: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  padding: 0;

  &::before {
    content: '←';
    transition: transform 0.3s ease;
  }

  &:hover {
    border-color: #FF41FB;
    background: rgba(255, 65, 251, 0.2);
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 6px 20px rgba(255, 65, 251, 0.4);

    &::before {
      transform: translateX(-2px);
    }
  }

  &:active {
    transform: translateY(0) scale(1);
  }

  @media (max-width: 768px) {
    top: 15px;
    left: 15px;
    width: 55px;
    height: 55px;
    font-size: 1.6rem;
  }

  @media (max-width: 480px) {
    top: 12px;
    left: 12px;
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
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
  font-size: clamp(1.6rem, 5vw, 2.5rem);
  font-weight: 700;
  color: #FFFFFF;
  text-align: center;
  margin: 20px 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  letter-spacing: 2px;
  text-transform: uppercase;

  @media (max-width: 768px) {
    margin: 15px 0;
  }

  @media (max-width: 480px) {
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
    name: string | { de: string; en?: string; da?: string; tr?: string; it?: string };
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
 * Helper function to get the display name from a category name (string or multilingual object)
 */
const getCategoryDisplayName = (
  categoryName: string | { de: string; en?: string; da?: string; tr?: string; it?: string },
  language: string
): string => {
  // If it's already a multilingual object, use it directly
  if (typeof categoryName === 'object' && categoryName !== null) {
    return categoryName[language as keyof typeof categoryName] || categoryName.de || '';
  }

  // If it's a string, return it as-is (assuming it's already translated or will be handled elsewhere)
  return categoryName;
};

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

      {/* Logo section */}
      {showLogo && (
        <LogoSection
          variants={itemVariants}
        >
          <MainHeading>
            <VisuallyHidden>Safira Lounge Digital Menu</VisuallyHidden>
            <LogoImg
              src="/images/safira_logo_220w.webp"
              srcSet="/images/safira_logo_120w.webp 120w, /images/safira_logo_220w.webp 220w, /images/safira_logo_280w.webp 280w"
              sizes="(max-width: 480px) 120px, (max-width: 768px) 150px, 200px"
              alt=""
              aria-hidden="true"
              loading="eager"
              fetchPriority="high"
            />
          </MainHeading>
          
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
        />
      )}

      {/* Category title */}
      {category && (
        <CategoryTitle
          variants={itemVariants}
        >
          {getCategoryDisplayName(category.name, language)}
        </CategoryTitle>
      )}
    </HeaderContainer>
  );
});

/**
 * Default export
 */
export default MenuHeader;