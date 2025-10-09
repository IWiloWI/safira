-- Migration: Add fallback_image column to video_mappings table
-- Date: 2025-10-09
-- Description: Adds support for fallback images when videos are loading or fail to load

-- Add fallback_image column
ALTER TABLE video_mappings
ADD COLUMN fallback_image VARCHAR(255) DEFAULT NULL
COMMENT 'Path to fallback image displayed while video loads'
AFTER video_path;

-- Verify the change
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'video_mappings'
AND COLUMN_NAME = 'fallback_image';

-- Example: Update a mapping with fallback image
-- UPDATE video_mappings
-- SET fallback_image = 'images/home-fallback.jpg'
-- WHERE category_id = 'home';
