/**
 * Custom hook for menu navigation logic
 * Handles navigation between categories, back navigation, and URL management
 */

import { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Category, MainCategory, FlexibleText } from '../types';

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
  getCurrentCategory: () => { name: FlexibleText; description: string | null } | null;
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
  const [isNavigating, setIsNavigating] = useState(false); // FIX: Navigation lock

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
   * FIX: Use navigation lock to prevent URL effect interference
   */
  const handleBack = useCallback(() => {
    const timestamp = Date.now();
    console.log(`[${timestamp}] [handleBack] ========== BACK BUTTON CLICKED ==========`);
    console.log(`[${timestamp}] [handleBack] Current URL:`, window.location.pathname);
    console.log(`[${timestamp}] [handleBack] Current state:`, { selectedMainCategory, selectedCategory });

    // If we're already on /menu, do nothing
    if (window.location.pathname === '/menu') {
      console.log(`[${timestamp}] [handleBack] Already on main menu, ignoring`);
      return;
    }

    // Prevent duplicate navigation
    if (isNavigating) {
      console.log(`[${timestamp}] [handleBack] Navigation already in progress, ignoring`);
      return;
    }

    // FIX: Set navigation lock FIRST - this prevents URL effect from interfering
    console.log(`[${timestamp}] [handleBack] 🔒 Setting navigation lock`);
    setIsNavigating(true);

    // Reset state
    console.log(`[${timestamp}] [handleBack] Resetting state to null/'all'`);
    setSelectedMainCategory(null);
    setSelectedCategory('all');

    // Navigate with lock active - use longer delay to ensure state propagates
    console.log(`[${timestamp}] [handleBack] Navigating to /menu (lock active)`);
    navigate('/menu', { replace: true });

    // Clear lock after React has time to re-render (200ms for safety)
    setTimeout(() => {
      console.log(`[${timestamp}] [handleBack] 🔓 Clearing navigation lock`);
      setIsNavigating(false);
    }, 200);
  }, [navigate, selectedMainCategory, selectedCategory, isNavigating]);

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
        // Return the full multilingual object or string as-is for MenuHeader compatibility
        return {
          name: specificCat.name, // Keep the original multilingual structure
          description: null
        };
      }
    }

    // Otherwise show main category
    return {
      name: mainCat.name, // Keep the original multilingual structure
      description: null
    };
  }, [selectedMainCategory, selectedCategory, mainCategories, categories]);

  /**
   * Get categories for current main category
   */
  const getCurrentCategories = useCallback(() => {
    if (!selectedMainCategory) return [];

    // Find the main category using selectedMainCategory (now contains actual API ID)
    const mainCategory = categories.find((cat: Category) => cat.id === selectedMainCategory && cat.isMainCategory === true);
    if (!mainCategory) {
      console.warn('[getCurrentCategories] Could not find main category for ID:', selectedMainCategory);
      return [];
    }

    // Return subcategories if available
    return (mainCategory as any).subcategories || [];
  }, [selectedMainCategory, categories]);

  // URL effect to sync with navigation - FIX: Use useLayoutEffect for better timing
  useLayoutEffect(() => {
    const timestamp = Date.now();
    console.log(`[${timestamp}] [URL Effect] ========== URL EFFECT RUNNING ==========`);
    console.log(`[${timestamp}] [URL Effect] isNavigating:`, isNavigating);
    console.log(`[${timestamp}] [URL Effect] category param from URL:`, category);
    console.log(`[${timestamp}] [URL Effect] Current state:`, { selectedMainCategory, selectedCategory });

    // FIX: Don't skip during navigation - we NEED to sync state immediately
    // The lock just prevents duplicate navigation, not state sync

    const drinkCategories = getCategoryIdsForMainCategory('drinks');
    const shishaCategories = getCategoryIdsForMainCategory('shisha');

    // Map numeric category IDs to English main category names for clean URLs
    const categoryIdMapping: { [key: string]: string } = {
      '1': 'shisha',      // Shisha category
      '2': 'beverages',   // Getränke/Beverages category
      '3': 'snacks'       // Snacks category
    };

    // Check if category is a numeric ID that should be mapped to an English name
    let mappedCategory = category;
    if (category && categoryIdMapping[category]) {
      mappedCategory = categoryIdMapping[category];
      console.log(`[${timestamp}] [URL Effect] Mapping category ID`, category, 'to', mappedCategory);
      // Redirect to the English name URL for clean URLs - but not if already navigating
      if (!isNavigating) {
        navigate(`/menu/${mappedCategory}`, { replace: true });
      }
      return;
    }

    console.log(`[${timestamp}] [URL Effect] Processed category:`, mappedCategory);

    // Use mapped category for further processing
    const processedCategory = mappedCategory;

    // FIX: Simplified logic - if no category in URL, reset state to match
    if (!processedCategory) {
      console.log(`[${timestamp}] [URL Effect] No category in URL (/menu)`);

      // If URL is /menu, state should always match (both null/'all')
      if (selectedMainCategory !== null || selectedCategory !== 'all') {
        console.log(`[${timestamp}] [URL Effect] State mismatch - resetting to null/'all'`);
        setSelectedMainCategory(null);
        setSelectedCategory('all');
      } else {
        console.log(`[${timestamp}] [URL Effect] ✅ State correct - on main menu`);
      }
      return;
    }

    // Skip if we're already in the correct state (but allow main category switches)
    if (processedCategory === selectedCategory) {
      const correctMainCategory =
        (processedCategory === 'drinks' && selectedMainCategory === 'drinks') ||
        (processedCategory === 'beverages' && selectedMainCategory === 'beverages') ||
        (processedCategory === 'shisha' && selectedMainCategory === 'shisha') ||
        (processedCategory === 'snacks' && selectedMainCategory === 'snacks') ||
        (drinkCategories.includes(processedCategory) && selectedMainCategory === 'drinks') ||
        (shishaCategories.includes(processedCategory) && selectedMainCategory === 'shisha') ||
        (processedCategory === 'menus' && selectedMainCategory === 'menus');

      if (correctMainCategory) {
        console.log('[URL Effect] Already in correct state, skipping');
        return;
      }
    }
    
    if (processedCategory === 'menus') {
      // Menus main category - always reset properly
      setSelectedMainCategory('menus');
      setSelectedCategory('all');
      return;
    } else if (processedCategory === 'shisha') {
      // Shisha main category - use the actual ID from API data
      console.log('[URL Effect] Shisha main category selected');
      setSelectedMainCategory('1'); // Use actual API ID instead of 'shisha'
      setSelectedCategory('all');
      return;
    } else if (processedCategory === 'beverages') {
      // Beverages main category - use actual API ID
      console.log('[URL Effect] Beverages category selected');
      setSelectedMainCategory('2'); // Use actual API ID instead of 'beverages'
      setSelectedCategory('all');
      return;
    } else if (processedCategory === 'snacks') {
      // Snacks main category - use actual API ID
      console.log('[URL Effect] Snacks main category selected');
      setSelectedMainCategory('3'); // Use actual API ID instead of 'snacks'
      setSelectedCategory('all');
      return;
    } else if (processedCategory === 'drinks') {
      // "drinks" is a virtual category - always redirect to softdrinks (but not during navigation)
      console.log('[URL Effect] Virtual drinks category - redirecting to softdrinks');
      if (!isNavigating) {
        navigate('/menu/softdrinks', { replace: true });
      }
      return;
    } else if (processedCategory === 'cocktails' || processedCategory === 'mocktails') {
      // Redirect old URLs to combined category (but not during navigation)
      if (!isNavigating) {
        navigate('/menu/cocktails-mocktails', { replace: true });
      }
      return;
    } else if (processedCategory && drinkCategories.includes(processedCategory)) {
      // Drink subcategories - always set main category properly
      setSelectedMainCategory('drinks');
      setSelectedCategory(processedCategory === 'cocktails-mocktails' ? 'cocktails-mocktails' : processedCategory);
    } else if (processedCategory && shishaCategories.includes(processedCategory)) {
      // Shisha subcategories - always set main category properly
      setSelectedMainCategory('shisha');
      setSelectedCategory(processedCategory);
    } else if (processedCategory && mainCategories[processedCategory]) {
      // Direct main category access
      setSelectedMainCategory(processedCategory);
      setSelectedCategory('all');
    } else {
      // Check if it's a standalone category that should be treated as a main category
      const categoryExists = categories.find((cat: Category) => cat.id === processedCategory);
      if (categoryExists) {
        console.log('[URL Effect] Found standalone category:', processedCategory, '- treating as main category');
        setSelectedMainCategory(processedCategory);
        setSelectedCategory('all');
      } else {
        // Unknown category - reset to main menu
        console.warn('[URL Effect] Unknown category:', processedCategory, '- resetting to main menu');
        setSelectedMainCategory(null);
        setSelectedCategory('all');
      }
    }
  }, [category, selectedCategory, selectedMainCategory, navigate, getCategoryIdsForMainCategory, mainCategories, categories, isNavigating]);

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