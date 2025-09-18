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
    console.log('[handleMainCategoryChange] Called with:', mainCategoryId, 'from current state:', selectedMainCategory, selectedCategory);

    if (mainCategoryId === 'menus' || mainCategoryId === 'safira-menus') {
      console.log('[handleMainCategoryChange] Navigating to menus');
      navigate('/menu/safira-menus');
    } else if (mainCategoryId === 'drinks') {
      console.log('[handleMainCategoryChange] Drinks category clicked - redirecting to softdrinks');
      // "drinks" is not a real category - redirect to the first drink subcategory
      navigate('/menu/softdrinks');
    } else if (mainCategoryId === 'softdrinks') {
      console.log('[handleMainCategoryChange] Softdrinks category clicked - navigating directly');
      // Direct navigation to softdrinks category
      navigate('/menu/softdrinks');
    } else if (mainCategoryId === 'shisha' || mainCategoryId === 'shisha-standard') {
      console.log('[handleMainCategoryChange] Shisha category clicked - navigating directly');
      navigate('/menu/shisha-standard');
    } else if (mainCategoryId === 'cocktails') {
      console.log('[handleMainCategoryChange] Cocktails category clicked - navigating directly');
      navigate('/menu/cocktails');
    } else if (mainCategoryId === 'snacks') {
      console.log('[handleMainCategoryChange] Snacks category clicked - navigating directly');
      navigate('/menu/snacks');
    } else {
      console.log('[handleMainCategoryChange] Switching to main category:', mainCategoryId);
      setSelectedMainCategory(mainCategoryId);
      setSelectedCategory('all');
      navigate(`/menu/${mainCategoryId}`);
    }
  }, [navigate, selectedCategory, selectedMainCategory]);

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

    console.log('[URL Effect] category param:', category, 'current selectedCategory:', selectedCategory, 'current selectedMainCategory:', selectedMainCategory);

    // Only update if URL category is different from current state
    if (!category) {
      // No category in URL - reset to main menu
      if (selectedMainCategory !== null || selectedCategory !== 'all') {
        setSelectedMainCategory(null);
        setSelectedCategory('all');
      }
      return;
    }

    // Skip if we're already in the correct state (but allow main category switches)
    if (category === selectedCategory) {
      const correctMainCategory =
        (category === 'drinks' && selectedMainCategory === 'drinks') ||
        (drinkCategories.includes(category) && selectedMainCategory === 'drinks') ||
        (shishaCategories.includes(category) && selectedMainCategory === 'shisha') ||
        (category === 'menus' && selectedMainCategory === 'menus');

      if (correctMainCategory) {
        console.log('[URL Effect] Already in correct state, skipping');
        return;
      }
    }
    
    if (category === 'menus') {
      // Menus main category - always reset properly
      setSelectedMainCategory('menus');
      setSelectedCategory('all');
      return;
    } else if (category === 'drinks') {
      // "drinks" is a virtual category - always redirect to softdrinks
      console.log('[URL Effect] Virtual drinks category - redirecting to softdrinks');
      navigate('/menu/softdrinks', { replace: true });
      return;
    } else if (category === 'cocktails' || category === 'mocktails') {
      // Redirect old URLs to combined category
      navigate('/menu/cocktails-mocktails', { replace: true });
      return;
    } else if (category && drinkCategories.includes(category)) {
      // Drink subcategories - always set main category properly
      setSelectedMainCategory('drinks');
      setSelectedCategory(category === 'cocktails-mocktails' ? 'cocktails-mocktails' : category);
    } else if (category && shishaCategories.includes(category)) {
      // Shisha subcategories - always set main category properly
      setSelectedMainCategory('shisha');
      setSelectedCategory(category);
    } else if (category && mainCategories[category]) {
      // Direct main category access
      setSelectedMainCategory(category);
      setSelectedCategory('all');
    } else {
      // Check if it's a standalone category that should be treated as a main category
      const categoryExists = categories.find((cat: Category) => cat.id === category);
      if (categoryExists) {
        console.log('[URL Effect] Found standalone category:', category, '- treating as main category');
        setSelectedMainCategory(category);
        setSelectedCategory('all');
      } else {
        // Unknown category - reset to main menu
        console.warn('[URL Effect] Unknown category:', category, '- resetting to main menu');
        setSelectedMainCategory(null);
        setSelectedCategory('all');
      }
    }
  }, [category, selectedCategory, selectedMainCategory, navigate, getCategoryIdsForMainCategory, mainCategories]);

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