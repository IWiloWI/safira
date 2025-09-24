-- Fix missing categories and subcategories
-- Based on products.xml analysis

-- Insert missing categories
INSERT IGNORE INTO categories (id, name_de, name_en, name_tr, name_da, description_de, description_en, description_tr, description_da, icon, image_url, is_active, sort_order, created_at, updated_at) VALUES
(1, 'Shisha Tabak', 'Shisha Tobacco', 'Nargile Tütünü', 'Vandpibe Tobak', 'Premium Shisha Tabak Auswahl', 'Premium Shisha Tobacco Selection', 'Premium Nargile Tütünü Seçimi', 'Premium Vandpibe Tobak Udvalg', 'fa-smoking', '', 1, 1, NOW(), NOW()),
(2, 'Getränke', 'Beverages', 'İçecekler', 'Drikkevarer', 'Erfrischende Getränke', 'Refreshing Beverages', 'Serinletici İçecekler', 'Forfriskende Drikkevarer', 'fa-coffee', '', 1, 2, NOW(), NOW());

-- Insert missing subcategories
INSERT IGNORE INTO subcategories (id, category_id, name_de, name_en, name_tr, name_da, description_de, description_en, description_tr, description_da, icon, image_url, is_active, sort_order, created_at, updated_at) VALUES
(1, 2, 'Heißgetränke', 'Hot Beverages', 'Sıcak İçecekler', 'Varme Drikkevarer', 'Warme und wohltuende Getränke', 'Warm and comforting drinks', 'Sıcak ve rahatlatıcı içecekler', 'Varme og beroligende drikkevarer', 'fa-coffee', '', 1, 1, NOW(), NOW()),
(2, 2, 'Kaltgetränke', 'Cold Beverages', 'Soğuk İçecekler', 'Kolde Drikkevarer', 'Erfrischende kalte Getränke', 'Refreshing cold drinks', 'Serinletici soğuk içecekler', 'Forfriskende kolde drikkevarer', 'fa-glass-water', '', 1, 2, NOW(), NOW()),
(4, 1, 'Fruchtig', 'Fruity', 'Meyveli', 'Frugtig', 'Fruchtige Tabaksorten', 'Fruity tobacco flavors', 'Meyveli tütün çeşitleri', 'Frugtige tobakssmagsarter', 'fa-apple', '', 1, 1, NOW(), NOW());

-- Verify the data
SELECT 'Categories:' as info;
SELECT * FROM categories WHERE id IN (1, 2);

SELECT 'Subcategories:' as info;
SELECT * FROM subcategories WHERE id IN (1, 2, 4);

SELECT 'Products by category:' as info;
SELECT category_id, subcategory_id, COUNT(*) as product_count
FROM products
GROUP BY category_id, subcategory_id
ORDER BY category_id, subcategory_id;