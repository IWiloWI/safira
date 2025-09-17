// Re-export all types for easy importing
export * from './database';
export * from './api';

// Express type extensions
declare global {
  namespace Express {
    interface Request {
      user?: {
        username: string;
        role: string;
        iat?: number;
      };
    }
  }
}

// Environment variable declarations
declare global {
  namespace NodeJS {
    interface ProcessEnv {
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
  }
}