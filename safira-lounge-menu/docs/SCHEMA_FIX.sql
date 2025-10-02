-- ============================================
-- SCHEMA FIX: Add Missing Columns to Products Table
-- ============================================
-- This fixes the schema mismatch between TypeScript interfaces
-- and the MySQL database that causes 500 errors
--
-- Date: 2025-10-02
-- Issue: isMenuPackage and menuContents fields missing from database
-- ============================================

-- Step 1: Add is_menu_package column
-- Required for menu package products (combo offers)
ALTER TABLE `products`
ADD COLUMN `is_menu_package` TINYINT(1) DEFAULT 0 AFTER `is_tobacco`,
ADD INDEX `idx_is_menu_package` (`is_menu_package`);

-- Step 2: Add menu_contents column
-- Stores the description of what's included in menu packages
ALTER TABLE `products`
ADD COLUMN `menu_contents` TEXT DEFAULT NULL AFTER `is_menu_package`;

-- Step 3: Add thumbnail_url column (optional enhancement)
-- For better image optimization
ALTER TABLE `products`
ADD COLUMN `thumbnail_url` VARCHAR(500) DEFAULT NULL AFTER `image_url`;

-- ============================================
-- OPTIONAL: Add Dietary/Nutritional Columns
-- ============================================
-- These are optional but recommended for future features

-- Dietary restrictions
ALTER TABLE `products`
ADD COLUMN `is_vegetarian` TINYINT(1) DEFAULT 0 AFTER `available`,
ADD COLUMN `is_vegan` TINYINT(1) DEFAULT 0 AFTER `is_vegetarian`,
ADD COLUMN `is_gluten_free` TINYINT(1) DEFAULT 0 AFTER `is_vegan`,
ADD INDEX `idx_dietary` (`is_vegetarian`, `is_vegan`, `is_gluten_free`);

-- Product details
ALTER TABLE `products`
ADD COLUMN `weight` DECIMAL(10,2) DEFAULT NULL COMMENT 'Weight in grams' AFTER `is_gluten_free`,
ADD COLUMN `alcohol_content` DECIMAL(5,2) DEFAULT NULL COMMENT 'Alcohol percentage' AFTER `weight`,
ADD COLUMN `temperature` ENUM('hot', 'cold', 'room', 'frozen') DEFAULT NULL AFTER `alcohol_content`,
ADD COLUMN `preparation_time` INT(11) DEFAULT NULL COMMENT 'Minutes' AFTER `temperature`,
ADD COLUMN `origin` VARCHAR(255) DEFAULT NULL AFTER `preparation_time`;

-- Allergens (stored as JSON array)
ALTER TABLE `products`
ADD COLUMN `allergens` JSON DEFAULT NULL AFTER `origin`;

-- Nutritional info (stored as JSON object)
ALTER TABLE `products`
ADD COLUMN `nutritional_info` JSON DEFAULT NULL AFTER `allergens`;

-- Custom metadata (stored as JSON object)
ALTER TABLE `products`
ADD COLUMN `metadata` JSON DEFAULT NULL AFTER `nutritional_info`;

-- ============================================
-- Verification Queries
-- ============================================

-- Check if columns were added successfully
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'products'
  AND COLUMN_NAME IN (
    'is_menu_package',
    'menu_contents',
    'thumbnail_url',
    'is_vegetarian',
    'is_vegan',
    'is_gluten_free',
    'weight',
    'alcohol_content',
    'temperature',
    'preparation_time',
    'origin',
    'allergens',
    'nutritional_info',
    'metadata'
  )
ORDER BY ORDINAL_POSITION;

-- Show table structure
DESCRIBE products;

-- ============================================
-- ROLLBACK (if needed)
-- ============================================
-- Uncomment these lines ONLY if you need to rollback the changes

/*
ALTER TABLE `products`
DROP COLUMN `is_menu_package`,
DROP COLUMN `menu_contents`,
DROP COLUMN `thumbnail_url`,
DROP COLUMN `is_vegetarian`,
DROP COLUMN `is_vegan`,
DROP COLUMN `is_gluten_free`,
DROP COLUMN `weight`,
DROP COLUMN `alcohol_content`,
DROP COLUMN `temperature`,
DROP COLUMN `preparation_time`,
DROP COLUMN `origin`,
DROP COLUMN `allergens`,
DROP COLUMN `nutritional_info`,
DROP COLUMN `metadata`;
*/
