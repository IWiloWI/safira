import { Request, Response, NextFunction } from 'express';
import { MultilingualText, Product, Category, Analytics, AppConfig, TobaccoCatalog } from './database';

// Extended Request types
export interface AuthenticatedRequest extends Request {
  user?: {
    username: string;
    role: string;
    iat?: number;
  };
}

// API Response types
export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: any;
}

export interface ApiError {
  success: false;
  error: string;
  details?: any;
}

export interface ApiSuccess<T = any> {
  success: true;
  message?: string;
  data?: T;
}

// Authentication types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    username: string;
    role: string;
  };
  error?: string;
}

export interface JWTPayload {
  username: string;
  role: string;
  iat: number;
}

// Product API types
export interface CreateProductRequest {
  name: string | MultilingualText;
  description?: string | MultilingualText;
  price: number;
  imageUrl?: string;
  available?: boolean;
  badges?: {
    neu?: boolean;
    kurze_zeit?: boolean;
    beliebt?: boolean;
  };
  brand?: string;
  translationOptions?: {
    translateName?: boolean;
    translateDescription?: boolean;
  };
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id?: string;
}

export interface ProductsResponse {
  categories: Category[];
}

// Category API types
export interface CreateCategoryRequest {
  id: string;
  name: MultilingualText;
  icon: string;
  description?: MultilingualText;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}

// Translation API types
export interface TranslationRequest {
  text: string;
  targetLanguages?: string[];
}

export interface TranslationResponse {
  translations: MultilingualText;
}

export interface ProductTranslationRequest {
  product: Product;
}

export interface ProductTranslationResponse {
  product: Product;
}

export interface TranslationFieldUpdateRequest {
  field: 'name' | 'description';
  translations: MultilingualText;
}

// Upload API types
export interface FileUploadResponse {
  message: string;
  url: string;
  filename: string;
  originalName: string;
}

// QR Code API types
export interface QRCodeRequest {
  tableId: string;
  baseUrl?: string;
}

export interface QRCodeResponse {
  qrCode: string;
  url: string;
  tableId: string;
  message: string;
}

// Analytics API types
export interface AnalyticsTrackRequest {
  type: 'page_view' | 'qr_scan' | 'device_info' | 'product_availability_changed' | 'product_created' | 'product_updated' | 'product_deleted' | 'bulk_price_update';
  data: Record<string, any>;
}

export interface AnalyticsResponse {
  totalViews: number;
  totalQRScans: number;
  todayViews: number;
  deviceInfo: any[];
  tableActivity: Record<string, number>;
  recentActivity: any[];
}

// Tobacco Catalog API types
export interface TobaccoAddRequest {
  brand?: string;
}

export interface TobaccoCreateRequest {
  id?: string;
  name: string;
  description?: string;
  brand: string;
  price: number;
}

export interface TobaccoAddToMenuRequest {
  tobaccoId: string;
  categoryId: string;
  badges?: {
    neu?: boolean;
    kurze_zeit?: boolean;
    beliebt?: boolean;
  };
}

export interface BulkPriceUpdateRequest {
  categoryId: string;
  newPrice: number;
}

export interface BulkPriceUpdateResponse {
  message: string;
  updatedCount: number;
  newPrice: number;
}

// Validation types
export interface ValidationError {
  type: string;
  value: any;
  msg: string;
  path: string;
  location: string;
}

export interface ValidationErrorResponse {
  success: false;
  error: string;
  details: ValidationError[];
}

// Middleware types
export type AuthMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => void | Promise<void>;
export type ApiMiddleware = (req: Request, res: Response, next: NextFunction) => void | Promise<void>;

// Route handler types
export type AuthenticatedRouteHandler<TReq = any, TRes = any> = (
  req: AuthenticatedRequest & { body: TReq },
  res: Response<TRes | ApiError>
) => void | Promise<void>;

export type RouteHandler<TReq = any, TRes = any> = (
  req: Request & { body: TReq },
  res: Response<TRes | ApiError>
) => void | Promise<void>;

// Server-Sent Events types
export interface SSEMessage {
  type: string;
  data?: any;
  message?: string;
}

// Rate limiting types
export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: {
    error: string;
    success: boolean;
  };
  standardHeaders: boolean;
  legacyHeaders: boolean;
}

// CSRF types
export interface CSRFConfig {
  saltLength: number;
  secretLength: number;
}

// File upload security types
export interface FileUploadConfig {
  limits: {
    fileSize: number;
    files: number;
  };
  fileFilter: (req: Request, file: Express.Multer.File, cb: (error: Error | null, acceptFile?: boolean) => void) => void;
}

// CORS configuration type
export interface CORSConfig {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void;
  credentials: boolean;
  methods: string[];
  allowedHeaders: string[];
}

// Environment variables type
export interface Environment {
  NODE_ENV?: string;
  SERVER_PORT?: string;
  DB_HOST?: string;
  DB_PORT?: string;
  DB_USER?: string;
  DB_PASSWORD?: string;
  DB_NAME?: string;
  JWT_SECRET?: string;
  JWT_EXPIRES_IN?: string;
  ADMIN_USERNAME?: string;
  ADMIN_PASSWORD?: string;
  OPENAI_API_KEY?: string;
  CSRF_SECRET?: string;
  RATE_LIMIT_WINDOW_MS?: string;
  RATE_LIMIT_MAX_REQUESTS?: string;
  REACT_APP_BASE_URL?: string;
  NETWORK_IP?: string;
}