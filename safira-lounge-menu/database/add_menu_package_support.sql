-- Add menu package support to products table
-- This migration adds fields for menu package products

-- Add is_menu_package column
ALTER TABLE products
ADD COLUMN is_menu_package TINYINT(1) DEFAULT 0 AFTER is_tobacco;

-- Add package_items column to store menu contents
ALTER TABLE products
ADD COLUMN package_items TEXT DEFAULT NULL AFTER is_menu_package;

-- Add index for faster queries
CREATE INDEX idx_is_menu_package ON products(is_menu_package);

-- Update comment
ALTER TABLE products COMMENT = 'Products table with tobacco and menu package support';
