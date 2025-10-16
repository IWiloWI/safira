/**
 * Category Navigation Component
 * Displays category navigation with main categories and subcategory tabs
 */

import React, { useMemo, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import SubcategoryTabs from './SubcategoryTabs';
import { Category, Language, MainCategory } from '../../types';
import { useResponsive } from '../../hooks/useResponsive';
import { generateSrcSet, getImageSizes } from '../../utils/imageUtils';

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
  width: 90vw;
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  z-index: 100;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 40px 20px;
    width: 90vw;
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

  @media (max-width: 768px) {
    max-width: 280px;
  }

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

    @media (max-width: 768px) {
      box-shadow:
        0 0 5px rgba(255, 20, 147, 0.5),
        0 0 10px rgba(255, 20, 147, 0.3),
        0 0 15px rgba(255, 20, 147, 0.2);
    }
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
  // Track the last main category to detect changes
  const lastMainCategoryRef = useRef<string | null>(null);

  // Unused responsive hook - keeping for potential future use
  // const { isBelow } = useResponsive();
  // const isMobile = isBelow('md');

  /**
   * Get current subcategories for selected main category
   */
  const currentSubcategories = useMemo(() => {
    if (!selectedMainCategory) return [];

    // First, try to find the main category and use its subcategories array
    const mainCategory = categories.find(cat => cat.id === selectedMainCategory && cat.isMainCategory === true);

    if (mainCategory && mainCategory.subcategories && mainCategory.subcategories.length > 0) {
      // Use the subcategories array from the main category
      console.log('[CategoryNavigation] Found subcategories in main category:', mainCategory.subcategories);
      const subcategories = mainCategory.subcategories.map(subcat => ({
        ...subcat,
        // Ensure we have proper structure for SubcategoryTabs
        id: `subcat_${subcat.id}`, // Map to subcat_4, subcat_5 format that SubcategoryTabs expects
        isMainCategory: false,
        parentPage: selectedMainCategory,
        items: subcat.items || []
      }));

      // Return subcategories without "Alle" tab
      return subcategories;
    }

    // Fallback: use the old method for backwards compatibility
    const subcategoryIds = getCategoryIdsForMainCategory(selectedMainCategory);
    console.log('[CategoryNavigation] Fallback: using subcategory IDs:', subcategoryIds);
    return categories.filter(cat => subcategoryIds.includes(cat.id));
  }, [selectedMainCategory, categories, getCategoryIdsForMainCategory]);

  /**
   * Auto-select first subcategory when main category changes (but not on subcategory changes)
   */
  useEffect(() => {
    // Only auto-select if the main category actually changed
    if (selectedMainCategory && selectedMainCategory !== lastMainCategoryRef.current) {
      lastMainCategoryRef.current = selectedMainCategory;

      if (currentSubcategories.length > 0) {
        const firstSubcategory = currentSubcategories[0];
        if (firstSubcategory) {
          console.log('[CategoryNavigation] Main category changed, auto-selecting first subcategory:', firstSubcategory.id);
          onCategoryChange(firstSubcategory.id);
        }
      }
    } else if (!selectedMainCategory) {
      // Reset the ref when no main category is selected
      lastMainCategoryRef.current = null;
    }
  }, [selectedMainCategory, currentSubcategories, onCategoryChange]);

  /**
   * Render main categories
   */
  const renderMainCategories = () => {
    if (!showMainCategories || selectedMainCategory) return null;

    // Sort main categories by sortOrder before rendering
    const sortedCategories = Object.entries(mainCategories)
      .sort(([, a], [, b]) => (a.sortOrder || 999) - (b.sortOrder || 999));

    return (
      <MainCategoriesContainer>
        {sortedCategories.map(([key, config], index) => {
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
                srcSet={generateSrcSet(config.image)}
                sizes="(max-width: 768px) 90vw, 45vw"
                alt={categoryName}
                width="600"
                height="600"
                loading={index < 2 ? 'eager' : 'lazy'}
                fetchPriority={index < 2 ? 'high' : 'auto'}
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
        mainCategoryId={selectedMainCategory}
        filterMode={true}
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