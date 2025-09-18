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

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

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

// Function to fetch CSRF token
const getCSRFToken = async (): Promise<string> => {
  if (csrfTokenCache) {
    return csrfTokenCache;
  }
  
  if (csrfTokenPromise) {
    return csrfTokenPromise;
  }
  
  csrfTokenPromise = fetch(`${API_BASE_URL}/csrf`)
    .then(response => response.json())
    .then(data => {
      csrfTokenCache = data.token;
      csrfTokenPromise = null;
      return data.token;
    })
    .catch(error => {
      console.error('Failed to get CSRF token:', error);
      csrfTokenPromise = null;
      throw error;
    });
  
  return csrfTokenPromise;
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
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
  const response = await api.post<LoginResponse>('/auth/login', { username, password });
  return response.data.data!;
};

// Products
export const getProducts = async (): Promise<ProductData> => {
  const response = await api.get<GetProductsResponse>('/products');
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
  const response = await api.put<UpdateProductResponse>(`/products/${categoryId}/items/${itemId}`, product);
  return response.data.data!.product;
};

export const deleteProduct = async (categoryId: string, itemId: string): Promise<void> => {
  await api.delete<DeleteProductResponse>(`/products/${categoryId}/items/${itemId}`);
};

export const moveProduct = async (fromCategoryId: string, itemId: string, toCategoryId: string): Promise<Product> => {
  const response = await api.put<MoveProductResponse>(`/products/move/${fromCategoryId}/${itemId}/${toCategoryId}`);
  return response.data.data!.product;
};

// QR Code generation
export const generateQRCode = async (tableId: string, baseUrl?: string): Promise<{
  qrCode: string;
  url: string;
  tableId: string;
}> => {
  const request: GenerateQRRequest = { tableId, baseUrl };
  const response = await api.post<GenerateQRResponse>('/qr/generate', request);
  return response.data.data!;
};

// Analytics
export const getAnalytics = async (): Promise<AnalyticsData> => {
  const response = await api.get<GetAnalyticsResponse>('/analytics');
  return response.data.data!;
};

export const trackEvent = async (type: AnalyticsEventType, data: Record<string, unknown>): Promise<void> => {
  const request: TrackEventRequest = { type, data };
  await api.post<TrackEventResponse>('/analytics/track', request);
};

// File upload
export const uploadFile = async (file: File): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post<UploadFileResponse>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data.data!;
};

// Configuration
export const getConfig = async (): Promise<AppConfig> => {
  const response = await api.get<GetConfigResponse>('/config');
  return response.data.data!;
};

export const updateConfig = async (config: AppConfig): Promise<AppConfig> => {
  const response = await api.put<UpdateConfigResponse>('/config', config);
  return response.data.data!.config;
};

// Health check
export const healthCheck = async (): Promise<HealthCheckResponse> => {
  const response = await api.get<ApiResponse<HealthCheckResponse>>('/health');
  return response.data.data!;
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

// Translation services
export const translateText = async (text: string, targetLanguages: Language[] = ['da', 'en']): Promise<Record<string, string>> => {
  const response = await api.post<TranslateTextResponse>('/translate', { text, targetLanguages });
  return response.data.data!.translations;
};

export const translateProduct = async (product: ProductUpdateData): Promise<Product> => {
  const response = await api.post<TranslateProductResponse>('/translate/product', { product });
  return response.data.data!.product;
};

export const getTranslationStatus = async (): Promise<{ configured: boolean; message: string }> => {
  const response = await api.get<TranslationStatusResponse>('/translate/status');
  return response.data.data!;
};

export const updateProductTranslations = async (
  categoryId: string, 
  itemId: string, 
  field: 'name' | 'description', 
  translations: { de: string; da: string; en: string; tr: string; it: string }
): Promise<Product> => {
  const request: TranslationUpdateRequest = { field, translations };
  const response = await api.put<UpdateTranslationsResponse>(`/products/${categoryId}/items/${itemId}/translations`, request);
  return response.data.data!.product;
};

// Tobacco Catalog API
export const getTobaccoCatalog = async (): Promise<TobaccoCatalog> => {
  const response = await api.get<GetTobaccoCatalogResponse>('/tobacco-catalog');
  return response.data.data!;
};

export const addBrandToCatalog = async (brand: string): Promise<{ brands: string[] }> => {
  const response = await api.post<AddBrandResponse>('/tobacco-catalog/brands', { brand });
  return response.data.data!;
};

export const addTobaccoToCatalog = async (tobacco: TobaccoItemCreateData): Promise<TobaccoItem> => {
  const response = await api.post<AddTobaccoResponse>('/tobacco-catalog/tobaccos', tobacco);
  return response.data.data!.tobacco;
};

export const removeTobaccoFromCatalog = async (id: string): Promise<void> => {
  await api.delete(`/tobacco-catalog/tobaccos/${id}`);
};

export const addTobaccoToMenu = async (
  tobaccoId: string, 
  categoryId: string, 
  badges?: ProductBadges
): Promise<Product> => {
  const response = await api.post<CreateProductResponse>('/tobacco-catalog/add-to-menu', {
    tobaccoId,
    categoryId,
    badges
  });
  return response.data.data!.product;
};

export const syncProductsToTobaccoCatalog = async (): Promise<{ message: string; syncedCount: number; totalTobaccos: number }> => {
  const response = await api.post<SyncTobaccoResponse>('/tobacco-catalog/sync-products');
  return response.data.data!;
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