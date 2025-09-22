<?php
// Direct products endpoint
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://test.safira-lounge.de');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Database connection
require_once 'config.php';

try {
    // Get all products with categories
    $query = "
        SELECT
            p.*,
            c.name as category_name,
            c.icon as category_icon
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY c.display_order, p.display_order
    ";

    $stmt = $dbh->prepare($query);
    $stmt->execute();
    $products = $stmt->fetchAll();

    // Get categories
    $catQuery = "SELECT * FROM categories ORDER BY display_order";
    $catStmt = $dbh->prepare($catQuery);
    $catStmt->execute();
    $categories = $catStmt->fetchAll();

    // Build response structure
    $data = [
        'categories' => [],
        'products' => []
    ];

    // Process categories
    foreach ($categories as $cat) {
        $data['categories'][] = [
            'id' => $cat['id'],
            'name' => json_decode($cat['name']),
            'icon' => $cat['icon'],
            'description' => json_decode($cat['description'] ?? '{}'),
            'items' => []
        ];
    }

    // Add products to categories
    foreach ($products as $product) {
        $productData = [
            'id' => $product['id'],
            'name' => json_decode($product['name']),
            'description' => json_decode($product['description'] ?? '{}'),
            'price' => (float)$product['price'],
            'image' => $product['image'],
            'available' => (bool)$product['available'],
            'badges' => json_decode($product['badges'] ?? '{}')
        ];

        // Find category and add product
        foreach ($data['categories'] as &$cat) {
            if ($cat['id'] == $product['category_id']) {
                $cat['items'][] = $productData;
                break;
            }
        }
    }

    echo json_encode($data);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to fetch products',
        'message' => $e->getMessage()
    ]);
}
?>