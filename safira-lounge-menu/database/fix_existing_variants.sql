-- SQL Script to fix existing products with variants
-- This script updates products that have variants to set price=0 and has_variants=1

-- First, update all products that have variants in product_sizes table
UPDATE products
SET has_variants = 1, price = 0
WHERE id IN (
    SELECT DISTINCT product_id
    FROM product_sizes
    WHERE available = 1
);

-- Verify the update
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