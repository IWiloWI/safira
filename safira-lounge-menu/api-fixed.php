<?php
// Fixed API without display_order dependency
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

$action = $_GET['action'] ?? 'test';

switch ($action) {
    case 'test':
        echo json_encode([
            'status' => 'success',
            'message' => 'API working in /safira',
            'timestamp' => date('c')
        ]);
        break;

    case 'test-connection':
        try {
            $stmt = $dbh->query("SELECT 1 as test");
            $result = $stmt->fetch();
            echo json_encode([
                'status' => 'success',
                'message' => 'Database connection successful',
                'database' => $database,
                'host' => $host_name,
                'timestamp' => date('c')
            ]);
        } catch (Exception $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'products':
        try {
            // Get categories without display_order
            $catStmt = $dbh->query("SELECT * FROM categories ORDER BY id");
            $categories = $catStmt->fetchAll(PDO::FETCH_ASSOC);

            // Get products without display_order
            $prodStmt = $dbh->query("SELECT * FROM products ORDER BY category_id, id");
            $products = $prodStmt->fetchAll(PDO::FETCH_ASSOC);

            $data = ['categories' => []];

            foreach ($categories as $cat) {
                // Handle JSON fields safely
                $name = $cat['name'] ?? '{}';
                $description = $cat['description'] ?? '{}';

                // If not valid JSON, treat as string, with fallback names
                $nameDecoded = json_decode($name, true);
                if (json_last_error() !== JSON_ERROR_NONE || empty($nameDecoded)) {
                    $fallbackNames = [
                        1 => 'Shisha Tabak',
                        2 => 'Getränke',
                        3 => 'Snacks',
                        4 => 'Desserts'
                    ];
                    $nameDecoded = [
                        'de' => $fallbackNames[$cat['id']] ?? "Kategorie {$cat['id']}",
                        'en' => $fallbackNames[$cat['id']] ?? "Category {$cat['id']}",
                        'da' => $fallbackNames[$cat['id']] ?? "Kategori {$cat['id']}"
                    ];
                }

                $descDecoded = json_decode($description, true);
                if (json_last_error() !== JSON_ERROR_NONE || empty($descDecoded)) {
                    $descDecoded = ['de' => '', 'en' => '', 'da' => ''];
                }

                $categoryData = [
                    'id' => $cat['id'],
                    'name' => $nameDecoded,
                    'icon' => $cat['icon'] ?? '',
                    'description' => $descDecoded,
                    'items' => []
                ];

                foreach ($products as $product) {
                    if ($product['category_id'] == $cat['id']) {
                        // Handle product JSON fields safely
                        $prodName = $product['name'] ?? '{}';
                        $prodDesc = $product['description'] ?? '{}';
                        $prodBadges = $product['badges'] ?? '{}';

                        $prodNameDecoded = json_decode($prodName, true);
                        if (json_last_error() !== JSON_ERROR_NONE) {
                            $prodNameDecoded = ['de' => $prodName];
                        }

                        $prodDescDecoded = json_decode($prodDesc, true);
                        if (json_last_error() !== JSON_ERROR_NONE) {
                            $prodDescDecoded = ['de' => $prodDesc];
                        }

                        $prodBadgesDecoded = json_decode($prodBadges, true);
                        if (json_last_error() !== JSON_ERROR_NONE) {
                            $prodBadgesDecoded = [];
                        }

                        $categoryData['items'][] = [
                            'id' => $product['id'],
                            'name' => $prodNameDecoded,
                            'description' => $prodDescDecoded,
                            'price' => (float)$product['price'],
                            'image' => $product['image'] ?? '',
                            'available' => (bool)$product['available'],
                            'badges' => $prodBadgesDecoded
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

    case 'categories':
        try {
            $catStmt = $dbh->query("SELECT * FROM categories ORDER BY id");
            $categories = $catStmt->fetchAll(PDO::FETCH_ASSOC);

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
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'settings':
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

    case 'health':
        echo json_encode([
            'status' => 'healthy',
            'timestamp' => date('c'),
            'version' => '1.0.0'
        ]);
        break;

    case 'debug-data':
        try {
            // Get raw category data
            $catStmt = $dbh->query("SELECT * FROM categories LIMIT 2");
            $categories = $catStmt->fetchAll(PDO::FETCH_ASSOC);

            // Get raw product data
            $prodStmt = $dbh->query("SELECT * FROM products LIMIT 2");
            $products = $prodStmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                'rawCategories' => $categories,
                'rawProducts' => $products
            ], JSON_PRETTY_PRINT);
        } catch (Exception $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(['error' => 'Action not found']);
        break;
}
?>