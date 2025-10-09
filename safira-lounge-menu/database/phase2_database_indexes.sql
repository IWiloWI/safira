-- ===================================================================
-- SAFIRA API - PHASE 2: DATABASE INDEX OPTIMIZATION
-- ===================================================================
-- Purpose: Add missing indexes to improve query performance by 30-40%
-- Expected improvement: 237ms → 150-180ms (cache miss)
-- Date: 2025-10-05
-- Version: 2.0
-- Database: MySQL/MariaDB
--
-- IMPORTANT: Run during low-traffic period
-- Estimated execution time: 1-3 minutes (depending on data size)
-- ===================================================================

-- Enable timing
SET @start_time = NOW();
SELECT 'Starting index optimization...' AS status;

-- ===================================================================
-- 1. CATEGORIES TABLE INDEXES
-- ===================================================================
SELECT '1. Optimizing CATEGORIES table...' AS status;

-- Check if indexes exist before creating
-- Index for active categories filter
CREATE INDEX IF NOT EXISTS idx_categories_active
ON categories(is_active);

-- Index for main category filter (used in WHERE clause)
CREATE INDEX IF NOT EXISTS idx_categories_main
ON categories(is_main_category);

-- Composite index for filtering + sorting (most efficient)
CREATE INDEX IF NOT EXISTS idx_categories_active_main_sort
ON categories(is_active, is_main_category, sort_order, id);

-- Index for parent category lookups
CREATE INDEX IF NOT EXISTS idx_categories_parent
ON categories(parent_category_id);

SELECT 'Categories: 4 indexes created/verified' AS status;

-- ===================================================================
-- 2. SUBCATEGORIES TABLE INDEXES
-- ===================================================================
SELECT '2. Optimizing SUBCATEGORIES table...' AS status;

-- Index for active subcategories
CREATE INDEX IF NOT EXISTS idx_subcategories_active
ON subcategories(is_active);

-- CRITICAL: Foreign key index for category relationship
-- This is the most important index for subcategories!
CREATE INDEX IF NOT EXISTS idx_subcategories_category
ON subcategories(category_id);

-- Composite index for filtering + sorting
CREATE INDEX IF NOT EXISTS idx_subcategories_category_sort
ON subcategories(category_id, sort_order, id);

-- Composite for active subcategories by category
CREATE INDEX IF NOT EXISTS idx_subcategories_active_category
ON subcategories(is_active, category_id, sort_order);

SELECT 'Subcategories: 4 indexes created/verified' AS status;

-- ===================================================================
-- 3. PRODUCTS TABLE INDEXES
-- ===================================================================
SELECT '3. Optimizing PRODUCTS table...' AS status;

-- CRITICAL: Foreign key indexes for relationships
-- These are essential for the pre-grouping optimization!
CREATE INDEX IF NOT EXISTS idx_products_category
ON products(category_id);

CREATE INDEX IF NOT EXISTS idx_products_subcategory
ON products(subcategory_id);

-- Composite index for category + subcategory lookups
CREATE INDEX IF NOT EXISTS idx_products_cat_subcat
ON products(category_id, subcategory_id);

-- Index for available products (if filtering is needed)
CREATE INDEX IF NOT EXISTS idx_products_available
ON products(available);

-- Composite index matching the ORDER BY clause
-- ORDER BY category_id, subcategory_id, id
CREATE INDEX IF NOT EXISTS idx_products_order
ON products(category_id, subcategory_id, id);

-- Covering index for common query pattern (optional but recommended)
-- Includes frequently accessed columns
CREATE INDEX IF NOT EXISTS idx_products_covering
ON products(category_id, subcategory_id, available, price);

SELECT 'Products: 6 indexes created/verified' AS status;

-- ===================================================================
-- 4. PRODUCT_SIZES TABLE INDEXES
-- ===================================================================
SELECT '4. Optimizing PRODUCT_SIZES table...' AS status;

-- CRITICAL: Foreign key index for product relationship
CREATE INDEX IF NOT EXISTS idx_product_sizes_product
ON product_sizes(product_id);

-- Composite index matching ORDER BY clause
-- ORDER BY product_id, sort_order, id
CREATE INDEX IF NOT EXISTS idx_product_sizes_order
ON product_sizes(product_id, sort_order, id);

-- Index for available sizes (if filtering is needed)
CREATE INDEX IF NOT EXISTS idx_product_sizes_available
ON product_sizes(available);

SELECT 'Product Sizes: 3 indexes created/verified' AS status;

-- ===================================================================
-- 5. OPTIMIZE TABLES (Rebuild indexes and update statistics)
-- ===================================================================
SELECT '5. Optimizing table structures...' AS status;

OPTIMIZE TABLE categories;
OPTIMIZE TABLE subcategories;
OPTIMIZE TABLE products;
OPTIMIZE TABLE product_sizes;

SELECT 'Tables optimized' AS status;

-- ===================================================================
-- 6. ANALYZE TABLES (Update query planner statistics)
-- ===================================================================
SELECT '6. Updating query planner statistics...' AS status;

