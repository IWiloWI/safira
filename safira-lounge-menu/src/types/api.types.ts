/**
 * API response and request type definitions
 * Provides consistent typing for all API interactions
 */

import { AppError, PaginationMeta, AnalyticsEventType, DeviceInfo, UploadResult } from './common.types';
import { Product, Category, ProductData, TobaccoCatalog, TobaccoItem } from './product.types';
import { User, AuthResponse, UserSession, UserActivity } from './user.types';

/**
 * Standard API response wrapper
 * All API endpoints should return this structure
 */
export interface ApiResponse<T = unknown> {
  /** Operation success status */
  success: boolean;
  /** Response data */
  data?: T;
  /** Error information if success is false */
  error?: AppError;
  /** Response message */
  message?: string;
  /** Request timestamp */
  timestamp: string;
  /** Request ID for tracking */
  requestId?: string;
}

/**
 * Paginated API response
 * Used for list endpoints that support pagination
 */
export interface PaginatedApiResponse<T = unknown> extends ApiResponse<T[]> {
  /** Pagination metadata */
  pagination: PaginationMeta;
}

/**
 * API request configuration
 */
export interface ApiRequestConfig {
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Additional headers */
  headers?: Record<string, string>;
  /** Query parameters */
  params?: Record<string, unknown>;
  /** Whether to include authentication token */
  requireAuth?: boolean;
  /** Retry configuration */
  retry?: {
    attempts: number;
    delay: number;
  };
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  /** Service status */
  status: 'healthy' | 'degraded' | 'unhealthy';
  /** Response timestamp */
  timestamp: string;
  /** Service version */
  version?: string;
  /** Uptime in seconds */
  uptime?: number;
  /** Database connection status */
  database?: 'connected' | 'disconnected' | 'error';
  /** External service statuses */
  services?: Record<string, 'available' | 'unavailable'>;
}

/**
 * Authentication API responses
 */
export interface LoginResponse extends ApiResponse<AuthResponse> {}

export interface LogoutResponse extends ApiResponse<{ message: string }> {}

export interface RefreshTokenResponse extends ApiResponse<{
  token: string;
  expiresAt: string;
}> {}

/**
 * Product API responses
 */
export interface GetProductsResponse extends ApiResponse<ProductData> {}

export interface CreateProductResponse extends ApiResponse<{ product: Product }> {}

export interface UpdateProductResponse extends ApiResponse<{ product: Product }> {}

export interface DeleteProductResponse extends ApiResponse<{ message: string }> {}

export interface MoveProductResponse extends ApiResponse<{ product: Product }> {}

/**
 * Category API responses
 */
export interface GetCategoriesResponse extends ApiResponse<Category[]> {}

export interface CreateCategoryResponse extends ApiResponse<{ category: Category }> {}

export interface UpdateCategoryResponse extends ApiResponse<{ category: Category }> {}

export interface DeleteCategoryResponse extends ApiResponse<{ message: string }> {}

/**
 * Tobacco catalog API responses
 */
export interface GetTobaccoCatalogResponse extends ApiResponse<TobaccoCatalog> {}

export interface AddBrandResponse extends ApiResponse<{ brands: string[] }> {}

export interface AddTobaccoResponse extends ApiResponse<{ tobacco: TobaccoItem }> {}

export interface SyncTobaccoResponse extends ApiResponse<{
  message: string;
  syncedCount: number;
  totalTobaccos: number;
}> {}

/**
 * Bulk operations API responses
 */
export interface BulkPriceUpdateResponse extends ApiResponse<{
  message: string;
  updatedCount: number;
  newPrice: number;
}> {}

/**
 * Translation API responses
 */
export interface TranslateTextResponse extends ApiResponse<{
  translations: Record<string, string>;
}> {}

export interface TranslateProductResponse extends ApiResponse<{ product: Product }> {}

export interface TranslationStatusResponse extends ApiResponse<{
  configured: boolean;
  message: string;
}> {}

export interface UpdateTranslationsResponse extends ApiResponse<{ product: Product }> {}

/**
 * Analytics API types
 */
export interface AnalyticsData {
  /** Total page views */
  totalViews: number;
  /** Total QR code scans */
  totalQRScans: number;
  /** Today's views */
  todayViews: number;
  /** Device breakdown */
  deviceInfo: DeviceInfo[];
  /** Table activity statistics */
  tableActivity: Record<string, number>;
  /** Recent activity log */
  recentActivity: AnalyticsActivity[];
  /** View trends over time */
  viewTrends?: AnalyticsTrend[];
  /** Popular products */
  popularProducts?: ProductAnalytics[];
}

/**
 * Analytics activity entry
 */
export interface AnalyticsActivity {
  /** Activity timestamp */
  time: string;
  /** Activity description */
  description: string;
  /** Full timestamp */
  timestamp: string;
  /** Activity type */
  type: AnalyticsEventType;
  /** User identifier (if applicable) */
  user?: string;
  /** Additional activity data */
  data: Record<string, unknown>;
}

/**
 * Analytics trend data point
 */
export interface AnalyticsTrend {
  /** Date/time */
  date: string;
  /** Number of views */
  views: number;
  /** Number of scans */
  scans: number;
  /** Unique visitors */
  uniqueVisitors?: number;
}

/**
 * Product analytics
 */
export interface ProductAnalytics {
  /** Product ID */
  productId: string;
  /** Product name */
  productName: string;
  /** Number of views */
  views: number;
  /** Category */
  category: string;
  /** Last viewed timestamp */
  lastViewed: string;
}

export interface GetAnalyticsResponse extends ApiResponse<AnalyticsData> {}

export interface TrackEventResponse extends ApiResponse<{ message: string }> {}

