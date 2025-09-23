<?php
/**
 * DEBUG VERSION - Categories API Endpoint
 * Handles category management with enhanced debugging
 */

global $dbh;

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['REQUEST_URI'];

// Parse path segments
$segments = explode('/', trim(parse_url($path, PHP_URL_PATH), '/'));
$apiIndex = array_search('api-debug', $segments);
if ($apiIndex === false) {
    $apiIndex = array_search('api', $segments);
}
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
 * Get all categories with enhanced debugging
 */
function getAllCategories($dbh) {
    try {
        // First, let's check what columns actually exist
        $tableStructure = getTableStructure($dbh, 'categories');
        $tableColumns = getTableColumns($dbh, 'categories');

        $query = "SELECT * FROM categories ORDER BY name";
        $stmt = $dbh->prepare($query);
        $stmt->execute();
        $categories = $stmt->fetchAll();

        // Enhanced processing with debug info
        $result = [];
        $debugInfo = [];

        foreach ($categories as $index => $category) {
            $processedCategory = [
                'id' => $category['id'],
                'name' => json_decode($category['name'] ?? '{}'),
                'icon' => $category['icon'],
                'description' => json_decode($category['description'] ?? '{}')
            ];

            // Add debug info for first few records
            if ($index < 2) {
                $debugInfo["category_$index"] = [
                    'raw_data' => $category,
                    'available_columns' => array_keys($category),
                    'name_json_decode_success' => json_last_error() === JSON_ERROR_NONE,
                    'description_json_decode_success' => json_last_error() === JSON_ERROR_NONE
                ];
            }

            $result[] = $processedCategory;
        }

        sendJson([
            'categories' => $result,
            'debug_info' => [
                'total_categories' => count($categories),
                'table_structure' => $tableStructure,
                'table_columns' => array_column($tableColumns, 'COLUMN_NAME'),
                'sample_processing' => $debugInfo,
                'query_executed' => $query
            ]
        ]);

    } catch (PDOException $e) {
        error_log("Database error in getAllCategories: " . $e->getMessage());
        sendError('Failed to fetch categories', 500, [
            'database_error' => $e->getMessage(),
            'error_code' => $e->getCode(),
            'query' => $query ?? 'Query not set'
        ]);
    }
}

/**
 * Get specific category by ID with debugging
 */
function getCategory($dbh, $categoryId) {
    try {
        $query = "SELECT * FROM categories WHERE id = ?";
        $stmt = $dbh->prepare($query);
        $stmt->execute([$categoryId]);
        $category = $stmt->fetch();

        if (!$category) {
            sendError('Category not found', 404, [
                'searched_id' => $categoryId,
                'query' => $query
            ]);
        }

        $result = [
            'id' => $category['id'],
            'name' => json_decode($category['name'] ?? '{}'),
            'icon' => $category['icon'],
            'description' => json_decode($category['description'] ?? '{}')
        ];

        sendJson([
            'category' => $result,
            'debug_info' => [
                'raw_data' => $category,
                'available_columns' => array_keys($category),
                'query_executed' => $query,
                'category_id_searched' => $categoryId
            ]
        ]);

    } catch (PDOException $e) {
        error_log("Database error in getCategory: " . $e->getMessage());
        sendError('Failed to fetch category', 500, [
            'database_error' => $e->getMessage(),
            'category_id' => $categoryId
        ]);
    }
}

/**
 * Add new category with enhanced debugging
 */
