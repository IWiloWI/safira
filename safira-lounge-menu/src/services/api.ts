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

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://test.safira-lounge.de/safira-api-fixed.php';

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
  const response = await api.post<any>('', { username, password }, {
    params: { action: 'login' }
  });
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
  const response = await api.get<GetProductsResponse>('', {
    params: { action: 'products' }
  });
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
  // Transform product data to match PHP API format
  // The PHP API handles the subcategory logic itself
  let requestData: any = {
    category_id: categoryId, // Pass the category_id as-is, PHP will handle subcat_ prefix
    price: product.price,
    image: product.imageUrl || '',
    available: product.available,
    badges: product.badges,
    brand: product.brand || '', // Add brand field
    is_tobacco: product.isTobacco || false, // Add tobacco flag
    ...(translationOptions && { translationOptions })
  };

  // 🔍 DEBUG: Check if product has sizes/variants
  console.log('🎯 API SERVICE DEBUG - Checking for variants in product data:', product);

  // Add sizes/variants if they exist
  if (product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0) {
    console.log('🎯 API SERVICE - Adding variants to request:', product.sizes);
    requestData.sizes = product.sizes;
  } else {
    console.log('🎯 API SERVICE - No variants found, using single price');
  }

  // The PHP API expects name and description as objects for validation
  // but processes the individual language fields from those objects
  if (typeof product.name === 'object' && product.name !== null) {
    requestData.name = product.name; // Send as object for PHP validation
  } else {
    requestData.name = product.name as string || ''; // Send as string for PHP validation
  }

  if (typeof product.description === 'object' && product.description !== null) {
    requestData.description = product.description; // Send as object for PHP validation
  } else {
    requestData.description = product.description as string || ''; // Send as string for PHP validation
  }

  console.log(`🆕 API: Creating product in category ${categoryId}`);
  console.log(`🔗 URL: ${API_BASE_URL}?action=create_product`);
  console.log(`📝 Final request data with sizes:`, requestData);

  // PHP API uses query parameters for create action
  // Use empty string as path since baseURL already contains the PHP file
  const response = await api.post<any>(``, requestData, {
    params: { action: 'create_product' }
  });
  const data = response.data.data || response.data;
  return data.product || data;
};

export const updateProduct = async (categoryId: string, itemId: string, product: ProductUpdateData): Promise<Product> => {
  // 🔍 DEBUG: Log update request
  console.log('🔄 API SERVICE - updateProduct called for ID:', itemId);
  console.log('🔄 API SERVICE - categoryId:', categoryId);
  console.log('🔄 API SERVICE - Update data:', product);

  // Transform update data similar to create - handle variants
  let requestData: any = {
    ...product,
    brand: product.brand || '', // Add brand field
    is_tobacco: product.isTobacco || false // Add tobacco flag
  };

  // Add sizes/variants if they exist
  if (product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0) {
    console.log('🎯 API SERVICE UPDATE - Adding variants to request:', product.sizes);
    requestData.sizes = product.sizes;
  } else {
    console.log('🎯 API SERVICE UPDATE - No variants found, using single price');
  }

  console.log('🔄 API SERVICE - Final update request data:', requestData);
  console.log(`🌐 API SERVICE - Making POST request to: ${API_BASE_URL}?action=update_product&id=${itemId}`);

  try {
    // Use the PHP API endpoint for updating products
    const response = await api.post('', requestData, {
      params: {
        action: 'update_product',
        id: itemId
      }
    });

    console.log('📥 API SERVICE - Response received:', response.data);

    const data = response.data;
    if (!data.success) {
      console.error('🔄 API SERVICE UPDATE - Server returned error:', data);
      throw new Error(data.error || 'Failed to update product');
    }

    console.log('✅ API SERVICE - Update successful, returning product data');
    return data.product || data;
  } catch (error: any) {
    // Handle axios errors (like 500 status)
    console.error('❌ API SERVICE - Update failed with error:', error);
    if (error.response?.data) {
      console.error('🔄 API SERVICE UPDATE - Error response data:', error.response.data);
      if (error.response.data.debug_messages) {
        console.error('🔄 API SERVICE UPDATE - Debug messages:', error.response.data.debug_messages);
      }
      if (error.response.data.debug) {
        console.error('🔄 API SERVICE UPDATE - Debug info:', error.response.data.debug);
      }
    }
    throw error;
  }
};

export const updateProductSubcategory = async (productId: string, subcategoryId: string): Promise<Product> => {
  // Use the PHP API endpoint for updating product subcategory
  const response = await api.post('', {
    subcategory_id: subcategoryId.replace('subcat_', '') // Remove prefix for database
  }, {
    params: {
      action: 'update_product',
      id: productId
    }
  });

  const data = response.data;
  if (!data.success) {
    throw new Error(data.error || 'Failed to update product');
  }

  return data.product;
};

export const deleteProduct = async (categoryId: string, itemId: string): Promise<void> => {
  try {
    console.log(`🔥 API: Sending DELETE request for product ${itemId}`);
    console.log(`🔗 URL: ${API_BASE_URL}?action=delete_product&id=${itemId}`);

    // PHP API uses query parameters for delete action
    const response = await api.delete<DeleteProductResponse>('', {
      params: { action: 'delete_product', id: itemId }
    });
    console.log(`✅ API: DELETE response received:`, response);

    // Check if response indicates success
    if (response.status && response.status >= 400) {
      throw new Error(`API returned error status: ${response.status}`);
    }
  } catch (error) {
    console.error(`❌ API: Failed to delete product ${itemId}:`, error);
    throw error;
  }
};

