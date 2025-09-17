const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const csrf = require('csrf');

/**
 * Security headers middleware
 */
const securityHeaders = helmet({
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
const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // increase limit for development
  message: {
    error: 'Too many requests from this IP, please try again later.',
    success: false
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Stricter rate limiting for auth endpoints
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth
  message: {
    error: 'Too many login attempts, please try again later.',
    success: false
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Input validation middleware
 */
const validateLogin = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-50 characters and contain only letters, numbers, and underscores'),
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be 6-128 characters long'),
];

const validateProduct = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Product name is required and must be less than 200 characters'),
  body('price')
    .isFloat({ min: 0, max: 9999.99 })
    .withMessage('Price must be a valid number between 0 and 9999.99'),
  body('category_id')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category ID is required'),
];

const validateCategory = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
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
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
}

/**
 * Secure CORS configuration
 */
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5001', // Allow backend self-requests for admin panel
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:5001', // Allow backend self-requests for admin panel
      process.env.REACT_APP_BASE_URL
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-csrf-token'],
};

/**
 * File upload security
 */
const fileUploadSecurity = {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit instead of 100MB
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/webm'
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only images and videos are allowed.'));
    }

    // Additional security: check file extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.webm'];
    const fileExtension = file.originalname.toLowerCase().slice(-5);
    const hasValidExtension = allowedExtensions.some(ext => fileExtension.endsWith(ext));

    if (!hasValidExtension) {
      return cb(new Error('Invalid file extension.'));
    }

    cb(null, true);
  }
};

/**
 * SQL Injection prevention helper
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  // Remove potentially dangerous characters
  return input
    .replace(/['"\\;]/g, '') // Remove quotes, backslashes, semicolons
    .trim()
    .substring(0, 1000); // Limit length
}

/**
 * XSS Prevention helper
 */
function sanitizeHtml(input) {
  if (typeof input !== 'string') return input;
  
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
const csrfTokens = csrf({
  saltLength: 20,
  secretLength: 32,
});

const csrfSecret = process.env.CSRF_SECRET || 'your-csrf-secret-key-change-in-production';

function generateCSRFToken() {
  return csrfTokens.create(csrfSecret);
}

function verifyCSRFToken(token) {
  return csrfTokens.verify(csrfSecret, token);
}

function csrfProtection(req, res, next) {
  // Skip CSRF for GET requests and auth endpoints
  if (req.method === 'GET' || req.path === '/api/auth/login') {
    return next();
  }

  const token = req.headers['x-csrf-token'] || req.body._csrf;
  
  if (!token || !verifyCSRFToken(token)) {
    return res.status(403).json({
      success: false,
      error: 'Invalid CSRF token'
    });
  }

  next();
}

module.exports = {
  securityHeaders,
  rateLimiter,
  authRateLimiter,
  validateLogin,
  validateProduct,
  validateCategory,
  handleValidationErrors,
  corsOptions,
  fileUploadSecurity,
  sanitizeInput,
  sanitizeHtml,
  generateCSRFToken,
  verifyCSRFToken,
  csrfProtection
};