import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import useKeyboardNavigation from '../../hooks/useKeyboardNavigation';
import useAccessibility from '../../hooks/useAccessibility';
import { ScreenReaderText } from '../Common/ScreenReaderOnly';

const CategoriesContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['mobile'].includes(prop),
})<{ mobile?: boolean }>`
  ${props => props.mobile ? `
    display: flex;
    overflow-x: auto;
    gap: 15px;
    padding: 10px 0;
    
    &::-webkit-scrollbar {
      height: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: rgba(255, 65, 251, 0.1);
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #FF41FB;
      border-radius: 3px;
    }
  ` : `
    display: flex;
    flex-direction: column;
    gap: 15px;
    position: sticky;
    top: 100px;
  `}
`;

const CategoryCard = styled(motion.button).withConfig({
  shouldForwardProp: (prop) => !['mobile', 'shouldShowFocusRing', 'reducedMotion'].includes(prop),
})<{ 
  $active: boolean; 
  mobile?: boolean; 
  shouldShowFocusRing?: boolean;
  reducedMotion?: boolean;
}>`
  ${props => props.mobile ? `
    flex: 0 0 auto;
    padding: 15px 25px;
    min-width: 170px;
  ` : `
    padding: 20px 30px;
    width: 100%;
  `}
  
  /* Ensure minimum touch target size */
  min-height: 44px;
  
  background: ${props => props.$active 
    ? 'linear-gradient(145deg, rgba(233, 30, 99, 0.2), rgba(255, 215, 0, 0.1))' 
    : 'linear-gradient(145deg, rgba(255, 255, 255, 0.85), rgba(255, 240, 255, 0.90))'};
  border: 2px solid ${props => props.$active ? 'rgba(233, 30, 99, 0.5)' : 'rgba(233, 30, 99, 0.25)'};
  border-radius: 25px;
  color: ${props => props.$active ? '#E91E63' : '#1A1A2E'};
  box-shadow: 0 8px 25px rgba(233, 30, 99, 0.15);
  font-family: 'Aldrich', sans-serif;
  font-size: ${props => props.mobile ? '0.95rem' : '1.05rem'};
  font-weight: 700;
  cursor: pointer;
  transition: ${props => props.reducedMotion ? 'none' : 'all 0.4s ease'};
  display: flex;
  align-items: center;
  gap: 18px;
  text-align: left;
  backdrop-filter: blur(25px);

  /* Focus styles */
  &:focus {
    outline: none;
    ${props => props.shouldShowFocusRing && `
      outline: 3px solid rgba(233, 30, 99, 0.6);
      outline-offset: 2px;
    `}
  }

  &:hover {
    background: linear-gradient(145deg, rgba(233, 30, 99, 0.25), rgba(255, 215, 0, 0.15));
    border-color: rgba(233, 30, 99, 0.6);
    transform: ${props => props.reducedMotion ? 'none' : `translateX(${props.mobile ? '0' : '10px'}) translateY(-3px)`};
    box-shadow: 0 15px 40px rgba(233, 30, 99, 0.25), 0 0 30px rgba(255, 215, 0, 0.2);
    color: #E91E63;
  }

  ${props => props.$active && `
    box-shadow: 0 15px 40px rgba(233, 30, 99, 0.3), 0 0 35px rgba(255, 215, 0, 0.25);
    transform: ${props.reducedMotion ? 'none' : `translateX(${props.mobile ? '0' : '8px'})`};
  `}
  
  /* High contrast mode support */
  @media (prefers-contrast: high) {
    border-width: 3px;
    
    &:focus {
      outline: 4px solid;
      outline-offset: 2px;
    }
  }
  
  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    transition: none;
    
    &:hover {
      transform: none;
    }
  }
`;

const CategoryIcon = styled.span`
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const CategoryInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const CategoryName = styled.span`
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const ItemCount = styled.span`
  font-size: 0.85rem;
  opacity: 0.8;
  margin-top: 3px;
  color: #4A4A68;
  font-style: italic;
  font-weight: 500;
`;

