import axios from 'axios';

// Import all types from the new type system
import type {
  Product,
  Category,
  ProductData,
  TobaccoCatalog,
  TobaccoItem,
  ProductCreateData,
  ProductUpdateData,
  TobaccoItemCreateData,
  BulkPriceUpdateResult,
  TranslationUpdateRequest,
} from '../types/product.types';

import type {
  User,
  LoginCredentials,
  AuthResponse,
  PasswordChangeRequest,
  PasswordResetRequest,
} from '../types/user.types';

import type {
  ApiResponse,
  GetProductsResponse,
  CreateProductResponse,
  UpdateProductResponse,
  DeleteProductResponse,
  MoveProductResponse,
  GetTobaccoCatalogResponse,
  AddBrandResponse,
  AddTobaccoResponse,
  SyncTobaccoResponse,
  BulkPriceUpdateResponse,
  TranslateTextResponse,
  TranslateProductResponse,
  TranslationStatusResponse,
  UpdateTranslationsResponse,
  GetAnalyticsResponse,
  TrackEventResponse,
  TrackEventRequest,
  GenerateQRResponse,
  GenerateQRRequest,
  UploadFileResponse,
  GetConfigResponse,
  UpdateConfigResponse,
  HealthCheckResponse,
  LoginResponse,
  AnalyticsData,
} from '../types/api.types';

import type {
  AppConfig,
} from '../types/api.types';

import type {
  Language,
  AnalyticsEventType,
  UploadResult,
  ProductBadges,
} from '../types/common.types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://test.safira-lounge.de/safira-api-fixed.php';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// CSRF token cache
let csrfTokenCache: string | null = null;
let csrfTokenPromise: Promise<string> | null = null;

// Function to fetch CSRF token - DISABLED for PHP API compatibility
const getCSRFToken = async (): Promise<string> => {
  console.warn('CSRF token disabled for PHP API compatibility');
  return 'disabled';
};

