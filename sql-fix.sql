-- EMERGENCY HOTFIX: Create missing categories that prevent products from being displayed
-- Execute this SQL directly in phpMyAdmin or database console

-- Create categories table if not exists
CREATE TABLE IF NOT EXISTS categories (
    id int(11) NOT NULL PRIMARY KEY,
    name_de varchar(255) DEFAULT '',
    name_en varchar(255) DEFAULT '',
    name_tr varchar(255) DEFAULT '',
    name_da varchar(255) DEFAULT '',
    description_de text DEFAULT NULL,
    description_en text DEFAULT NULL,
    description_tr text DEFAULT NULL,
    description_da text DEFAULT NULL,
    icon varchar(100) DEFAULT 'fa-utensils',
    image_url varchar(500) DEFAULT '',
    is_active tinyint(1) DEFAULT 1,
    sort_order int(11) DEFAULT 999,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create subcategories table if not exists
CREATE TABLE IF NOT EXISTS subcategories (
    id int(11) NOT NULL PRIMARY KEY,
    category_id int(11) NOT NULL,
    name_de varchar(255) DEFAULT '',
    name_en varchar(255) DEFAULT '',
    name_tr varchar(255) DEFAULT '',
    name_da varchar(255) DEFAULT '',
    description_de text DEFAULT NULL,
    description_en text DEFAULT NULL,
    description_tr text DEFAULT NULL,
    description_da text DEFAULT NULL,
    icon varchar(100) DEFAULT 'fa-folder',
    image_url varchar(500) DEFAULT '',
    is_active tinyint(1) DEFAULT 1,
    sort_order int(11) DEFAULT 999,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert missing categories (IGNORE = skip if exists)
INSERT IGNORE INTO categories (id, name_de, name_en, name_tr, name_da, description_de, description_en, description_tr, description_da, icon, is_active, sort_order) VALUES
(1, 'Shisha Tabak', 'Shisha Tobacco', 'Nargile Tütünü', 'Vandpibe Tobak', 'Premium Shisha Tabak Auswahl', 'Premium Shisha Tobacco Selection', 'Premium Nargile Tütünü Seçimi', 'Premium Vandpibe Tobak Udvalg', 'fa-smoking', 1, 1),
(2, 'Getränke', 'Beverages', 'İçecekler', 'Drikkevarer', 'Erfrischende Getränke', 'Refreshing Beverages', 'Serinletici İçecekler', 'Forfriskende Drikkevarer', 'fa-coffee', 1, 2);

-- Insert missing subcategories (IGNORE = skip if exists)
INSERT IGNORE INTO subcategories (id, category_id, name_de, name_en, name_tr, name_da, description_de, description_en, description_tr, description_da, icon, is_active, sort_order) VALUES
(1, 2, 'Heißgetränke', 'Hot Beverages', 'Sıcak İçecekler', 'Varme Drikkevarer', 'Warme und wohltuende Getränke', 'Warm and comforting drinks', 'Sıcak ve rahatlatıcı içecekler', 'Varme og beroligende drikkevarer', 'fa-coffee', 1, 1),
(2, 2, 'Kaltgetränke', 'Cold Beverages', 'Soğuk İçecekler', 'Kolde Drikkevarer', 'Erfrischende kalte Getränke', 'Refreshing cold drinks', 'Serinletici soğuk içecekler', 'Forfriskende kolde drikkevarer', 'fa-glass-water', 1, 2),
(4, 1, 'Fruchtig', 'Fruity', 'Meyveli', 'Frugtig', 'Fruchtige Tabaksorten', 'Fruity tobacco flavors', 'Meyveli tütün çeşitleri', 'Frugtige tobakssmagsarter', 'fa-apple', 1, 1);

-- Verify the fix
SELECT 'CATEGORIES:' as info;
SELECT id, name_de, is_active FROM categories ORDER BY id;

SELECT 'SUBCATEGORIES:' as info;
SELECT id, category_id, name_de, is_active FROM subcategories ORDER BY category_id, id;

SELECT 'PRODUCTS BY CATEGORY:' as info;
SELECT
    p.category_id,
    c.name_de as category_name,
    p.subcategory_id,
    s.name_de as subcategory_name,
    COUNT(*) as product_count
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN subcategories s ON p.subcategory_id = s.id
GROUP BY p.category_id, p.subcategory_id
ORDER BY p.category_id, p.subcategory_id;