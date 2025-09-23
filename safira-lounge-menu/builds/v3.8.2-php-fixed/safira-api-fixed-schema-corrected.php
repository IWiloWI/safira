<?php
// Safira API with Login Support - Schema Corrected Version
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
            'message' => 'SAFIRA API WITH LOGIN SUPPORT WORKING - SCHEMA CORRECTED',
            'timestamp' => date('c'),
            'location' => '/safira/ directory'
        ]);
        break;

    case 'login':
        // Handle admin login
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            $username = $input['username'] ?? '';
            $password = $input['password'] ?? '';

            // Simple admin credentials
            if ($username === 'admin' && $password === 'admin123') {
                $token = 'admin_token_' . time() . '_' . rand(1000, 9999);

                echo json_encode([
                    'success' => true,
                    'user' => [
                        'id' => 'admin',
                        'username' => 'admin',
                        'email' => 'admin@safira-lounge.de',
                        'role' => 'admin',
                        'isActive' => true,
                        'isVerified' => true,
                        'createdAt' => date('c'),
                        'updatedAt' => date('c')
                    ],
                    'token' => $token,
                    'expiresAt' => date('c', time() + 24 * 60 * 60), // 24 hours
                    'permissions' => ['products.view', 'products.create', 'products.update', 'products.delete'],
                    'sessionId' => $token
                ]);
            } else {
                http_response_code(401);
                echo json_encode([
                    'success' => false,
                    'error' => 'Invalid credentials',
                    'message' => 'Username or password incorrect'
                ]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Login failed: ' . $e->getMessage()
            ]);
        }
        break;

    case 'products':
        try {
            // Get categories using correct column names
            $catStmt = $dbh->query("SELECT id, name_de, name_en, name_tr, description_de, description_en, description_tr, image_url, sort_order, is_active FROM categories WHERE is_active = 1 ORDER BY sort_order, id");
            $categories = $catStmt->fetchAll(PDO::FETCH_ASSOC);

            // Get products - keeping original structure for now
            $prodStmt = $dbh->query("SELECT * FROM products ORDER BY category_id, id");
            $products = $prodStmt->fetchAll(PDO::FETCH_ASSOC);

            $data = ['categories' => []];

            foreach ($categories as $cat) {
                // Convert separate language columns to expected format
                $nameTranslations = [
                    'de' => $cat['name_de'] ?? '',
                    'en' => $cat['name_en'] ?? '',
                    'da' => $cat['name_tr'] ?? '', // Using TR column for DA for now
                    'tr' => $cat['name_tr'] ?? ''
                ];

                $descriptionTranslations = [
                    'de' => $cat['description_de'] ?? '',
                    'en' => $cat['description_en'] ?? '',
                    'da' => $cat['description_tr'] ?? '', // Using TR column for DA for now
                    'tr' => $cat['description_tr'] ?? ''
                ];

                $categoryData = [
                    'id' => $cat['id'],
                    'name' => $nameTranslations,
                    'icon' => 'fa-utensils', // Default icon since not in database
                    'description' => $descriptionTranslations,
                    'image' => $cat['image_url'] ?? '',
                    'sortOrder' => $cat['sort_order'] ?? 0,
                    'isActive' => (bool)$cat['is_active'],
                    'items' => []
                ];

                foreach ($products as $product) {
                    if ($product['category_id'] == $cat['id']) {
                        // Handle product data as before (might need similar adjustment)
                        $prodName = $product['name'] ?? '{}';
                        $prodDesc = $product['description'] ?? '{}';
                        $prodBadges = $product['badges'] ?? '{}';

                        $prodNameDecoded = json_decode($prodName, true);
                        if (json_last_error() !== JSON_ERROR_NONE || empty($prodNameDecoded)) {
                            $prodNameDecoded = ['de' => $prodName ?: 'Produkt'];
                        }

                        $prodDescDecoded = json_decode($prodDesc, true);
                        if (json_last_error() !== JSON_ERROR_NONE || empty($prodDescDecoded)) {
                            $prodDescDecoded = ['de' => $prodDesc ?: ''];
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
            'version' => '1.0.1-schema-corrected',
            'location' => 'safira directory'
        ]);
        break;

    case 'create_category':
        // Create new category using correct column structure
        try {
            $input = json_decode(file_get_contents('php://input'), true);

            if (!$input || !isset($input['name'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Category name is required']);
                break;
            }

            // Extract name translations
            $nameData = $input['name'];
            $name_de = '';
            $name_en = '';
            $name_tr = '';

            if (is_array($nameData)) {
                $name_de = $nameData['de'] ?? '';
                $name_en = $nameData['en'] ?? '';
                $name_tr = $nameData['tr'] ?? $nameData['da'] ?? ''; // Use TR or DA
            } else {
                $name_de = $nameData; // Use as German if string
            }

            // Extract description translations
            $descData = $input['description'] ?? [];
            $desc_de = '';
            $desc_en = '';
            $desc_tr = '';

            if (is_array($descData)) {
                $desc_de = $descData['de'] ?? '';
                $desc_en = $descData['en'] ?? '';
                $desc_tr = $descData['tr'] ?? $descData['da'] ?? '';
            } elseif (is_string($descData)) {
                $desc_de = $descData;
            }

            // Other fields
            $image_url = $input['image'] ?? '';
            $sort_order = $input['sortOrder'] ?? 999;
            $is_active = isset($input['isActive']) ? ($input['isActive'] ? 1 : 0) : 1;

            $stmt = $dbh->prepare("INSERT INTO categories (name_de, name_en, name_tr, description_de, description_en, description_tr, image_url, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$name_de, $name_en, $name_tr, $desc_de, $desc_en, $desc_tr, $image_url, $sort_order, $is_active]);

            $categoryId = $dbh->lastInsertId();

            echo json_encode([
                'success' => true,
                'message' => 'Category created successfully',
                'category' => [
                    'id' => $categoryId,
                    'name' => [
                        'de' => $name_de,
                        'en' => $name_en,
                        'tr' => $name_tr,
                        'da' => $name_tr
                    ],
                    'description' => [
                        'de' => $desc_de,
                        'en' => $desc_en,
                        'tr' => $desc_tr,
                        'da' => $desc_tr
                    ],
                    'image' => $image_url,
                    'sortOrder' => $sort_order,
                    'isActive' => (bool)$is_active
                ]
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'error' => 'Failed to create category: ' . $e->getMessage(),
                'debug_info' => [
                    'input' => $input ?? null,
                    'sql_error' => $e->getMessage()
                ]
            ]);
        }
        break;

    case 'update_category':
        // Update existing category using correct column structure
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            $categoryId = $_GET['id'] ?? null;

            if (!$categoryId) {
                http_response_code(400);
                echo json_encode(['error' => 'Category ID is required']);
                break;
            }

            if (!$input || !isset($input['name'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Category name is required']);
                break;
            }

            // Extract name translations
            $nameData = $input['name'];
            $name_de = '';
            $name_en = '';
            $name_tr = '';

            if (is_array($nameData)) {
                $name_de = $nameData['de'] ?? '';
                $name_en = $nameData['en'] ?? '';
                $name_tr = $nameData['tr'] ?? $nameData['da'] ?? '';
            } else {
                $name_de = $nameData;
            }

            // Extract description translations
            $descData = $input['description'] ?? [];
            $desc_de = '';
            $desc_en = '';
            $desc_tr = '';

            if (is_array($descData)) {
                $desc_de = $descData['de'] ?? '';
                $desc_en = $descData['en'] ?? '';
                $desc_tr = $descData['tr'] ?? $descData['da'] ?? '';
            } elseif (is_string($descData)) {
                $desc_de = $descData;
            }

            // Other fields
            $image_url = $input['image'] ?? '';
            $sort_order = $input['sortOrder'] ?? 999;
            $is_active = isset($input['isActive']) ? ($input['isActive'] ? 1 : 0) : 1;

            $stmt = $dbh->prepare("UPDATE categories SET name_de = ?, name_en = ?, name_tr = ?, description_de = ?, description_en = ?, description_tr = ?, image_url = ?, sort_order = ?, is_active = ? WHERE id = ?");
            $stmt->execute([$name_de, $name_en, $name_tr, $desc_de, $desc_en, $desc_tr, $image_url, $sort_order, $is_active, $categoryId]);

            if ($stmt->rowCount() > 0 || $stmt->rowCount() === 0) { // 0 rows means no changes but category exists
                echo json_encode([
                    'success' => true,
                    'message' => 'Category updated successfully',
                    'category' => [
                        'id' => $categoryId,
                        'name' => [
                            'de' => $name_de,
                            'en' => $name_en,
                            'tr' => $name_tr,
                            'da' => $name_tr
                        ],
                        'description' => [
                            'de' => $desc_de,
                            'en' => $desc_en,
                            'tr' => $desc_tr,
                            'da' => $desc_tr
                        ],
                        'image' => $image_url,
                        'sortOrder' => $sort_order,
                        'isActive' => (bool)$is_active
                    ]
                ]);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Category not found']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update category: ' . $e->getMessage()]);
        }
        break;

    case 'delete_category':
        // Delete category
        try {
            $categoryId = $_GET['id'] ?? null;

            if (!$categoryId) {
                http_response_code(400);
                echo json_encode(['error' => 'Category ID is required']);
                break;
            }

            // Check if category has products
            $checkStmt = $dbh->prepare("SELECT COUNT(*) FROM products WHERE category_id = ?");
            $checkStmt->execute([$categoryId]);
            $productCount = $checkStmt->fetchColumn();

            if ($productCount > 0) {
                http_response_code(400);
                echo json_encode([
                    'error' => 'Cannot delete category with products. Please move or delete all products first.',
                    'productCount' => $productCount
                ]);
                break;
            }

            $stmt = $dbh->prepare("DELETE FROM categories WHERE id = ?");
            $stmt->execute([$categoryId]);

            if ($stmt->rowCount() > 0) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Category deleted successfully'
                ]);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Category not found']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete category: ' . $e->getMessage()]);
        }
        break;

    default:
        http_response_code(404);
        echo json_encode([
            'error' => 'Action not found',
            'available_actions' => ['test', 'login', 'products', 'settings', 'health', 'create_category', 'update_category', 'delete_category'],
            'request_uri' => $_SERVER['REQUEST_URI'] ?? 'unknown'
        ]);
        break;
}
?>