// Request interceptor to add auth token and CSRF token
api.interceptors.request.use(
  async (config) => {
    // Add auth token
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Skip CSRF token for now as endpoint doesn't exist
    // TODO: Re-enable when CSRF endpoint is implemented
    /*
    if (config.method && config.method.toUpperCase() !== 'GET') {
      try {
        const csrfToken = await getCSRFToken();
        config.headers['x-csrf-token'] = csrfToken;
      } catch (error) {
        console.error('Failed to add CSRF token to request:', error);
        // Continue with request even if CSRF token fails
      }
    }
    */
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Function to clear CSRF token cache
const clearCSRFTokenCache = () => {
  csrfTokenCache = null;
  csrfTokenPromise = null;
};

// Response interceptor for error handling and PHP API compatibility
api.interceptors.response.use(
  (response) => {
    // Handle PHP API direct responses (no wrapper)
    if (response.data && !response.data.data && !response.data.success) {
      // PHP API returns direct data, wrap it for compatibility
      response.data = {
        data: response.data,
        success: true
      };
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      clearCSRFTokenCache(); // Clear CSRF token cache on auth failure
      // Use React Router navigation instead of direct window manipulation
      console.log('Authentication failed, redirect to login required');
      // The parent component should handle this error and redirect
    }

    if (error.response?.status === 403) {
      // Clear CSRF token cache and retry if it's a CSRF error
      if (error.response?.data?.error?.includes('CSRF')) {
        clearCSRFTokenCache();
      }
      console.log('CSRF or authorization error, might need fresh token');
    }

    return Promise.reject(error);
  }
);

// Legacy exports for backward compatibility (will be removed in future versions)
/** @deprecated Use Product from types/product.types instead */
export type { Product };
/** @deprecated Use Category from types/product.types instead */
export type { Category };
/** @deprecated Use ProductData from types/product.types instead */
export type { ProductData };
/** @deprecated Use AnalyticsData from types/api.types instead */
export type { AnalyticsData };
/** @deprecated Use AppConfig from types/api.types instead */
export type Config = AppConfig;
/** @deprecated Use TobaccoCatalog from types/product.types instead */
export type { TobaccoCatalog };
/** @deprecated Use TobaccoItem from types/product.types instead */
export type { TobaccoItem };

// API functions

// Authentication
export const login = async (username: string, password: string): Promise<AuthResponse> => {
  const response = await api.post<any>('?action=login', { username, password });
  // Handle PHP API response format
  const userData = response.data;
  return {
    success: true,
    user: userData.user || {
      id: 'admin',
      username: userData.username || 'admin',
      email: 'admin@safira-lounge.de',
      role: 'admin',
      isActive: true,
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    token: userData.token,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    permissions: ['products.view', 'products.create', 'products.update', 'products.delete'],
    sessionId: userData.token || Date.now().toString()
  };
};

// Products
export const getProducts = async (): Promise<ProductData> => {
  const response = await api.get<GetProductsResponse>('?action=products');
  return response.data.data || (response.data as unknown as ProductData);
};

export const updateProducts = async (products: ProductData): Promise<ProductData> => {
  const response = await api.put<GetProductsResponse>('/products', products);
  return response.data.data!;
};

export const addProduct = async (
  categoryId: string, 
  product: ProductCreateData, 
  translationOptions?: { translateName: boolean; translateDescription: boolean }
): Promise<Product> => {
  const requestData = {
    ...product,
    ...(translationOptions && { translationOptions })
  };
  const response = await api.post<CreateProductResponse>(`/products/${categoryId}/items`, requestData);
  return response.data.data!.product;
};

export const updateProduct = async (categoryId: string, itemId: string, product: ProductUpdateData): Promise<Product> => {
  // PHP API uses direct product ID in URL, not categoryId/itemId
  const response = await api.put<any>(`/products/${itemId}`, product);
  const data = response.data.data || response.data;
  return data.product || data;
};

export const deleteProduct = async (categoryId: string, itemId: string): Promise<void> => {
  // PHP API uses direct product ID in URL, not categoryId/itemId
  await api.delete<DeleteProductResponse>(`/products/${itemId}`);
};

export const moveProduct = async (fromCategoryId: string, itemId: string, toCategoryId: string): Promise<Product> => {
  // PHP API doesn't support move operation, simulate by update
  const product = await getProduct(itemId);
  const updatedProduct = { ...product, categoryId: toCategoryId };
  return await updateProduct(fromCategoryId, itemId, updatedProduct);
};

// Helper function to get single product
const getProduct = async (productId: string): Promise<Product> => {
  const response = await api.get(`?action=products&id=${productId}`);
  return response.data.data || response.data;
};

// QR Code generation - Mock for PHP compatibility
export const generateQRCode = async (tableId: string, baseUrl?: string): Promise<{
  qrCode: string;
  url: string;
  tableId: string;
}> => {
  // PHP API doesn't have QR generation, return mock data
  const url = `${baseUrl || window.location.origin}?table=${tableId}`;
  return {
    qrCode: `data:image/svg+xml;base64,${btoa(`<svg>QR Code for table ${tableId}</svg>`)}`,
    url,
    tableId
  };
};

// Analytics - Mock for PHP compatibility
export const getAnalytics = async (): Promise<AnalyticsData> => {
  // PHP API doesn't have analytics, return mock data
  return {
    totalViews: 0,
    totalQRScans: 0,
    todayViews: 0,
    deviceInfo: [],
    tableActivity: {},
    recentActivity: []
  };
};

export const trackEvent = async (type: AnalyticsEventType, data: Record<string, unknown>): Promise<void> => {
  // PHP API doesn't have analytics tracking, no-op
  console.log('Analytics tracking (mock):', type, data);
};

// File upload - Mock for PHP compatibility
export const uploadFile = async (file: File): Promise<UploadResult> => {
  // PHP API doesn't have file upload, return mock data
  return {
    url: URL.createObjectURL(file),
    filename: file.name,
    originalName: file.name,
    size: file.size,
    mimeType: file.type
  };
};

// Configuration - Use settings endpoint instead
export const getConfig = async (): Promise<AppConfig> => {
  const response = await api.get<any>('?action=settings');
  const settings = response.data.data || response.data;

  // Convert PHP settings format to AppConfig format
  return {
    siteName: (settings.restaurantName?.de || settings.restaurantName) || 'Safira Lounge',
    address: (settings.address?.de || settings.address) || 'Flensburg, Deutschland',
    phone: settings.phone || '+49 461 123456',
    email: settings.email || 'info@safira-lounge.de',
    hours: settings.openingHours || {
      monday: '18:00-02:00',
      tuesday: '18:00-02:00',
      wednesday: '18:00-02:00',
      thursday: '18:00-02:00',
      friday: '18:00-03:00',
      saturday: '18:00-03:00',
      sunday: '18:00-02:00'
    },
    social: settings.socialMedia || {
      instagram: '@safira_lounge',
      facebook: 'SafiraLounge',
      website: 'https://safira-lounge.de'
    },
    theme: {
      primaryColor: settings.theme?.primaryColor || '#FF41FB',
      secondaryColor: settings.theme?.secondaryColor || '#000000',
      logoUrl: settings.theme?.logoUrl || ''
    },
    features: {
      analytics: false,
      qrCodes: false,
      translations: false,
      uploads: false
    }
  };
};

export const updateConfig = async (config: AppConfig): Promise<AppConfig> => {
  const response = await api.put<UpdateConfigResponse>('/settings', config);
  return config; // Return the sent config as PHP doesn't return it
};

// Health check
export const healthCheck = async (): Promise<HealthCheckResponse> => {
  const response = await api.get<any>('?action=health');
  return response.data.data || response.data;
};

// Utility functions
export const isServerHealthy = async (): Promise<boolean> => {
  try {
    const health = await healthCheck();
    return health.status === 'healthy' || health.status === 'degraded';
  } catch {
    return false;
  }
};

// Translation services - Mock for PHP compatibility
export const translateText = async (text: string, targetLanguages: Language[] = ['da', 'en']): Promise<Record<string, string>> => {
  // PHP API doesn't have translation service, return mock translations
  const translations: Record<string, string> = { de: text };
  targetLanguages.forEach(lang => {
    translations[lang] = `[${lang.toUpperCase()}] ${text}`;
  });
  return translations;
};

export const translateProduct = async (product: ProductUpdateData): Promise<Product> => {
  // PHP API doesn't have translation service, return product as-is
  return product as Product;
};

export const getTranslationStatus = async (): Promise<{ configured: boolean; message: string }> => {
  // PHP API doesn't have translation service
  return {
    configured: false,
    message: 'Translation service not available in PHP API'
  };
};

export const updateProductTranslations = async (
  categoryId: string,
  itemId: string,
  field: 'name' | 'description',
  translations: { de: string; da: string; en: string; tr: string; it: string }
): Promise<Product> => {
  // Use regular product update endpoint
  const updateData = { [field]: translations };
  return await updateProduct(categoryId, itemId, updateData);
};

// Tobacco Catalog API - Mock for PHP compatibility
export const getTobaccoCatalog = async (): Promise<TobaccoCatalog> => {
  // PHP API doesn't have tobacco catalog, return mock data
  return {
    brands: ['Al Fakher', 'Adalya', 'Serbetli', 'Fumari', 'Starbuzz'],
    tobaccos: []
  };
};

export const addBrandToCatalog = async (brand: string): Promise<{ brands: string[] }> => {
  // PHP API doesn't have tobacco catalog, return mock data
  const mockBrands = ['Al Fakher', 'Adalya', 'Serbetli', 'Fumari', 'Starbuzz', brand];
  return { brands: mockBrands };
};

export const addTobaccoToCatalog = async (tobacco: TobaccoItemCreateData): Promise<TobaccoItem> => {
  // PHP API doesn't have tobacco catalog, return mock data
  return {
    id: Date.now().toString(),
    name: tobacco.name,
    brand: tobacco.brand,
    description: tobacco.description,
    price: tobacco.price,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

export const removeTobaccoFromCatalog = async (id: string): Promise<void> => {
  // PHP API doesn't have tobacco catalog, no-op
  console.log('Tobacco catalog removal (mock):', id);
};

export const addTobaccoToMenu = async (
  tobaccoId: string,
  categoryId: string,
  badges?: ProductBadges
): Promise<Product> => {
  // PHP API doesn't have tobacco catalog, create product directly
  const product = {
    name: `Tobacco Product ${tobaccoId}`,
    description: 'Added from tobacco catalog',
    price: 15.99,
    available: true,
    badges: badges || { neu: false, kurze_zeit: false, beliebt: false }
  };
  return await addProduct(categoryId, product);
};

export const syncProductsToTobaccoCatalog = async (): Promise<{ message: string; syncedCount: number; totalTobaccos: number }> => {
  // PHP API doesn't have tobacco catalog sync
  return {
    message: 'Tobacco catalog sync not available in PHP API',
    syncedCount: 0,
    totalTobaccos: 0
  };
};

// Bulk price update for tobacco products
export const bulkUpdateTobaccoPrice = async (categoryId: string, newPrice: number): Promise<BulkPriceUpdateResult> => {
  const response = await api.post<BulkPriceUpdateResponse>('/products/bulk-price-update', {
    categoryId,
    newPrice
  });
  const data = response.data.data!;
  
  // Ensure the response matches BulkPriceUpdateResult interface
  return {
    message: data.message,
    updatedCount: data.updatedCount,
    newPrice: data.newPrice,
    processedCount: data.updatedCount,
    successCount: data.updatedCount,
    failureCount: 0,
    errors: []
  };
};

// Export utilities
export { clearCSRFTokenCache };

// Export the axios instance for custom requests
export default api;