interface MenuCategoriesProps {
  categories: any[];
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
  mobile?: boolean;
}

const MenuCategories: React.FC<MenuCategoriesProps> = ({ 
  categories, 
  selectedCategory, 
  onCategorySelect,
  mobile = false 
}) => {
  const { t, language } = useLanguage();
  const { shouldShowFocusRing, isReducedMotion, announce } = useAccessibility();
  const containerRef = useRef<HTMLDivElement>(null);

  const allCategory = {
    id: 'all',
    name: t('menu.allCategories'),
    icon: '📋',
    items: categories.reduce((acc, cat) => acc + cat.items.length, 0)
  };

  const categoryList = [allCategory, ...categories];

  // Set up keyboard navigation
  const {
    activeIndex,
    focusElement,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast
  } = useKeyboardNavigation({
    containerRef,
    horizontal: mobile,
    vertical: !mobile,
    wrap: true,
    onEnter: (index) => {
      const category = categoryList[index];
      if (category) {
        onCategorySelect(category.id);
        announce(`Selected category: ${typeof category.name === 'string' ? category.name : category.name[language] || category.name['de']}`, 'polite');
      }
    },
    onSpace: (index) => {
      const category = categoryList[index];
      if (category) {
        onCategorySelect(category.id);
        announce(`Selected category: ${typeof category.name === 'string' ? category.name : category.name[language] || category.name['de']}`, 'polite');
      }
    },
    customFocusableSelector: 'button[role="tab"]'
  });

  // Handle category selection with announcement
  const handleCategorySelect = (categoryId: string) => {
    const category = categoryList.find(cat => cat.id === categoryId);
    if (category) {
      onCategorySelect(categoryId);
      const categoryName = typeof category.name === 'string' ? category.name : category.name[language] || category.name['de'];
      announce(`Showing ${categoryName} category`, 'polite');
    }
  };

  return (
    <CategoriesContainer 
      ref={containerRef}
      mobile={mobile}
      role="tablist"
      aria-label={t('menu.categories') || 'Menu categories'}
    >
      <ScreenReaderText>
        Use arrow keys to navigate between categories, Enter or Space to select
      </ScreenReaderText>
      
      {categoryList.map((category, index) => {
        const categoryName = typeof category.name === 'string' 
          ? category.name 
          : category.name[language] || category.name['de'];
        
        const itemCount = category.id === 'all' 
          ? category.items 
          : category.items?.length || 0;

        const isSelected = selectedCategory === category.id;

        return (
          <CategoryCard
            key={category.id}
            $active={isSelected}
            mobile={mobile}
            shouldShowFocusRing={shouldShowFocusRing}
            reducedMotion={isReducedMotion}
            onClick={() => handleCategorySelect(category.id)}
            role="tab"
            tabIndex={isSelected ? 0 : -1}
            aria-selected={isSelected}
            aria-controls={`tabpanel-${category.id}`}
            aria-label={`${categoryName} category, ${itemCount} items${isSelected ? ', selected' : ''}`}
            initial={{ opacity: 0, x: mobile ? 0 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              duration: isReducedMotion ? 0 : 0.5, 
              delay: isReducedMotion ? 0 : index * 0.05 
            }}
            whileTap={{ scale: isReducedMotion ? 1 : 0.95 }}
          >
            <CategoryIcon aria-hidden="true">{category.icon}</CategoryIcon>
            <CategoryInfo>
              <CategoryName>{categoryName}</CategoryName>
              {!mobile && (
                <ItemCount aria-hidden="true">{itemCount} Items</ItemCount>
              )}
            </CategoryInfo>
            
            {/* Screen reader only status indicator */}
            <ScreenReaderText>
              {isSelected ? 'Currently selected' : ''}
            </ScreenReaderText>
          </CategoryCard>
        );
      })}
    </CategoriesContainer>
  );
};

export default MenuCategories;