-- This SQL script fixes all products that have variants
-- Execute this directly in MySQL/phpMyAdmin

-- First, let's see which products have variants but haven't been updated
SELECT
    p.id,
    p.name_de as name,
    p.price as main_price,
    p.has_variants,
    COUNT(ps.id) as variant_count,
    GROUP_CONCAT(CONCAT(ps.size, ': ', ps.price, '€') SEPARATOR ', ') as variants
FROM products p
LEFT JOIN product_sizes ps ON p.id = ps.product_id AND ps.available = 1
WHERE p.id IN (
    SELECT DISTINCT product_id
    FROM product_sizes
    WHERE available = 1
)
GROUP BY p.id, p.name_de, p.price, p.has_variants
ORDER BY p.name_de;

-- Now update all products that have variants in product_sizes table
UPDATE products
SET has_variants = 1, price = 0
WHERE id IN (
    SELECT DISTINCT product_id
    FROM product_sizes
    WHERE available = 1
);

-- Verify the changes
SELECT
    p.id,
    p.name_de as name,
    p.price as main_price,
    p.has_variants,
    COUNT(ps.id) as variant_count,
    GROUP_CONCAT(CONCAT(ps.size, ': ', ps.price, '€') SEPARATOR ', ') as variants
FROM products p
LEFT JOIN product_sizes ps ON p.id = ps.product_id AND ps.available = 1
WHERE p.has_variants = 1
GROUP BY p.id, p.name_de, p.price, p.has_variants
ORDER BY p.name_de;