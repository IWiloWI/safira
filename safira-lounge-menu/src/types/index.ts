/**
 * Main type exports for the Safira Lounge Menu project
 * Centralized exports for all TypeScript interfaces and types
 */

// Common types
export * from './common.types';

// Product and category types
export * from './product.types';

// User and authentication types
export * from './user.types';

// API request/response types
export * from './api.types';

// Form and validation types
export * from './form.types';

// React component prop types
export * from './component.types';

// Re-export commonly used types with aliases for convenience
export type {
  // Core entities
  Product as MenuItem,
  Category as MenuCategory,
  User as AdminUser,
  
  // Multilingual content
  MultilingualText as LocalizedText,
  FlexibleText as LocalizableText,
  
  // Form data
  ProductFormData as MenuItemFormData,
  CategoryFormData as MenuCategoryFormData,
  
  // API responses
  ApiResponse as SafiraApiResponse,
  PaginatedApiResponse as SafiraPaginatedResponse,
  
  // Component props
  ProductCardProps as MenuItemCardProps,
  ProductListProps as MenuItemListProps,
  
  // Common utilities
  Language as SupportedLanguage,
  LoadingState as AsyncState,
} from './index';

/**
 * Type guard functions for runtime type checking
 */

/**
 * Check if text is multilingual
 */
export function isMultilingualText(text: unknown): text is import('./common.types').MultilingualText {
  return typeof text === 'object' && 
         text !== null && 
         'de' in text && 
         typeof (text as any).de === 'string';
}

/**
 * Check if value is a valid language code
 */
export function isValidLanguage(value: unknown): value is import('./common.types').Language {
  return typeof value === 'string' && ['de', 'da', 'en', 'tr', 'it'].includes(value);
}

/**
 * Check if product has all required fields
 */
export function isValidProduct(value: unknown): value is import('./product.types').Product {
  return typeof value === 'object' && 
         value !== null && 
         'id' in value && 
         'name' in value && 
         'available' in value &&
         typeof (value as any).id === 'string' &&
         typeof (value as any).available === 'boolean';
}

/**
 * Check if category has all required fields
 */
export function isValidCategory(value: unknown): value is import('./product.types').Category {
  return typeof value === 'object' && 
         value !== null && 
         'id' in value && 
         'name' in value && 
         'icon' in value &&
         'items' in value &&
         typeof (value as any).id === 'string' &&
         typeof (value as any).icon === 'string' &&
         Array.isArray((value as any).items);
}

/**
 * Check if user has required authentication fields
 */
export function isValidUser(value: unknown): value is import('./user.types').User {
  return typeof value === 'object' && 
         value !== null && 
         'id' in value && 
         'username' in value && 
         'email' in value &&
         'role' in value &&
         typeof (value as any).id === 'string' &&
         typeof (value as any).username === 'string' &&
         typeof (value as any).email === 'string';
}

/**
 * Check if API response has correct structure
 */
export function isApiResponse<T>(value: unknown): value is import('./api.types').ApiResponse<T> {
  return typeof value === 'object' && 
         value !== null && 
         'success' in value && 
         'timestamp' in value &&
         typeof (value as any).success === 'boolean' &&
         typeof (value as any).timestamp === 'string';
}

/**
 * Helper functions for working with multilingual content
 */
export const MultilingualHelpers = {
  /**
   * Get text in specified language with fallback
   */
  getText(
    text: import('./common.types').FlexibleText, 
    language: import('./common.types').Language = 'de'
  ): string {
    if (typeof text === 'string') {
      return text;
    }
    
    if (typeof text === 'object' && text !== null) {
      return (text as any)[language] || (text as any).de || '';
    }
    
    return '';
  },

  /**
   * Create multilingual text object
   */
  createMultilingual(
    de: string, 
    da?: string, 
    en?: string,
    tr?: string,
    it?: string
  ): import('./common.types').MultilingualText {
    return {
      de,
      da: da || de,
      en: en || de,
      tr: tr || de,
      it: it || de
    };
  },

  /**
   * Check if all translations are present
   */
  isComplete(text: import('./common.types').FlexibleText): boolean {
    if (typeof text === 'string') {
      return false; // String is not considered complete multilingual
    }
    
    if (typeof text === 'object' && text !== null) {
      const obj = text as any;
      return !!(obj.de && obj.da && obj.en && obj.tr && obj.it);
    }
    
    return false;
  },

  /**
   * Get missing languages for translation
   */
  getMissingLanguages(text: import('./common.types').FlexibleText): import('./common.types').Language[] {
    if (typeof text === 'string') {
      return ['da', 'en', 'tr', 'it']; // Assuming string is in German
    }
    
    if (typeof text === 'object' && text !== null) {
      const obj = text as any;
      const missing: import('./common.types').Language[] = [];
      
      if (!obj.de) missing.push('de');
      if (!obj.da) missing.push('da');
      if (!obj.en) missing.push('en');
      if (!obj.tr) missing.push('tr');
      if (!obj.it) missing.push('it');
      
      return missing;
    }
    
    return ['de', 'da', 'en', 'tr', 'it'];
  }
};

/**
 * Constants for common values
 */
export const TypeConstants = {
  /** Default language */
  DEFAULT_LANGUAGE: 'de' as import('./common.types').Language,
  
  /** Supported languages */
  LANGUAGES: ['de', 'da', 'en', 'tr', 'it'] as import('./common.types').Language[],
  
  /** User roles */
  USER_ROLES: ['admin', 'manager', 'staff', 'viewer'] as import('./user.types').UserRole[],
  
  /** Product badge types */
  BADGE_TYPES: ['neu', 'kurze_zeit', 'beliebt'] as Array<keyof import('./common.types').ProductBadges>,
  
  /** Loading states */
  LOADING_STATES: ['idle', 'loading', 'success', 'error'] as import('./common.types').LoadingState[],
  
  /** HTTP status codes */
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
  } as const,
} as const;

/**
 * Type utility for extracting keys from objects
 */
export type KeysOf<T> = keyof T;

/**
 * Type utility for extracting values from objects
 */
export type ValuesOf<T> = T[keyof T];

/**
 * Type utility for making specific fields optional
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Type utility for making specific fields required
 */
export type Required<T, K extends keyof T> = T & import('./common.types').RequireFields<T, K>;

/**
 * Type utility for deep partial (all nested fields optional)
 */
export type DeepPartial<T> = import('./common.types').PartialDeep<T>;

/**
 * Export version information
 */
export const VERSION = {
  types: '1.0.0',
  lastUpdated: new Date().toISOString(),
} as const;