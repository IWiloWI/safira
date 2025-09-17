const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// JWT Secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';

// Admin credentials from environment
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD ? 
  bcrypt.hashSync(process.env.ADMIN_PASSWORD, 12) : 
  bcrypt.hashSync('defaultpassword', 12);

/**
 * Generate JWT token
 */
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify JWT token
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Authentication middleware
 */
function authenticate(req, res, next) {
  const authHeader = req.header('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Access denied. No token provided.' 
    });
  }

  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid token.' 
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(401).json({ 
      success: false, 
      error: 'Token validation failed.' 
    });
  }
}

/**
 * Login function
 */
async function login(username, password) {
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
      role: 'admin',
      iat: Date.now()
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
async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

module.exports = {
  authenticate,
  generateToken,
  verifyToken,
  login,
  hashPassword
};