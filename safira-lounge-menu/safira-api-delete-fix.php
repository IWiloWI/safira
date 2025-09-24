<?php
/**
 * EMERGENCY FIX: Safira API with corrected DELETE endpoint
 * Fixed: Product deletion now properly removes from database
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database connection - IONOS credentials
$host = 'db5018522360.hosting-data.io';
$dbname = 'dbs14708743';
$username = 'dbu3362598';
$password = '!Aramat1.';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}

// Authentication
function authenticate() {
    $headers = getallheaders();
    $token = $headers['Authorization'] ?? '';

    // Simple token validation - in production use proper JWT
    if (strpos($token, 'Bearer ') === 0) {
        $token = substr($token, 7);
    }

    // For admin login
    if (isset($_POST['username']) && isset($_POST['password'])) {
        if ($_POST['username'] === 'admin' && $_POST['password'] === 'admin123') {
            return true;
        }
    }

    return !empty($token); // Accept any token for now
}

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['REQUEST_URI'];
$pathSegments = explode('/', trim(parse_url($path, PHP_URL_PATH), '/'));

// Remove script name from path segments
if (end($pathSegments) === 'safira-api-fixed.php' || end($pathSegments) === 'safira-api-delete-fix.php') {
    array_pop($pathSegments);
}

// Route handling
switch ($method) {
    case 'GET':
        if (isset($_GET['action']) && $_GET['action'] === 'products') {
            handleGetProducts($pdo);
        } else {
            handleGetProducts($pdo);
        }
        break;

    case 'POST':
        if (isset($_POST['username'])) {
            handleLogin();
        } else {
            handleCreateProduct($pdo);
        }
        break;

    case 'PUT':
        if (count($pathSegments) >= 2 && $pathSegments[0] === 'products') {
            $productId = $pathSegments[1];
            handleUpdateProduct($pdo, $productId);
        }
        break;

    case 'DELETE':
        if (count($pathSegments) >= 2 && $pathSegments[0] === 'products') {
            $productId = $pathSegments[1];
            handleDeleteProduct($pdo, $productId);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Product ID required for deletion']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}

function handleLogin() {
    if ($_POST['username'] === 'admin' && $_POST['password'] === 'admin123') {
        echo json_encode([
            'success' => true,
            'token' => 'admin_token_' . time(),
            'user' => ['id' => 1, 'username' => 'admin', 'role' => 'admin']
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
    }
}

function handleGetProducts($pdo) {
    try {
        // Get all products with category information
        $stmt = $pdo->query("
            SELECT
                p.*,
                c.name_de as category_name_de,
                c.name_en as category_name_en,
                c.name_tr as category_name_tr,
                c.name_da as category_name_da,
                sc.name_de as subcategory_name_de,
                sc.name_en as subcategory_name_en,
                sc.name_tr as subcategory_name_tr,
                sc.name_da as subcategory_name_da
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
            ORDER BY p.sort_order, p.id
        ");

        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Transform to expected format
        $categories = [];
        $categoryMap = [];

        foreach ($products as $product) {
            $categoryId = $product['category_id'] ?: 'unassigned';
            $subcategoryId = $product['subcategory_id'] ?: 'subcat_' . $categoryId;

            // Create category if not exists
            if (!isset($categoryMap[$categoryId])) {
                $categoryMap[$categoryId] = [
                    'id' => $categoryId,
                    'name' => [
                        'de' => $product['category_name_de'] ?: 'Nicht zugeordnet',
                        'en' => $product['category_name_en'] ?: 'Unassigned',
                        'tr' => $product['category_name_tr'] ?: 'Atanmamış',
                        'da' => $product['category_name_da'] ?: 'Ikke tildelt'
                    ],
                    'icon' => 'fa-utensils',
                    'items' => []
                ];
                $categories[] = &$categoryMap[$categoryId];
            }

            // Create subcategory if not exists
            $subcategoryExists = false;
            foreach ($categoryMap[$categoryId]['items'] as &$subcat) {
                if ($subcat['id'] === $subcategoryId) {
                    $subcategoryExists = true;
                    break;
                }
            }

            if (!$subcategoryExists) {
                $categoryMap[$categoryId]['items'][] = [
                    'id' => $subcategoryId,
                    'name' => [
                        'de' => $product['subcategory_name_de'] ?: 'Standard',
                        'en' => $product['subcategory_name_en'] ?: 'Standard',
                        'tr' => $product['subcategory_name_tr'] ?: 'Standart',
                        'da' => $product['subcategory_name_da'] ?: 'Standard'
                    ],
                    'products' => []
                ];
            }

            // Add product to subcategory
            foreach ($categoryMap[$categoryId]['items'] as &$subcat) {
                if ($subcat['id'] === $subcategoryId) {
                    $subcat['products'][] = [
                        'id' => $product['id'],
                        'categoryId' => $subcategoryId,
                        'name' => [
                            'de' => $product['name_de'] ?: $product['name'] ?: 'Unbekannt',
                            'en' => $product['name_en'] ?: $product['name'] ?: 'Unknown',
                            'tr' => $product['name_tr'] ?: $product['name'] ?: 'Bilinmeyen',
                            'da' => $product['name_da'] ?: $product['name'] ?: 'Ukendt'
                        ],
                        'description' => [
                            'de' => $product['description_de'] ?: $product['description'] ?: '',
                            'en' => $product['description_en'] ?: $product['description'] ?: '',
                            'tr' => $product['description_tr'] ?: $product['description'] ?: '',
                            'da' => $product['description_da'] ?: $product['description'] ?: ''
                        ],
                        'price' => (float)$product['price'],
                        'imageUrl' => $product['image_url'],
                        'available' => (bool)$product['available'],
                        'badges' => [
                            'neu' => (bool)$product['badge_new'],
                            'beliebt' => (bool)$product['badge_popular'],
                            'kurze_zeit' => (bool)$product['badge_limited']
                        ],
                        'createdAt' => $product['created_at'],
                        'updatedAt' => $product['updated_at']
                    ];
                    break;
                }
            }
        }

        echo json_encode($categories);

    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch products: ' . $e->getMessage()]);
    }
}

function handleCreateProduct($pdo) {
    if (!authenticate()) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        return;
    }

    $input = json_decode(file_get_contents('php://input'), true);

    try {
        $stmt = $pdo->prepare("
            INSERT INTO products (
                category_id, subcategory_id, name_de, name_en, name_tr, name_da,
                description_de, description_en, description_tr, description_da,
                price, image_url, available, badge_new, badge_popular, badge_limited,
                sort_order, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        ");

        $stmt->execute([
            $input['category_id'] ?? null,
            $input['subcategory_id'] ?? null,
            $input['name_de'] ?? $input['name'] ?? '',
            $input['name_en'] ?? $input['name'] ?? '',
            $input['name_tr'] ?? $input['name'] ?? '',
            $input['name_da'] ?? $input['name'] ?? '',
            $input['description_de'] ?? $input['description'] ?? '',
            $input['description_en'] ?? $input['description'] ?? '',
            $input['description_tr'] ?? $input['description'] ?? '',
            $input['description_da'] ?? $input['description'] ?? '',
            $input['price'] ?? 0,
            $input['image_url'] ?? '',
            $input['available'] ?? 1,
            $input['badge_new'] ?? 0,
            $input['badge_popular'] ?? 0,
            $input['badge_limited'] ?? 0,
            $input['sort_order'] ?? 999
        ]);

        $productId = $pdo->lastInsertId();
        echo json_encode(['success' => true, 'id' => $productId]);

    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create product: ' . $e->getMessage()]);
    }
}

function handleUpdateProduct($pdo, $productId) {
    if (!authenticate()) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        return;
    }

    $input = json_decode(file_get_contents('php://input'), true);

    try {
        $stmt = $pdo->prepare("
            UPDATE products SET
                category_id = ?, subcategory_id = ?, name_de = ?, name_en = ?, name_tr = ?, name_da = ?,
                description_de = ?, description_en = ?, description_tr = ?, description_da = ?,
                price = ?, image_url = ?, available = ?, badge_new = ?, badge_popular = ?, badge_limited = ?,
                sort_order = ?, updated_at = NOW()
            WHERE id = ?
        ");

        $stmt->execute([
            $input['category_id'] ?? null,
            $input['subcategory_id'] ?? null,
            $input['name_de'] ?? $input['name'] ?? '',
            $input['name_en'] ?? $input['name'] ?? '',
            $input['name_tr'] ?? $input['name'] ?? '',
            $input['name_da'] ?? $input['name'] ?? '',
            $input['description_de'] ?? $input['description'] ?? '',
            $input['description_en'] ?? $input['description'] ?? '',
            $input['description_tr'] ?? $input['description'] ?? '',
            $input['description_da'] ?? $input['description'] ?? '',
            $input['price'] ?? 0,
            $input['image_url'] ?? '',
            $input['available'] ?? 1,
            $input['badge_new'] ?? 0,
            $input['badge_popular'] ?? 0,
            $input['badge_limited'] ?? 0,
            $input['sort_order'] ?? 999,
            $productId
        ]);

        echo json_encode(['success' => true]);

    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update product: ' . $e->getMessage()]);
    }
}

function handleDeleteProduct($pdo, $productId) {
    if (!authenticate()) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        return;
    }

    try {
        error_log("🗑️ PHP API: Attempting to delete product ID: $productId");

        // First check if product exists
        $checkStmt = $pdo->prepare("SELECT id, name_de, name FROM products WHERE id = ?");
        $checkStmt->execute([$productId]);
        $existingProduct = $checkStmt->fetch(PDO::FETCH_ASSOC);

        if (!$existingProduct) {
            error_log("❌ PHP API: Product $productId not found in database");
            http_response_code(404);
            echo json_encode(['error' => 'Product not found']);
            return;
        }

        error_log("✅ PHP API: Found product to delete: " . ($existingProduct['name_de'] ?: $existingProduct['name']));

        // Perform the deletion
        $deleteStmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
        $success = $deleteStmt->execute([$productId]);
        $rowsAffected = $deleteStmt->rowCount();

        if ($success && $rowsAffected > 0) {
            error_log("✅ PHP API: Successfully deleted product $productId (rows affected: $rowsAffected)");
            echo json_encode(['success' => true, 'message' => 'Product deleted successfully']);
        } else {
            error_log("❌ PHP API: Delete query executed but no rows affected (Product ID: $productId)");
            http_response_code(500);
            echo json_encode(['error' => 'Product deletion failed - no rows affected']);
        }

    } catch(Exception $e) {
        error_log("❌ PHP API: Exception during delete: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete product: ' . $e->getMessage()]);
    }
}

?>