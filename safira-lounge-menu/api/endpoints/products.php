<?php
/**
 * Products API Endpoint
 * Handles product and category data
 */

global $dbh;

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['REQUEST_URI'];

// Parse path segments
$segments = explode('/', trim(parse_url($path, PHP_URL_PATH), '/'));
$apiIndex = array_search('api', $segments);
$productsIndex = array_search('products', $segments);

switch ($method) {
    case 'GET':
        if (count($segments) > $productsIndex + 1) {
            // GET /api/products/{id} - Get specific product
            $productId = $segments[$productsIndex + 1];
            getProduct($dbh, $productId);
        } else {
            // GET /api/products - Get all products with categories
            getAllProducts($dbh);
        }
        break;

    case 'POST':
        // POST /api/products/{categoryId}/items - Add new product
        if (isset($segments[$productsIndex + 1]) && isset($segments[$productsIndex + 2]) && $segments[$productsIndex + 2] === 'items') {
            $categoryId = $segments[$productsIndex + 1];
            addProduct($dbh, $categoryId);
        } else {
            sendError('Invalid endpoint', 400);
        }
        break;

    case 'PUT':
        // PUT /api/products/{id} - Update product
        if (isset($segments[$productsIndex + 1])) {
            $productId = $segments[$productsIndex + 1];
            updateProduct($dbh, $productId);
        } else {
            sendError('Product ID required', 400);
        }
        break;

    case 'DELETE':
        // DELETE /api/products/{id} - Delete product
        if (isset($segments[$productsIndex + 1])) {
            $productId = $segments[$productsIndex + 1];
            deleteProduct($dbh, $productId);
        } else {
            sendError('Product ID required', 400);
        }
        break;

    default:
        sendError('Method not allowed', 405);
        break;
}

/**
 * Get all products organized by categories
 */
function getAllProducts($dbh) {
    try {
        // Get all categories
        $categoriesQuery = "SELECT * FROM categories ORDER BY name_de";
        $stmt = $dbh->prepare($categoriesQuery);
        $stmt->execute();
        $categories = $stmt->fetchAll();

        // Get all products
        $productsQuery = "SELECT * FROM products WHERE available = 1 ORDER BY name_de";
        $stmt = $dbh->prepare($productsQuery);
        $stmt->execute();
        $products = $stmt->fetchAll();

        // Group products by category
        $result = ['categories' => []];

        foreach ($categories as $category) {
            $categoryProducts = array_filter($products, function($product) use ($category) {
                return $product['category_id'] === $category['id'];
            });

            // Build multilingual name object
            $categoryName = [
                'de' => $category['name_de'] ?? '',
                'en' => $category['name_en'] ?? '',
                'tr' => $category['name_tr'] ?? '',
                'da' => $category['name_da'] ?? ''
            ];

            // Build multilingual description object
            $categoryDesc = [
                'de' => $category['description_de'] ?? '',
                'en' => $category['description_en'] ?? '',
                'tr' => $category['description_tr'] ?? '',
                'da' => $category['description_da'] ?? ''
            ];

            $result['categories'][] = [
                'id' => (string)$category['id'],
                'name' => $categoryName,
                'icon' => $category['icon'],
                'description' => $categoryDesc,
                'isMainCategory' => (bool)($category['is_main_category'] ?? true),
                'parentPage' => $category['parent_category_id'] ? (string)$category['parent_category_id'] : null,
                'items' => array_map(function($product) {
                    // Build multilingual product name
                    $productName = [
                        'de' => $product['name_de'] ?? '',
                        'en' => $product['name_en'] ?? '',
                        'tr' => $product['name_tr'] ?? '',
                        'da' => $product['name_da'] ?? ''
                    ];

                    // Build multilingual product description
                    $productDesc = [
                        'de' => $product['description_de'] ?? '',
                        'en' => $product['description_en'] ?? '',
                        'tr' => $product['description_tr'] ?? '',
                        'da' => $product['description_da'] ?? ''
                    ];

                    return [
                        'id' => (string)$product['id'],
                        'name' => $productName,
                        'description' => $productDesc,
                        'price' => (float)$product['price'],
                        'imageUrl' => $product['image_url'],
                        'available' => (bool)$product['available'],
                        'isTobacco' => (bool)($product['is_tobacco'] ?? false),
                        'brand' => $product['brand'] ?? null,
                        'isMenuPackage' => (bool)($product['is_menu_package'] ?? false),
                        'menuContents' => $product['package_items'] ?? null
                    ];
                }, array_values($categoryProducts))
            ];
        }

        sendJson($result);

    } catch (PDOException $e) {
        error_log("Database error in getAllProducts: " . $e->getMessage());
        sendError('Failed to fetch products', 500);
    }
}

/**
 * Get specific product by ID
 */
