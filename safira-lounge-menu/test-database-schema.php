#!/usr/bin/env php
<?php
/**
 * Database Schema Validation Script
 *
 * This script verifies that all required tables and columns exist
 * for the Safira Lounge Menu application to function correctly.
 *
 * Usage: php test-database-schema.php
 *
 * Exit codes:
 * 0 = All checks passed
 * 1 = Critical errors found (missing tables/columns)
 * 2 = Warnings found (missing indexes/constraints)
 */

echo "\n";
echo str_repeat("=", 70) . "\n";
echo "SAFIRA LOUNGE MENU - DATABASE SCHEMA VALIDATION\n";
echo str_repeat("=", 70) . "\n\n";

// Database connection
$host_name = 'db5018522360.hosting-data.io';
$database = 'dbs14708743';
$user_name = 'dbu3362598';
$password = '!Aramat1.';

try {
    $pdo = new PDO("mysql:host=$host_name;dbname=$database;charset=utf8mb4", $user_name, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✅ Database connection successful\n";
    echo "   Host: $host_name\n";
    echo "   Database: $database\n\n";
} catch (PDOException $e) {
    die("❌ Database connection failed: " . $e->getMessage() . "\n");
}

$errors = [];
$warnings = [];
$checks_passed = 0;
$total_checks = 0;

// =============================================================================
// TEST 1: Check Required Tables
// =============================================================================

echo "TEST 1: Checking required tables...\n";
echo str_repeat("-", 70) . "\n";

$required_tables = [
    'categories' => 'Main product categories',
    'subcategories' => 'Sub-categories within main categories',
    'products' => 'Product items',
    'product_sizes' => 'Product size/price variants'
];

foreach ($required_tables as $table => $description) {
    $total_checks++;
    $stmt = $pdo->query("SHOW TABLES LIKE '$table'");
    if ($stmt->rowCount() === 0) {
        $errors[] = "Missing table: $table ($description)";
        echo "❌ Table '$table' does not exist\n";
    } else {
        $checks_passed++;
        echo "✅ Table '$table' exists ($description)\n";
    }
}

echo "\n";

// =============================================================================
// TEST 2: Check Products Table Structure
// =============================================================================

echo "TEST 2: Checking products table structure...\n";
echo str_repeat("-", 70) . "\n";

$required_columns = [
    'id' => 'Primary key',
    'category_id' => 'Main category reference',
    'subcategory_id' => 'Subcategory reference',
    'name_de' => 'German product name',
    'name_en' => 'English product name',
    'name_da' => 'Danish product name',
    'name_tr' => 'Turkish product name',
    'description_de' => 'German description',
    'description_en' => 'English description',
    'description_da' => 'Danish description',
    'description_tr' => 'Turkish description',
    'price' => 'Base price',
    'has_variants' => 'Flag for size variants',
    'image_url' => 'Product image',
    'available' => 'Availability flag',
    'badge_new' => 'New badge',
    'badge_popular' => 'Popular badge',
    'badge_limited' => 'Limited time badge',
    'brand' => 'Product brand',
    'is_tobacco' => 'Tobacco product flag',
    'sort_order' => 'Display order',
    'created_at' => 'Creation timestamp',
    'updated_at' => 'Update timestamp'
];

$stmt = $pdo->query("DESCRIBE products");
$existing_columns = [];
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $existing_columns[$row['Field']] = $row;
}

foreach ($required_columns as $column => $description) {
    $total_checks++;
    if (!isset($existing_columns[$column])) {
        $errors[] = "Missing column in products table: $column ($description)";
        echo "❌ Column 'products.$column' does not exist\n";
    } else {
        $checks_passed++;
        echo "✅ Column 'products.$column' exists ($description)\n";
    }
}

echo "\n";

// =============================================================================
// TEST 3: Check Foreign Key Constraints
// =============================================================================

echo "TEST 3: Checking foreign key constraints...\n";
echo str_repeat("-", 70) . "\n";

$fk_checks = [
    [
        'table' => 'products',
        'column' => 'category_id',
        'references' => 'categories.id',
        'description' => 'Product to category relationship'
    ],
    [
        'table' => 'subcategories',
        'column' => 'category_id',
        'references' => 'categories.id',
        'description' => 'Subcategory to category relationship'
    ],
    [
        'table' => 'product_sizes',
        'column' => 'product_id',
        'references' => 'products.id',
        'description' => 'Product variant to product relationship'
    ]
];

