<?php
/**
 * DEBUG VERSION - Products API Endpoint
 * Handles product management with enhanced debugging
 */

// Copy the products endpoint from the working version for basic functionality
// This is primarily to ensure the debug API has all endpoints available

global $dbh;

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getAllProducts($dbh);
        break;

    case 'POST':
        sendError('Products POST not implemented in debug version', 501);
        break;

    default:
        sendError('Method not allowed', 405);
        break;
}

/**
 * Get all products with basic debugging
 */
function getAllProducts($dbh) {
    try {
        $query = "SELECT * FROM products ORDER BY name";
        $stmt = $dbh->prepare($query);
        $stmt->execute();
        $products = $stmt->fetchAll();

        sendJson([
            'products' => $products,
            'debug_info' => [
                'total_products' => count($products),
                'query_executed' => $query,
                'table_columns' => !empty($products) ? array_keys($products[0]) : [],
                'note' => 'This is a basic debug version of products endpoint'
            ]
        ]);

    } catch (PDOException $e) {
        error_log("Database error in getAllProducts: " . $e->getMessage());
        sendError('Failed to fetch products', 500, [
            'database_error' => $e->getMessage()
        ]);
    }
}
?>