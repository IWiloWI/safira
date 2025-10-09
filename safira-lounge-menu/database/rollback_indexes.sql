-- ROLLBACK SCRIPT FOR PERFORMANCE INDEXES
--
-- Use this script to remove all performance indexes if needed
-- Safe to run: Will only drop indexes, not data

-- ============================================================================
-- CATEGORIES TABLE
-- ============================================================================

ALTER TABLE categories DROP INDEX IF EXISTS idx_active_main;
ALTER TABLE categories DROP INDEX IF EXISTS idx_sort;

-- ============================================================================
-- SUBCATEGORIES TABLE
-- ============================================================================

ALTER TABLE subcategories DROP INDEX IF EXISTS idx_category_active;
ALTER TABLE subcategories DROP INDEX IF EXISTS idx_category_sort;

-- ============================================================================
-- PRODUCTS TABLE
-- ============================================================================

ALTER TABLE products DROP INDEX IF EXISTS idx_category_subcat;
ALTER TABLE products DROP INDEX IF EXISTS idx_subcategory;
ALTER TABLE products DROP INDEX IF EXISTS idx_available;
ALTER TABLE products DROP INDEX IF EXISTS idx_tobacco;
ALTER TABLE products DROP INDEX IF EXISTS idx_menu_package;
ALTER TABLE products DROP INDEX IF EXISTS idx_has_variants;
ALTER TABLE products DROP INDEX IF EXISTS idx_category_subcat_name;
ALTER TABLE products DROP INDEX IF EXISTS idx_name_de;
ALTER TABLE products DROP INDEX IF EXISTS idx_name_en;

-- ============================================================================
-- PRODUCT_SIZES TABLE
-- ============================================================================

ALTER TABLE product_sizes DROP INDEX IF EXISTS idx_product;
ALTER TABLE product_sizes DROP INDEX IF EXISTS idx_available;
ALTER TABLE product_sizes DROP INDEX IF EXISTS idx_product_available;

-- ============================================================================
-- TOBACCO_CATALOG TABLE
-- ============================================================================

ALTER TABLE tobacco_catalog DROP INDEX IF EXISTS idx_brand;
ALTER TABLE tobacco_catalog DROP INDEX IF EXISTS idx_name;
ALTER TABLE tobacco_catalog DROP INDEX IF EXISTS idx_name_brand;

-- ============================================================================
-- VIDEO_MAPPINGS TABLE
-- ============================================================================

ALTER TABLE video_mappings DROP INDEX IF EXISTS idx_category;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Confirm all custom indexes are removed
SELECT
    TABLE_NAME,
    INDEX_NAME,
    GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) as columns
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'dbs14708743'
  AND TABLE_NAME IN ('categories', 'subcategories', 'products', 'product_sizes', 'tobacco_catalog', 'video_mappings')
  AND INDEX_NAME LIKE 'idx_%'
GROUP BY TABLE_NAME, INDEX_NAME;