function addCategory($dbh) {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        sendError('Invalid JSON input', 400, [
            'raw_input' => file_get_contents('php://input'),
            'json_error' => json_last_error_msg()
        ]);
    }

    // Validate required fields
    if (!isset($input['name']) || !isset($input['icon'])) {
        sendError('Name and icon are required', 400, [
            'received_fields' => array_keys($input),
            'required_fields' => ['name', 'icon']
        ]);
    }

    try {
        // Check table structure before insert
        $tableStructure = getTableStructure($dbh, 'categories');
        $tableColumns = array_column(getTableColumns($dbh, 'categories'), 'COLUMN_NAME');

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

        // Verify the insert by fetching the new record
        $verifyQuery = "SELECT * FROM categories WHERE id = ?";
        $verifyStmt = $dbh->prepare($verifyQuery);
        $verifyStmt->execute([$categoryId]);
        $insertedCategory = $verifyStmt->fetch();

        sendJson([
            'message' => 'Category added successfully',
            'id' => $categoryId,
            'debug_info' => [
                'table_columns_available' => $tableColumns,
                'table_structure' => $tableStructure,
                'input_received' => $input,
                'values_inserted' => [
                    'id' => $categoryId,
                    'name' => $name,
                    'icon' => $icon,
                    'description' => $description
                ],
                'inserted_record' => $insertedCategory,
                'query_executed' => $query
            ]
        ], 201);

    } catch (PDOException $e) {
        error_log("Database error in addCategory: " . $e->getMessage());
        sendError('Failed to add category', 500, [
            'database_error' => $e->getMessage(),
            'error_code' => $e->getCode(),
            'input_data' => $input,
            'query' => $query ?? 'Query not set'
        ]);
    }
}

/**
 * Update existing category with debugging
 */
function updateCategory($dbh, $categoryId) {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        sendError('Invalid JSON input', 400);
    }

    try {
        // Check if category exists
        $checkQuery = "SELECT * FROM categories WHERE id = ?";
        $stmt = $dbh->prepare($checkQuery);
        $stmt->execute([$categoryId]);
        $existingCategory = $stmt->fetch();

        if (!$existingCategory) {
            sendError('Category not found', 404, [
                'category_id' => $categoryId,
                'query' => $checkQuery
            ]);
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

        // Get updated record
        $updatedStmt = $dbh->prepare($checkQuery);
        $updatedStmt->execute([$categoryId]);
        $updatedCategory = $updatedStmt->fetch();

        sendJson([
            'message' => 'Category updated successfully',
            'debug_info' => [
                'category_id' => $categoryId,
                'input_received' => $input,
                'before_update' => $existingCategory,
                'after_update' => $updatedCategory,
                'values_set' => [
                    'name' => $name,
                    'icon' => $icon,
                    'description' => $description
                ]
            ]
        ]);

    } catch (PDOException $e) {
        error_log("Database error in updateCategory: " . $e->getMessage());
        sendError('Failed to update category', 500, [
            'database_error' => $e->getMessage(),
            'category_id' => $categoryId
        ]);
    }
}

/**
 * Delete category with debugging
 */
function deleteCategory($dbh, $categoryId) {
    try {
        // Check if category exists
        $checkQuery = "SELECT * FROM categories WHERE id = ?";
        $stmt = $dbh->prepare($checkQuery);
        $stmt->execute([$categoryId]);
        $category = $stmt->fetch();

        if (!$category) {
            sendError('Category not found', 404, [
                'category_id' => $categoryId,
                'query' => $checkQuery
            ]);
        }

        // Check if category has products
        $productsQuery = "SELECT COUNT(*) as count FROM products WHERE category_id = ?";
        $stmt = $dbh->prepare($productsQuery);
        $stmt->execute([$categoryId]);
        $result = $stmt->fetch();

        if ($result['count'] > 0) {
            sendError('Cannot delete category with products', 400, [
                'category_id' => $categoryId,
                'products_count' => $result['count']
            ]);
        }

        // Delete category
        $query = "DELETE FROM categories WHERE id = ?";
        $stmt = $dbh->prepare($query);
        $stmt->execute([$categoryId]);

        sendJson([
            'message' => 'Category deleted successfully',
            'debug_info' => [
                'deleted_category' => $category,
                'category_id' => $categoryId,
                'products_check' => $result
            ]
        ]);

    } catch (PDOException $e) {
        error_log("Database error in deleteCategory: " . $e->getMessage());
        sendError('Failed to delete category', 500, [
            'database_error' => $e->getMessage(),
            'category_id' => $categoryId
        ]);
    }
}
?>