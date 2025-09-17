import React, { useRef, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import useAccessibility from '../../hooks/useAccessibility';
import { ScreenReaderText } from '../Common/ScreenReaderOnly';

const CardContainer = styled(motion.div)<{ 
  $isSelected?: boolean; 
  $isDisabled?: boolean; 
  $isMenuBuilder?: boolean;
  $shouldShowFocusRing?: boolean;
  $reducedMotion?: boolean;
}>`
  background: ${props => props.$isSelected ? 'rgba(233, 30, 99, 0.2)' : 'transparent'};
  border: ${props => props.$isSelected ? '2px solid rgba(233, 30, 99, 0.8)' : 'none'};
  border-radius: ${props => props.$isMenuBuilder ? '10px' : '0'};
  padding: ${props => props.$isMenuBuilder ? '15px 60px 15px 15px' : '15px 0'};
  margin: ${props => props.$isMenuBuilder ? '0 20px 10px 0' : '0'};
  transition: ${props => props.$reducedMotion ? 'none' : 'all 0.3s ease'};
  position: relative;
  overflow: visible;
  border-bottom: ${props => props.$isMenuBuilder ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'};
  cursor: ${props => props.$isDisabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.$isDisabled ? 0.5 : 1};
  
  /* Ensure minimum touch target size */
  min-height: 44px;
  
  /* Focus styles for keyboard navigation */
  &:focus-within {
    outline: none;
    ${props => props.$shouldShowFocusRing && `
      outline: 3px solid rgba(255, 65, 251, 0.6);
      outline-offset: 2px;
    `}
  }

  &:hover {
    background: ${props => {
      if (props.$isDisabled) return props.$isSelected ? 'rgba(233, 30, 99, 0.2)' : 'transparent';
      if (props.$isSelected) return 'rgba(233, 30, 99, 0.3)';
      return 'rgba(255, 255, 255, 0.05)';
    }};
    border-bottom-color: ${props => props.$isMenuBuilder ? 'none' : 'rgba(255, 65, 251, 0.3)'};
    border-color: ${props => props.$isSelected ? 'rgba(233, 30, 99, 1)' : 'rgba(255, 65, 251, 0.3)'};
  }

  &:active {
    background: ${props => {
      if (props.$isDisabled) return props.$isSelected ? 'rgba(233, 30, 99, 0.2)' : 'transparent';
      return props.$isSelected ? 'rgba(233, 30, 99, 0.4)' : 'rgba(255, 65, 251, 0.1)';
    }};
    transform: ${props => props.$isDisabled || props.$reducedMotion ? 'none' : 'scale(0.98)'};
  }
  
  /* High contrast mode support */
  @media (prefers-contrast: high) {
    border-width: 3px;
    
    &:focus-within {
      outline: 4px solid;
      outline-offset: 2px;
    }
  }
  
  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    transition: none;
    
    &:active {
      transform: none;
    }
  }
`;

const ProductBadgesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  align-items: center;
  margin-left: 10px;
`;

const ProductBadge = styled.span<{ badgeType: 'neu' | 'kurze_zeit' | 'beliebt' }>`
  background: ${props => {
    switch (props.badgeType) {
      case 'neu': return 'linear-gradient(135deg, #4CAF50, #45a049)';
      case 'kurze_zeit': return 'linear-gradient(135deg, #FF9800, #f57c00)';
      case 'beliebt': return 'linear-gradient(135deg, #E91E63, #c2185b)';
      default: return '#FF41FB';
    }
  }};
  color: white;
  padding: 3px 8px;
  border-radius: 10px;
  font-family: 'Aldrich', sans-serif;
  font-size: 0.65rem;
  text-transform: uppercase;
  font-weight: bold;
  box-shadow: ${props => {
    switch (props.badgeType) {
      case 'neu': return '0 0 15px rgba(76, 175, 80, 0.8), 0 2px 8px rgba(0, 0, 0, 0.3)';
      case 'kurze_zeit': return '0 0 15px rgba(255, 152, 0, 0.8), 0 2px 8px rgba(0, 0, 0, 0.3)';
      case 'beliebt': return '0 0 15px rgba(233, 30, 99, 0.8), 0 2px 8px rgba(0, 0, 0, 0.3)';
      default: return '0 0 15px rgba(255, 65, 251, 0.8), 0 2px 8px rgba(0, 0, 0, 0.3)';
    }
  }};
  animation: ${props => {
    switch (props.badgeType) {
      case 'neu': return 'pulseGreen 2s ease-in-out infinite';
      case 'kurze_zeit': return 'pulseOrange 2s ease-in-out infinite';
      case 'beliebt': return 'pulsePink 2s ease-in-out infinite';
      default: return 'pulsePurple 2s ease-in-out infinite';
    }
  }};

  @keyframes pulseGreen {
    0%, 100% { box-shadow: 0 0 15px rgba(76, 175, 80, 0.8), 0 2px 8px rgba(0, 0, 0, 0.3); }
    50% { box-shadow: 0 0 25px rgba(76, 175, 80, 1), 0 0 35px rgba(76, 175, 80, 0.6), 0 2px 8px rgba(0, 0, 0, 0.3); }
  }

  @keyframes pulseOrange {
    0%, 100% { box-shadow: 0 0 15px rgba(255, 152, 0, 0.8), 0 2px 8px rgba(0, 0, 0, 0.3); }
    50% { box-shadow: 0 0 25px rgba(255, 152, 0, 1), 0 0 35px rgba(255, 152, 0, 0.6), 0 2px 8px rgba(0, 0, 0, 0.3); }
  }

  @keyframes pulsePink {
    0%, 100% { box-shadow: 0 0 15px rgba(233, 30, 99, 0.8), 0 2px 8px rgba(0, 0, 0, 0.3); }
    50% { box-shadow: 0 0 25px rgba(233, 30, 99, 1), 0 0 35px rgba(233, 30, 99, 0.6), 0 2px 8px rgba(0, 0, 0, 0.3); }
  }

  @keyframes pulsePurple {
    0%, 100% { box-shadow: 0 0 15px rgba(255, 65, 251, 0.8), 0 2px 8px rgba(0, 0, 0, 0.3); }
    50% { box-shadow: 0 0 25px rgba(255, 65, 251, 1), 0 0 35px rgba(255, 65, 251, 0.6), 0 2px 8px rgba(0, 0, 0, 0.3); }
  }
`;

const ProductHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ProductName = styled.h3`
  font-family: 'Oswald', sans-serif;
  font-size: 1.1rem;
  color: #FFFFFF;
  text-transform: uppercase;
  margin: 0;
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  flex: 1;
`;

const SinglePrice = styled.div`
  font-family: 'Oswald', sans-serif;
  font-weight: 600;
  font-size: 1.1rem;
  color: #FFFFFF;
  text-align: right;
`;

const SelectionIndicator = styled.div<{ $isSelected: boolean }>`
  position: absolute;
  top: 50%;
  right: -15px;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid ${props => props.$isSelected ? '#E91E63' : 'rgba(255, 255, 255, 0.3)'};
  background: ${props => props.$isSelected ? '#E91E63' : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: white;
  transition: all 0.3s ease;
  z-index: 10;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
`;

interface ProductCardProps {
  product: any;
  language: string;
  index: number;
  isMenuBuilder?: boolean;
  isSelected?: boolean;
  isDisabled?: boolean;
  onSelect?: () => void;
  // Accessibility props
  id?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

// Header component for subcategory dividers
const HeaderContainer = styled(motion.div)`
  background: transparent;
  border: none;
  padding: 25px 0 15px 0;
  text-align: center;
  position: relative;
  margin: 20px 0 10px 0;
`;

const HeaderTitle = styled.h3`
  font-family: 'Oswald', sans-serif;
  font-size: 1.2rem;
  color: #FF41FB;
  text-transform: uppercase;
  margin: 0;
  letter-spacing: 2px;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(255, 65, 251, 0.5);
`;

const HeaderDescription = styled.div`
  color: rgba(255, 255, 255, 0.6);
  fontSize: 0.8rem;
  marginTop: 8px;
  fontFamily: 'Aldrich, sans-serif';
  text-align: center;
  font-style: italic;
`;

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  language, 
  index, 
  isMenuBuilder = false, 
  isSelected = false, 
  isDisabled = false, 
  onSelect,
  id,
  ariaLabel,
  ariaDescribedBy
}) => {
  const { t } = useTranslation();
  const { shouldShowFocusRing, isReducedMotion, announce } = useAccessibility();
  const cardRef = useRef<HTMLDivElement>(null);
  
  const getProductName = (nameObj: any) => {
    if (typeof nameObj === 'string') return nameObj;
    return nameObj[language] || nameObj['de'] || nameObj;
  };

  const getProductDescription = (descObj: any) => {
    if (!descObj) return null;
    if (typeof descObj === 'string') return descObj;
    return descObj[language] || descObj['de'] || null;
  };

  const productName = getProductName(product.name);
  const productDescription = getProductDescription(product.description);

  const getActiveBadges = (badges: { neu: boolean; kurze_zeit: boolean; beliebt: boolean } | undefined) => {
    if (!badges) return [];
    const activeBadges = [];
    if (badges.neu) activeBadges.push({ type: 'neu', text: t('product.badges.neu') });
    if (badges.kurze_zeit) activeBadges.push({ type: 'kurze_zeit', text: t('product.badges.kurze_zeit') });
    if (badges.beliebt) activeBadges.push({ type: 'beliebt', text: t('product.badges.beliebt') });
    return activeBadges;
  };

  const getAllBadges = () => {
    return getActiveBadges(product.badges);
  };

  // Handle card selection with accessibility announcement
  const handleSelect = useCallback(() => {
    if (!isDisabled && onSelect) {
      onSelect();
      const action = isSelected ? 'deselected' : 'selected';
      announce(`${productName} ${action}`, 'polite');
    }
  }, [isDisabled, onSelect, isSelected, productName, announce]);

  // Handle keyboard interactions
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (isDisabled) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSelect();
    }
  }, [isDisabled, handleSelect]);

  // Create accessible description
  const createAccessibleDescription = () => {
    const parts = [productName];
    
    if (product.price) {
      parts.push(`Price: ${product.price.toFixed(2)} euros`);
    }
    
    if (productDescription) {
      parts.push(productDescription);
    }
    
    const badges = getAllBadges();
    if (badges.length > 0) {
      parts.push(`Badges: ${badges.map(b => b.text).join(', ')}`);
    }
    
    if (isMenuBuilder) {
      parts.push(isSelected ? 'Selected for menu' : 'Available for selection');
    }
    
    if (isDisabled) {
      parts.push('Not available');
    }
    
    return parts.join('. ');
  };

  // Generate unique ID if not provided
  const cardId = id || `product-${product.id || index}`;

  // Render header items differently
  if (product.isHeader) {
    return (
      <HeaderContainer
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: isReducedMotion ? 0 : 0.4, 
          delay: isReducedMotion ? 0 : index * 0.03 
        }}
        role="heading"
        aria-level={2}
        id={cardId}
      >
        <HeaderTitle>{productName}</HeaderTitle>
        {productDescription && (
          <HeaderDescription>
            {productDescription}
          </HeaderDescription>
        )}
      </HeaderContainer>
    );
  }

  return (
    <CardContainer
      ref={cardRef}
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: isReducedMotion ? 0 : 0.5, 
        delay: isReducedMotion ? 0 : index * 0.05 
      }}
      $isSelected={isSelected}
      $isDisabled={isDisabled}
      $isMenuBuilder={isMenuBuilder}
      $shouldShowFocusRing={shouldShowFocusRing}
      $reducedMotion={isReducedMotion}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
      role={isMenuBuilder ? "button" : "article"}
      tabIndex={isDisabled ? -1 : 0}
      id={cardId}
      aria-label={ariaLabel || createAccessibleDescription()}
      aria-describedby={ariaDescribedBy}
      aria-pressed={isMenuBuilder ? isSelected : undefined}
      aria-disabled={isDisabled}
    >
      {isMenuBuilder && (
        <SelectionIndicator 
          $isSelected={isSelected}
          aria-hidden="true"
        >
          {isSelected && '✓'}
        </SelectionIndicator>
      )}
      
      <ProductHeader>
        <ProductName>
          {productName}
          {getAllBadges().length > 0 && (
            <ProductBadgesContainer>
              {getAllBadges().map((badge, badgeIndex) => (
                <ProductBadge 
                  key={badgeIndex} 
                  badgeType={badge.type as 'neu' | 'kurze_zeit' | 'beliebt'}
                  aria-label={`Badge: ${badge.text}`}
                >
                  {badge.text}
                </ProductBadge>
              ))}
              
              {/* Screen reader summary of badges */}
              <ScreenReaderText>
                {getAllBadges().length > 0 && 
                  `Product has ${getAllBadges().length} badge${getAllBadges().length > 1 ? 's' : ''}: ${getAllBadges().map(b => b.text).join(', ')}`
                }
              </ScreenReaderText>
            </ProductBadgesContainer>
          )}
        </ProductName>
        
        {product.price && (
          <SinglePrice aria-label={`Price: ${product.price.toFixed(2)} euros`}>
            {product.price.toFixed(2)}€
          </SinglePrice>
        )}
      </ProductHeader>
      
      {productDescription && (
        <div 
          style={{ 
            color: 'rgba(255, 255, 255, 0.7)', 
            fontSize: '0.9rem', 
            marginTop: '5px',
            fontFamily: 'Aldrich, sans-serif'
          }}
          aria-label={`Description: ${productDescription}`}
        >
          {productDescription}
        </div>
      )}
      
      {/* Screen reader only status information */}
      <ScreenReaderText>
        {isMenuBuilder && (isSelected ? 'Selected for menu' : 'Click to add to menu')}
        {isDisabled && 'Currently unavailable'}
      </ScreenReaderText>
      
    </CardContainer>
  );
};

export default ProductCard;