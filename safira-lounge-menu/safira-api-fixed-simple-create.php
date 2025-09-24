<?php
// Safira API with WORKING create_product endpoint
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
    $dbh = new PDO("mysql:host=$host_name;dbname=$database;charset=utf8mb4", $user_name, $password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// Get action from URL or parameter
$action = $_GET['action'] ?? 'test';

// Handle frontend's /auth/login path
$requestUri = $_SERVER['REQUEST_URI'] ?? '';
if (strpos($requestUri, '/auth/login') !== false) {
    $action = 'login';
}

switch ($action) {
    case 'test':
        echo json_encode([
            'status' => 'success',
            'message' => 'SAFIRA API WITH SIMPLE CREATE_PRODUCT',
            'timestamp' => date('c'),
            'version' => '5.0.1-simple-create'
        ]);
        break;

    case 'login':
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            $username = $input['username'] ?? '';
            $password = $input['password'] ?? '';

            if ($username === 'admin' && $password === 'Aramat1.') {
                echo json_encode([
                    'success' => true,
                    'token' => 'valid_token_' . time(),
                    'user' => [
                        'username' => 'admin',
                        'role' => 'admin'
                    ]
                ]);
            } else {
                http_response_code(401);
                echo json_encode(['error' => 'Invalid credentials']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Login failed']);
        }
        break;

    case 'products':
        try {
            // Get categories
            $catStmt = $dbh->query("SELECT * FROM categories ORDER BY sort_order, id");
            $categories = $catStmt->fetchAll(PDO::FETCH_ASSOC);

            // Get subcategories
            $subcatStmt = $dbh->query("SELECT * FROM subcategories ORDER BY category_id, sort_order, id");
            $subcategories = $subcatStmt->fetchAll(PDO::FETCH_ASSOC);

            // Get products
            $prodStmt = $dbh->query("
                SELECT * FROM products
                WHERE available = 1
                ORDER BY category_id, subcategory_id, sort_order, id
            ");
            $products = $prodStmt->fetchAll(PDO::FETCH_ASSOC);

            // Transform to frontend format
            $result = [];
            foreach ($categories as $category) {
                $catId = $category['id'];
                $catName = $category['name'];

                $result[$catId] = [
                    'id' => (string)$catId,
                    'name' => $catName,
                    'subcategories' => []
                ];

                // Add subcategories
                foreach ($subcategories as $subcat) {
                    if ($subcat['category_id'] == $catId) {
                        $subcatId = $subcat['id'];
                        $result[$catId]['subcategories'][(string)$subcatId] = [
                            'id' => (string)$subcatId,
                            'name' => $subcat['name'],
                            'items' => []
                        ];
                    }
                }

                // Add products
                foreach ($products as $product) {
                    if ($product['category_id'] == $catId) {
                        $subcatId = $product['subcategory_id'] ?? 'default';
                        $subcatKey = (string)$subcatId;

                        // If subcategory doesn't exist, create default
                        if (!isset($result[$catId]['subcategories'][$subcatKey])) {
                            $result[$catId]['subcategories'][$subcatKey] = [
                                'id' => $subcatKey,
                                'name' => 'Default',
                                'items' => []
                            ];
                        }

                        $result[$catId]['subcategories'][$subcatKey]['items'][] = [
                            'id' => (string)$product['id'],
                            'name' => $product['name'],
                            'description' => $product['description'] ?? '',
                            'price' => (float)$product['price'],
                            'image' => $product['image'] ?? '',
                            'available' => (bool)$product['available'],
                            'badges' => [
                                'neu' => false,
                                'beliebt' => false,
                                'kurze_zeit' => false
                            ]
                        ];
                    }
                }
            }

            echo json_encode(['data' => $result]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch products: ' . $e->getMessage()]);
        }
        break;

    case 'create_product':
        try {
            $input = json_decode(file_get_contents('php://input'), true);

            if (!$input || !isset($input['name']) || !isset($input['price'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Name and price are required']);
                break;
            }

            // Extract name - handle both string and multilingual format
            $name = '';
            if (is_array($input['name'])) {
                $name = $input['name']['de'] ?? $input['name']['en'] ?? $input['name']['tr'] ?? $input['name']['da'] ?? '';
            } else {
                $name = (string)$input['name'];
            }

            // Extract description - handle both string and multilingual format
            $description = '';
            if (isset($input['description'])) {
                if (is_array($input['description'])) {
                    $description = $input['description']['de'] ?? $input['description']['en'] ?? $input['description']['tr'] ?? $input['description']['da'] ?? '';
                } else {
                    $description = (string)$input['description'];
                }
            }

            $category_id = $input['category_id'] ?? null;
            $subcategory_id = $input['subcategory_id'] ?? null;
            $price = (float)($input['price'] ?? 0);
            $image_url = $input['image'] ?? $input['imageUrl'] ?? '';
            $available = isset($input['available']) ? (bool)$input['available'] : true;

            // Insert into existing database schema (basic fields only)
            $stmt = $dbh->prepare("
                INSERT INTO products (
                    category_id, subcategory_id, name, description,
                    price, image, available, sort_order
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 999)
            ");

            $stmt->execute([
                $category_id,
                $subcategory_id,
                $name,
                $description,
                $price,
                $image_url,
                $available ? 1 : 0
            ]);

            $product_id = $dbh->lastInsertId();

            echo json_encode([
                'success' => true,
                'message' => 'Product created successfully',
                'product' => [
                    'id' => (string)$product_id,
                    'name' => $name,
                    'description' => $description,
                    'price' => $price,
                    'image' => $image_url,
                    'available' => $available,
                    'category_id' => $category_id,
                    'subcategory_id' => $subcategory_id
                ]
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create product: ' . $e->getMessage()]);
        }
        break;

    case 'delete_product':
        try {
            $productId = $_GET['id'] ?? null;

            if (!$productId) {
                http_response_code(400);
                echo json_encode(['error' => 'Product ID is required']);
                break;
            }

            $stmt = $dbh->prepare("DELETE FROM products WHERE id = ?");
            $stmt->execute([$productId]);

            if ($stmt->rowCount() > 0) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Product deleted successfully'
                ]);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Product not found']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete product: ' . $e->getMessage()]);
        }
        break;

    case 'subcategories':
        try {
            $stmt = $dbh->query("SELECT * FROM subcategories ORDER BY category_id, sort_order, id");
            $subcategories = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['data' => $subcategories]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch subcategories: ' . $e->getMessage()]);
        }
        break;

    case 'settings':
        echo json_encode([
            'data' => [
                'restaurantName' => 'Safira Lounge',
                'address' => 'Flensburg, Deutschland',
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
                'theme' => [
                    'primaryColor' => '#FF41FB',
                    'secondaryColor' => '#000000'
                ]
            ]
        ]);
        break;

    case 'health':
        echo json_encode([
            'status' => 'healthy',
            'timestamp' => date('c'),
            'version' => '5.0.1-simple-create',
            'available_actions' => ['test', 'login', 'products', 'subcategories', 'create_product', 'delete_product', 'settings', 'health']
        ]);
        break;

    default:
        http_response_code(404);
        echo json_encode(['error' => 'Action not found']);
        break;
}
?>