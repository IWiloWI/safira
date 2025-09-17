/**
 * Custom hook for product form state management
 * Handles form data, validation, and submission logic
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Product, ProductCreateData, ProductUpdateData } from '../types/product.types';
import { ProductBadges } from '../types/common.types';

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  available: boolean;
  badges: ProductBadges;
  brand?: string;
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
  }
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
    const loadedData = {
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
      brand: product.brand
    };
    
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

    // Brand validation for shisha products
    if (formData.category === 'shisha-standard' && !formData.brand) {
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
    setValidation({ isValid, errors });
    
    return isValid;
  }, [formData]);

  /**
   * Get form data as product create/update object
   */
  const getFormData = useCallback((): ProductCreateData | ProductUpdateData => {
    const data: any = {
      name: formData.name,
      description: formData.description,
      available: formData.available,
      badges: formData.badges
    };

    // Add price if provided
    if (formData.price) {
      data.price = parseFloat(formData.price);
    }

    // Add brand for tobacco products
    if (formData.brand) {
      data.brand = formData.brand;
    }

    return data;
  }, [formData]);

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

        // Brand validation for shisha products
        if (formData.category === 'shisha-standard' && !formData.brand) {
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
    
    // Form utilities
    getFormData,
    hasChanges
  };
};
