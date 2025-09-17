/**
 * Comprehensive validation utilities for form inputs and data validation
 * Replaces manual validation throughout the application
 */

import { ValidationError } from '../components/Common/AsyncErrorBoundary';
import type { 
  Product, 
  Category, 
  LoginCredentials, 
  User,
  MultilingualText 
} from '../types';

// Validation result type
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

// Field validation configuration
export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  customValidator?: (value: any) => string | null;
}

/**
 * Generic validation function for any field
 */
export function validateField(
  value: any, 
  validation: FieldValidation, 
  fieldName: string = 'Field'
): ValidationResult {
  const errors: string[] = [];

  // Required validation
  if (validation.required && (value === null || value === undefined || value === '')) {
    errors.push(`${fieldName} ist erforderlich`);
    return { isValid: false, errors };
  }

  // Skip other validations if value is empty and not required
  if (!value && !validation.required) {
    return { isValid: true, errors: [] };
  }

  const stringValue = String(value);

  // Length validations
  if (validation.minLength && stringValue.length < validation.minLength) {
    errors.push(`${fieldName} muss mindestens ${validation.minLength} Zeichen lang sein`);
  }

  if (validation.maxLength && stringValue.length > validation.maxLength) {
    errors.push(`${fieldName} darf maximal ${validation.maxLength} Zeichen lang sein`);
  }

  // Pattern validation
  if (validation.pattern && !validation.pattern.test(stringValue)) {
    errors.push(`${fieldName} hat ein ungültiges Format`);
  }

  // Numeric validations
  if (typeof value === 'number') {
    if (validation.min !== undefined && value < validation.min) {
      errors.push(`${fieldName} muss mindestens ${validation.min} sein`);
    }

    if (validation.max !== undefined && value > validation.max) {
      errors.push(`${fieldName} darf maximal ${validation.max} sein`);
    }
  }

  // Custom validation
  if (validation.customValidator) {
    const customError = validation.customValidator(value);
    if (customError) {
      errors.push(customError);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validation schemas for different entity types
 */
export const validationSchemas = {
  // Product validation
  product: {
    name: {
      required: true,
      minLength: 1,
      maxLength: 200,
      customValidator: (value: MultilingualText) => {
        if (typeof value === 'object') {
          const hasGerman = value.de && value.de.trim().length > 0;
          if (!hasGerman) {
            return 'Deutscher Produktname ist erforderlich';
          }
        }
        return null;
      }
    },
    price: {
      required: true,
      min: 0,
      max: 9999.99,
      customValidator: (value: number) => {
        if (isNaN(value)) return 'Preis muss eine gültige Zahl sein';
        if (value < 0) return 'Preis kann nicht negativ sein';
        return null;
      }
    },
    categoryId: {
      required: true,
      minLength: 1,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9_-]+$/
    },
    description: {
      maxLength: 1000
    },
    imageUrl: {
      pattern: /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i,
      customValidator: (value: string) => {
        if (!value) return null;
        try {
          new URL(value);
          return null;
        } catch {
          return 'Ungültige Bild-URL';
        }
      }
    }
  },

  // Category validation
  category: {
    id: {
      required: true,
      minLength: 1,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9_-]+$/,
      customValidator: (value: string) => {
        if (value?.toLowerCase().includes('admin')) {
          return 'Kategorie-ID darf nicht "admin" enthalten';
        }
        return null;
      }
    },
    name: {
      required: true,
      minLength: 1,
      maxLength: 100,
      customValidator: (value: MultilingualText) => {
        if (typeof value === 'object') {
          const hasGerman = value.de && value.de.trim().length > 0;
          if (!hasGerman) {
            return 'Deutscher Kategoriename ist erforderlich';
          }
        }
        return null;
      }
    },
  },

  // User/Login validation
  login: {
    username: {
      required: true,
      minLength: 3,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9_]+$/,
      customValidator: (value: string) => {
        if (value?.toLowerCase() === 'root' || value?.toLowerCase() === 'administrator') {
          return 'Dieser Benutzername ist nicht erlaubt';
        }
        return null;
      }
    },
    password: {
      required: true,
      minLength: 6,
      maxLength: 128,
      customValidator: (value: string) => {
        if (!value) return null;
        
        const hasLower = /[a-z]/.test(value);
        const hasUpper = /[A-Z]/.test(value);
        const hasNumber = /\d/.test(value);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
        
        if (value.length < 8) {
          return 'Passwort sollte mindestens 8 Zeichen lang sein';
        }
        
        const strength = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
        if (strength < 2) {
          return 'Passwort sollte Großbuchstaben, Kleinbuchstaben, Zahlen oder Sonderzeichen enthalten';
        }
        
        return null;
      }
    }
  },

  // File upload validation
  upload: {
    fileSize: {
      max: 10 * 1024 * 1024, // 10MB
      customValidator: (file: File) => {
        if (!file) return 'Keine Datei ausgewählt';
        if (file.size > 10 * 1024 * 1024) {
          return 'Datei ist zu groß (maximal 10MB)';
        }
        return null;
      }
    },
    fileType: {
      customValidator: (file: File) => {
        if (!file) return null;
        
        const allowedTypes = [
          'image/jpeg',
          'image/png', 
          'image/webp',
          'image/gif',
          'video/mp4',
          'video/webm'
        ];
        
        if (!allowedTypes.includes(file.type)) {
          return 'Ungültiger Dateityp. Nur Bilder (JPG, PNG, WebP, GIF) und Videos (MP4, WebM) sind erlaubt';
        }
        
        return null;
      }
    }
  }
};

