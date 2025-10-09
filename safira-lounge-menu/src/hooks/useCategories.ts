/**
 * Custom hook for category management
 * Handles category operations and state management
 */

import { useState, useEffect, useCallback } from 'react';
import { Category, CategoryCreateData, CategoryUpdateData } from '../types/product.types';
import { FlexibleText } from '../types/common.types';
import { getProducts } from '../services/api';
import productsData from '../data/products.json';

interface UseCategoriesReturn {
  categories: Category[];
  subcategories: Category[];
  mainCategories: Category[];
  isLoading: boolean;
  error: string | null;
  loadCategories: () => Promise<void>;
  getCategoryName: (nameObj: FlexibleText, language?: string) => string;
  getCategoryById: (id: string) => Category | undefined;
  getProductCountByCategory: (categoryId: string) => number;
}

export const useCategories = (language: string = 'de'): UseCategoriesReturn => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [mainCategories, setMainCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load categories from API with fallback to local data
   */
  const loadCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load from PHP API instead of Node.js
      const API_URL = process.env.REACT_APP_API_URL || 'https://test.safira-lounge.de/safira-api-fixed.php';
      const response = await fetch(`${API_URL}?action=products`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        const allCategories = data.categories || [];

        // Debug logging
        console.log('API Response from /api/products:', data);
        console.log('All categories:', allCategories);

        // Extract main categories and flatten subcategories
        const mainCats: any[] = [];
        const subCats: any[] = [];

        allCategories.forEach((cat: any) => {
          if (cat.isMainCategory === true) {
            // This is a main category
            mainCats.push(cat);

            // If it has nested subcategories, flatten them
            if (cat.subcategories && Array.isArray(cat.subcategories)) {
              cat.subcategories.forEach((subcat: any) => {
                subCats.push({
                  ...subcat,
                  isMainCategory: false,
                  parentPage: cat.id
                });
              });
            }
          } else if (cat.isMainCategory === false) {
            // This is already a flat subcategory
            subCats.push(cat);
          }
        });

        console.log('Main categories:', mainCats.map((cat: any) => ({ id: cat.id, name: cat.name })));
        console.log('Subcategories:', subCats.map((cat: any) => ({ id: cat.id, name: cat.name, parentPage: cat.parentPage })));

        // Nest subcategories under their parent categories for ProductForm
        const nestedCategories = mainCats.map((mainCat: any) => {
          const childCategories = subCats.filter((subCat: any) =>
            subCat.parentPage === mainCat.id || subCat.parentPage === String(mainCat.id)
          );

          return {
            ...mainCat,
            subcategories: childCategories.length > 0 ? childCategories : undefined
          };
        });

        console.log('Nested categories structure:', nestedCategories);

        setCategories(nestedCategories);
        setMainCategories(mainCats);
        setSubcategories(subCats);
      } else {
        throw new Error(`API call failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      console.log('Falling back to local data');
      setError('Failed to load categories from API');
      
      // Fallback to local data
      const fallbackCategories = productsData.categories as Category[];
      setCategories(fallbackCategories);
      
      // Filter fallback data too
      const mainCats = fallbackCategories.filter(cat => cat.isMainCategory === true);
      const subCats = fallbackCategories.filter(cat => cat.isMainCategory !== true);
      
      setMainCategories(mainCats);
      setSubcategories(subCats);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get category name based on language
   */
  const getCategoryName = useCallback((nameObj: FlexibleText, lang: string = language) => {
    if (typeof nameObj === 'string') return nameObj;
    return nameObj[lang as keyof typeof nameObj] || nameObj['de'] || Object.values(nameObj)[0] || 'Unknown Category';
  }, [language]);

  /**
   * Get category by ID
   */
  const getCategoryById = useCallback((id: string) => {
    return categories.find(cat => cat.id === id);
  }, [categories]);

  /**
   * Get product count for a category
   */
  const getProductCountByCategory = useCallback((categoryId: string) => {
    const category = getCategoryById(categoryId);
    return category?.items?.length || 0;
  }, [getCategoryById]);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Listen for category updates from other components
  useEffect(() => {
    const handleCategoriesUpdated = () => {
      loadCategories();
    };

    window.addEventListener('categoriesUpdated', handleCategoriesUpdated);
    
    return () => {
      window.removeEventListener('categoriesUpdated', handleCategoriesUpdated);
    };
  }, [loadCategories]);

  return {
    categories,
    subcategories,
    mainCategories,
    isLoading,
    error,
    loadCategories,
    getCategoryName,
    getCategoryById,
    getProductCountByCategory
  };
};
