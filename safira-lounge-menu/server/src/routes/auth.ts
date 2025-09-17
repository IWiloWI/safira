import { Router, Response } from 'express';
import { 
  AuthenticatedRequest, 
  LoginRequest, 
  LoginResponse,
} from '@/types/api';
import { login } from '@/middleware/auth';
import { authRateLimiter, validateLogin, handleValidationErrors, sanitizeInput } from '@/middleware/security';
import { sendSuccess, sendError, asyncHandler } from '@/utils/responseUtils';

const router = Router();

/**
 * Login endpoint
 */
router.post('/login', 
  authRateLimiter, 
  validateLogin, 
  handleValidationErrors, 
  asyncHandler(async (req: AuthenticatedRequest & { body: LoginRequest }, res: Response) => {
    try {
      const { username, password } = req.body;
      
      // Sanitize inputs
      const cleanUsername = sanitizeInput(username);
      const cleanPassword = password; // Don't sanitize password as it may contain special chars
      
      console.log('🔐 Login attempt for username:', cleanUsername);
      
      const result: LoginResponse = await login(cleanUsername, cleanPassword);
      
      if (result.success) {
        console.log('✅ Login successful for:', cleanUsername);
        sendSuccess(res, {
          token: result.token,
          user: result.user
        }, 'Login successful');
      } else {
        console.log('❌ Login failed for:', cleanUsername);
        sendError(res, result.error || 'Login failed', 401);
      }
    } catch (error) {
      console.error('Login error:', error);
      sendError(res, 'Login failed', 500);
    }
  })
);

export default router;