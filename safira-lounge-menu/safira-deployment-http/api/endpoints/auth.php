<?php
/**
 * Authentication API Endpoint
 * Handles admin login/logout
 */

global $dbh;

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        $path = $_SERVER['REQUEST_URI'];
        if (strpos($path, '/login') !== false) {
            login($dbh);
        } elseif (strpos($path, '/logout') !== false) {
            logout();
        } else {
            sendError('Invalid auth endpoint', 400);
        }
        break;

    case 'GET':
        // GET /api/auth/verify - Verify token
        verifyToken();
        break;

    default:
        sendError('Method not allowed', 405);
        break;
}

/**
 * Admin login
 */
function login($dbh) {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input || !isset($input['username']) || !isset($input['password'])) {
        sendError('Username and password required', 400);
    }

    $username = $input['username'];
    $password = $input['password'];

    // For now, use simple hardcoded admin credentials
    // TODO: Store in database with proper hashing
    $adminUsername = 'admin';
    $adminPassword = 'safira2024'; // Change this!

    if ($username === $adminUsername && $password === $adminPassword) {
        // Generate simple token (in production, use JWT)
        $token = bin2hex(random_bytes(32));

        // Store token in session or database
        session_start();
        $_SESSION['auth_token'] = $token;
        $_SESSION['user_id'] = 'admin';
        $_SESSION['login_time'] = time();

        sendJson([
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => 'admin',
                'username' => $adminUsername,
                'role' => 'admin'
            ]
        ]);
    } else {
        sendError('Invalid credentials', 401);
    }
}

/**
 * Admin logout
 */
function logout() {
    session_start();
    session_destroy();
    sendJson(['message' => 'Logout successful']);
}

/**
 * Verify authentication token
 */
function verifyToken() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

    if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        sendError('No token provided', 401);
    }

    $token = $matches[1];

    session_start();
    if (!isset($_SESSION['auth_token']) || $_SESSION['auth_token'] !== $token) {
        sendError('Invalid token', 401);
    }

    // Check if token is not too old (24 hours)
    if (time() - $_SESSION['login_time'] > 86400) {
        session_destroy();
        sendError('Token expired', 401);
    }

    sendJson([
        'valid' => true,
        'user' => [
            'id' => $_SESSION['user_id'],
            'username' => 'admin',
            'role' => 'admin'
        ]
    ]);
}

/**
 * Middleware function to check authentication
 */
function requireAuth() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

    if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        sendError('Authentication required', 401);
    }

    $token = $matches[1];

    session_start();
    if (!isset($_SESSION['auth_token']) || $_SESSION['auth_token'] !== $token) {
        sendError('Invalid token', 401);
    }

    // Check if token is not too old
    if (time() - $_SESSION['login_time'] > 86400) {
        session_destroy();
        sendError('Token expired', 401);
    }

    return true;
}
?>