-- =============================================================================
-- SAFIRA LOUNGE MENU: Rollback Plan for Subcategories Migration
-- =============================================================================
-- Version: 1.0
-- Date: 2025-10-02
-- Purpose: Safely rollback the subcategories and variants migration
-- Author: System Architect Agent
--
-- ⚠️  WARNING: This script will DELETE data! ⚠️
-- - All subcategory assignments will be lost
-- - All product variants (sizes/prices) will be lost
-- - Brand and tobacco flags will be removed
--
-- Only use this rollback if the migration causes critical issues!
-- =============================================================================

-- Safety prompt
SELECT '⚠️  WARNING: You are about to rollback the subcategories migration!' AS warning;
SELECT 'This will DELETE subcategories, product variants, and related data.' AS warning;
SELECT 'Press Ctrl+C NOW to cancel, or wait 5 seconds to continue...' AS warning;

-- Wait 5 seconds (you can cancel during this time)
DO SLEEP(5);

-- =============================================================================
-- STEP 1: BACKUP EXISTING DATA
-- =============================================================================

SELECT 'STEP 1: Creating backup tables...' AS status;

-- Backup subcategories
CREATE TABLE IF NOT EXISTS subcategories_backup_20251002 AS
SELECT * FROM subcategories;

SELECT CONCAT('✓ Backed up ', COUNT(*), ' subcategories') AS status
FROM subcategories_backup_20251002;

-- Backup product_sizes
CREATE TABLE IF NOT EXISTS product_sizes_backup_20251002 AS
SELECT * FROM product_sizes;

SELECT CONCAT('✓ Backed up ', COUNT(*), ' product variants') AS status
FROM product_sizes_backup_20251002;

-- Backup products with new columns
CREATE TABLE IF NOT EXISTS products_backup_columns_20251002 AS
SELECT id, subcategory_id, has_variants, brand, is_tobacco
FROM products
WHERE subcategory_id IS NOT NULL OR has_variants = 1 OR brand != '' OR is_tobacco = 1;

SELECT CONCAT('✓ Backed up ', COUNT(*), ' products with new feature data') AS status
FROM products_backup_columns_20251002;

-- =============================================================================
-- STEP 2: REMOVE FOREIGN KEY CONSTRAINTS
-- =============================================================================

SELECT 'STEP 2: Removing foreign key constraints...' AS status;

-- Find and drop foreign key constraints
SET @fk_subcategories = (
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'subcategories'
    AND COLUMN_NAME = 'category_id'
    AND REFERENCED_TABLE_NAME IS NOT NULL
    LIMIT 1
);

SET @sql = IF(@fk_subcategories IS NOT NULL,
    CONCAT('ALTER TABLE subcategories DROP FOREIGN KEY ', @fk_subcategories),
    'SELECT "No foreign key found on subcategories.category_id" AS status');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_product_sizes = (
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'product_sizes'
    AND COLUMN_NAME = 'product_id'
    AND REFERENCED_TABLE_NAME IS NOT NULL
    LIMIT 1
);

SET @sql = IF(@fk_product_sizes IS NOT NULL,
    CONCAT('ALTER TABLE product_sizes DROP FOREIGN KEY ', @fk_product_sizes),
    'SELECT "No foreign key found on product_sizes.product_id" AS status');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT '✓ Foreign key constraints removed' AS status;

-- =============================================================================
-- STEP 3: DROP NEW TABLES
-- =============================================================================

SELECT 'STEP 3: Dropping new tables...' AS status;

DROP TABLE IF EXISTS product_sizes;
SELECT '✓ Dropped product_sizes table' AS status;

DROP TABLE IF EXISTS subcategories;
SELECT '✓ Dropped subcategories table' AS status;

-- =============================================================================
-- STEP 4: REMOVE NEW COLUMNS FROM PRODUCTS TABLE
-- =============================================================================

SELECT 'STEP 4: Removing new columns from products table...' AS status;

-- Check which columns exist
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

-- Drop columns
SET @sql = IF(@subcategory_id_exists > 0,
    'ALTER TABLE products DROP COLUMN subcategory_id',
    'SELECT "subcategory_id column does not exist" AS status');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(@has_variants_exists > 0,
    'ALTER TABLE products DROP COLUMN has_variants',
    'SELECT "has_variants column does not exist" AS status');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(@brand_exists > 0,
    'ALTER TABLE products DROP COLUMN brand',
    'SELECT "brand column does not exist" AS status');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(@is_tobacco_exists > 0,
    'ALTER TABLE products DROP COLUMN is_tobacco',
    'SELECT "is_tobacco column does not exist" AS status');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT '✓ New columns removed from products table' AS status;

-- =============================================================================
-- STEP 5: VERIFY ROLLBACK
-- =============================================================================

SELECT 'STEP 5: Verifying rollback...' AS status;

-- Check tables
SELECT
    'Tables Check' AS check_type,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'categories') AS categories,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'products') AS products,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'subcategories') AS subcategories_should_be_0,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'product_sizes') AS product_sizes_should_be_0;

-- Check columns
SELECT
    'Columns Check' AS check_type,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'products' AND column_name = 'subcategory_id') AS subcategory_id_should_be_0,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'products' AND column_name = 'has_variants') AS has_variants_should_be_0,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'products' AND column_name = 'brand') AS brand_should_be_0,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'products' AND column_name = 'is_tobacco') AS is_tobacco_should_be_0;

-- Check backup tables
SELECT
    'Backup Tables' AS check_type,
    (SELECT COUNT(*) FROM subcategories_backup_20251002) AS subcategories_backed_up,
    (SELECT COUNT(*) FROM product_sizes_backup_20251002) AS product_sizes_backed_up,
    (SELECT COUNT(*) FROM products_backup_columns_20251002) AS products_data_backed_up;

-- =============================================================================
-- FINAL STATUS
-- =============================================================================

SELECT '✅ ROLLBACK COMPLETED SUCCESSFULLY!' AS status;
SELECT 'The database has been rolled back to the pre-migration state.' AS info;
SELECT 'Backup tables have been created with suffix "_backup_20251002"' AS info;

-- Show products table structure
SELECT 'Current products table structure:' AS info;
DESCRIBE products;

-- =============================================================================
-- RESTORE INSTRUCTIONS
-- =============================================================================

SELECT '' AS blank_line;
SELECT '📋 TO RESTORE THE MIGRATION DATA LATER:' AS instructions;
SELECT '1. Run migrate-to-subcategories.sql again' AS step_1;
SELECT '2. Restore subcategories: INSERT INTO subcategories SELECT * FROM subcategories_backup_20251002;' AS step_2;
SELECT '3. Restore product_sizes: INSERT INTO product_sizes SELECT * FROM product_sizes_backup_20251002;' AS step_3;
SELECT '4. Restore product columns data from products_backup_columns_20251002' AS step_4;

-- =============================================================================
-- ROLLBACK COMPLETE
-- =============================================================================