/**
 * Event tracking request
 */
export interface TrackEventRequest {
  /** Event type */
  type: AnalyticsEventType;
  /** Event data */
  data: Record<string, unknown>;
  /** Optional user identifier */
  userId?: string;
  /** Device information */
  deviceInfo?: DeviceInfo;
  /** Table ID for location tracking */
  tableId?: string;
}

/**
 * QR Code API responses
 */
export interface GenerateQRResponse extends ApiResponse<{
  qrCode: string;
  url: string;
  tableId: string;
}> {}

/**
 * QR Code generation request
 */
export interface GenerateQRRequest {
  /** Table identifier */
  tableId: string;
  /** Base URL for QR code */
  baseUrl?: string;
  /** QR code size */
  size?: number;
  /** QR code format */
  format?: 'png' | 'svg' | 'jpeg';
}

/**
 * File upload API responses
 */
export interface UploadFileResponse extends ApiResponse<{
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
}> {}

/**
 * Configuration API types
 */
export interface AppConfig {
  /** Site name */
  siteName: string;
  /** Business address */
  address: string;
  /** Phone number */
  phone: string;
  /** Email address */
  email: string;
  /** Business hours */
  hours: Record<string, string>;
  /** Social media links */
  social: Record<string, string>;
  /** WiFi information */
  wifi?: {
    networkName: string;
    password: string;
    qrCode?: string;
  };
  /** Theme configuration */
  theme?: {
    primaryColor: string;
    secondaryColor: string;
    logoUrl: string;
  };
  /** Feature flags */
  features?: Record<string, boolean>;
}

export interface GetConfigResponse extends ApiResponse<AppConfig> {}

export interface UpdateConfigResponse extends ApiResponse<{ config: AppConfig }> {}

/**
 * User management API responses
 */
export interface GetUsersResponse extends PaginatedApiResponse<User> {}

export interface CreateUserResponse extends ApiResponse<{ user: User }> {}

export interface UpdateUserResponse extends ApiResponse<{ user: User }> {}

export interface DeleteUserResponse extends ApiResponse<{ message: string }> {}

export interface GetUserActivityResponse extends PaginatedApiResponse<UserActivity> {}

export interface GetUserSessionsResponse extends ApiResponse<UserSession[]> {}

/**
 * Error response types
 */
export interface ValidationErrorResponse extends ApiResponse<never> {
  error: AppError & {
    /** Field-specific validation errors */
    fieldErrors?: Record<string, string[]>;
  };
}

/**
 * Rate limiting response
 */
export interface RateLimitResponse {
  /** Rate limit exceeded status */
  rateLimited: boolean;
  /** Limit reset timestamp */
  resetAt: string;
  /** Requests remaining */
  remaining: number;
  /** Request limit per window */
  limit: number;
}

/**
 * WebSocket message types for real-time updates
 */
export interface WebSocketMessage<T = unknown> {
  /** Message type */
  type: 'product_update' | 'category_update' | 'user_update' | 'analytics_update' | 'error' | 'heartbeat';
  /** Message payload */
  payload: T;
  /** Message timestamp */
  timestamp: string;
  /** Message ID */
  id: string;
}

/**
 * Real-time product update message
 */
export interface ProductUpdateMessage {
  /** Update type */
  action: 'created' | 'updated' | 'deleted';
  /** Updated product */
  product?: Product;
  /** Product ID (for deletions) */
  productId?: string;
  /** Category ID */
  categoryId: string;
  /** User who made the change */
  updatedBy: string;
}

/**
 * Real-time analytics update message
 */
export interface AnalyticsUpdateMessage {
  /** Update type */
  type: AnalyticsEventType;
  /** Event data */
  data: Record<string, unknown>;
  /** Timestamp */
  timestamp: string;
}

/**
 * API endpoint paths (for reference and type safety)
 */
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  
  // Products
  PRODUCTS: '/products',
  PRODUCT_BY_CATEGORY: '/products/:categoryId/items',
  PRODUCT_BY_ID: '/products/:categoryId/items/:itemId',
  MOVE_PRODUCT: '/products/move/:fromCategoryId/:itemId/:toCategoryId',
  BULK_PRICE_UPDATE: '/products/bulk-price-update',
  
  // Categories
  CATEGORIES: '/categories',
  CATEGORY_BY_ID: '/categories/:categoryId',
  
  // Tobacco
  TOBACCO_CATALOG: '/tobacco-catalog',
  TOBACCO_BRANDS: '/tobacco-catalog/brands',
  TOBACCO_ITEMS: '/tobacco-catalog/tobaccos',
  TOBACCO_SYNC: '/tobacco-catalog/sync-products',
  TOBACCO_ADD_TO_MENU: '/tobacco-catalog/add-to-menu',
  
  // Analytics
  ANALYTICS: '/analytics',
  TRACK_EVENT: '/analytics/track',
  
  // QR Codes
  GENERATE_QR: '/qr/generate',
  
  // File Upload
  UPLOAD: '/upload',
  
  // Configuration
  CONFIG: '/config',
  
  // Health
  HEALTH: '/health',
  
  // Translation
  TRANSLATE: '/translate',
  TRANSLATE_PRODUCT: '/translate/product',
  TRANSLATE_STATUS: '/translate/status',
  UPDATE_TRANSLATIONS: '/products/:categoryId/items/:itemId/translations',
  
  // Users
  USERS: '/users',
  USER_BY_ID: '/users/:userId',
  USER_ACTIVITY: '/users/:userId/activity',
  USER_SESSIONS: '/users/:userId/sessions',
} as const;

/**
 * HTTP status codes for API responses
 */
export const HTTP_STATUS = {
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
} as const;