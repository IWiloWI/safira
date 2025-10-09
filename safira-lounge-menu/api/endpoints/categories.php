<?php
/**
 * Categories API Endpoint
 * Handles category management
 */

global $dbh;

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['REQUEST_URI'];

// Parse path segments
$segments = explode('/', trim(parse_url($path, PHP_URL_PATH), '/'));
$apiIndex = array_search('api', $segments);
$categoriesIndex = array_search('categories', $segments);

switch ($method) {
    case 'GET':
        if (count($segments) > $categoriesIndex + 1) {
            // GET /api/categories/{id} - Get specific category
            $categoryId = $segments[$categoriesIndex + 1];
            getCategory($dbh, $categoryId);
        } else {
            // GET /api/categories - Get all categories
            getAllCategories($dbh);
        }
        break;

    case 'POST':
        // POST /api/categories - Add new category
        addCategory($dbh);
        break;

    case 'PUT':
        // PUT /api/categories/{id} - Update category
        if (isset($segments[$categoriesIndex + 1])) {
            $categoryId = $segments[$categoriesIndex + 1];
            updateCategory($dbh, $categoryId);
        } else {
            sendError('Category ID required', 400);
        }
        break;

    case 'DELETE':
        // DELETE /api/categories/{id} - Delete category
        if (isset($segments[$categoriesIndex + 1])) {
            $categoryId = $segments[$categoriesIndex + 1];
            deleteCategory($dbh, $categoryId);
        } else {
            sendError('Category ID required', 400);
        }
        break;

    default:
        sendError('Method not allowed', 405);
        break;
}

/**
 * Get all categories
 */
function getAllCategories($dbh) {
    try {
        $query = "SELECT * FROM categories ORDER BY name_de";
        $stmt = $dbh->prepare($query);
        $stmt->execute();
        $categories = $stmt->fetchAll();

        $result = array_map(function($category) {
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

            return [
                'id' => (string)$category['id'],
                'name' => $categoryName,
                'icon' => $category['icon'],
                'description' => $categoryDesc,
                'isMainCategory' => (bool)($category['is_main_category'] ?? true),
                'parentPage' => $category['parent_category_id'] ? (string)$category['parent_category_id'] : null
            ];
        }, $categories);

        sendJson(['categories' => $result]);

    } catch (PDOException $e) {
        error_log("Database error in getAllCategories: " . $e->getMessage());
        sendError('Failed to fetch categories', 500);
    }
}

/**
 * Get specific category by ID
 */
function getCategory($dbh, $categoryId) {
    try {
        $query = "SELECT * FROM categories WHERE id = ?";
        $stmt = $dbh->prepare($query);
        $stmt->execute([$categoryId]);
        $category = $stmt->fetch();

        if (!$category) {
            sendError('Category not found', 404);
        }

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

        $result = [
            'id' => (string)$category['id'],
            'name' => $categoryName,
            'icon' => $category['icon'],
            'description' => $categoryDesc,
            'isMainCategory' => (bool)($category['is_main_category'] ?? true),
            'parentPage' => $category['parent_category_id'] ? (string)$category['parent_category_id'] : null
        ];

        sendJson($result);

    } catch (PDOException $e) {
        error_log("Database error in getCategory: " . $e->getMessage());
        sendError('Failed to fetch category', 500);
    }
}

/**
 * Add new category
 */
function addCategory($dbh) {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        sendError('Invalid JSON input', 400);
    }

    // Validate required fields
    if (!isset($input['name']) || !isset($input['icon'])) {
        sendError('Name and icon are required', 400);
    }

    try {
        $query = "INSERT INTO categories (id, name, icon, description)
                  VALUES (?, ?, ?, ?)";

        $categoryId = uniqid();
        $name = json_encode($input['name']);
        $icon = $input['icon'];
        $description = json_encode($input['description'] ?? []);

        $stmt = $dbh->prepare($query);
        $stmt->execute([
            $categoryId,
            $name,
            $icon,
            $description
        ]);

        sendJson(['message' => 'Category added successfully', 'id' => $categoryId], 201);

    } catch (PDOException $e) {
        error_log("Database error in addCategory: " . $e->getMessage());
        sendError('Failed to add category', 500);
    }
}

/**
 * Update existing category
 */
function updateCategory($dbh, $categoryId) {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        sendError('Invalid JSON input', 400);
    }

    try {
        // Check if category exists
        $checkQuery = "SELECT id FROM categories WHERE id = ?";
        $stmt = $dbh->prepare($checkQuery);
        $stmt->execute([$categoryId]);

        if (!$stmt->fetch()) {
            sendError('Category not found', 404);
        }

        // Update category
        $query = "UPDATE categories SET
                  name = COALESCE(?, name),
                  icon = COALESCE(?, icon),
                  description = COALESCE(?, description)
                  WHERE id = ?";

        $name = isset($input['name']) ? json_encode($input['name']) : null;
        $icon = $input['icon'] ?? null;
        $description = isset($input['description']) ? json_encode($input['description']) : null;

        $stmt = $dbh->prepare($query);
        $stmt->execute([
            $name,
            $icon,
            $description,
            $categoryId
        ]);

        sendJson(['message' => 'Category updated successfully']);

    } catch (PDOException $e) {
        error_log("Database error in updateCategory: " . $e->getMessage());
        sendError('Failed to update category', 500);
    }
}

/**
 * Delete category
 */
function deleteCategory($dbh, $categoryId) {
    try {
        // Check if category exists
        $checkQuery = "SELECT id FROM categories WHERE id = ?";
        $stmt = $dbh->prepare($checkQuery);
        $stmt->execute([$categoryId]);

        if (!$stmt->fetch()) {
            sendError('Category not found', 404);
        }

        // Check if category has products
        $productsQuery = "SELECT COUNT(*) as count FROM products WHERE category_id = ?";
        $stmt = $dbh->prepare($productsQuery);
        $stmt->execute([$categoryId]);
        $result = $stmt->fetch();

        if ($result['count'] > 0) {
            sendError('Cannot delete category with products', 400);
        }

        // Delete category
        $query = "DELETE FROM categories WHERE id = ?";
        $stmt = $dbh->prepare($query);
        $stmt->execute([$categoryId]);

        sendJson(['message' => 'Category deleted successfully']);

    } catch (PDOException $e) {
        error_log("Database error in deleteCategory: " . $e->getMessage());
        sendError('Failed to delete category', 500);
    }
}
?>