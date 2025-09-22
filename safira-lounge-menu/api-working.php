<?php
// Working API for /safira directory
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://test.safira-lounge.de');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Database connection
$host_name = 'db5018522360.hosting-data.io';
$database = 'dbs14708743';
$user_name = 'dbu3362598';
$password = '!Aramat1.';

try {
    $dbh = new PDO("mysql:host=$host_name;dbname=$database", $user_name, $password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// Simple router based on 'action' parameter
$action = $_GET['action'] ?? 'test';

switch ($action) {
    case 'test':
        echo json_encode([
            'status' => 'success',
            'message' => 'API working in /safira',
            'timestamp' => date('c')
        ]);
        break;

    case 'products':
        try {
            // Get categories
            $catStmt = $dbh->query("SELECT * FROM categories ORDER BY display_order");
            $categories = $catStmt->fetchAll(PDO::FETCH_ASSOC);

            // Get products
            $prodStmt = $dbh->query("SELECT * FROM products ORDER BY category_id, display_order");
            $products = $prodStmt->fetchAll(PDO::FETCH_ASSOC);

            $data = ['categories' => []];

            foreach ($categories as $cat) {
                $categoryData = [
                    'id' => $cat['id'],
                    'name' => json_decode($cat['name'] ?? '{}'),
                    'icon' => $cat['icon'] ?? '',
                    'description' => json_decode($cat['description'] ?? '{}'),
                    'items' => []
                ];

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
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'settings':
        // Return default settings (no settings table needed)
        echo json_encode([
            'restaurantName' => ['de' => 'Safira Lounge', 'en' => 'Safira Lounge', 'da' => 'Safira Lounge'],
            'address' => ['de' => 'Flensburg, Deutschland', 'en' => 'Flensburg, Germany', 'da' => 'Flensborg, Tyskland'],
            'phone' => '+49 461 123456',
            'email' => 'info@safira-lounge.de',
            'openingHours' => [
                'monday' => '18:00-02:00',
                'tuesday' => '18:00-02:00',
                'wednesday' => '18:00-02:00',
                'thursday' => '18:00-02:00',
                'friday' => '18:00-03:00',
                'saturday' => '18:00-03:00',
                'sunday' => '18:00-02:00'
            ],
            'socialMedia' => [
                'instagram' => '@safira_lounge',
                'facebook' => 'SafiraLounge',
                'website' => 'https://safira-lounge.de'
            ],
            'theme' => [
                'primaryColor' => '#FF41FB',
                'secondaryColor' => '#000000',
                'backgroundVideo' => true
            ],
            'language' => 'de'
        ]);
        break;

    default:
        http_response_code(404);
        echo json_encode(['error' => 'Action not found']);
        break;
}
?>