export const moveProduct = async (fromCategoryId: string, itemId: string, toCategoryId: string): Promise<Product> => {
  // PHP API doesn't support move operation, simulate by update
  const product = await getProduct(itemId);
  const updatedProduct = { ...product, categoryId: toCategoryId };
  return await updateProduct(fromCategoryId, itemId, updatedProduct);
};

// Helper function to get single product
const getProduct = async (productId: string): Promise<Product> => {
  const response = await api.get('', {
    params: { action: 'products', id: productId }
  });
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
  const response = await api.get<any>('', {
    params: { action: 'settings' }
  });
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
  const response = await api.get<any>('', {
    params: { action: 'health' }
  });
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

// Translation services - Real ChatGPT translation via PHP API
export const translateText = async (text: string, targetLanguages: Language[] = ['da', 'en', 'tr']): Promise<Record<string, string>> => {
  try {
    // Use PHP API for translation
    const response = await api.post('', {
      text,
      targetLanguages
    }, {
      params: { action: 'translation' }
    });

    if (response.data && response.data.data && response.data.data.translations) {
      return response.data.data.translations;
    }
  } catch (error) {
    console.log('PHP translation failed, using fallback:', error);
  }

  // Fallback: Simple translations
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
  translations: Record<string, string>
): Promise<Product> => {
  // Use regular product update endpoint
  const updateData = { [field]: translations };
  return await updateProduct(categoryId, itemId, updateData);
};

// Tobacco Catalog API - Real implementation using PHP backend
export const getTobaccoCatalog = async (): Promise<TobaccoCatalog> => {
  try {
    const response = await api.get('', {
      params: { action: 'tobacco_catalog' }
    });

    const data = response.data.data || response.data;
    return {
      brands: data.brands || [],
      tobaccos: data.tobaccos || []
    };
  } catch (error) {
    console.error('Failed to load tobacco catalog:', error);
    // Return fallback data on error
    return {
      brands: ['Al Fakher', 'Adalya', 'Serbetli', 'Fumari', 'Starbuzz'],
      tobaccos: []
    };
  }
};

export const addBrandToCatalog = async (brand: string): Promise<{ brands: string[] }> => {
  try {
    const response = await api.post('', {
      brand: brand.trim()
    }, {
      params: { action: 'add_tobacco_brand' }
    });

    const data = response.data.data || response.data;
    return {
      brands: data.brands || []
    };
  } catch (error) {
    console.error('Failed to add brand to catalog:', error);
    throw error;
  }
};

export const addTobaccoToCatalog = async (tobacco: TobaccoItemCreateData): Promise<TobaccoItem> => {
  try {
    const response = await api.post('', {
      name: tobacco.name,
      brand: tobacco.brand,
      description: tobacco.description || '',
      price: tobacco.price || 0
    }, {
      params: { action: 'add_tobacco_catalog' }
    });

    const data = response.data.data || response.data;
    return {
      id: data.id || Date.now().toString(),
      name: data.name || tobacco.name,
      brand: data.brand || tobacco.brand,
      description: data.description || tobacco.description,
      price: data.price || tobacco.price,
      createdAt: data.created_at || new Date().toISOString(),
      updatedAt: data.updated_at || new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to add tobacco to catalog:', error);
    throw error;
  }
};

export const removeTobaccoFromCatalog = async (id: string): Promise<void> => {
  try {
    await api.delete('', {
      params: { action: 'delete_tobacco_catalog', id }
    });
  } catch (error) {
    console.error('Failed to remove tobacco from catalog:', error);
    throw error;
  }
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
  try {
    const response = await api.post('', {}, {
      params: { action: 'sync_tobacco_catalog' }
    });

    const data = response.data.data || response.data;
    return {
      message: data.message || 'Sync completed',
      syncedCount: data.syncedCount || 0,
      totalTobaccos: data.totalTobaccos || 0
    };
  } catch (error) {
    console.error('Failed to sync tobacco catalog:', error);
    throw error;
  }
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

// Auto-translation functions
export const autoTranslateMissingContent = async (languageCode: string): Promise<{
  success: boolean;
  message: string;
  translated_count: number;
  errors: string[];
}> => {
  try {
    const response = await api.post('', {
      languageCode
    }, {
      params: { action: 'auto_translate_missing' }
    });

    return response.data;
  } catch (error) {
    console.error('Failed to auto-translate missing content:', error);
    throw error;
  }
};

export const getActiveLanguages = async (): Promise<{
  active_languages: Array<{code: string, name: string, flag: string}>;
  language_codes: string[];
}> => {
  try {
    const response = await api.get('', {
      params: { action: 'get_active_languages' }
    });

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error('Failed to get active languages');
    }
  } catch (error) {
    console.error('Failed to get active languages:', error);
    // Fallback to default languages
    return {
      active_languages: [
        {code: 'de', name: 'Deutsch', flag: '🇩🇪'},
        {code: 'en', name: 'English', flag: '🇬🇧'},
        {code: 'da', name: 'Dansk', flag: '🇩🇰'}
      ],
      language_codes: ['de', 'en', 'da']
    };
  }
};

// Debug function for tobacco system
export const debugTobaccoSystem = async () => {
  try {
    console.log('🔍 DEBUG: Calling tobacco system debug...');
    const response = await api.get('', { params: { action: 'debug_tobacco_system' } });
    console.log('🔍 DEBUG: Tobacco system response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ DEBUG: Failed to debug tobacco system:', error);
    throw error;
  }
};

// Sync existing tobacco products to catalog
export const syncExistingTobacco = async () => {
  try {
    console.log('🔄 SYNC: Syncing existing tobacco products...');
    const response = await api.post('', { action: 'sync_existing_tobacco' });
    console.log('🔄 SYNC: Sync response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ SYNC: Failed to sync tobacco products:', error);
    throw error;
  }
};

// Export the axios instance for custom requests
export default api;