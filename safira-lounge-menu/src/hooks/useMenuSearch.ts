/**
 * Custom hook for menu search and filtering functionality
 * Handles search queries, filtering, and product sorting
 */

import { useState, useMemo, useCallback } from 'react';
import { Product, Category, Language } from '../types';

export interface UseMenuSearchOptions {
  /** Products to search/filter */
  products: Product[];
  /** Current language for searching */
  language: Language;
  /** Current main category */
  selectedMainCategory: string | null;
  /** Current selected category */
  selectedCategory: string;
  /** Main categories configuration */
  mainCategories: Record<string, any>;
  /** All categories */
  categories: Category[];
  /** Initial search query */
  initialSearchQuery?: string;
}

export interface UseMenuSearchReturn {
  /** Current search query */
  searchQuery: string;
  /** Set search query */
  setSearchQuery: (query: string) => void;
  /** Filtered products based on search and category */
  filteredProducts: Product[];
  /** Clear search */
  clearSearch: () => void;
  /** Check if search is active */
  hasActiveSearch: boolean;
  /** Search results count */
  resultsCount: number;
}

/**
 * Hook for managing menu search and filtering
 */
export function useMenuSearch(options: UseMenuSearchOptions): UseMenuSearchReturn {
  const {
    products,
    language,
    selectedMainCategory,
    selectedCategory,
    mainCategories,
    categories,
    initialSearchQuery = ''
  } = options;

  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

  /**
   * Get filtered products based on category and search
   */
  const filteredProducts = useMemo(() => {
    if (!selectedMainCategory) {
      return [];
    }

    let filteredProducts: Product[] = [];
    const currentMainCategory = mainCategories[selectedMainCategory];
    
    if (!currentMainCategory) return [];

    // Filter by category
    if (selectedCategory === 'all') {
      // All categories in main category
      currentMainCategory.categoryIds.forEach((catId: string) => {
        const category = categories.find((cat: Category) => cat.id === catId);
        if (category && category.items) {
          const categoryProducts = category.items
            .filter((item: Product) => item.available !== false)
            .map((item: Product) => ({ 
              ...item, 
              categoryId: category.id
               
            }));
          filteredProducts = [...filteredProducts, ...categoryProducts];
        }
      });
    } else if (selectedCategory === 'cocktails-mocktails') {
      // Combined cocktails & mocktails
      ['cocktails', 'mocktails'].forEach((catId: string) => {
        const category = categories.find((cat: Category) => cat.id === catId);
        if (category && category.items) {
          const categoryProducts = category.items
            .filter((item: Product) => item.available !== false)
            .map((item: Product) => ({ 
              ...item, 
              categoryId: category.id
               
            }));
          filteredProducts = [...filteredProducts, ...categoryProducts];
        }
      });
    } else {
      // Specific category
      const category = categories.find((cat: Category) => cat.id === selectedCategory);
      if (category && currentMainCategory.categoryIds.includes(category.id)) {
        filteredProducts = category.items
          .filter((item: Product) => item.available !== false)
          .map((item: Product) => ({ 
            ...item, 
            categoryId: category.id
             
          }));
      }
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      filteredProducts = filteredProducts.filter(product => {
        const name = typeof product.name === 'string' 
          ? product.name 
          : product.name[language] || product.name['de'];
        
        const description = product.description
          ? (typeof product.description === 'string' 
            ? product.description 
            : product.description[language] || product.description['de'] || '')
          : '';
        
        return name.toLowerCase().includes(searchLower) || 
               description.toLowerCase().includes(searchLower);
      });
    }

    // Sort products for better UX
    if (selectedMainCategory === 'shisha') {
      // Sort tobacco products by brand
      filteredProducts = filteredProducts.sort((a, b) => {
        const brandA = a.brand || '';
        const brandB = b.brand || '';
        
        if (brandA && brandB) {
          return brandA.localeCompare(brandB);
        }
        
        if (brandA && !brandB) return -1;
        if (!brandA && brandB) return 1;
        
        const nameA = typeof a.name === 'string' ? a.name : a.name[language] || a.name['de'];
        const nameB = typeof b.name === 'string' ? b.name : b.name[language] || b.name['de'];
        return nameA.localeCompare(nameB);
      });
    }

    return filteredProducts;
  }, [selectedMainCategory, selectedCategory, searchQuery, language, mainCategories, categories]);

  /**
   * Clear search query
   */
  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  /**
   * Check if search is active
   */
  const hasActiveSearch = searchQuery.trim().length > 0;

  /**
   * Get results count
   */
  const resultsCount = filteredProducts.length;

  return {
    searchQuery,
    setSearchQuery,
    filteredProducts,
    clearSearch,
    hasActiveSearch,
    resultsCount
  };
}

/**
 * Default export for convenience
 */
export default useMenuSearch;