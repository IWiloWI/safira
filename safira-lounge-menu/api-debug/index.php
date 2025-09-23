<?php
/**
 * DEBUG VERSION - Safira Lounge API Router
 * Routes requests to appropriate endpoints with enhanced debugging
 */

require_once 'config.php';
setCorsHeaders();

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remove base path if present
$path = preg_replace('#^/api-debug#', '', $path);
$path = preg_replace('#^/api#', '', $path);
$path = trim($path, '/');

// Parse path segments
$segments = explode('/', $path);
$endpoint = $segments[0] ?? '';

// Route to appropriate endpoint
switch ($endpoint) {
    case 'products':
        require_once 'endpoints/products.php';
        break;

    case 'categories':
        require_once 'endpoints/categories.php';
        break;

    case 'auth':
        require_once 'endpoints/auth.php';
        break;

    case 'settings':
        require_once 'endpoints/settings.php';
        break;

    case 'debug':
        require_once 'endpoints/debug.php';
        break;

    case 'health':
        $tables = getDatabaseTables($dbh);
        sendJson([
            'status' => 'OK',
            'database' => 'connected',
            'timestamp' => date('c'),
            'database_info' => [
                'host' => 'db5018522360.hosting-data.io',
                'database' => 'dbs14708743',
                'tables' => $tables
            ]
        ]);
        break;

    case '':
        // Root endpoint - show API info
        sendJson([
            'message' => 'Safira Lounge API - DEBUG VERSION',
            'version' => 'debug-v1.0.0',
            'endpoints' => [
                '/products',
                '/categories',
                '/auth',
                '/settings',
                '/debug',
                '/health'
            ],
            'debug_features' => [
                'Enhanced error reporting',
                'Database schema inspection',
                'Column structure analysis',
                'Table information display'
            ]
        ]);
        break;

    default:
        sendError('Endpoint not found', 404, [
            'requested_endpoint' => $endpoint,
            'available_endpoints' => ['products', 'categories', 'auth', 'settings', 'debug', 'health'],
            'full_path' => $path,
            'segments' => $segments
        ]);
}
?>