-- Clean up old non-responsive image URLs
-- These are still being loaded and wasting bandwidth

-- Update any remaining old category images to use responsive versions
UPDATE categories
SET image_url = '/images/categories/hot-drinks-safira-1_600w.webp'
WHERE image_url LIKE '%category_11_%';

UPDATE categories
SET image_url = '/images/categories/getraenke-safira_600w.webp'
WHERE image_url LIKE '%category_2_%';

UPDATE categories
SET image_url = '/images/categories/shisha-safira_600w.webp'
WHERE image_url LIKE '%category_1_%' AND id = 1;

UPDATE categories
SET image_url = '/images/categories/snacks-safira_600w.webp'
WHERE image_url LIKE '%category_10_%';

-- Verify the updates
SELECT id, name_de, image_url FROM categories WHERE id IN (1, 2, 10, 11);
