-- Füge Varianten für das Wasser-Produkt hinzu und korrigiere bestehende Produkte

-- 1. Füge Varianten für Wasser hinzu (ID: 121)
INSERT INTO product_sizes (product_id, size, price, available, description, sort_order) VALUES
(121, '0.3L', 2.50, 1, 'Kleine Flasche', 0),
(121, '0.5L', 3.50, 1, 'Große Flasche', 1),
(121, '1.0L', 5.00, 1, 'Liter Flasche', 2);

-- 2. Aktualisiere das Wasser-Produkt: has_variants = 1, price = 0
UPDATE products SET has_variants = 1, price = 0 WHERE id = 121;

-- 3. Aktualisiere alle anderen Produkte die Varianten haben sollten
UPDATE products
SET has_variants = 1, price = 0
WHERE id IN (
    SELECT DISTINCT product_id
    FROM product_sizes
    WHERE available = 1
);

-- 4. Prüfe die Ergebnisse
SELECT
    p.id,
    p.name_de as name,
    p.price as main_price,
    p.has_variants,
    COUNT(ps.id) as variant_count,
    GROUP_CONCAT(CONCAT(ps.size, ': ', ps.price, '€') SEPARATOR ', ') as variants
FROM products p
LEFT JOIN product_sizes ps ON p.id = ps.product_id AND ps.available = 1
WHERE p.id = 121 OR p.has_variants = 1
GROUP BY p.id, p.name_de, p.price, p.has_variants
ORDER BY p.name_de;