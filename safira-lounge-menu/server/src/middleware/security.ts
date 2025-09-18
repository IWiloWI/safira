import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { body, validationResult, ValidationChain, ValidationError as ExpressValidationError } from 'express-validator';
const Tokens = require('csrf');
import { Request, Response, NextFunction } from 'express';
import { RateLimitConfig, FileUploadConfig, CORSConfig, ValidationErrorResponse } from '@/types/api';

/**
 * Security headers middleware
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      mediaSrc: ["'self'", "blob:"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

/**
 * Rate limiting middleware
 */
const rateLimitConfig: RateLimitConfig = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    success: false
  },
  standardHeaders: true,
  legacyHeaders: false,
};

export const rateLimiter = rateLimit(rateLimitConfig);

/**
 * Stricter rate limiting for auth endpoints
 */
const authRateLimitConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth
  message: {
    error: 'Too many login attempts, please try again later.',
    success: false
  },
  standardHeaders: true,
  legacyHeaders: false,
};

export const authRateLimiter = rateLimit(authRateLimitConfig);

/**
 * Input validation middleware
 */
export const validateLogin: ValidationChain[] = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-50 characters and contain only letters, numbers, and underscores'),
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be 6-128 characters long'),
];

export const validateProduct: ValidationChain[] = [
  body('name')
    .custom((value) => {
      if (typeof value === 'string') {
        return value.trim().length >= 1 && value.trim().length <= 200;
      }
      if (typeof value === 'object' && value !== null) {
        return value.de && value.de.trim().length >= 1 && value.de.trim().length <= 200;
      }
      return false;
    })
    .withMessage('Product name is required and must be less than 200 characters'),
  body('price')
    .isFloat({ min: 0, max: 9999.99 })
    .withMessage('Price must be a valid number between 0 and 9999.99'),
];

export const validateCategory: ValidationChain[] = [
  body('name')
    .custom((value) => {
      if (typeof value === 'object' && value !== null) {
        return value.de && value.de.trim().length >= 1 && value.de.trim().length <= 100;
      }
      return false;
    })
    .withMessage('Category name is required and must be less than 100 characters'),
  body('id')
    .trim()
    .isLength({ min: 1, max: 50 })
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Category ID must contain only letters, numbers, hyphens, and underscores'),
];

/**
 * Handle validation errors
 */
export function handleValidationErrors(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const expressErrors = errors.array() as ExpressValidationError[];
    const formattedErrors = expressErrors.map((err: any) => ({
      type: err.type || 'field',
      value: err.value,
      msg: err.msg,
      path: err.path || err.param,
      location: err.location || 'body'
    }));
    const response: ValidationErrorResponse = {
      success: false,
      error: 'Validation failed',
      details: formattedErrors
    };
    res.status(400).json(response);
    return;
  }
  next();
}

/**
 * Secure CORS configuration
 */
export const corsOptions: CORSConfig = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void): void {
    // Allow all origins in development mode
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-csrf-token'],
};

/**
 * File upload security
 */
export const fileUploadSecurity: FileUploadConfig = {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit instead of 100MB
    files: 1,
  },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, acceptFile?: boolean) => void): void => {
    // Check file type
    const allowedMimeTypes: string[] = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/webm'
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      cb(new Error('Invalid file type. Only images and videos are allowed.'));
      return;
    }

    // Additional security: check file extension
    const allowedExtensions: string[] = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.webm'];
    const fileExtension = file.originalname.toLowerCase().slice(-5);
    const hasValidExtension = allowedExtensions.some(ext => fileExtension.endsWith(ext));

    if (!hasValidExtension) {
      cb(new Error('Invalid file extension.'));
      return;
    }

    cb(null, true);
  }
};

/**
 * SQL Injection prevention helper
 */
export function sanitizeInput(input: unknown): string {
  if (typeof input !== 'string') return String(input || '');
  
  // Remove potentially dangerous characters
  return input
    .replace(/['"\\;]/g, '') // Remove quotes, backslashes, semicolons
    .trim()
    .substring(0, 1000); // Limit length
}

/**
 * XSS Prevention helper
 */
export function sanitizeHtml(input: unknown): string {
  if (typeof input !== 'string') return String(input || '');
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * CSRF Protection setup
 */
const csrfTokens = new Tokens();

const csrfSecret: string = process.env.CSRF_SECRET || 'your-csrf-secret-key-change-in-production';

export function generateCSRFToken(): string {
  return csrfTokens.create(csrfSecret);
}

export function verifyCSRFToken(token: string): boolean {
  return csrfTokens.verify(csrfSecret, token);
}

export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  // Skip CSRF for GET requests and auth endpoints
  if (req.method === 'GET' || req.path === '/api/auth/login') {
    next();
    return;
  }

  const token = req.headers['x-csrf-token'] as string || req.body._csrf as string;
  
  if (!token || !verifyCSRFToken(token)) {
    res.status(403).json({
      success: false,
      error: 'Invalid CSRF token'
    });
    return;
  }

  next();
}

/**
 * Type guard for checking if error is a multer error
 */
export function isMulterError(error: any): error is Error & { code: string } {
  return error && typeof error.code === 'string';
}