/**
 * Custom hook for product form state management
 * Handles form data, validation, and submission logic
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Product, ProductCreateData, ProductUpdateData, ProductSize } from '../types/product.types';
import { ProductBadges } from '../types/common.types';

interface MenuPackageItem {
  name: string;
  quantity: string;
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  available: boolean;
  badges: ProductBadges;
  brand?: string;
  sizes: ProductSize[];
  hasVariants: boolean;
  isTobacco: boolean; // NEW: Manual tobacco product flag
  isMenuPackage: boolean; // NEW: Manual menu package flag
  menuContents?: string; // NEW: Menu package contents description
  menuItems: MenuPackageItem[]; // NEW: Array of menu package items
}

interface ProductFormValidation {
  isValid: boolean;
  errors: Record<string, string>;
}

interface UseProductFormReturn {
  formData: ProductFormData;
  validation: ProductFormValidation;
  isSubmitting: boolean;

  // Form actions
  updateField: (field: keyof ProductFormData, value: any) => void;
  updateBadge: (badgeType: keyof ProductBadges, value: boolean) => void;
  resetForm: (category?: string) => void;
  loadProduct: (product: Product) => void;
  validateForm: () => boolean;

  // Variant actions
  addVariant: () => void;
  removeVariant: (index: number) => void;
  updateVariant: (index: number, field: keyof ProductSize, value: any) => void;
  toggleVariants: () => void;

  // Menu package actions
  addMenuItem: () => void;
  removeMenuItem: (index: number) => void;
  updateMenuItem: (index: number, field: keyof MenuPackageItem, value: any) => void;

  // Form utilities
  getFormData: () => ProductCreateData | ProductUpdateData;
  hasChanges: boolean;
}

const defaultFormData: ProductFormData = {
  name: '',
  description: '',
  price: '',
  category: '',
  available: true,
  badges: {
    neu: false,
    kurze_zeit: false,
    beliebt: false
  },
  sizes: [],
  hasVariants: false,
  isTobacco: false, // NEW: Default tobacco flag to false
  isMenuPackage: false, // NEW: Default menu package flag to false
  menuContents: '', // NEW: Default menu contents to empty string
  menuItems: [] // NEW: Default menu items array
};

export const useProductForm = (categories: any[] = [], getProductName: (name: any) => string, getProductDescription: (desc: any) => string): UseProductFormReturn => {
  const [formData, setFormData] = useState<ProductFormData>(defaultFormData);
  const [initialData, setInitialData] = useState<ProductFormData>(defaultFormData);
  const [validation, setValidation] = useState<ProductFormValidation>({ isValid: true, errors: {} });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isInitialized = useRef(false);

  /**
   * Update a single form field
   */
  const updateField = useCallback((field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    setValidation(prev => {
      if (prev.errors[field]) {
        const { [field]: removed, ...restErrors } = prev.errors;
        return {
          ...prev,
          errors: restErrors
        };
      }
      return prev;
    });
  }, []);

  /**
   * Update a badge value
   */
  const updateBadge = useCallback((badgeType: keyof ProductBadges, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      badges: { ...prev.badges, [badgeType]: value }
    }));
  }, []);

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback((category?: string) => {
    const defaultCategory = category || categories[0]?.id || '';
    const resetData = {
      ...defaultFormData,
      category: defaultCategory,
      price: defaultCategory === 'shisha-standard' ? '15.00' : ''
    };
    
    setFormData(resetData);
    setInitialData(resetData);
    setValidation({ isValid: true, errors: {} });
  }, [categories]);

  /**
   * Load existing product data into form
   */
  const loadProduct = useCallback((product: Product) => {
    const loadedData: ProductFormData = {
      name: getProductName(product.name),
      description: getProductDescription(product.description),
      price: product.price?.toString() || '',
      category: product.categoryId || '',
      available: product.available,
      badges: product.badges || {
        neu: false,
        kurze_zeit: false,
        beliebt: false
      },
      brand: product.brand,
      sizes: product.sizes || [],
      hasVariants: Boolean(product.sizes && product.sizes.length > 0),
      isTobacco: Boolean(product.isTobacco), // NEW: Load tobacco flag from product
      isMenuPackage: Boolean(product.isMenuPackage), // NEW: Load menu package flag from product
      menuContents: product.menuContents || '', // NEW: Load menu contents from product
      menuItems: parseMenuItems(product.menuContents) // NEW: Parse menu contents into items array
    };

    function parseMenuItems(menuContents?: string): MenuPackageItem[] {
      if (!menuContents) return [];
      const lines = menuContents.split('\n').filter(line => line.trim());
      return lines.map(line => {
        const match = line.match(/^(\d+)x?\s*(.+)$/);
        if (match) {
          return { quantity: match[1], name: match[2].trim() };
        }
        return { quantity: '1', name: line.trim() };
      });
    }

    setFormData(loadedData);
    setInitialData(loadedData);
    setValidation({ isValid: true, errors: {} });
  }, [getProductName, getProductDescription]);

  /**
   * Validate form data
   */
  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};

    // Required field validation
    if (!formData.name.trim()) {
      errors.name = 'Product name is required';
    }

    if (!formData.category) {
      errors.category = 'Category is required';
    }

    // Price validation
    if (formData.price) {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price < 0) {
        errors.price = 'Price must be a valid positive number';
      }
    }

    // Brand validation for tobacco products
    if (formData.isTobacco && !formData.brand) {
      errors.brand = 'Brand is required for tobacco products';
    }

    // Menu contents validation for menu packages
    if (formData.isMenuPackage && (!formData.menuContents || formData.menuContents.trim().length === 0)) {
      errors.menuContents = 'Menu contents are required for menu packages';
    }

    // Name length validation
    if (formData.name.length > 100) {
      errors.name = 'Product name cannot exceed 100 characters';
    }

    // Description length validation
    if (formData.description.length > 500) {
      errors.description = 'Description cannot exceed 500 characters';
    }

    const isValid = Object.keys(errors).length === 0;
    setValidation({ isValid, errors });
    
    return isValid;
  }, [formData]);

  /**
   * Get form data as product create/update object
   */
  const getFormData = useCallback((): ProductCreateData | ProductUpdateData => {
    // Convert menuItems array to formatted string
    const packageItemsString = formData.menuItems
      .filter(item => item.name.trim())
      .map(item => `${item.quantity}x ${item.name}`)
      .join('\n');

    const data: any = {
      name: formData.name,
      description: formData.description,
      category_id: formData.category,
      available: formData.available,
      badges: formData.badges,
      is_tobacco: formData.isTobacco, // FIXED: Use snake_case for database
      is_menu_package: formData.isMenuPackage, // FIXED: Use snake_case for database
      package_items: packageItemsString || formData.menuContents // FIXED: Use formatted items or fallback to menuContents
    };

    // 🔍 DEBUG: Log form submission data
    console.log('🔍 FORM DEBUG - getFormData called:');
    console.log('📝 Form Data:', formData);
    console.log('📦 Submission Data:', data);
    console.log('📂 Selected Category ID:', formData.category);

    // Add variants if enabled, otherwise add single price
    if (formData.hasVariants && formData.sizes.length > 0) {
      console.log('🎯 VARIANTS DEBUG - Processing variants:');
      console.log('🎯 Has variants:', formData.hasVariants);
      console.log('🎯 Variants count:', formData.sizes.length);
      console.log('🎯 Raw variants data:', formData.sizes);

      data.sizes = formData.sizes.map(size => ({
        size: size.size,
        price: size.price,
        available: size.available ?? true,
        description: size.description
      }));

      console.log('🎯 Processed variants for API:', data.sizes);
    } else if (formData.price) {
      console.log('🎯 No variants - using single price:', formData.price);
      data.price = parseFloat(formData.price);
    } else {
      console.log('⚠️ No price or variants provided');
    }

    // Add brand for tobacco products
    if (formData.brand) {
      data.brand = formData.brand;
    }

    return data;
  }, [formData]);

  /**
   * Add a new variant
   */
  const addVariant = useCallback(() => {
    const newVariant: ProductSize = {
      size: '',
      price: 0,
      available: true
    };

    setFormData(prev => ({
      ...prev,
      sizes: [...prev.sizes, newVariant],
      hasVariants: true
    }));
  }, []);

  /**
   * Remove a variant by index
   */
  const removeVariant = useCallback((index: number) => {
    setFormData(prev => {
      const newSizes = prev.sizes.filter((_, i) => i !== index);
      return {
        ...prev,
        sizes: newSizes,
        hasVariants: newSizes.length > 0
      };
    });
  }, []);

  /**
   * Update a specific variant field
   */
  const updateVariant = useCallback((index: number, field: keyof ProductSize, value: any) => {
    setFormData(prev => {
      const newSizes = [...prev.sizes];
      if (newSizes[index]) {
        newSizes[index] = { ...newSizes[index], [field]: value };
      }
      return {
        ...prev,
        sizes: newSizes
      };
    });
  }, []);

  /**
   * Toggle variants mode on/off
   */
  const toggleVariants = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      hasVariants: !prev.hasVariants,
      sizes: !prev.hasVariants ? prev.sizes : []
    }));
  }, []);

  /**
   * Add a new menu item
   */
  const addMenuItem = useCallback(() => {
    const newItem: MenuPackageItem = {
      name: '',
      quantity: '1'
    };

    setFormData(prev => ({
      ...prev,
      menuItems: [...prev.menuItems, newItem]
    }));
  }, []);

  /**
   * Remove a menu item by index
   */
  const removeMenuItem = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      menuItems: prev.menuItems.filter((_, i) => i !== index)
    }));
  }, []);

  /**
   * Update a specific menu item field
   */
  const updateMenuItem = useCallback((index: number, field: keyof MenuPackageItem, value: any) => {
    setFormData(prev => {
      const newItems = [...prev.menuItems];
      if (newItems[index]) {
        newItems[index] = { ...newItems[index], [field]: value };
      }
      return {
        ...prev,
        menuItems: newItems
      };
    });
  }, []);

  /**
   * Check if form has changes from initial state
   */
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData);

  // Auto-validate on form changes with debouncing
  useEffect(() => {
    if (formData.name || formData.category) {
      const timeoutId = setTimeout(() => {
        const errors: Record<string, string> = {};

        // Required field validation
        if (!formData.name.trim()) {
          errors.name = 'Product name is required';
        }

        if (!formData.category) {
          errors.category = 'Category is required';
        }

        // Price validation
        if (formData.price) {
          const price = parseFloat(formData.price);
          if (isNaN(price) || price < 0) {
            errors.price = 'Price must be a valid positive number';
          }
        }

        // Brand validation for tobacco products
        if (formData.isTobacco && !formData.brand) {
          errors.brand = 'Brand is required for tobacco products';
        }

        // Name length validation
        if (formData.name.length > 100) {
          errors.name = 'Product name cannot exceed 100 characters';
        }

        // Description length validation
        if (formData.description.length > 500) {
          errors.description = 'Description cannot exceed 500 characters';
        }

        const isValid = Object.keys(errors).length === 0;
        
        setValidation(prev => {
          // Only update if validation actually changed
          if (prev.isValid !== isValid || JSON.stringify(prev.errors) !== JSON.stringify(errors)) {
            return { isValid, errors };
          }
          return prev;
        });
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [formData.name, formData.category, formData.price, formData.brand, formData.description]);

  // Set default category on categories load
  useEffect(() => {
    if (categories.length > 0 && !formData.category && !isInitialized.current) {
      isInitialized.current = true;
      const defaultCategory = categories[0]?.id || '';
      const resetData = {
        ...defaultFormData,
        category: defaultCategory,
        price: defaultCategory === 'shisha-standard' ? '15.00' : ''
      };
      
      setFormData(resetData);
      setInitialData(resetData);
      setValidation({ isValid: true, errors: {} });
    }
  }, [categories.length]);

  return {
    formData,
    validation,
    isSubmitting,

    // Form actions
    updateField,
    updateBadge,
    resetForm,
    loadProduct,
    validateForm,

    // Variant actions
    addVariant,
    removeVariant,
    updateVariant,
    toggleVariants,

    // Menu package actions
    addMenuItem,
    removeMenuItem,
    updateMenuItem,

    // Form utilities
    getFormData,
    hasChanges
  };
};

export type { MenuPackageItem };
