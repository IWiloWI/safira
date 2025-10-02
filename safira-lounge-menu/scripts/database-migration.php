<?php
/**
 * Database Migration Script
 * Adds missing columns to support all frontend features
 * SAFE TO RUN: Only adds missing columns, doesn't delete data
 */

header('Content-Type: text/plain; charset=utf-8');
echo "===========================================\n";
echo "SAFIRA DATABASE MIGRATION SCRIPT\n";
echo "===========================================\n\n";

// Database connection
$host_name = 'db5018522360.hosting-data.io';
$database = 'dbs14708743';
$user_name = 'dbu3362598';
$password = '!Aramat1.';

try {
    $dbh = new PDO("mysql:host=$host_name;dbname=$database;charset=utf8mb4", $user_name, $password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✓ Database connection successful\n\n";
} catch (PDOException $e) {
    die("✗ Database connection failed: " . $e->getMessage() . "\n");
}

$migrations = [];
$errors = [];

// ============================================
// PRODUCTS TABLE MIGRATIONS
// ============================================

echo "MIGRATING: products table\n";
echo "----------------------------------------\n";

// Check and add isMenuPackage column
try {
    $stmt = $dbh->query("SHOW COLUMNS FROM products LIKE 'isMenuPackage'");
    if ($stmt->rowCount() === 0) {
        $dbh->exec("ALTER TABLE products ADD COLUMN isMenuPackage TINYINT(1) DEFAULT 0 AFTER available");
        echo "✓ Added column: products.isMenuPackage\n";
        $migrations[] = "Added products.isMenuPackage";
    } else {
        echo "- Column already exists: products.isMenuPackage\n";
    }
} catch (PDOException $e) {
    echo "✗ Error with isMenuPackage: " . $e->getMessage() . "\n";
    $errors[] = "isMenuPackage: " . $e->getMessage();
}

// Check and add menuContents column
try {
    $stmt = $dbh->query("SHOW COLUMNS FROM products LIKE 'menuContents'");
    if ($stmt->rowCount() === 0) {
        $dbh->exec("ALTER TABLE products ADD COLUMN menuContents TEXT DEFAULT NULL AFTER isMenuPackage");
        echo "✓ Added column: products.menuContents\n";
        $migrations[] = "Added products.menuContents";
    } else {
        echo "- Column already exists: products.menuContents\n";
    }
} catch (PDOException $e) {
    echo "✗ Error with menuContents: " . $e->getMessage() . "\n";
    $errors[] = "menuContents: " . $e->getMessage();
}

// Check and add isTobacco column
try {
    $stmt = $dbh->query("SHOW COLUMNS FROM products LIKE 'isTobacco'");
    if ($stmt->rowCount() === 0) {
        $dbh->exec("ALTER TABLE products ADD COLUMN isTobacco TINYINT(1) DEFAULT 0 AFTER menuContents");
        echo "✓ Added column: products.isTobacco\n";
        $migrations[] = "Added products.isTobacco";
    } else {
        echo "- Column already exists: products.isTobacco\n";
    }
} catch (PDOException $e) {
    echo "✗ Error with isTobacco: " . $e->getMessage() . "\n";
    $errors[] = "isTobacco: " . $e->getMessage();
}

// Check and add has_variants column
try {
    $stmt = $dbh->query("SHOW COLUMNS FROM products LIKE 'has_variants'");
    if ($stmt->rowCount() === 0) {
        $dbh->exec("ALTER TABLE products ADD COLUMN has_variants TINYINT(1) DEFAULT 0 AFTER price");
        echo "✓ Added column: products.has_variants\n";
        $migrations[] = "Added products.has_variants";
    } else {
        echo "- Column already exists: products.has_variants\n";
    }
} catch (PDOException $e) {
    echo "✗ Error with has_variants: " . $e->getMessage() . "\n";
    $errors[] = "has_variants: " . $e->getMessage();
}

// Check and add brand column
try {
    $stmt = $dbh->query("SHOW COLUMNS FROM products LIKE 'brand'");
    if ($stmt->rowCount() === 0) {
        $dbh->exec("ALTER TABLE products ADD COLUMN brand VARCHAR(255) DEFAULT NULL AFTER name");
        echo "✓ Added column: products.brand\n";
        $migrations[] = "Added products.brand";
    } else {
        echo "- Column already exists: products.brand\n";
    }
} catch (PDOException $e) {
    echo "✗ Error with brand: " . $e->getMessage() . "\n";
    $errors[] = "brand: " . $e->getMessage();
}

echo "\n";

// ============================================
// CATEGORIES TABLE MIGRATIONS
// ============================================

echo "MIGRATING: categories table\n";
echo "----------------------------------------\n";

// Check and add parent_category_id column
try {
    $stmt = $dbh->query("SHOW COLUMNS FROM categories LIKE 'parent_category_id'");
    if ($stmt->rowCount() === 0) {
        $dbh->exec("ALTER TABLE categories ADD COLUMN parent_category_id VARCHAR(50) DEFAULT NULL AFTER icon");
        echo "✓ Added column: categories.parent_category_id\n";
        $migrations[] = "Added categories.parent_category_id";
    } else {
        echo "- Column already exists: categories.parent_category_id\n";
    }
} catch (PDOException $e) {
    echo "✗ Error with parent_category_id: " . $e->getMessage() . "\n";
    $errors[] = "parent_category_id: " . $e->getMessage();
}

// Check and add is_main_category column
try {
    $stmt = $dbh->query("SHOW COLUMNS FROM categories LIKE 'is_main_category'");
    if ($stmt->rowCount() === 0) {
        $dbh->exec("ALTER TABLE categories ADD COLUMN is_main_category TINYINT(1) DEFAULT 1 AFTER parent_category_id");
        echo "✓ Added column: categories.is_main_category\n";
        $migrations[] = "Added categories.is_main_category";
    } else {
        echo "- Column already exists: categories.is_main_category\n";
    }
} catch (PDOException $e) {
    echo "✗ Error with is_main_category: " . $e->getMessage() . "\n";
    $errors[] = "is_main_category: " . $e->getMessage();
}

// Check and add sort_order column
try {
    $stmt = $dbh->query("SHOW COLUMNS FROM categories LIKE 'sort_order'");
    if ($stmt->rowCount() === 0) {
        $dbh->exec("ALTER TABLE categories ADD COLUMN sort_order INT DEFAULT 999 AFTER is_main_category");
        echo "✓ Added column: categories.sort_order\n";
        $migrations[] = "Added categories.sort_order";
    } else {
        echo "- Column already exists: categories.sort_order\n";
    }
} catch (PDOException $e) {
    echo "✗ Error with sort_order: " . $e->getMessage() . "\n";
    $errors[] = "sort_order: " . $e->getMessage();
}

// Check and add image column for category buttons
try {
    $stmt = $dbh->query("SHOW COLUMNS FROM categories LIKE 'image'");
    if ($stmt->rowCount() === 0) {
        $dbh->exec("ALTER TABLE categories ADD COLUMN image VARCHAR(500) DEFAULT NULL AFTER icon");
        echo "✓ Added column: categories.image\n";
        $migrations[] = "Added categories.image";
    } else {
        echo "- Column already exists: categories.image\n";
    }
} catch (PDOException $e) {
    echo "✗ Error with image: " . $e->getMessage() . "\n";
    $errors[] = "image: " . $e->getMessage();
}

echo "\n";

// ============================================
// PRODUCT_SIZES TABLE CREATION
// ============================================

echo "MIGRATING: product_sizes table\n";
echo "----------------------------------------\n";

try {
    $stmt = $dbh->query("SHOW TABLES LIKE 'product_sizes'");
    if ($stmt->rowCount() === 0) {
        $createTableSQL = "
        CREATE TABLE product_sizes (
            id VARCHAR(50) NOT NULL PRIMARY KEY,
            product_id VARCHAR(50) NOT NULL,
            size VARCHAR(100) NOT NULL COMMENT 'Size label (e.g., 0.3L, Klein, Groß)',
            price DECIMAL(10,2) NOT NULL,
            available TINYINT(1) DEFAULT 1,
            description TEXT DEFAULT NULL,
            sort_order INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_product_id (product_id),
            INDEX idx_available (available),
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ";
        $dbh->exec($createTableSQL);
        echo "✓ Created table: product_sizes\n";
        $migrations[] = "Created product_sizes table";
    } else {
        echo "- Table already exists: product_sizes\n";
    }
} catch (PDOException $e) {
    echo "✗ Error creating product_sizes table: " . $e->getMessage() . "\n";
    $errors[] = "product_sizes table: " . $e->getMessage();
}

echo "\n";

// ============================================
// SUMMARY
// ============================================

echo "===========================================\n";
echo "MIGRATION SUMMARY\n";
echo "===========================================\n\n";

echo "Migrations applied: " . count($migrations) . "\n";
if (count($migrations) > 0) {
    foreach ($migrations as $migration) {
        echo "  ✓ $migration\n";
    }
}

echo "\nErrors encountered: " . count($errors) . "\n";
if (count($errors) > 0) {
    foreach ($errors as $error) {
        echo "  ✗ $error\n";
    }
}

echo "\n===========================================\n";
if (count($errors) === 0) {
    echo "✓ MIGRATION COMPLETED SUCCESSFULLY!\n";
} else {
    echo "⚠ MIGRATION COMPLETED WITH ERRORS\n";
}
echo "===========================================\n";

// Show final schema
echo "\nFINAL SCHEMA VERIFICATION:\n";
echo "----------------------------------------\n";

try {
    // Products columns
    $stmt = $dbh->query("DESCRIBE products");
    $productCols = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "Products columns: " . implode(", ", $productCols) . "\n\n";

    // Categories columns
    $stmt = $dbh->query("DESCRIBE categories");
    $categoryCols = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "Categories columns: " . implode(", ", $categoryCols) . "\n\n";

    // Product sizes if exists
    $stmt = $dbh->query("SHOW TABLES LIKE 'product_sizes'");
    if ($stmt->rowCount() > 0) {
        $stmt = $dbh->query("DESCRIBE product_sizes");
        $sizeCols = $stmt->fetchAll(PDO::FETCH_COLUMN);
        echo "Product_sizes columns: " . implode(", ", $sizeCols) . "\n";
    }

} catch (PDOException $e) {
    echo "Error verifying schema: " . $e->getMessage() . "\n";
}
?>
