<?php
// Safira API with Subcategories Support
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
            'message' => 'SAFIRA API WITH SUBCATEGORIES SUPPORT',
            'timestamp' => date('c'),
            'version' => '5.0.0-subcategories'
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
            // Get main categories
            $catStmt = $dbh->query("
                SELECT * FROM categories
                WHERE is_active = 1
                ORDER BY sort_order, id
            ");
            $categories = $catStmt->fetchAll(PDO::FETCH_ASSOC);

            // Get all subcategories
            $subcatStmt = $dbh->query("
                SELECT * FROM subcategories
                WHERE is_active = 1
                ORDER BY category_id, sort_order, id
            ");
            $subcategories = $subcatStmt->fetchAll(PDO::FETCH_ASSOC);

            // Get products
            $prodStmt = $dbh->query("
                SELECT * FROM products
                WHERE available = 1
                ORDER BY category_id, subcategory_id, sort_order, id
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
                    'isMainCategory' => true,
                    'parentPage' => '',
                    'sortOrder' => (int)$cat['sort_order'],
                    'items' => [],
                    'subcategories' => []
                ];

                // Add subcategories to this category
                foreach ($subcategories as $subcat) {
                    if ($subcat['category_id'] == $cat['id']) {
                        $subcategoryData = [
                            'id' => (string)$subcat['id'],
                            'name' => [
                                'de' => $subcat['name_de'] ?? '',
                                'en' => $subcat['name_en'] ?? '',
                                'da' => $subcat['name_da'] ?? '',
                                'tr' => $subcat['name_tr'] ?? ''
                            ],
                            'description' => [
                                'de' => $subcat['description_de'] ?? '',
                                'en' => $subcat['description_en'] ?? '',
                                'da' => $subcat['description_da'] ?? '',
                                'tr' => $subcat['description_tr'] ?? ''
                            ],
                            'icon' => $subcat['icon'] ?? 'fa-folder',
                            'image' => $subcat['image_url'] ?? '',
                            'sortOrder' => (int)$subcat['sort_order'],
                            'items' => []
                        ];

                        // Add products to subcategory
                        foreach ($products as $product) {
                            if ($product['subcategory_id'] == $subcat['id']) {
                                $badges = [];
                                if ($product['badge_new'] ?? false) $badges['neu'] = true;
                                if ($product['badge_popular'] ?? false) $badges['beliebt'] = true;
                                if ($product['badge_limited'] ?? false) $badges['kurze_zeit'] = true;

                                $subcategoryData['items'][] = [
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

                        $categoryData['subcategories'][] = $subcategoryData;
                    }
                }

                // Also add products directly in the category (without subcategory)
                foreach ($products as $product) {
                    if ($product['category_id'] == $cat['id'] && empty($product['subcategory_id'])) {
                        $badges = [];
                        if ($product['badge_new'] ?? false) $badges['neu'] = true;
                        if ($product['badge_popular'] ?? false) $badges['beliebt'] = true;
                        if ($product['badge_limited'] ?? false) $badges['kurze_zeit'] = true;

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

                // For backward compatibility, also treat subcategories as regular categories
                foreach ($categoryData['subcategories'] as $subcat) {
                    $subcatAsCategory = [
                        'id' => 'subcat_' . $subcat['id'],
                        'name' => $subcat['name'],
                        'description' => $subcat['description'],
                        'icon' => $subcat['icon'],
                        'image' => $subcat['image'],
                        'isMainCategory' => false,
                        'parentPage' => $cat['id'],
                        'sortOrder' => $subcat['sortOrder'],
                        'items' => $subcat['items']
                    ];
                    $data['categories'][] = $subcatAsCategory;
                }

                $data['categories'][] = $categoryData;
            }

            echo json_encode($data);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'subcategories':
        try {
            $categoryId = $_GET['category_id'] ?? null;

            if (!$categoryId) {
                http_response_code(400);
                echo json_encode(['error' => 'Category ID is required']);
                break;
            }

            $stmt = $dbh->prepare("
                SELECT * FROM subcategories
                WHERE category_id = ? AND is_active = 1
                ORDER BY sort_order, id
            ");
            $stmt->execute([$categoryId]);
            $subcategories = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $result = ['subcategories' => []];

            foreach ($subcategories as $subcat) {
                $result['subcategories'][] = [
                    'id' => (string)$subcat['id'],
                    'categoryId' => (string)$subcat['category_id'],
                    'name' => [
                        'de' => $subcat['name_de'] ?? '',
                        'en' => $subcat['name_en'] ?? '',
                        'da' => $subcat['name_da'] ?? '',
                        'tr' => $subcat['name_tr'] ?? ''
                    ],
                    'description' => [
                        'de' => $subcat['description_de'] ?? '',
                        'en' => $subcat['description_en'] ?? '',
                        'da' => $subcat['description_da'] ?? '',
                        'tr' => $subcat['description_tr'] ?? ''
                    ],
                    'icon' => $subcat['icon'] ?? 'fa-folder',
                    'image' => $subcat['image_url'] ?? '',
                    'sortOrder' => (int)$subcat['sort_order']
                ];
            }

            echo json_encode($result);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch subcategories: ' . $e->getMessage()]);
        }
        break;

    case 'create_subcategory':
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            $categoryId = $_GET['category_id'] ?? $input['category_id'] ?? null;

            if (!$categoryId) {
                http_response_code(400);
                echo json_encode(['error' => 'Category ID is required']);
                break;
            }

            if (!$input || !isset($input['name'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Subcategory name is required']);
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
            $icon = $input['icon'] ?? 'fa-folder';
            $sort_order = $input['sortOrder'] ?? 999;

            $stmt = $dbh->prepare("
                INSERT INTO subcategories (
                    category_id, name_de, name_en, name_tr, name_da,
                    description_de, description_en, description_tr, description_da,
                    image_url, icon, sort_order, is_active
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
            ");

            $stmt->execute([
                $categoryId, $name_de, $name_en, $name_tr, $name_da,
                $desc_de, $desc_en, $desc_tr, $desc_da,
                $image_url, $icon, $sort_order
            ]);

            $subcategoryId = $dbh->lastInsertId();

            echo json_encode([
                'success' => true,
                'message' => 'Subcategory created successfully',
                'subcategory' => [
                    'id' => (string)$subcategoryId,
                    'categoryId' => (string)$categoryId,
                    'name' => [
                        'de' => $name_de,
                        'en' => $name_en,
                        'da' => $name_da,
                        'tr' => $name_tr
                    ],
                    'description' => [
                        'de' => $desc_de,
                        'en' => $desc_en,
                        'da' => $desc_da,
                        'tr' => $desc_tr
                    ],
                    'icon' => $icon,
                    'image' => $image_url
                ]
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create subcategory: ' . $e->getMessage()]);
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
            'version' => '5.0.0-subcategories'
        ]);
        break;

    case 'delete_category':
        try {
            $categoryId = $_GET['id'] ?? null;

            if (!$categoryId) {
                http_response_code(400);
                echo json_encode(['error' => 'Category ID is required']);
                break;
            }

            // First check if category exists
            $checkStmt = $dbh->prepare("SELECT id, name_de FROM categories WHERE id = ?");
            $checkStmt->execute([$categoryId]);
            $category = $checkStmt->fetch(PDO::FETCH_ASSOC);

            if (!$category) {
                http_response_code(404);
                echo json_encode(['error' => 'Category not found']);
                break;
            }

            // Check if category has products
            $productCheckStmt = $dbh->prepare("SELECT COUNT(*) as count FROM products WHERE category_id = ?");
            $productCheckStmt->execute([$categoryId]);
            $productCount = $productCheckStmt->fetch(PDO::FETCH_ASSOC)['count'];

            if ($productCount > 0) {
                // Delete all products in this category first
                $deleteProductsStmt = $dbh->prepare("DELETE FROM products WHERE category_id = ?");
                $deleteProductsStmt->execute([$categoryId]);
            }

            // Check if category has subcategories
            $subcatCheckStmt = $dbh->prepare("SELECT COUNT(*) as count FROM subcategories WHERE category_id = ?");
            $subcatCheckStmt->execute([$categoryId]);
            $subcatCount = $subcatCheckStmt->fetch(PDO::FETCH_ASSOC)['count'];

            if ($subcatCount > 0) {
                // Delete products in subcategories first
                $deleteSubcatProductsStmt = $dbh->prepare("
                    DELETE p FROM products p
                    INNER JOIN subcategories s ON p.subcategory_id = s.id
                    WHERE s.category_id = ?
                ");
                $deleteSubcatProductsStmt->execute([$categoryId]);

                // Delete subcategories
                $deleteSubcatsStmt = $dbh->prepare("DELETE FROM subcategories WHERE category_id = ?");
                $deleteSubcatsStmt->execute([$categoryId]);
            }

            // Finally delete the category
            $deleteCatStmt = $dbh->prepare("DELETE FROM categories WHERE id = ?");
            $deleteCatStmt->execute([$categoryId]);

            echo json_encode([
                'success' => true,
                'message' => 'Category deleted successfully',
                'details' => [
                    'category_name' => $category['name_de'],
                    'products_deleted' => $productCount,
                    'subcategories_deleted' => $subcatCount
                ]
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete category: ' . $e->getMessage()]);
        }
        break;

    case 'delete_product':
        try {
            $productId = $_GET['id'] ?? null;
            $categoryId = $_GET['category_id'] ?? null;

            if (!$productId) {
                http_response_code(400);
                echo json_encode(['error' => 'Product ID is required']);
                break;
            }

            // Delete the product
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

    case 'update_subcategory':
        try {
            $subcategoryId = $_GET['id'] ?? null;
            $input = json_decode(file_get_contents('php://input'), true);

            if (!$subcategoryId || !$input) {
                http_response_code(400);
                echo json_encode(['error' => 'Subcategory ID and data are required']);
                break;
            }

            // Extract translations
            $name_de = is_array($input['name']) ? ($input['name']['de'] ?? '') : ($input['name'] ?? '');
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

            $stmt = $dbh->prepare("
                UPDATE subcategories SET
                    name_de = ?, name_en = ?, name_tr = ?, name_da = ?,
                    description_de = ?, description_en = ?, description_tr = ?, description_da = ?
                WHERE id = ?
            ");

            $stmt->execute([
                $name_de, $name_en, $name_tr, $name_da,
                $desc_de, $desc_en, $desc_tr, $desc_da,
                $subcategoryId
            ]);

            echo json_encode([
                'success' => true,
                'message' => 'Subcategory updated successfully'
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update subcategory: ' . $e->getMessage()]);
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

            // Extract multilingual fields
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

            $category_id = $input['category_id'] ?? null;
            $subcategory_id = $input['subcategory_id'] ?? null;
            $price = (float)($input['price'] ?? 0);
            $image_url = $input['image'] ?? $input['imageUrl'] ?? '';
            $available = isset($input['available']) ? (bool)$input['available'] : true;

            // Handle badges
            $badge_new = false;
            $badge_popular = false;
            $badge_limited = false;

            if (isset($input['badges']) && is_array($input['badges'])) {
                $badge_new = (bool)($input['badges']['neu'] ?? false);
                $badge_popular = (bool)($input['badges']['beliebt'] ?? false);
                $badge_limited = (bool)($input['badges']['kurze_zeit'] ?? false);
            }

            $stmt = $dbh->prepare("
                INSERT INTO products (
                    category_id, subcategory_id,
                    name_de, name_en, name_tr, name_da,
                    description_de, description_en, description_tr, description_da,
                    price, image_url, available,
                    badge_new, badge_popular, badge_limited,
                    sort_order
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 999)
            ");

            $stmt->execute([
                $category_id, $subcategory_id,
                $name_de, $name_en, $name_tr, $name_da,
                $desc_de, $desc_en, $desc_tr, $desc_da,
                $price, $image_url, $available ? 1 : 0,
                $badge_new ? 1 : 0, $badge_popular ? 1 : 0, $badge_limited ? 1 : 0
            ]);

            $product_id = $dbh->lastInsertId();

            echo json_encode([
                'success' => true,
                'message' => 'Product created successfully',
                'product' => [
                    'id' => (string)$product_id,
                    'name' => [
                        'de' => $name_de,
                        'en' => $name_en,
                        'tr' => $name_tr,
                        'da' => $name_da
                    ],
                    'description' => [
                        'de' => $desc_de,
                        'en' => $desc_en,
                        'tr' => $desc_tr,
                        'da' => $desc_da
                    ],
                    'price' => $price,
                    'image' => $image_url,
                    'available' => $available,
                    'badges' => [
                        'neu' => $badge_new,
                        'beliebt' => $badge_popular,
                        'kurze_zeit' => $badge_limited
                    ]
                ]
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create product: ' . $e->getMessage()]);
        }
        break;

    default:
        http_response_code(404);
        echo json_encode([
            'error' => 'Action not found',
            'available_actions' => ['test', 'login', 'products', 'subcategories', 'create_subcategory', 'delete_category', 'delete_product', 'update_subcategory', 'create_product', 'settings', 'health']
        ]);
        break;
}
?>