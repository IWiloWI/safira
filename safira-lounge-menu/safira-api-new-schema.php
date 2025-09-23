<?php
// Safira API - New Database Schema Version
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
            'message' => 'SAFIRA API NEW SCHEMA VERSION',
            'timestamp' => date('c'),
            'version' => '4.0.0-new-schema'
        ]);
        break;

    case 'login':
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            $username = $input['username'] ?? '';
            $password = $input['password'] ?? '';

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
                    'expiresAt' => date('c', time() + 24 * 60 * 60),
                    'permissions' => ['products.view', 'products.create', 'products.update', 'products.delete'],
                    'sessionId' => $token
                ]);
            } else {
                http_response_code(401);
                echo json_encode([
                    'success' => false,
                    'error' => 'Invalid credentials'
                ]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Login failed: ' . $e->getMessage()]);
        }
        break;

    case 'products':
        try {
            // Get categories with new schema
            $catStmt = $dbh->query("
                SELECT * FROM categories
                WHERE is_active = 1
                ORDER BY sort_order, id
            ");
            $categories = $catStmt->fetchAll(PDO::FETCH_ASSOC);

            // Get products with new schema
            $prodStmt = $dbh->query("
                SELECT * FROM products
                WHERE available = 1
                ORDER BY category_id, sort_order, id
            ");
            $products = $prodStmt->fetchAll(PDO::FETCH_ASSOC);

            $data = ['categories' => []];

            foreach ($categories as $cat) {
                $categoryData = [
                    'id' => (string)$cat['id'],
                    'name' => [
                        'de' => $cat['name_de'] ?? '',
                        'en' => $cat['name_en'] ?? '',
                        'da' => $cat['name_da'] ?? '',
                        'tr' => $cat['name_tr'] ?? ''
                    ],
                    'description' => [
                        'de' => $cat['description_de'] ?? '',
                        'en' => $cat['description_en'] ?? '',
                        'da' => $cat['description_da'] ?? '',
                        'tr' => $cat['description_tr'] ?? ''
                    ],
                    'icon' => $cat['icon'] ?? 'fa-utensils',
                    'image' => $cat['image_url'] ?? '',
                    'isMainCategory' => (bool)($cat['is_main_category'] ?? 1),
                    'parentPage' => $cat['parent_category_id'] ? (string)$cat['parent_category_id'] : '',
                    'sortOrder' => (int)$cat['sort_order'],
                    'items' => []
                ];

                // Add products to category
                foreach ($products as $product) {
                    if ($product['category_id'] == $cat['id']) {
                        $badges = [];
                        if ($product['badge_new']) $badges['neu'] = true;
                        if ($product['badge_popular']) $badges['beliebt'] = true;
                        if ($product['badge_limited']) $badges['kurze_zeit'] = true;

                        $categoryData['items'][] = [
                            'id' => (string)$product['id'],
                            'name' => [
                                'de' => $product['name_de'] ?? '',
                                'en' => $product['name_en'] ?? '',
                                'da' => $product['name_da'] ?? '',
                                'tr' => $product['name_tr'] ?? ''
                            ],
                            'description' => [
                                'de' => $product['description_de'] ?? '',
                                'en' => $product['description_en'] ?? '',
                                'da' => $product['description_da'] ?? '',
                                'tr' => $product['description_tr'] ?? ''
                            ],
                            'price' => (float)$product['price'],
                            'image' => $product['image_url'] ?? '',
                            'available' => (bool)$product['available'],
                            'badges' => $badges
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

    case 'create_category':
        try {
            $input = json_decode(file_get_contents('php://input'), true);

            if (!$input || !isset($input['name'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Category name is required']);
                break;
            }

            // Extract translations
            $name_de = '';
            $name_en = '';
            $name_tr = '';
            $name_da = '';

            if (is_array($input['name'])) {
                $name_de = $input['name']['de'] ?? '';
                $name_en = $input['name']['en'] ?? $name_de;
                $name_tr = $input['name']['tr'] ?? $name_de;
                $name_da = $input['name']['da'] ?? $name_de;
            } else {
                $name_de = $input['name'];
                $name_en = $name_de;
                $name_tr = $name_de;
                $name_da = $name_de;
            }

            $desc_de = '';
            $desc_en = '';
            $desc_tr = '';
            $desc_da = '';

            if (isset($input['description']) && is_array($input['description'])) {
                $desc_de = $input['description']['de'] ?? '';
                $desc_en = $input['description']['en'] ?? '';
                $desc_tr = $input['description']['tr'] ?? '';
                $desc_da = $input['description']['da'] ?? '';
            }

            $image_url = $input['image'] ?? '';
            $icon = $input['icon'] ?? 'fa-utensils';
            $sort_order = $input['sortOrder'] ?? 999;
            $is_main_category = isset($input['isMainCategory']) ? ($input['isMainCategory'] ? 1 : 0) : 1;
            $parent_category_id = (!empty($input['parentPage']) && !$is_main_category) ? $input['parentPage'] : null;

            $stmt = $dbh->prepare("
                INSERT INTO categories (
                    name_de, name_en, name_tr, name_da,
                    description_de, description_en, description_tr, description_da,
                    image_url, icon, sort_order, is_main_category, parent_category_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");

            $stmt->execute([
                $name_de, $name_en, $name_tr, $name_da,
                $desc_de, $desc_en, $desc_tr, $desc_da,
                $image_url, $icon, $sort_order, $is_main_category, $parent_category_id
            ]);

            $categoryId = $dbh->lastInsertId();

            // Fetch the created category
            $newCat = $dbh->prepare("SELECT * FROM categories WHERE id = ?");
            $newCat->execute([$categoryId]);
            $category = $newCat->fetch(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'message' => 'Category created successfully',
                'category' => [
                    'id' => (string)$categoryId,
                    'name' => [
                        'de' => $category['name_de'],
                        'en' => $category['name_en'],
                        'da' => $category['name_da'],
                        'tr' => $category['name_tr']
                    ],
                    'description' => [
                        'de' => $category['description_de'] ?? '',
                        'en' => $category['description_en'] ?? '',
                        'da' => $category['description_da'] ?? '',
                        'tr' => $category['description_tr'] ?? ''
                    ],
                    'icon' => $category['icon'],
                    'image' => $category['image_url'] ?? '',
                    'isMainCategory' => (bool)$category['is_main_category'],
                    'parentPage' => $category['parent_category_id'] ? (string)$category['parent_category_id'] : ''
                ]
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create category: ' . $e->getMessage()]);
        }
        break;

    case 'update_category':
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

            // Extract translations
            $name_de = is_array($input['name']) ? ($input['name']['de'] ?? '') : $input['name'];
            $name_en = is_array($input['name']) ? ($input['name']['en'] ?? $name_de) : $name_de;
            $name_tr = is_array($input['name']) ? ($input['name']['tr'] ?? $name_de) : $name_de;
            $name_da = is_array($input['name']) ? ($input['name']['da'] ?? $name_de) : $name_de;

            $desc_de = '';
            $desc_en = '';
            $desc_tr = '';
            $desc_da = '';

            if (isset($input['description']) && is_array($input['description'])) {
                $desc_de = $input['description']['de'] ?? '';
                $desc_en = $input['description']['en'] ?? '';
                $desc_tr = $input['description']['tr'] ?? '';
                $desc_da = $input['description']['da'] ?? '';
            }

            $image_url = $input['image'] ?? '';
            $icon = $input['icon'] ?? 'fa-utensils';
            $sort_order = $input['sortOrder'] ?? 999;
            $is_main_category = isset($input['isMainCategory']) ? ($input['isMainCategory'] ? 1 : 0) : 1;
            $parent_category_id = (!empty($input['parentPage']) && !$is_main_category) ? $input['parentPage'] : null;

            $stmt = $dbh->prepare("
                UPDATE categories SET
                    name_de = ?, name_en = ?, name_tr = ?, name_da = ?,
                    description_de = ?, description_en = ?, description_tr = ?, description_da = ?,
                    image_url = ?, icon = ?, sort_order = ?,
                    is_main_category = ?, parent_category_id = ?
                WHERE id = ?
            ");

            $stmt->execute([
                $name_de, $name_en, $name_tr, $name_da,
                $desc_de, $desc_en, $desc_tr, $desc_da,
                $image_url, $icon, $sort_order,
                $is_main_category, $parent_category_id,
                $categoryId
            ]);

            echo json_encode([
                'success' => true,
                'message' => 'Category updated successfully'
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update category: ' . $e->getMessage()]);
        }
        break;

    case 'delete_category':
        try {
            $categoryId = $_GET['id'] ?? null;

            if (!$categoryId) {
                http_response_code(400);
                echo json_encode(['error' => 'Category ID is required']);
                break;
            }

            // Products will be deleted automatically due to foreign key constraint
            $stmt = $dbh->prepare("DELETE FROM categories WHERE id = ?");
            $stmt->execute([$categoryId]);

            echo json_encode([
                'success' => true,
                'message' => 'Category deleted successfully'
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete category: ' . $e->getMessage()]);
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
            'version' => '4.0.0-new-schema'
        ]);
        break;

    default:
        http_response_code(404);
        echo json_encode([
            'error' => 'Action not found',
            'available_actions' => ['test', 'login', 'products', 'settings', 'health', 'create_category', 'update_category', 'delete_category']
        ]);
        break;
}
?>