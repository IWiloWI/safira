<?php
/**
 * Products API - ROOT Version
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://test.safira-lounge.de');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Database configuration
$host_name = 'db5018522360.hosting-data.io';
$database = 'dbs14708743';
$user_name = 'dbu3362598';
$password = '!Aramat1.';

try {
    $dbh = new PDO(
        "mysql:host=$host_name;dbname=$database;charset=utf8mb4",
        $user_name,
        $password,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    // Get categories
    $catQuery = "SELECT * FROM categories ORDER BY display_order";
    $catStmt = $dbh->prepare($catQuery);
    $catStmt->execute();
    $categories = $catStmt->fetchAll();

    // Get products
    $prodQuery = "SELECT * FROM products ORDER BY category_id, display_order";
    $prodStmt = $dbh->prepare($prodQuery);
    $prodStmt->execute();
    $products = $prodStmt->fetchAll();

    // Build response structure
    $data = ['categories' => []];

    foreach ($categories as $cat) {
        $categoryData = [
            'id' => $cat['id'],
            'name' => json_decode($cat['name'] ?? '{}'),
            'icon' => $cat['icon'] ?? '',
            'description' => json_decode($cat['description'] ?? '{}'),
            'items' => []
        ];

        // Add products to this category
        foreach ($products as $product) {
            if ($product['category_id'] == $cat['id']) {
                $categoryData['items'][] = [
                    'id' => $product['id'],
                    'name' => json_decode($product['name'] ?? '{}'),
                    'description' => json_decode($product['description'] ?? '{}'),
                    'price' => (float)$product['price'],
                    'image' => $product['image'] ?? '',
                    'available' => (bool)$product['available'],
                    'badges' => json_decode($product['badges'] ?? '{}')
                ];
            }
        }

        $data['categories'][] = $categoryData;
    }

    echo json_encode($data);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to fetch products: ' . $e->getMessage()
    ]);
}
?>