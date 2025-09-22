<?php
/**
 * Safira Lounge API Router
 * Routes requests to appropriate endpoints
 */

require_once 'config.php';
setCorsHeaders();

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remove base path if present
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

    case 'health':
        sendJson(['status' => 'OK', 'database' => 'connected', 'timestamp' => date('c')]);
        break;

    default:
        sendError('Endpoint not found', 404);
}
?>