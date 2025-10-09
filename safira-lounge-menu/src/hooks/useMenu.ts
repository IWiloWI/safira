/**
 * Custom hook for menu data management and filtering
 * Handles menu data loading, filtering, and state management
 */

import { useState, useEffect, useMemo } from 'react';
import { useAutoRefresh } from './useAutoRefresh';
import { getProducts, ProductData } from '../services/api';
import { Product, Category, Language } from '../types';
import productsData from '../data/products.json';

export interface UseMenuOptions {
  /** Current language for filtering and display */
  language: Language;
  /** Initial category to load */
  initialCategory?: string;
  /** Auto-refresh enabled */
  autoRefresh?: boolean;
}

export interface UseMenuReturn {
  /** All products data */
  products: Product[];
  /** All categories data */
  categories: Category[];
  /** Filtered products based on current filters */
  filteredProducts: Product[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: string | null;
  /** Refresh notification message */
  refreshNotification: string | null;
  /** API products data */
  apiProducts: ProductData | null;
  /** Reload products from API */
  reloadProducts: () => Promise<void>;
  /** Clear refresh notification */
  clearRefreshNotification: () => void;
}

/**
 * Hook for managing menu data and filtering
 */
export function useMenu(options: UseMenuOptions): UseMenuReturn {
  const { language, initialCategory, autoRefresh = true } = options;
  
  const [apiProducts, setApiProducts] = useState<ProductData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshNotification, setRefreshNotification] = useState<string | null>(null);

  /**
   * Load products from API
   */
  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Loading products from API...');
      const data = await getProducts();
      setApiProducts(data);
      if (data && data.categories) {
        console.log('Products loaded from API:', data.categories.length, 'categories');
      } else {
        console.log('Products loaded from API, but no categories found');
      }
    } catch (error) {
      console.error('Failed to load products from API, falling back to JSON:', error);
      setApiProducts(null);
      setError('Failed to load latest menu data');
    } finally {
      setIsLoading(false);
    }
  };

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Auto-refresh setup - DISABLED (using useAdminChangeDetection instead)
  // This SSE-based system is disabled in favor of the simpler polling-based
  // useAdminChangeDetection hook which is already active in MenuPageContainer
  useAutoRefresh({
    onUpdate: (event) => {
      console.log('🔄 Menu Auto-refresh triggered:', event.type);
      if (event.type.includes('product') || event.type.includes('bulk_price')) {
        console.log('♻️ Reloading products due to:', (event.message || event.type));

        setRefreshNotification(event.data?.message || 'Menu updated');
        setTimeout(() => setRefreshNotification(null), 3000);

        loadProducts();
      }
    },
    onConnect: () => {
      console.log('✅ Auto-refresh for menu connected');
    },
    onDisconnect: () => {
      console.log('❌ Auto-refresh for menu disconnected');
    },
    enabled: false // Disabled - using useAdminChangeDetection polling instead
  });

  /**
   * Get all products from current data source
   */
  const products = useMemo(() => {
    const dataSource = apiProducts || productsData;
    const categories = (dataSource as any).categories || [];
    
    return categories.reduce((allProducts: Product[], category: Category) => {
      // Ensure category.items exists and is an array before filtering
      const items = category.items || [];
      const categoryProducts = items
        .filter((item: Product) => item.available !== false)
        .map((item: Product) => ({
          ...item,
          categoryId: category.id
        }));
      
      return [...allProducts, ...categoryProducts];
    }, []);
  }, [apiProducts]);

  /**
   * Get all categories from current data source
   */
  const categories = useMemo(() => {
    const dataSource = apiProducts || productsData;
    return (dataSource as any).categories || [];
  }, [apiProducts]);

  /**
   * Get filtered products (can be extended with more filters)
   */
  const filteredProducts = useMemo(() => {
    // Basic implementation - can be extended with search, category filters, etc.
    return products;
  }, [products]);

  /**
   * Clear refresh notification
   */
  const clearRefreshNotification = () => {
    setRefreshNotification(null);
  };

  return {
    products,
    categories,
    filteredProducts,
    isLoading,
    error,
    refreshNotification,
    apiProducts,
    reloadProducts: loadProducts,
    clearRefreshNotification
  };
}

/**
 * Default export for convenience
 */
export default useMenu;