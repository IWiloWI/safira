-- SQL Script to add product variants support
-- Author: Claude
-- Date: 2024

-- Create product_sizes table for product variants
CREATE TABLE IF NOT EXISTS `product_sizes` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `product_id` INT(11) NOT NULL,
  `size` VARCHAR(100) NOT NULL COMMENT 'Size label (e.g., "0,3L", "Klein", "Groß")',
  `price` DECIMAL(10,2) NOT NULL,
  `available` TINYINT(1) DEFAULT 1,
  `description` TEXT DEFAULT NULL,
  `sort_order` INT(11) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_available` (`available`),
  CONSTRAINT `fk_product_sizes_product` FOREIGN KEY (`product_id`)
    REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add index for better performance
ALTER TABLE `product_sizes` ADD INDEX `idx_product_available` (`product_id`, `available`);

-- Example: Insert sample variants for existing drinks (optional)
-- You can uncomment these lines to add sample data

/*
-- Sample data for a Cola product (assuming product_id = 1)
INSERT INTO `product_sizes` (`product_id`, `size`, `price`, `available`, `sort_order`) VALUES
(1, '0,3L', 3.50, 1, 1),
(1, '0,5L', 5.00, 1, 2),
(1, '1,0L', 7.50, 1, 3);

-- Sample data for a Coffee product (assuming product_id = 2)
INSERT INTO `product_sizes` (`product_id`, `size`, `price`, `available`, `sort_order`) VALUES
(2, 'Klein', 2.50, 1, 1),
(2, 'Mittel', 3.50, 1, 2),
(2, 'Groß', 4.50, 1, 3);
*/

-- Add a column to products table to indicate if product uses variants
ALTER TABLE `products`
ADD COLUMN `has_variants` TINYINT(1) DEFAULT 0 AFTER `price`,
ADD INDEX `idx_has_variants` (`has_variants`);

-- Update products that have sizes to set has_variants = 1
UPDATE `products` p
SET p.`has_variants` = 1
WHERE EXISTS (
  SELECT 1 FROM `product_sizes` ps WHERE ps.`product_id` = p.`id`
);