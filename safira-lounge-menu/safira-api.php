<?php
/**
 * Safira API - All in One File
 * Läuft direkt in /safira Verzeichnis
 */

// CORS Headers
header('Access-Control-Allow-Origin: http://test.safira-lounge.de');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight requests
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
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// Get the requested path from URL parameter
$path = $_GET['path'] ?? '';

switch ($path) {
    case 'test-connection':
        try {
            $query = "SELECT 1 as test";
            $stmt = $dbh->prepare($query);
            $stmt->execute();
            $result = $stmt->fetch();

            echo json_encode([
                'status' => 'success',
                'message' => 'Database connection successful',
                'timestamp' => date('c'),
                'database' => $database,
                'host' => $host_name
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database test failed: ' . $e->getMessage()]);
        }
        break;

    case 'health':
        echo json_encode([
            'status' => 'healthy',
            'timestamp' => date('c'),
            'version' => '1.0.0'
        ]);
        break;

    case 'products':
        try {
            // Get categories with products
            $query = "SELECT * FROM categories ORDER BY display_order";
            $stmt = $dbh->prepare($query);
            $stmt->execute();
            $categories = $stmt->fetchAll();

            $query = "SELECT * FROM products ORDER BY category_id, display_order";
            $stmt = $dbh->prepare($query);
            $stmt->execute();
            $products = $stmt->fetchAll();

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
            echo json_encode(['error' => 'Failed to fetch products: ' . $e->getMessage()]);
        }
        break;

    case 'categories':
        try {
            $query = "SELECT * FROM categories ORDER BY display_order";
            $stmt = $dbh->prepare($query);
            $stmt->execute();
            $categories = $stmt->fetchAll();

            $result = [];
            foreach ($categories as $cat) {
                $result[] = [
                    'id' => $cat['id'],
                    'name' => json_decode($cat['name'] ?? '{}'),
                    'icon' => $cat['icon'] ?? '',
                    'description' => json_decode($cat['description'] ?? '{}')
                ];
            }

            echo json_encode($result);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch categories: ' . $e->getMessage()]);
        }
        break;

    case 'settings':
        try {
            // Try to get settings
            $query = "SELECT * FROM settings LIMIT 1";
            $stmt = $dbh->prepare($query);
            $stmt->execute();
            $settings = $stmt->fetch();

            if (!$settings) {
                // Create default settings if none exist
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
            } else {
                echo json_encode([
                    'restaurantName' => json_decode($settings['restaurant_name'] ?? '{}'),
                    'address' => json_decode($settings['address'] ?? '{}'),
                    'phone' => $settings['phone'] ?? '',
                    'email' => $settings['email'] ?? '',
                    'openingHours' => json_decode($settings['opening_hours'] ?? '{}'),
                    'socialMedia' => json_decode($settings['social_media'] ?? '{}'),
                    'theme' => json_decode($settings['theme'] ?? '{}'),
                    'language' => $settings['language'] ?? 'de'
                ]);
            }
        } catch (Exception $e) {
            // If settings table doesn't exist, return defaults
            echo json_encode([
                'restaurantName' => ['de' => 'Safira Lounge', 'en' => 'Safira Lounge', 'da' => 'Safira Lounge'],
                'address' => ['de' => 'Flensburg, Deutschland', 'en' => 'Flensburg, Germany', 'da' => 'Flensborg, Tyskland'],
                'phone' => '+49 461 123456',
                'email' => 'info@safira-lounge.de',
                'language' => 'de'
            ]);
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
        break;
}
?>