/**
 * Validate an entire product object
 */
export function validateProduct(product: Partial<Product>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate each field
  const nameResult = validateField(product.name, validationSchemas.product.name, 'Produktname');
  errors.push(...nameResult.errors);

  const priceResult = validateField(product.price, validationSchemas.product.price, 'Preis');
  errors.push(...priceResult.errors);

  const categoryResult = validateField(product.categoryId, validationSchemas.product.categoryId, 'Kategorie');
  errors.push(...categoryResult.errors);

  if (product.description) {
    const descResult = validateField(product.description, validationSchemas.product.description, 'Beschreibung');
    errors.push(...descResult.errors);
  }

  if (product.imageUrl) {
    const imageResult = validateField(product.imageUrl, validationSchemas.product.imageUrl, 'Bild-URL');
    errors.push(...imageResult.errors);
  }

  // Business logic validations
  if (product.price !== undefined && product.price > 100) {
    warnings.push('Hoher Preis - bitte überprüfen');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate category object
 */
export function validateCategory(category: Partial<Category>): ValidationResult {
  const errors: string[] = [];

  const idResult = validateField(category.id, validationSchemas.category.id, 'Kategorie-ID');
  errors.push(...idResult.errors);

  const nameResult = validateField(category.name, validationSchemas.category.name, 'Kategoriename');
  errors.push(...nameResult.errors);


  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate login credentials
 */
export function validateLoginCredentials(credentials: Partial<LoginCredentials>): ValidationResult {
  const errors: string[] = [];

  const usernameResult = validateField(credentials.username, validationSchemas.login.username, 'Benutzername');
  errors.push(...usernameResult.errors);

  const passwordResult = validateField(credentials.password, validationSchemas.login.password, 'Passwort');
  errors.push(...passwordResult.errors);

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate file upload
 */
export function validateFileUpload(file: File): ValidationResult {
  const errors: string[] = [];

  const sizeResult = validateField(file, validationSchemas.upload.fileSize, 'Dateigröße');
  errors.push(...sizeResult.errors);

  const typeResult = validateField(file, validationSchemas.upload.fileType, 'Dateityp');
  errors.push(...typeResult.errors);

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Validate multilingual text object
 */
export function validateMultilingualText(
  text: MultilingualText | string, 
  fieldName: string,
  required: boolean = false
): ValidationResult {
  const errors: string[] = [];

  if (typeof text === 'string') {
    if (required && !text.trim()) {
      errors.push(`${fieldName} ist erforderlich`);
    }
    return { isValid: errors.length === 0, errors };
  }

  if (typeof text === 'object' && text !== null) {
    // At least German should be provided
    if (required && (!text.de || !text.de.trim())) {
      errors.push(`${fieldName} (Deutsch) ist erforderlich`);
    }

    // Validate individual languages if provided
    Object.entries(text).forEach(([lang, value]) => {
      if (value && typeof value === 'string' && value.length > 1000) {
        errors.push(`${fieldName} (${lang.toUpperCase()}) ist zu lang (maximal 1000 Zeichen)`);
      }
    });
  } else if (required) {
    errors.push(`${fieldName} ist erforderlich`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validation error class for throwing validation errors
 */
export class FormValidationError extends ValidationError {
  public validationResult: ValidationResult;

  constructor(validationResult: ValidationResult, message?: string) {
    super(message || validationResult.errors.join(', '));
    this.validationResult = validationResult;
    this.name = 'FormValidationError';
  }
}

/**
 * Async validation for unique constraints (e.g., checking if category ID exists)
 */
export async function validateUniqueField(
  value: string,
  field: string,
  excludeId?: string
): Promise<ValidationResult> {
  try {
    // This would typically make an API call to check uniqueness
    const response = await fetch(`/api/validate/${field}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value, excludeId })
    });

    if (!response.ok) {
      return {
        isValid: false,
        errors: ['Validierung konnte nicht durchgeführt werden']
      };
    }

    const result = await response.json();
    return {
      isValid: result.isUnique,
      errors: result.isUnique ? [] : [`${field} ist bereits vergeben`]
    };
  } catch (error) {
    console.error('Unique validation error:', error);
    return {
      isValid: false,
      errors: ['Validierung konnte nicht durchgeführt werden']
    };
  }
}

/**
 * Debounced validation for real-time feedback
 */
export function createDebouncedValidator<T>(
  validator: (value: T) => ValidationResult,
  delay: number = 300
) {
  let timeoutId: NodeJS.Timeout;

  return (value: T, callback: (result: ValidationResult) => void) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const result = validator(value);
      callback(result);
    }, delay);
  };
}