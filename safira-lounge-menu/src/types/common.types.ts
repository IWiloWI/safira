/**
 * Common utility types and base interfaces for the Safira Lounge Menu project
 * These types are used across multiple modules and provide consistent typing
 */

/**
 * Supported languages in the application
 */
export type Language = 'de' | 'da' | 'en' | 'tr' | 'it';

/**
 * Default language for fallback scenarios
 */
export const DEFAULT_LANGUAGE: Language = 'de';

/**
 * Multilingual text content
 * Provides localized text for all supported languages
 * @example
 * ```typescript
 * const welcomeText: MultilingualText = {
 *   de: "Willkommen",
 *   da: "Velkommen", 
 *   en: "Welcome"
 * };
 * ```
 */
export interface MultilingualText {
  /** German text */
  de: string;
  /** Danish text */
  da: string;
  /** English text */
  en: string;
  /** Turkish text */
  tr: string;
  /** Italian text */
  it: string;
}

/**
 * Partial multilingual text for optional translations
 * Used when translations might not be complete for all languages
 */
export interface PartialMultilingualText {
  /** German text (required as fallback) */
  de: string;
  /** Danish text (optional) */
  da?: string;
  /** English text (optional) */
  en?: string;
  /** Turkish text (optional) */
  tr?: string;
  /** Italian text (optional) */
  it?: string;
}

/**
 * Union type for text that can be either a simple string or multilingual
 * Legacy support for existing data structures
 */
export type FlexibleText = string | MultilingualText | PartialMultilingualText;

/**
 * Badge types for product highlighting
 * These are used to mark products with special status
 */
export interface ProductBadges {
  /** New product badge */
  neu: boolean;
  /** Limited time badge */
  kurze_zeit: boolean;
  /** Popular product badge */
  beliebt: boolean;
}

/**
 * Price information for products with optional size variations
 */
export interface PriceInfo {
  /** Size label (e.g., "Small", "Medium", "Large") */
  size: string;
  /** Price in euros */
  price: number;
}

/**
 * Base entity interface with common fields
 */
export interface BaseEntity {
  /** Unique identifier */
  id: string;
}

/**
 * Status type for various entities
 */
export type EntityStatus = 'active' | 'inactive' | 'pending' | 'deleted';

/**
 * Priority levels for tasks and operations
 */
export type Priority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Common error structure for API responses
 */
export interface AppError {
  /** Error code */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Additional error details */
  details?: Record<string, unknown>;
  /** Timestamp when error occurred */
  timestamp: string;
}

/**
 * Pagination parameters for list requests
 */
export interface PaginationParams {
  /** Page number (0-based) */
  page: number;
  /** Number of items per page */
  limit: number;
  /** Field to sort by */
  sortBy?: string;
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Pagination metadata for responses
 */
export interface PaginationMeta {
  /** Current page number */
  page: number;
  /** Items per page */
  limit: number;
  /** Total number of items */
  total: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there's a next page */
  hasNext: boolean;
  /** Whether there's a previous page */
  hasPrev: boolean;
}

/**
 * Search and filter parameters
 */
export interface SearchParams {
  /** Search query string */
  query?: string;
  /** Category filter */
  category?: string;
  /** Language filter */
  language?: Language;
  /** Additional filters */
  filters?: Record<string, unknown>;
}

/**
 * Coordinates for location-based features
 */
export interface Coordinates {
  /** Latitude */
  lat: number;
  /** Longitude */
  lng: number;
}

/**
 * Social media configuration
 */
export interface SocialMediaLinks {
  /** Facebook page URL */
  facebook?: string;
  /** Instagram profile URL */
  instagram?: string;
  /** TikTok profile URL */
  tiktok?: string;
  /** YouTube channel URL */
  youtube?: string;
  /** LinkedIn profile URL */
  linkedin?: string;
  /** Twitter/X profile URL */
  twitter?: string;
}

/**
 * Business hours configuration
 */
export interface BusinessHours {
  /** Monday hours */
  monday: string;
  /** Tuesday hours */
  tuesday: string;
  /** Wednesday hours */
  wednesday: string;
  /** Thursday hours */
  thursday: string;
  /** Friday hours */
  friday: string;
  /** Saturday hours */
  saturday: string;
  /** Sunday hours */
  sunday: string;
}

/**
 * Contact information structure
 */
export interface ContactInfo {
  /** Business address */
  address: string;
  /** Phone number */
  phone: string;
  /** Email address */
  email: string;
  /** Website URL */
  website?: string;
  /** Business coordinates */
  coordinates?: Coordinates;
}

/**
 * File upload result
 */
export interface UploadResult {
  /** Public URL of uploaded file */
  url: string;
  /** Generated filename */
  filename: string;
  /** Original filename */
  originalName: string;
  /** File size in bytes */
  size: number;
  /** MIME type */
  mimeType: string;
}

/**
 * Loading states for async operations
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Generic async operation result
 */
export interface AsyncResult<T> {
  /** Loading state */
  status: LoadingState;
  /** Result data if successful */
  data?: T;
  /** Error if operation failed */
  error?: AppError;
  /** Loading indicator */
  isLoading: boolean;
}

/**
 * Event types for analytics tracking
 */
export type AnalyticsEventType = 
  | 'page_view'
  | 'product_view'
  | 'product_created'
  | 'product_updated'
  | 'product_deleted'
  | 'product_availability_changed'
  | 'qr_scan'
  | 'menu_navigation'
  | 'language_change'
  | 'bulk_price_update'
  | 'search_performed';

/**
 * Device information for analytics
 */
export interface DeviceInfo {
  /** Device type */
  type: 'mobile' | 'tablet' | 'desktop';
  /** Browser name */
  browser: string;
  /** Operating system */
  os: string;
  /** Screen resolution */
  screenResolution: string;
  /** User agent string */
  userAgent: string;
}

/**
 * Utility type to make all properties optional
 */
export type PartialDeep<T> = {
  [P in keyof T]?: T[P] extends object ? PartialDeep<T[P]> : T[P];
};

/**
 * Utility type to make specific properties required
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Utility type for timestamp fields
 */
export interface Timestamps {
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}