function getProduct($dbh, $productId) {
    try {
        $query = "SELECT * FROM products WHERE id = ?";
        $stmt = $dbh->prepare($query);
        $stmt->execute([$productId]);
        $product = $stmt->fetch();

        if (!$product) {
            sendError('Product not found', 404);
        }

        $result = [
            'id' => $product['id'],
            'name' => json_decode($product['name'] ?? '{}'),
            'description' => json_decode($product['description'] ?? '{}'),
            'price' => (float)$product['price'],
            'imageUrl' => $product['image_url'],
            'available' => (bool)$product['available'],
            'categoryId' => $product['category_id'],
            'isTobacco' => (bool)($product['is_tobacco'] ?? false),
            'brand' => $product['brand'] ?? null,
            'isMenuPackage' => (bool)($product['is_menu_package'] ?? false),
            'menuContents' => $product['package_items'] ?? null
        ];

        sendJson($result);

    } catch (PDOException $e) {
        error_log("Database error in getProduct: " . $e->getMessage());
        sendError('Failed to fetch product', 500);
    }
}

/**
 * Add new product to category
 */
function addProduct($dbh, $categoryId) {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        sendError('Invalid JSON input', 400);
    }

    // Validate required fields
    if (!isset($input['name'])) {
        sendError('Name is required', 400);
    }

    // Price is required unless it's a menu package with package items
    $isMenuPackage = isset($input['is_menu_package']) && $input['is_menu_package'];
    if (!$isMenuPackage && !isset($input['price'])) {
        sendError('Price is required', 400);
    }

    // Package items are required for menu packages
    if ($isMenuPackage && empty($input['package_items'])) {
        sendError('Package items are required for menu packages', 400);
    }

    try {
        $query = "INSERT INTO products (id, category_id, name, description, price, image_url, available, is_tobacco, brand, is_menu_package, package_items)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $productId = uniqid();
        $name = json_encode($input['name']);
        $description = json_encode($input['description'] ?? []);
        $price = isset($input['price']) ? (float)$input['price'] : null;
        $imageUrl = $input['imageUrl'] ?? null;
        $available = $input['available'] ?? true;
        $isTobacco = isset($input['is_tobacco']) ? (int)$input['is_tobacco'] : 0;
        $brand = $input['brand'] ?? null;
        $isMenuPackage = isset($input['is_menu_package']) ? (int)$input['is_menu_package'] : 0;
        $packageItems = $input['package_items'] ?? null;

        $stmt = $dbh->prepare($query);
        $stmt->execute([
            $productId,
            $categoryId,
            $name,
            $description,
            $price,
            $imageUrl,
            $available ? 1 : 0,
            $isTobacco,
            $brand,
            $isMenuPackage,
            $packageItems
        ]);

        sendJson(['message' => 'Product added successfully', 'id' => $productId], 201);

    } catch (PDOException $e) {
        error_log("Database error in addProduct: " . $e->getMessage());
        sendError('Failed to add product', 500);
    }
}

/**
 * Update existing product
 */
function updateProduct($dbh, $productId) {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        sendError('Invalid JSON input', 400);
    }

    try {
        // Check if product exists
        $checkQuery = "SELECT id FROM products WHERE id = ?";
        $stmt = $dbh->prepare($checkQuery);
        $stmt->execute([$productId]);

        if (!$stmt->fetch()) {
            sendError('Product not found', 404);
        }

        // Update product
        $query = "UPDATE products SET
                  name = COALESCE(?, name),
                  description = COALESCE(?, description),
                  price = COALESCE(?, price),
                  image_url = COALESCE(?, image_url),
                  available = COALESCE(?, available),
                  is_tobacco = COALESCE(?, is_tobacco),
                  brand = COALESCE(?, brand),
                  is_menu_package = COALESCE(?, is_menu_package),
                  package_items = COALESCE(?, package_items)
                  WHERE id = ?";

        $name = isset($input['name']) ? json_encode($input['name']) : null;
        $description = isset($input['description']) ? json_encode($input['description']) : null;
        $price = isset($input['price']) ? (float)$input['price'] : null;
        $imageUrl = $input['imageUrl'] ?? null;
        $available = isset($input['available']) ? ($input['available'] ? 1 : 0) : null;
        $isTobacco = isset($input['is_tobacco']) ? (int)$input['is_tobacco'] : null;
        $brand = $input['brand'] ?? null;
        $isMenuPackage = isset($input['is_menu_package']) ? (int)$input['is_menu_package'] : null;
        $packageItems = $input['package_items'] ?? null;

        $stmt = $dbh->prepare($query);
        $stmt->execute([
            $name,
            $description,
            $price,
            $imageUrl,
            $available,
            $isTobacco,
            $brand,
            $isMenuPackage,
            $packageItems,
            $productId
        ]);

        sendJson(['message' => 'Product updated successfully']);

    } catch (PDOException $e) {
        error_log("Database error in updateProduct: " . $e->getMessage());
        sendError('Failed to update product', 500);
    }
}

/**
 * Delete product
 */
function deleteProduct($dbh, $productId) {
    try {
        // Check if product exists
        $checkQuery = "SELECT id FROM products WHERE id = ?";
        $stmt = $dbh->prepare($checkQuery);
        $stmt->execute([$productId]);

        if (!$stmt->fetch()) {
            sendError('Product not found', 404);
        }

        // Delete product
        $query = "DELETE FROM products WHERE id = ?";
        $stmt = $dbh->prepare($query);
        $stmt->execute([$productId]);

        sendJson(['message' => 'Product deleted successfully']);

    } catch (PDOException $e) {
        error_log("Database error in deleteProduct: " . $e->getMessage());
        sendError('Failed to delete product', 500);
    }
}
?>