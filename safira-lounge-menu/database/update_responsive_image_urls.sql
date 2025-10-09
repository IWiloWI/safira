-- ============================================================================
-- Update Category Image URLs to Responsive WebP Images
-- ============================================================================
-- Date: 2025-10-06
-- Purpose: Replace old single image URLs with responsive WebP base URLs
--
-- IMPORTANT:
-- 1. Backup database first!
-- 2. Upload /public/images/categories/ to server first!
-- 3. Server path should be: /images/categories/
-- ============================================================================

-- Backup current categories (just in case)
CREATE TABLE IF NOT EXISTS categories_backup_responsive_images AS
SELECT * FROM categories
WHERE id IN (1, 2, 10, 11);

-- ============================================================================
-- Category Mapping (from categories.sql):
-- ============================================================================
-- ID | Name       | Current URL                           | New Base URL (600w default)
-- ---|------------|---------------------------------------|----------------------------------
-- 1  | Shisha     | /images/category_1_1759739527.webp    | /images/categories/shisha-safira_600w.webp
-- 2  | Getränke   | /images/category_2_1759739539.webp    | /images/categories/getraenke-safira_600w.webp
-- 10 | Snacks     | /images/category_10_1759252400.jpg    | /images/categories/snacks-safira_600w.webp
-- 11 | Menüs      | /images/category_11_1759739133.webp   | /images/categories/hot-drinks-safira-1_600w.webp
-- ============================================================================

-- ============================================================================
-- UPDATE STATEMENTS
-- ============================================================================

-- Category 1: Shisha
UPDATE categories
SET image_url = '/images/categories/shisha-safira_600w.webp'
WHERE id = 1;

-- Category 2: Getränke
UPDATE categories
SET image_url = '/images/categories/getraenke-safira_600w.webp'
WHERE id = 2;

-- Category 10: Snacks
UPDATE categories
SET image_url = '/images/categories/snacks-safira_600w.webp'
WHERE id = 10;

-- Category 11: Menüs
-- Note: Lighthouse shows this as one of the largest images
-- Mapping to Hot Drinks image (needs verification!)
UPDATE categories
SET image_url = '/images/categories/hot-drinks-safira-1_600w.webp'
WHERE id = 11;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check updated URLs
SELECT
  id,
  name_de,
  image_url AS new_url
FROM categories
WHERE id IN (1, 2, 10, 11)
ORDER BY id;

-- Check backup exists
SELECT COUNT(*) AS backup_count
FROM categories_backup_responsive_images;

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================
/*
UPDATE categories c
JOIN categories_backup_responsive_images b ON c.id = b.id
SET c.image_url = b.image_url;

DROP TABLE categories_backup_responsive_images;
*/

-- ============================================================================
-- NOTES:
-- ============================================================================
--
-- After executing this SQL:
-- 1. Frontend code will need to generate srcset from base URL
-- 2. CategoryNavigation.tsx needs update to create srcset variants:
--    - Replace _600w with _300w, _900w, _1200w
-- 3. All 4 responsive sizes must exist on server
--
-- Available responsive images for each category:
-- - shisha-safira_{300w,600w,900w,1200w}.webp
-- - getraenke-safira_{300w,600w,900w,1200w}.webp
-- - snacks-safira_{300w,600w,900w,1200w}.webp
-- - hot-drinks-safira-1_{300w,600w,900w,1200w}.webp
--
-- Plus 7 more categories available:
-- - biere-safira
-- - cocktails-safira
-- - eistee-safira-1
-- - hot-drinks-safira-2
-- - red-bull-safira
-- - saefte-safira
-- - softdrinks-safira
-- ============================================================================
