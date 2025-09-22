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
        $categoriesQuery = "SELECT * FROM categories ORDER BY name";
        $stmt = $dbh->prepare($categoriesQuery);
        $stmt->execute();
        $categories = $stmt->fetchAll();

        // Get all products
        $productsQuery = "SELECT * FROM products WHERE available = 1 ORDER BY name";
        $stmt = $dbh->prepare($productsQuery);
        $stmt->execute();
        $products = $stmt->fetchAll();

        // Group products by category
        $result = ['categories' => []];

        foreach ($categories as $category) {
            $categoryProducts = array_filter($products, function($product) use ($category) {
                return $product['category_id'] === $category['id'];
            });

            $result['categories'][] = [
                'id' => $category['id'],
                'name' => json_decode($category['name'] ?? '{}'),
                'icon' => $category['icon'],
                'description' => json_decode($category['description'] ?? '{}'),
                'items' => array_map(function($product) {
                    return [
                        'id' => $product['id'],
                        'name' => json_decode($product['name'] ?? '{}'),
                        'description' => json_decode($product['description'] ?? '{}'),
                        'price' => (float)$product['price'],
                        'imageUrl' => $product['image_url'],
                        'available' => (bool)$product['available']
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
            'categoryId' => $product['category_id']
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
    if (!isset($input['name']) || !isset($input['price'])) {
        sendError('Name and price are required', 400);
    }

    try {
        $query = "INSERT INTO products (id, category_id, name, description, price, image_url, available)
                  VALUES (?, ?, ?, ?, ?, ?, ?)";

        $productId = uniqid();
        $name = json_encode($input['name']);
        $description = json_encode($input['description'] ?? []);
        $price = (float)$input['price'];
        $imageUrl = $input['imageUrl'] ?? null;
        $available = $input['available'] ?? true;

        $stmt = $dbh->prepare($query);
        $stmt->execute([
            $productId,
            $categoryId,
            $name,
            $description,
            $price,
            $imageUrl,
            $available ? 1 : 0
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
                  available = COALESCE(?, available)
                  WHERE id = ?";

        $name = isset($input['name']) ? json_encode($input['name']) : null;
        $description = isset($input['description']) ? json_encode($input['description']) : null;
        $price = isset($input['price']) ? (float)$input['price'] : null;
        $imageUrl = $input['imageUrl'] ?? null;
        $available = isset($input['available']) ? ($input['available'] ? 1 : 0) : null;

        $stmt = $dbh->prepare($query);
        $stmt->execute([
            $name,
            $description,
            $price,
            $imageUrl,
            $available,
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