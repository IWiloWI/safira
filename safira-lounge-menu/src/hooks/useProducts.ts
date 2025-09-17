/**
 * Custom hook for product CRUD operations
 * Manages product state, API calls, and business logic
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  Product, 
  ProductCreateData, 
  ProductUpdateData,
  BulkPriceUpdateResult,
  ProductFilters,
  ProductSortOptions
} from '../types/product.types';
import { LoadingState } from '../types/common.types';
import { 
  getProducts, 
  addProduct, 
  updateProduct, 
  deleteProduct, 
  bulkUpdateTobaccoPrice,
  trackEvent
} from '../services/api';
import productsData from '../data/products.json';

interface UseProductsReturn {
  // State
  products: Product[];
  filteredProducts: Product[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadProducts: () => Promise<void>;
  createProduct: (categoryId: string, productData: ProductCreateData) => Promise<void>;
  updateProductData: (categoryId: string, productId: string, updates: ProductUpdateData) => Promise<void>;
  removeProduct: (categoryId: string, productId: string) => Promise<void>;
  toggleAvailability: (product: Product) => Promise<void>;
  toggleBadge: (product: Product, badgeType: 'neu' | 'kurze_zeit' | 'beliebt') => Promise<void>;
  bulkUpdatePrices: (categoryId: string, newPrice: number) => Promise<BulkPriceUpdateResult>;
  filterProducts: (filters: ProductFilters) => void;
  sortProducts: (options: ProductSortOptions) => void;
  searchProducts: (query: string) => void;
  
  // Utilities
  getProductName: (nameObj: any, language?: string) => string;
  getProductDescription: (descObj: any, language?: string) => string;
  renderPrice: (product: Product) => string;
}

export const useProducts = (language: string = 'de'): UseProductsReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<ProductFilters>({});
  const [currentSort, setCurrentSort] = useState<ProductSortOptions | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Load products from API with fallback to local data
   */
  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await getProducts();
      
      // Transform API data to flat product list WITH category assignment from the data structure
      const allProducts = data.categories.flatMap(cat =>
        cat.items.map(item => ({
          ...item,
          // Preserve categoryId if it exists in the item, otherwise use the parent category id
          categoryId: (item as any).categoryId || cat.id,
          categoryName: cat.name
        }))
      );
      
      setProducts(allProducts as Product[]);
      setFilteredProducts(allProducts as Product[]);
    } catch (error) {
      console.error('Failed to load products:', error);
      setError('Failed to load products from API');
      
      // Fallback to local data WITH category assignment from the data structure
      const allProducts = productsData.categories.flatMap(cat =>
        cat.items.map(item => ({
          ...item,
          // Preserve categoryId if it exists in the item, otherwise use the parent category id
          categoryId: (item as any).categoryId || cat.id,
          categoryName: cat.name
        }))
      );
      setProducts(allProducts as Product[]);
      setFilteredProducts(allProducts as Product[]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create a new product
   */
  const createProduct = useCallback(async (categoryId: string, productData: ProductCreateData) => {
    try {
      setIsLoading(true);
      const newProduct = await addProduct(categoryId, productData);
      
      // Track the activity
      try {
        await trackEvent('product_created', {
          productId: newProduct?.id || 'unknown',
          productName: productData.name,
          categoryId,
          description: `New product "${productData.name}" added`
        });
      } catch (trackingError) {
        console.log('Activity tracking failed:', trackingError);
      }
      
      await loadProducts(); // Reload to get fresh data
    } catch (error) {
      console.error('Failed to create product:', error);
      setError('Failed to create product');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [loadProducts]);

  /**
   * Update an existing product
   */
  const updateProductData = useCallback(async (categoryId: string, productId: string, updates: ProductUpdateData) => {
    try {
      setIsLoading(true);
      await updateProduct(categoryId, productId, updates);
      
      // Track the activity
      try {
        await trackEvent('product_updated', {
          productId,
          categoryId,
          description: `Product updated`
        });
      } catch (trackingError) {
        console.log('Activity tracking failed:', trackingError);
      }
      
      await loadProducts(); // Reload to get fresh data
    } catch (error) {
      console.error('Failed to update product:', error);
      setError('Failed to update product');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [loadProducts]);

  /**
   * Delete a product
   */
  const removeProduct = useCallback(async (categoryId: string, productId: string) => {
    try {
      setIsLoading(true);
      await deleteProduct(categoryId, productId);
      
      // Track the activity
      try {
        await trackEvent('product_deleted', {
          productId,
          categoryId,
          description: `Product deleted`
        });
      } catch (trackingError) {
        console.log('Activity tracking failed:', trackingError);
      }
      
      await loadProducts(); // Reload to get fresh data
    } catch (error) {
      console.error('Failed to delete product:', error);
      setError('Failed to delete product');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [loadProducts]);

  /**
   * Toggle product availability
   */
  const toggleAvailability = useCallback(async (product: Product) => {
    try {
      const newAvailability = !product.available;
      await updateProductData(product.categoryId!, product.id, { available: newAvailability });
      
      // Track specific availability change
      const productName = getProductName(product.name);
      try {
        await trackEvent('product_availability_changed', {
          productId: product.id,
          productName,
          categoryId: product.categoryId,
          available: newAvailability,
          description: `Product availability ${newAvailability ? 'enabled' : 'disabled'} for "${productName}"`
        });
      } catch (trackingError) {
        console.log('Activity tracking failed:', trackingError);
      }
    } catch (error) {
      console.error('Failed to toggle availability:', error);
      throw error;
    }
  }, [updateProductData]);

  /**
   * Toggle product badge
   */
  const toggleBadge = useCallback(async (product: Product, badgeType: 'neu' | 'kurze_zeit' | 'beliebt') => {
    try {
      const currentBadges = product.badges || { neu: false, kurze_zeit: false, beliebt: false };
      const updatedBadges = {
        ...currentBadges,
        [badgeType]: !currentBadges[badgeType]
      };
      
      await updateProductData(product.categoryId!, product.id, { badges: updatedBadges });
    } catch (error) {
      console.error('Failed to toggle badge:', error);
      throw error;
    }
  }, [updateProductData]);

  /**
   * Bulk update prices for tobacco products
   */
  const bulkUpdatePrices = useCallback(async (categoryId: string, newPrice: number): Promise<BulkPriceUpdateResult> => {
    try {
      setIsLoading(true);
      const result = await bulkUpdateTobaccoPrice(categoryId, newPrice);
      await loadProducts(); // Reload to get fresh data
      return result;
    } catch (error) {
      console.error('Failed to bulk update prices:', error);
      setError('Failed to update prices');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [loadProducts]);

  /**
   * Utility function to get product name based on language
   */
  const getProductName = useCallback((nameObj: any, lang: string = language) => {
    if (typeof nameObj === 'string') return nameObj;
    return nameObj[lang] || nameObj['de'] || nameObj;
  }, [language]);

  /**
   * Utility function to get product description based on language
   */
  const getProductDescription = useCallback((descObj: any, lang: string = language) => {
    if (!descObj) return '';
    if (typeof descObj === 'string') return descObj;
    return descObj[lang] || descObj['de'] || '';
  }, [language]);

  /**
   * Render product price considering sizes
   */
  const renderPrice = useCallback((product: Product) => {
    if (product.sizes && Array.isArray(product.sizes)) {
      return product.sizes.map(size => `${size.size}: ${size.price}€`).join(', ');
    }
    return product.price ? `${product.price}€` : 'N/A';
  }, []);

  /**
   * Apply filters to products
   */
  const filterProducts = useCallback((filters: ProductFilters) => {
    setCurrentFilters(filters);
    applyFiltersAndSort(filters, currentSort, searchQuery);
  }, [currentSort, searchQuery]);

  /**
   * Sort products
   */
  const sortProducts = useCallback((options: ProductSortOptions) => {
    setCurrentSort(options);
    applyFiltersAndSort(currentFilters, options, searchQuery);
  }, [currentFilters, searchQuery]);

  /**
   * Search products by query
   */
  const searchProducts = useCallback((query: string) => {
    setSearchQuery(query);
    applyFiltersAndSort(currentFilters, currentSort, query);
  }, [currentFilters, currentSort]);

  /**
   * Apply filters, sorting, and search
   */
  const applyFiltersAndSort = useCallback((filters: ProductFilters, sort: ProductSortOptions | null, query: string) => {
    let filtered = [...products];

    // Apply category filter
    if (filters.categoryId && filters.categoryId !== 'all') {
      if (filters.categoryId === 'unassigned') {
        // Show products with no categoryId (unassigned)
        filtered = filtered.filter(product => !product.categoryId);
      } else {
        // Show products assigned to specific category
        filtered = filtered.filter(product => product.categoryId === filters.categoryId);
      }
    }

    // Apply availability filter
    if (filters.available !== undefined) {
      filtered = filtered.filter(product => product.available === filters.available);
    }

    // Apply brand filter
    if (filters.brand) {
      filtered = filtered.filter(product => product.brand === filters.brand);
    }

    // Apply price range filter
    if (filters.priceRange) {
      filtered = filtered.filter(product => {
        const price = product.price || 0;
        return price >= filters.priceRange!.min && price <= filters.priceRange!.max;
      });
    }

    // Apply badges filter
    if (filters.badges) {
      filtered = filtered.filter(product => {
        if (!product.badges) return false;
        return Object.keys(filters.badges!).some(badge => 
          product.badges![badge as keyof typeof product.badges] === filters.badges![badge as keyof typeof filters.badges]
        );
      });
    }

    // Apply search query
    if (query) {
      filtered = filtered.filter(product => {
        const productName = getProductName(product.name);
        const productDesc = getProductDescription(product.description);
        const searchText = `${productName} ${productDesc}`.toLowerCase();
        return searchText.includes(query.toLowerCase());
      });
    }

    // Apply sorting
    if (sort) {
      filtered.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (sort.field) {
          case 'name':
            aValue = getProductName(a.name, sort.language).toLowerCase();
            bValue = getProductName(b.name, sort.language).toLowerCase();
            break;
          case 'price':
            aValue = a.price || 0;
            bValue = b.price || 0;
            break;
          case 'brand':
            aValue = a.brand || '';
            bValue = b.brand || '';
            break;
          case 'createdAt':
            aValue = new Date(a.createdAt || '').getTime();
            bValue = new Date(b.createdAt || '').getTime();
            break;
          case 'updatedAt':
            aValue = new Date(a.updatedAt || '').getTime();
            bValue = new Date(b.updatedAt || '').getTime();
            break;
          default:
            return 0;
        }
        
        if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredProducts(filtered);
  }, [products, getProductName, getProductDescription]);

  // Re-apply filters when products change
  useEffect(() => {
    applyFiltersAndSort(currentFilters, currentSort, searchQuery);
  }, [products, applyFiltersAndSort, currentFilters, currentSort, searchQuery]);

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    // State
    products,
    filteredProducts,
    isLoading,
    error,
    
    // Actions
    loadProducts,
    createProduct,
    updateProductData,
    removeProduct,
    toggleAvailability,
    toggleBadge,
    bulkUpdatePrices,
    filterProducts,
    sortProducts,
    searchProducts,
    
    // Utilities
    getProductName,
    getProductDescription,
    renderPrice
  };
};
