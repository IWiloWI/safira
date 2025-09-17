/**
 * Custom hook for menu navigation logic
 * Handles navigation between categories, back navigation, and URL management
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Category, MainCategory } from '../types';

export interface UseMenuNavigationOptions {
  /** Main categories configuration */
  mainCategories: Record<string, MainCategory>;
  /** All available categories */
  categories: Category[];
  /** Function to get category IDs for a main category */
  getCategoryIdsForMainCategory: (mainCategoryKey: string) => string[];
}

export interface UseMenuNavigationReturn {
  /** Current main category */
  selectedMainCategory: string | null;
  /** Current selected category */
  selectedCategory: string;
  /** Category from URL params */
  category: string | undefined;
  /** Navigate to main category */
  handleMainCategoryChange: (mainCategoryId: string) => void;
  /** Navigate to category */
  handleCategoryChange: (categoryId: string) => void;
  /** Handle back navigation */
  handleBack: () => void;
  /** Reset to main menu */
  resetToMainMenu: () => void;
  /** Get current category info */
  getCurrentCategory: () => { name: string; description: string | null } | null;
  /** Get categories for current main category */
  getCurrentCategories: () => Category[];
}

/**
 * Hook for managing menu navigation
 */
export function useMenuNavigation(options: UseMenuNavigationOptions): UseMenuNavigationReturn {
  const { mainCategories, categories, getCategoryIdsForMainCategory } = options;
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();

  const [selectedMainCategory, setSelectedMainCategory] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  /**
   * Handle main category navigation
   */
  const handleMainCategoryChange = useCallback((mainCategoryId: string) => {
    if (mainCategoryId === 'menus') {
      navigate('/menu/menus');
    } else if (mainCategoryId === 'drinks') {
      setSelectedMainCategory(mainCategoryId);
      const currentDrinkCategory = selectedCategory && selectedCategory !== 'all' ? selectedCategory : 'softdrinks';
      navigate(`/menu/${currentDrinkCategory}`);
    } else {
      setSelectedMainCategory(mainCategoryId);
      setSelectedCategory('all');
      navigate(`/menu/${mainCategoryId}`);
    }
  }, [navigate, selectedCategory]);

  /**
   * Handle category tab change
   */
  const handleCategoryChange = useCallback((categoryId: string) => {
    console.log('[useMenuNavigation] handleCategoryChange called - from:', selectedCategory, 'to:', categoryId);
    if (selectedCategory === categoryId) {
      console.log('[useMenuNavigation] Same category selected, ignoring');
      return;
    }
    
    console.log('[useMenuNavigation] Setting new category:', categoryId);
    setSelectedCategory(categoryId);
    
    // Use navigate instead of history.replaceState to properly update route
    console.log('[useMenuNavigation] Navigating to:', `/menu/${categoryId}`);
    navigate(`/menu/${categoryId}`, { replace: true });
  }, [selectedCategory, navigate]);

  /**
   * Handle back navigation
   */
  const handleBack = useCallback(() => {
    setSelectedMainCategory(null);
    navigate('/menu');
  }, [navigate]);

  /**
   * Reset to main menu
   */
  const resetToMainMenu = useCallback(() => {
    setSelectedMainCategory(null);
    setSelectedCategory('all');
    navigate('/menu');
  }, [navigate]);

  /**
   * Get current category information
   */
  const getCurrentCategory = useCallback(() => {
    if (!selectedMainCategory) return null;
    
    const mainCat = mainCategories[selectedMainCategory];
    if (!mainCat) return null;
    
    // If specific subcategory is selected, show its name
    if (selectedCategory && selectedCategory !== 'all') {
      const specificCat = categories.find((cat: Category) => cat.id === selectedCategory);
      
      if (specificCat) {
        const name = typeof specificCat.name === 'string' 
          ? specificCat.name 
          : specificCat.name.de || Object.values(specificCat.name)[0] || 'Unknown Category';
        return {
          name: name as string,
          description: null
        };
      }
    }
    
    // Otherwise show main category
    return {
      name: mainCat.name.de,
      description: null
    };
  }, [selectedMainCategory, selectedCategory, mainCategories, categories]);

  /**
   * Get categories for current main category
   */
  const getCurrentCategories = useCallback(() => {
    if (!selectedMainCategory) return [];
    const currentMainCategory = mainCategories[selectedMainCategory];
    if (!currentMainCategory) return [];
    
    return categories.filter((cat: Category) => 
      currentMainCategory.categoryIds.includes(cat.id)
    );
  }, [selectedMainCategory, mainCategories, categories]);

  // URL effect to sync with navigation
  useEffect(() => {
    const drinkCategories = getCategoryIdsForMainCategory('drinks');
    const shishaCategories = getCategoryIdsForMainCategory('shisha');
    
    console.log('[URL Effect] category param:', category, 'current selectedCategory:', selectedCategory);
    
    // Don't override if we're already on the correct category (prevents loops)
    if (category === selectedCategory) {
      console.log('[URL Effect] Already on correct category, skipping');
      return;
    }
    
    if (category === 'menus') {
      // Menus main category
      setSelectedMainCategory('menus');
      setSelectedCategory('all');
      return;
    } else if (category === 'drinks') {
      // Main drinks category - redirect to softdrinks on first load only
      if (!selectedCategory || selectedCategory === 'all') {
        navigate('/menu/softdrinks', { replace: true });
      } else {
        setSelectedMainCategory('drinks');
      }
      return;
    } else if (category === 'cocktails' || category === 'mocktails') {
      // Redirect old URLs to combined category
      navigate('/menu/cocktails-mocktails', { replace: true });
      return;
    } else if (category && drinkCategories.includes(category)) {
      // Drink subcategories
      setSelectedMainCategory('drinks');
      setSelectedCategory(category === 'cocktails-mocktails' ? 'cocktails-mocktails' : category);
    } else if (category && shishaCategories.includes(category)) {
      // Shisha subcategories
      setSelectedMainCategory('shisha');
      setSelectedCategory(category);
    } else if (category && mainCategories[category]) {
      setSelectedMainCategory(category);
      setSelectedCategory('all');
    }
  }, [category, selectedCategory, navigate, getCategoryIdsForMainCategory, mainCategories]);

  return {
    selectedMainCategory,
    selectedCategory,
    category,
    handleMainCategoryChange,
    handleCategoryChange,
    handleBack,
    resetToMainMenu,
    getCurrentCategory,
    getCurrentCategories
  };
}

/**
 * Default export for convenience
 */
export default useMenuNavigation;