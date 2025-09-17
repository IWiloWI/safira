/**
 * Category Navigation Component
 * Displays category navigation with main categories and subcategory tabs
 */

import React, { useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import SubcategoryTabs from './SubcategoryTabs';
import { Category, Language, MainCategory } from '../../types';
import { useResponsive } from '../../hooks/useResponsive';

// Styled components
const NavigationContainer = styled(motion.div)`
  width: 100%;
  position: relative;
  z-index: 50;
`;

const MainCategoriesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
  padding: 60px 20px;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  z-index: 100;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 40px 20px;
  }
`;

const MainCategoryCard = styled(motion.button)`
  position: relative;
  width: 100%;
  max-width: 400px;
  height: auto;
  border: none;
  cursor: pointer;
  transition: all 0.5s ease;
  background: transparent;
  margin: 0 auto;

  &:hover {
    transform: translateY(-12px) scale(1.05);
    
    img {
      box-shadow: 
        0 0 15px rgba(255, 65, 251, 1),
        0 0 30px rgba(255, 65, 251, 0.8),
        0 0 45px rgba(255, 65, 251, 0.6),
        0 0 60px rgba(255, 65, 251, 0.4);
    }
  }

  img {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 30px;
    border: none;
    box-shadow: 
      0 0 10px rgba(255, 20, 147, 0.8),
      0 0 20px rgba(255, 20, 147, 0.6),
      0 0 30px rgba(255, 20, 147, 0.4);
    transition: all 0.5s ease;
  }
`;

// Component interfaces
export interface CategoryNavigationProps {
  /** Main categories configuration */
  mainCategories: Record<string, MainCategory>;
  /** All available categories */
  categories: Category[];
  /** Currently selected main category */
  selectedMainCategory: string | null;
  /** Currently selected subcategory */
  selectedCategory: string;
  /** Main category change handler */
  onMainCategoryChange: (categoryId: string) => void;
  /** Subcategory change handler */
  onCategoryChange: (categoryId: string) => void;
  /** Current language */
  language: Language;
  /** Function to get category IDs for main category */
  getCategoryIdsForMainCategory: (mainCategoryKey: string) => string[];
  /** Whether to show main categories */
  showMainCategories?: boolean;
  /** Whether to show subcategory tabs */
  showSubcategories?: boolean;
  /** CSS class name */
  className?: string;
  /** Test ID */
  testId?: string;
}

/**
 * Category Navigation Component
 * Handles both main category selection and subcategory navigation
 */
export const CategoryNavigation: React.FC<CategoryNavigationProps> = React.memo(({
  mainCategories,
  categories,
  selectedMainCategory,
  selectedCategory,
  onMainCategoryChange,
  onCategoryChange,
  language,
  getCategoryIdsForMainCategory,
  showMainCategories = true,
  showSubcategories = true,
  className,
  testId = 'category-navigation'
}) => {
  // Unused responsive hook - keeping for potential future use
  // const { isBelow } = useResponsive();
  // const isMobile = isBelow('md');

  /**
   * Get current subcategories for selected main category
   */
  const currentSubcategories = useMemo(() => {
    if (!selectedMainCategory) return [];
    
    const subcategoryIds = getCategoryIdsForMainCategory(selectedMainCategory);
    return categories.filter(cat => subcategoryIds.includes(cat.id));
  }, [selectedMainCategory, categories, getCategoryIdsForMainCategory]);

  /**
   * Render main categories
   */
  const renderMainCategories = () => {
    if (!showMainCategories || selectedMainCategory) return null;
    
    return (
      <MainCategoriesContainer>
        {Object.entries(mainCategories).map(([key, config], index) => {
          const categoryName = typeof config.name === 'string' 
            ? config.name 
            : config.name[language] || config.name.de;
            
          return (
            <MainCategoryCard
              key={key}
              onClick={() => onMainCategoryChange(key)}
              whileHover={{ scale: 1.05, y: -12 }}
              whileTap={{ scale: 0.95 }}
              aria-label={`Select ${categoryName}`}
            >
              <img 
                src={config.image} 
                alt={categoryName}
                loading={index < 2 ? 'eager' : 'lazy'}
              />
            </MainCategoryCard>
          );
        })}
      </MainCategoriesContainer>
    );
  };

  /**
   * Render subcategory navigation
   */
  const renderSubcategories = () => {
    if (!showSubcategories || !selectedMainCategory || currentSubcategories.length === 0) {
      return null;
    }
    
    return (
      <SubcategoryTabs
        categories={currentSubcategories}
        activeCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
        language={language}
        scrollable
        mainCategoryId={selectedMainCategory}
      />
    );
  };

  return (
    <NavigationContainer
      className={className}
      data-testid={testId}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {renderMainCategories()}
      {renderSubcategories()}
    </NavigationContainer>
  );
});

/**
 * Default export
 */
export default CategoryNavigation;