foreach ($fk_checks as $fk) {
    $total_checks++;
    $stmt = $pdo->query("
        SELECT CONSTRAINT_NAME
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = '$database'
        AND TABLE_NAME = '{$fk['table']}'
        AND COLUMN_NAME = '{$fk['column']}'
        AND REFERENCED_TABLE_NAME IS NOT NULL
    ");

    if ($stmt->rowCount() > 0) {
        $checks_passed++;
        $constraint = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "✅ Foreign key exists: {$fk['table']}.{$fk['column']} → {$fk['references']}\n";
        echo "   ({$fk['description']})\n";
    } else {
        $warnings[] = "Missing foreign key: {$fk['table']}.{$fk['column']} → {$fk['references']}";
        echo "⚠️  Foreign key missing: {$fk['table']}.{$fk['column']} → {$fk['references']}\n";
        echo "   ({$fk['description']})\n";
    }
}

echo "\n";

// =============================================================================
// TEST 4: Check Indexes
// =============================================================================

echo "TEST 4: Checking indexes for performance...\n";
echo str_repeat("-", 70) . "\n";

$index_checks = [
    ['table' => 'products', 'column' => 'category_id'],
    ['table' => 'products', 'column' => 'subcategory_id'],
    ['table' => 'products', 'column' => 'available'],
    ['table' => 'subcategories', 'column' => 'category_id'],
    ['table' => 'product_sizes', 'column' => 'product_id']
];

foreach ($index_checks as $idx) {
    $total_checks++;
    $stmt = $pdo->query("
        SHOW INDEX FROM {$idx['table']} WHERE Column_name = '{$idx['column']}'
    ");

    if ($stmt->rowCount() > 0) {
        $checks_passed++;
        echo "✅ Index exists on {$idx['table']}.{$idx['column']}\n";
    } else {
        $warnings[] = "Missing index on {$idx['table']}.{$idx['column']} (performance impact)";
        echo "⚠️  Index missing on {$idx['table']}.{$idx['column']} (may impact performance)\n";
    }
}

echo "\n";

// =============================================================================
// TEST 5: Test Product Creation
// =============================================================================

echo "TEST 5: Testing product creation workflow...\n";
echo str_repeat("-", 70) . "\n";

try {
    // Get first category
    $stmt = $pdo->query("SELECT id, name_de FROM categories LIMIT 1");
    $category = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($category) {
        $total_checks++;
        echo "Using test category: {$category['name_de']} (ID: {$category['id']})\n";

        // Try to insert a test product
        $testStmt = $pdo->prepare("
            INSERT INTO products (
                category_id, subcategory_id, name_de, name_en, price, available, has_variants, brand, is_tobacco
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $testStmt->execute([
            $category['id'],
            null, // subcategory_id
            'TEST PRODUCT - DELETE ME',
            'TEST PRODUCT - DELETE ME',
            9.99,
            0, // not available (hidden from customers)
            0, // no variants
            'Test Brand',
            0  // not tobacco
        ]);

        $testProductId = $pdo->lastInsertId();
        $checks_passed++;
        echo "✅ Test product creation successful (ID: $testProductId)\n";

        // Test variant creation
        $total_checks++;
        $variantStmt = $pdo->prepare("
            INSERT INTO product_sizes (product_id, size, price, available)
            VALUES (?, ?, ?, ?)
        ");

        $variantStmt->execute([
            $testProductId,
            'Test Size',
            12.99,
            1
        ]);

        $variantId = $pdo->lastInsertId();
        $checks_passed++;
        echo "✅ Test variant creation successful (ID: $variantId)\n";

        // Update product with has_variants flag
        $total_checks++;
        $updateStmt = $pdo->prepare("UPDATE products SET has_variants = 1 WHERE id = ?");
        $updateStmt->execute([$testProductId]);
        $checks_passed++;
        echo "✅ Product has_variants flag updated successfully\n";

        // Clean up test data
        $pdo->exec("DELETE FROM product_sizes WHERE id = $variantId");
        $pdo->exec("DELETE FROM products WHERE id = $testProductId");
        echo "✅ Test data cleaned up\n";
    } else {
        $warnings[] = "No categories found for testing";
        echo "⚠️  No categories found for testing\n";
    }
} catch (PDOException $e) {
    $errors[] = "Product creation test failed: " . $e->getMessage();
    echo "❌ Product creation test failed: " . $e->getMessage() . "\n";
}

echo "\n";

// =============================================================================
// TEST 6: Data Consistency Checks
// =============================================================================

echo "TEST 6: Checking data consistency...\n";
echo str_repeat("-", 70) . "\n";

// Check for orphaned subcategories
$stmt = $pdo->query("
    SELECT sc.id, sc.name_de, sc.category_id
    FROM subcategories sc
    LEFT JOIN categories c ON sc.category_id = c.id
    WHERE c.id IS NULL
");

$orphaned_subcats = $stmt->fetchAll(PDO::FETCH_ASSOC);
if (count($orphaned_subcats) > 0) {
    $warnings[] = "Found " . count($orphaned_subcats) . " orphaned subcategories";
    echo "⚠️  Found " . count($orphaned_subcats) . " orphaned subcategories (subcategories with invalid category_id)\n";
} else {
    echo "✅ No orphaned subcategories found\n";
}

// Check for orphaned products
$stmt = $pdo->query("
    SELECT p.id, p.name_de, p.category_id
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE c.id IS NULL
");

$orphaned_products = $stmt->fetchAll(PDO::FETCH_ASSOC);
if (count($orphaned_products) > 0) {
    $warnings[] = "Found " . count($orphaned_products) . " orphaned products";
    echo "⚠️  Found " . count($orphaned_products) . " orphaned products (products with invalid category_id)\n";
} else {
    echo "✅ No orphaned products found\n";
}

// Check for orphaned product sizes
$stmt = $pdo->query("
    SELECT ps.id, ps.size, ps.product_id
    FROM product_sizes ps
    LEFT JOIN products p ON ps.product_id = p.id
    WHERE p.id IS NULL
");

$orphaned_sizes = $stmt->fetchAll(PDO::FETCH_ASSOC);
if (count($orphaned_sizes) > 0) {
    $warnings[] = "Found " . count($orphaned_sizes) . " orphaned product sizes";
    echo "⚠️  Found " . count($orphaned_sizes) . " orphaned product sizes (sizes with invalid product_id)\n";
} else {
    echo "✅ No orphaned product sizes found\n";
}

echo "\n";

// =============================================================================
// SUMMARY
// =============================================================================

echo str_repeat("=", 70) . "\n";
echo "VALIDATION SUMMARY\n";
echo str_repeat("=", 70) . "\n\n";

echo "Checks completed: $checks_passed / $total_checks passed\n\n";

// Get statistics
$stmt = $pdo->query("SELECT COUNT(*) FROM categories");
$cat_count = $stmt->fetchColumn();
$stmt = $pdo->query("SELECT COUNT(*) FROM subcategories");
$subcat_count = $stmt->fetchColumn();
$stmt = $pdo->query("SELECT COUNT(*) FROM products");
$prod_count = $stmt->fetchColumn();
$stmt = $pdo->query("SELECT COUNT(*) FROM product_sizes");
$size_count = $stmt->fetchColumn();

echo "Database Statistics:\n";
echo "  - Categories: $cat_count\n";
echo "  - Subcategories: $subcat_count\n";
echo "  - Products: $prod_count\n";
echo "  - Product variants: $size_count\n\n";

if (count($errors) === 0 && count($warnings) === 0) {
    echo "✅ ✅ ✅ ALL CHECKS PASSED ✅ ✅ ✅\n\n";
    echo "The database schema is complete and correct!\n";
    echo "You can now use the application without issues.\n\n";
    exit(0);
} else {
    if (count($errors) > 0) {
        echo "❌ CRITICAL ERRORS FOUND (" . count($errors) . "):\n";
        echo str_repeat("-", 70) . "\n";
        foreach ($errors as $i => $error) {
            echo ($i + 1) . ". $error\n";
        }
        echo "\n";
        echo "🔧 ACTION REQUIRED:\n";
        echo "Run the migration script to fix these errors:\n";
        echo "  mysql -h $host_name -u $user_name -p $database < docs/migrate-to-subcategories.sql\n\n";
    }

    if (count($warnings) > 0) {
        echo "⚠️  WARNINGS (" . count($warnings) . "):\n";
        echo str_repeat("-", 70) . "\n";
        foreach ($warnings as $i => $warning) {
            echo ($i + 1) . ". $warning\n";
        }
        echo "\n";
        echo "These warnings indicate minor issues that may affect performance\n";
        echo "or data integrity, but the application should still function.\n\n";
    }

    exit(count($errors) > 0 ? 1 : 2);
}
?>
