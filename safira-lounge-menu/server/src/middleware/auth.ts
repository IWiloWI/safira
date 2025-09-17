import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, JWTPayload, LoginResponse } from '@/types/api';

// JWT Secret from environment variables
const JWT_SECRET: string = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '15m';

// Admin credentials from environment
const ADMIN_USERNAME: string = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH: string = process.env.ADMIN_PASSWORD ? 
  bcrypt.hashSync(process.env.ADMIN_PASSWORD, 12) : 
  bcrypt.hashSync('defaultpassword', 12);

/**
 * Generate JWT token
 */
export function generateToken(payload: Omit<JWTPayload, 'iat'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Authentication middleware
 */
export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.header('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
  if (!token) {
    res.status(401).json({ 
      success: false, 
      error: 'Access denied. No token provided.' 
    });
    return;
  }

  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      res.status(401).json({ 
        success: false, 
        error: 'Invalid token.' 
      });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error instanceof Error ? error.message : 'Unknown error');
    res.status(401).json({ 
      success: false, 
      error: 'Token validation failed.' 
    });
  }
}

/**
 * Login function
 */
export async function login(username: string, password: string): Promise<LoginResponse> {
  try {
    // Check if username matches
    if (username !== ADMIN_USERNAME) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    if (!isPasswordValid) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Generate token
    const token = generateToken({ 
      username, 
      role: 'admin'
    });

    return { 
      success: true, 
      token,
      user: { username, role: 'admin' }
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Login failed' };
  }
}

/**
 * Password hash utility
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Password comparison utility
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}