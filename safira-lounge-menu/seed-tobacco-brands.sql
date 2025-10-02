-- Seed Initial Tobacco Brands
-- This script populates the tobacco_catalog table with popular brands

-- Create tobacco_catalog table if it doesn't exist
CREATE TABLE IF NOT EXISTS tobacco_catalog (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_tobacco (name, brand),
    INDEX idx_brand (brand)
);

-- Insert popular tobacco brands with sample products
INSERT IGNORE INTO tobacco_catalog (name, brand, description, price) VALUES
-- Al Fakher (most popular)
('Double Apple', 'Al Fakher', 'Klassischer Doppel-Apfel Geschmack', 15.00),
('Mint', 'Al Fakher', 'Frische Minze', 15.00),
('Watermelon', 'Al Fakher', 'Süße Wassermelone', 15.00),

-- Adalya
('Love 66', 'Adalya', 'Erdbeere, Vanille, Minze', 16.00),
('Lady Killer', 'Adalya', 'Pfirsich, Mango, Vanille', 16.00),

-- Aqua Mentha
('African Crush', 'Aqua Mentha', 'Pfirsich, Mango, Traube, Kiwi', 17.00),
('Joker', 'Aqua Mentha', 'Zitrone, Orange, Minze', 17.00),

-- Serbetli
('Ice Watermelon Mint', 'Serbetli', 'Eiskalte Wassermelone mit Minze', 14.00),
('Ice Banana Milk', 'Serbetli', 'Banane, Milch, Eis', 14.00),

-- Fumari
('White Gummy Bear', 'Fumari', 'Weißes Gummibärchen', 18.00),
('Ambrosia', 'Fumari', 'Melone, Zitrus, Minze', 18.00),

-- Starbuzz
('Blue Mist', 'Starbuzz', 'Blaubeere, Minze', 19.00),
('Pirates Cave', 'Starbuzz', 'Verschiedene Früchte', 19.00),

-- Holster
('Red Berries', 'Holster', 'Rote Beeren Mix', 16.00),
('Cool Lemon', 'Holster', 'Kühle Zitrone', 16.00),

-- Nameless
('Black Nana', 'Nameless', 'Banane, dunkle Früchte', 20.00),
('Unicorn Passion', 'Nameless', 'Exotische Früchte', 20.00),

-- 187 Tobacco
('Mint', '187 Tobacco', 'Intensive Minze', 21.00),
('Hamburg', '187 Tobacco', 'Beeren, Minze', 21.00),

-- Ottomans
('Cherry', 'Ottomans', 'Kirsche', 15.00),
('Grape', 'Ottomans', 'Traube', 15.00);

-- Verify insertion
SELECT
    COUNT(*) as total_products,
    COUNT(DISTINCT brand) as total_brands
FROM tobacco_catalog;

-- Show all brands
SELECT DISTINCT brand
FROM tobacco_catalog
ORDER BY brand;
