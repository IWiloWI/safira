-- =============================================================================
-- SAFIRA LOUNGE MENU: Database Migration to Subcategories & Variants
-- =============================================================================
-- Version: 1.0
-- Date: 2025-10-02
-- Purpose: Add missing tables and columns for subcategories and product variants
-- Author: System Architect Agent
--
-- This migration script safely adds:
-- 1. subcategories table (for organizing products within categories)
-- 2. product_sizes table (for product variants with different sizes/prices)
-- 3. Missing columns in products table (subcategory_id, has_variants, brand, is_tobacco)
--
-- Safety Features:
-- - Idempotent: Can be run multiple times safely
-- - Preserves existing data
-- - Uses IF NOT EXISTS checks
-- - Validates structure before and after
-- =============================================================================

-- Enable logging
SET @migration_start = NOW();
SELECT 'Migration started at:' AS status, @migration_start AS timestamp;

-- =============================================================================
-- STEP 1: CREATE SUBCATEGORIES TABLE
-- =============================================================================

SELECT 'STEP 1: Creating subcategories table...' AS status;

CREATE TABLE IF NOT EXISTS `subcategories` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `category_id` INT(11) NOT NULL,
    `name_de` VARCHAR(255) NOT NULL DEFAULT '',
    `name_en` VARCHAR(255) DEFAULT '',
    `name_tr` VARCHAR(255) DEFAULT '',
    `name_da` VARCHAR(255) DEFAULT '',
    `description_de` TEXT,
    `description_en` TEXT,
    `description_tr` TEXT,
    `description_da` TEXT,
    `icon` VARCHAR(100) DEFAULT 'fa-folder',
    `image_url` VARCHAR(500) DEFAULT '',
    `sort_order` INT(11) DEFAULT 999,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_category` (`category_id`),
    KEY `idx_sort_order` (`sort_order`),
    KEY `idx_active` (`is_active`),
    CONSTRAINT `fk_subcategories_category` FOREIGN KEY (`category_id`)
        REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT '✓ Subcategories table created/verified' AS status;

-- =============================================================================
-- STEP 2: CREATE PRODUCT_SIZES TABLE
-- =============================================================================

SELECT 'STEP 2: Creating product_sizes table...' AS status;

CREATE TABLE IF NOT EXISTS `product_sizes` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `product_id` INT(11) NOT NULL,
    `size` VARCHAR(100) NOT NULL,
    `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `available` TINYINT(1) DEFAULT 1,
    `description` VARCHAR(255) DEFAULT NULL,
    `sort_order` INT(11) DEFAULT 999,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_product` (`product_id`),
    KEY `idx_sort_order` (`sort_order`),
    CONSTRAINT `fk_product_sizes_product` FOREIGN KEY (`product_id`)
        REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT '✓ Product_sizes table created/verified' AS status;

-- =============================================================================
-- STEP 3: ADD MISSING COLUMNS TO PRODUCTS TABLE
-- =============================================================================

SELECT 'STEP 3: Adding missing columns to products table...' AS status;

-- Check which columns are missing
SET @subcategory_id_exists = (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
    AND table_name = 'products'
    AND column_name = 'subcategory_id'
);

SET @has_variants_exists = (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
    AND table_name = 'products'
    AND column_name = 'has_variants'
);

SET @brand_exists = (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
    AND table_name = 'products'
    AND column_name = 'brand'
);

SET @is_tobacco_exists = (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
    AND table_name = 'products'
    AND column_name = 'is_tobacco'
);

-- Add subcategory_id column
SET @sql = IF(@subcategory_id_exists = 0,
    'ALTER TABLE products ADD COLUMN subcategory_id INT(11) DEFAULT NULL AFTER category_id, ADD KEY idx_subcategory (subcategory_id)',
    'SELECT "✓ subcategory_id column already exists" AS status');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add has_variants column
SET @sql = IF(@has_variants_exists = 0,
    'ALTER TABLE products ADD COLUMN has_variants TINYINT(1) DEFAULT 0 AFTER price',
    'SELECT "✓ has_variants column already exists" AS status');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add brand column
SET @sql = IF(@brand_exists = 0,
    'ALTER TABLE products ADD COLUMN brand VARCHAR(255) DEFAULT \'\' AFTER badge_limited',
    'SELECT "✓ brand column already exists" AS status');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add is_tobacco column
SET @sql = IF(@is_tobacco_exists = 0,
    'ALTER TABLE products ADD COLUMN is_tobacco TINYINT(1) DEFAULT 0 AFTER brand',
    'SELECT "✓ is_tobacco column already exists" AS status');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT '✓ Products table columns updated' AS status;

-- =============================================================================
-- STEP 4: INSERT SAMPLE SUBCATEGORIES (IF EMPTY)
-- =============================================================================

SELECT 'STEP 4: Creating sample subcategories...' AS status;

-- Only insert if table is empty
SET @subcat_count = (SELECT COUNT(*) FROM subcategories);

-- Insert sample subcategories for category 1 (Shisha Tabak)
INSERT IGNORE INTO subcategories (id, category_id, name_de, name_en, name_tr, name_da, description_de, description_en, description_tr, description_da, icon, sort_order)
VALUES
    (1, 1, 'Fruchtig', 'Fruity', 'Meyveli', 'Frugtig', 'Fruchtige Tabaksorten', 'Fruity tobacco flavors', 'Meyveli tütün çeşitleri', 'Frugtige tobakssmagsarter', 'fa-apple', 1),
    (2, 1, 'Minzig', 'Mint', 'Naneli', 'Mynte', 'Minzige Tabaksorten', 'Mint tobacco flavors', 'Naneli tütün çeşitleri', 'Mynte tobakssmagsarter', 'fa-leaf', 2),
    (3, 1, 'Süß', 'Sweet', 'Tatlı', 'Sød', 'Süße Tabaksorten', 'Sweet tobacco flavors', 'Tatlı tütün çeşitleri', 'Søde tobakssmagsarter', 'fa-candy-cane', 3);

-- Check if we have category 2 (Getränke/Beverages)
SET @has_category_2 = (SELECT COUNT(*) FROM categories WHERE id = 2);

-- Insert subcategories for category 2 if it exists
SET @sql = IF(@has_category_2 > 0,
    'INSERT IGNORE INTO subcategories (id, category_id, name_de, name_en, name_tr, name_da, description_de, description_en, description_tr, description_da, icon, sort_order) VALUES
    (4, 2, "Heißgetränke", "Hot Beverages", "Sıcak İçecekler", "Varme Drikkevarer", "Warme und wohltuende Getränke", "Warm and comforting drinks", "Sıcak ve rahatlatıcı içecekler", "Varme og beroligende drikkevarer", "fa-coffee", 1),
    (5, 2, "Kaltgetränke", "Cold Beverages", "Soğuk İçecekler", "Kolde Drikkevarer", "Erfrischende kalte Getränke", "Refreshing cold drinks", "Serinletici soğuk içecekler", "Forfriskende kolde drikkevarer", "fa-glass-water", 2),
    (6, 2, "Säfte", "Juices", "Meyve Suları", "Juicer", "Frische Säfte und Smoothies", "Fresh juices and smoothies", "Taze meyve suları ve smoothie''ler", "Friske juicer og smoothies", "fa-apple", 3)',
    'SELECT "✓ Category 2 not found, skipping beverage subcategories" AS status');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT '✓ Sample subcategories created' AS status;

-- =============================================================================
-- STEP 5: VERIFY MIGRATION
-- =============================================================================

SELECT 'STEP 5: Verifying migration...' AS status;

-- Check tables exist
SELECT
    'Tables Check' AS check_type,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'subcategories') AS subcategories_table,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'product_sizes') AS product_sizes_table;

-- Check columns exist
SELECT
    'Columns Check' AS check_type,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'products' AND column_name = 'subcategory_id') AS subcategory_id_column,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'products' AND column_name = 'has_variants') AS has_variants_column,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'products' AND column_name = 'brand') AS brand_column,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'products' AND column_name = 'is_tobacco') AS is_tobacco_column;

-- Check data
SELECT
    'Data Check' AS check_type,
    (SELECT COUNT(*) FROM categories) AS categories_count,
    (SELECT COUNT(*) FROM subcategories) AS subcategories_count,
    (SELECT COUNT(*) FROM products) AS products_count,
    (SELECT COUNT(*) FROM product_sizes) AS product_sizes_count;

-- Check products with new features
SELECT
    'Products Features' AS check_type,
    (SELECT COUNT(*) FROM products WHERE subcategory_id IS NOT NULL) AS products_with_subcategory,
    (SELECT COUNT(*) FROM products WHERE has_variants = 1) AS products_with_variants,
    (SELECT COUNT(*) FROM products WHERE brand IS NOT NULL AND brand != '') AS products_with_brand,
    (SELECT COUNT(*) FROM products WHERE is_tobacco = 1) AS tobacco_products;

-- =============================================================================
-- FINAL STATUS
-- =============================================================================

SET @migration_end = NOW();

SELECT
    '✅ MIGRATION COMPLETED SUCCESSFULLY!' AS status,
    @migration_start AS started_at,
    @migration_end AS completed_at,
    TIMESTAMPDIFF(SECOND, @migration_start, @migration_end) AS duration_seconds;

-- Show sample of subcategories
SELECT 'Sample Subcategories:' AS info;
SELECT sc.id, c.name_de AS category, sc.name_de AS subcategory, sc.icon, sc.sort_order
FROM subcategories sc
LEFT JOIN categories c ON sc.category_id = c.id
ORDER BY sc.category_id, sc.sort_order
LIMIT 10;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================
-- Next steps:
-- 1. Run test-database-schema.php to validate the migration
-- 2. Test product creation via API
-- 3. Verify frontend functionality
-- =============================================================================
