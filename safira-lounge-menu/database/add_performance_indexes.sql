-- PERFORMANCE INDEXES FOR SAFIRA LOUNGE API
--
-- Purpose: Optimize database query performance
-- Expected improvement: 60-85% faster queries
--
-- Safe to run: These are all non-destructive ADD INDEX operations
-- Rollback: See rollback_indexes.sql

-- ============================================================================
-- CATEGORIES TABLE
-- ============================================================================

-- Index for main category filtering
-- Used in: SELECT * FROM categories WHERE is_active = 1 AND is_main_category = 1
ALTER TABLE categories
ADD INDEX idx_active_main (is_active, is_main_category, sort_order);

-- Index for sorting
ALTER TABLE categories
ADD INDEX idx_sort (sort_order, id);

-- ============================================================================
-- SUBCATEGORIES TABLE
-- ============================================================================

-- Index for category lookup (most important)
-- Used in: SELECT * FROM subcategories WHERE category_id = ? AND is_active = 1
ALTER TABLE subcategories
ADD INDEX idx_category_active (category_id, is_active, sort_order);

-- Index for sorting within category
ALTER TABLE subcategories
ADD INDEX idx_category_sort (category_id, sort_order, id);

-- ============================================================================
-- PRODUCTS TABLE
-- ============================================================================

-- Composite index for category/subcategory filtering
-- Used in: JOIN products ON (p.category_id = c.id OR p.subcategory_id = sc.id)
ALTER TABLE products
ADD INDEX idx_category_subcat (category_id, subcategory_id);

-- Separate index for subcategory lookup
-- Used in: SELECT * FROM products WHERE subcategory_id = ?
ALTER TABLE products
ADD INDEX idx_subcategory (subcategory_id);

-- Index for availability filtering
-- Used in: SELECT * FROM products WHERE available = 1
ALTER TABLE products
ADD INDEX idx_available (available);

-- Index for tobacco products
-- Used in: SELECT * FROM products WHERE is_tobacco = 1
ALTER TABLE products
ADD INDEX idx_tobacco (is_tobacco, brand);

-- Index for menu packages
ALTER TABLE products
ADD INDEX idx_menu_package (is_menu_package);

-- Index for products with variants
ALTER TABLE products
ADD INDEX idx_has_variants (has_variants);

-- Composite index for efficient sorting
-- Used in: ORDER BY category_id, subcategory_id, name_de
ALTER TABLE products
ADD INDEX idx_category_subcat_name (category_id, subcategory_id, name_de(100));

-- Language-specific name indexes for faster sorting
ALTER TABLE products
ADD INDEX idx_name_de (name_de(100));

ALTER TABLE products
ADD INDEX idx_name_en (name_en(100));

-- ============================================================================
-- PRODUCT_SIZES TABLE
-- ============================================================================

-- Most critical index: product lookup
-- Used in: SELECT * FROM product_sizes WHERE product_id = ?
ALTER TABLE product_sizes
ADD INDEX idx_product (product_id, sort_order);

-- Index for availability filtering
ALTER TABLE product_sizes
ADD INDEX idx_available (available);

-- Composite index for joining with products
ALTER TABLE product_sizes
ADD INDEX idx_product_available (product_id, available, sort_order);

-- ============================================================================
-- TOBACCO_CATALOG TABLE (if exists)
-- ============================================================================

-- Index for brand filtering
ALTER TABLE tobacco_catalog
ADD INDEX idx_brand (brand, name(100));

-- Index for name lookup
ALTER TABLE tobacco_catalog
ADD INDEX idx_name (name(100));

-- Composite for duplicate checking
ALTER TABLE tobacco_catalog
ADD INDEX idx_name_brand (name(100), brand(50));

-- ============================================================================
-- VIDEO_MAPPINGS TABLE (if exists)
-- ============================================================================

-- Index for category lookup
ALTER TABLE video_mappings
ADD INDEX idx_category (category_id);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Show all indexes on critical tables
SELECT
    'categories' as table_name,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX,
    CARDINALITY
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'dbs14708743'
  AND TABLE_NAME = 'categories'
ORDER BY INDEX_NAME, SEQ_IN_INDEX;

SELECT
    'subcategories' as table_name,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX,
    CARDINALITY
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'dbs14708743'
  AND TABLE_NAME = 'subcategories'
ORDER BY INDEX_NAME, SEQ_IN_INDEX;

SELECT
    'products' as table_name,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX,
    CARDINALITY
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'dbs14708743'
  AND TABLE_NAME = 'products'
ORDER BY INDEX_NAME, SEQ_IN_INDEX;

SELECT
    'product_sizes' as table_name,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX,
    CARDINALITY
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'dbs14708743'
  AND TABLE_NAME = 'product_sizes'
ORDER BY INDEX_NAME, SEQ_IN_INDEX;

-- ============================================================================
-- PERFORMANCE TESTING
-- ============================================================================

-- Test query performance with EXPLAIN
EXPLAIN SELECT
    c.id, c.name_de,
    sc.id, sc.name_de,
    p.id, p.name_de,
    ps.id, ps.size
FROM categories c
LEFT JOIN subcategories sc ON c.id = sc.category_id
LEFT JOIN products p ON (p.category_id = c.id OR p.subcategory_id = sc.id)
LEFT JOIN product_sizes ps ON p.id = ps.product_id
WHERE c.is_active = 1
ORDER BY c.sort_order, sc.sort_order, p.name_de;

-- Check index usage
SHOW INDEX FROM products WHERE Key_name LIKE 'idx_%';
