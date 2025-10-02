<?php
/**
 * Database Schema Inspection Script
 * Checks current database schema and identifies missing columns
 */

header('Content-Type: application/json; charset=utf-8');

// Database connection
$host_name = 'db5018522360.hosting-data.io';
$database = 'dbs14708743';
$user_name = 'dbu3362598';
$password = '!Aramat1.';

try {
    $dbh = new PDO("mysql:host=$host_name;dbname=$database;charset=utf8mb4", $user_name, $password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $results = [
        'status' => 'success',
        'timestamp' => date('c'),
        'database' => $database,
        'tables' => [],
        'issues' => [],
        'recommendations' => []
    ];

    // Check existing tables
    $tablesQuery = "SHOW TABLES";
    $stmt = $dbh->query($tablesQuery);
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

    $results['tables'] = $tables;

    // Check categories table structure
    if (in_array('categories', $tables)) {
        $columnsQuery = "DESCRIBE categories";
        $stmt = $dbh->query($columnsQuery);
        $categoryColumns = $stmt->fetchAll(PDO::FETCH_COLUMN);

        $results['categories_schema'] = [
            'exists' => true,
            'columns' => $categoryColumns,
            'missing_columns' => []
        ];

        // Check for required columns
        $requiredCategoryColumns = [
            'id', 'name', 'description', 'icon',
            'parent_category_id', 'is_main_category', 'sort_order'
        ];

        foreach ($requiredCategoryColumns as $col) {
            if (!in_array($col, $categoryColumns)) {
                $results['categories_schema']['missing_columns'][] = $col;
                $results['issues'][] = "Missing column 'categories.$col'";
            }
        }
    } else {
        $results['categories_schema'] = ['exists' => false];
        $results['issues'][] = "Table 'categories' does not exist";
    }

    // Check products table structure
    if (in_array('products', $tables)) {
        $columnsQuery = "DESCRIBE products";
        $stmt = $dbh->query($columnsQuery);
        $productColumns = $stmt->fetchAll(PDO::FETCH_COLUMN);

        $results['products_schema'] = [
            'exists' => true,
            'columns' => $productColumns,
            'missing_columns' => []
        ];

        // Check for required columns
        $requiredProductColumns = [
            'id', 'category_id', 'name', 'description', 'price',
            'image_url', 'available', 'isMenuPackage', 'menuContents', 'isTobacco'
        ];

        foreach ($requiredProductColumns as $col) {
            if (!in_array($col, $productColumns)) {
                $results['products_schema']['missing_columns'][] = $col;
                $results['issues'][] = "Missing column 'products.$col'";
            }
        }
    } else {
        $results['products_schema'] = ['exists' => false];
        $results['issues'][] = "Table 'products' does not exist";
    }

    // Check product_sizes table
    if (in_array('product_sizes', $tables)) {
        $results['product_sizes_schema'] = ['exists' => true];
    } else {
        $results['product_sizes_schema'] = ['exists' => false];
        $results['issues'][] = "Table 'product_sizes' does not exist (optional but recommended for size variants)";
    }

    // Check subcategories support
    if (in_array('subcategories', $tables)) {
        $results['subcategories_schema'] = ['exists' => true];
    } else {
        $results['subcategories_schema'] = ['exists' => false];
        $results['recommendations'][] = "Consider using parent_category_id in categories table for subcategories instead of separate table";
    }

    // Sample data counts
    if (in_array('categories', $tables)) {
        $countStmt = $dbh->query("SELECT COUNT(*) as count FROM categories");
        $results['data_counts']['categories'] = $countStmt->fetch(PDO::FETCH_ASSOC)['count'];
    }

    if (in_array('products', $tables)) {
        $countStmt = $dbh->query("SELECT COUNT(*) as count FROM products");
        $results['data_counts']['products'] = $countStmt->fetch(PDO::FETCH_ASSOC)['count'];
    }

    // Recommendations
    if (count($results['issues']) > 0) {
        $results['recommendations'][] = "Run the database migration script to add missing columns";
        $results['migration_required'] = true;
    } else {
        $results['migration_required'] = false;
    }

    echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database connection failed',
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>