ANALYZE TABLE categories;
ANALYZE TABLE subcategories;
ANALYZE TABLE products;
ANALYZE TABLE product_sizes;

SELECT 'Statistics updated' AS status;

-- ===================================================================
-- 7. VERIFY INDEXES (Show all created indexes)
-- ===================================================================
SELECT '7. Verification - Current indexes:' AS status;

SELECT
    'categories' AS table_name,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX,
    INDEX_TYPE
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'categories'
ORDER BY INDEX_NAME, SEQ_IN_INDEX;

SELECT
    'subcategories' AS table_name,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX,
    INDEX_TYPE
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'subcategories'
ORDER BY INDEX_NAME, SEQ_IN_INDEX;

SELECT
    'products' AS table_name,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX,
    INDEX_TYPE
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'products'
ORDER BY INDEX_NAME, SEQ_IN_INDEX;

SELECT
    'product_sizes' AS table_name,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX,
    INDEX_TYPE
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'product_sizes'
ORDER BY INDEX_NAME, SEQ_IN_INDEX;

-- ===================================================================
-- 8. COMPLETION SUMMARY
-- ===================================================================
SELECT
    CONCAT('Index optimization completed in ',
           TIMESTAMPDIFF(SECOND, @start_time, NOW()),
           ' seconds') AS status;

SELECT 'SUMMARY:' AS '===========================================';
SELECT '17 indexes created/verified' AS summary;
SELECT '4 tables optimized' AS summary;
SELECT '4 tables analyzed' AS summary;
SELECT '' AS summary;
SELECT 'Expected improvements:' AS summary;
SELECT '- Query performance: 30-40% faster' AS summary;
SELECT '- Cache miss response: 237ms → 150-180ms' AS summary;
SELECT '- Database query time: 1.48ms → 0.8-1.0ms' AS summary;
SELECT '' AS summary;
SELECT 'Next steps:' AS summary;
SELECT '1. Test API performance with ?nocache=1' AS summary;
SELECT '2. Compare before/after metrics' AS summary;
SELECT '3. Monitor slow query log' AS summary;
SELECT '4. Proceed to Phase 3 (OpCache) if needed' AS summary;

-- ===================================================================
-- ROLLBACK SCRIPT (if needed)
-- ===================================================================
-- Save this for emergency rollback:
/*
-- ROLLBACK: Drop all created indexes
DROP INDEX IF EXISTS idx_categories_active ON categories;
DROP INDEX IF EXISTS idx_categories_main ON categories;
DROP INDEX IF EXISTS idx_categories_active_main_sort ON categories;
DROP INDEX IF EXISTS idx_categories_parent ON categories;

DROP INDEX IF EXISTS idx_subcategories_active ON subcategories;
DROP INDEX IF EXISTS idx_subcategories_category ON subcategories;
DROP INDEX IF EXISTS idx_subcategories_category_sort ON subcategories;
DROP INDEX IF EXISTS idx_subcategories_active_category ON subcategories;

DROP INDEX IF EXISTS idx_products_category ON products;
DROP INDEX IF EXISTS idx_products_subcategory ON products;
DROP INDEX IF EXISTS idx_products_cat_subcat ON products;
DROP INDEX IF EXISTS idx_products_available ON products;
DROP INDEX IF EXISTS idx_products_order ON products;
DROP INDEX IF EXISTS idx_products_covering ON products;

DROP INDEX IF EXISTS idx_product_sizes_product ON product_sizes;
DROP INDEX IF EXISTS idx_product_sizes_order ON product_sizes;
DROP INDEX IF EXISTS idx_product_sizes_available ON product_sizes;
*/

-- ===================================================================
-- PERFORMANCE TESTING QUERIES
-- ===================================================================
-- Use these to verify index usage:

-- Test 1: Categories query (should use idx_categories_active_main_sort)
EXPLAIN SELECT id, name_de, name_en, name_da, name_tr,
       description_de, description_en, description_da, description_tr,
       icon, image_url, is_main_category, parent_category_id, sort_order
FROM categories
WHERE is_active = 1 AND (is_main_category = 1 OR is_main_category IS NULL)
ORDER BY sort_order, id;

-- Test 2: Subcategories query (should use idx_subcategories_active_category)
EXPLAIN SELECT id, category_id, name_de, name_en, name_da, name_tr,
       description_de, description_en, description_da, description_tr,
       icon, image_url, sort_order
FROM subcategories
WHERE is_active = 1
ORDER BY category_id, sort_order, id;

-- Test 3: Products query (should use idx_products_order)
EXPLAIN SELECT id, category_id, subcategory_id,
       name_de, name_en, name_da, name_tr,
       description_de, description_en, description_da, description_tr,
       price, image_url, available,
       badge_new, badge_popular, badge_limited,
       is_tobacco, brand, is_menu_package, package_items
FROM products
ORDER BY category_id, subcategory_id, id;

-- Test 4: Product sizes query (should use idx_product_sizes_order)
EXPLAIN SELECT product_id, size, price, available, description, sort_order
FROM product_sizes
ORDER BY product_id, sort_order, id;

-- ===================================================================
-- END OF SCRIPT
-- ===================================================================
