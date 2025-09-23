<?php
// Database Reset Script - Complete Recreation
// WARNING: This will DELETE ALL DATA and recreate tables from scratch

header('Content-Type: text/plain; charset=utf-8');
echo "===========================================\n";
echo "SAFIRA DATABASE RESET SCRIPT\n";
echo "===========================================\n\n";

// Database connection
$host_name = 'db5018522360.hosting-data.io';
$database = 'dbs14708743';
$user_name = 'dbu3362598';
$password = '!Aramat1.';

try {
    $dbh = new PDO("mysql:host=$host_name;dbname=$database;charset=utf8mb4", $user_name, $password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✓ Database connection successful\n\n";
} catch (PDOException $e) {
    die("✗ Database connection failed: " . $e->getMessage() . "\n");
}

// Step 1: Drop existing tables
echo "STEP 1: Dropping existing tables...\n";
echo "----------------------------------------\n";

$tables_to_drop = ['products', 'categories', 'subcategories', 'tobacco_catalog', 'admin_users'];

foreach ($tables_to_drop as $table) {
    try {
        $dbh->exec("DROP TABLE IF EXISTS `$table`");
        echo "✓ Dropped table: $table\n";
    } catch (PDOException $e) {
        echo "✗ Error dropping $table: " . $e->getMessage() . "\n";
    }
}

echo "\n";

// Step 2: Create categories table with proper schema
echo "STEP 2: Creating categories table...\n";
echo "----------------------------------------\n";

$create_categories = "
CREATE TABLE `categories` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `name_de` VARCHAR(255) NOT NULL DEFAULT '',
    `name_en` VARCHAR(255) DEFAULT '',
    `name_tr` VARCHAR(255) DEFAULT '',
    `name_da` VARCHAR(255) DEFAULT '',
    `description_de` TEXT,
    `description_en` TEXT,
    `description_tr` TEXT,
    `description_da` TEXT,
    `image_url` VARCHAR(500) DEFAULT '',
    `icon` VARCHAR(100) DEFAULT 'fa-utensils',
    `sort_order` INT(11) DEFAULT 999,
    `is_active` TINYINT(1) DEFAULT 1,
    `is_main_category` TINYINT(1) DEFAULT 1,
    `parent_category_id` INT(11) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_sort_order` (`sort_order`),
    KEY `idx_is_active` (`is_active`),
    KEY `idx_is_main` (`is_main_category`),
    KEY `idx_parent` (`parent_category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
";

try {
    $dbh->exec($create_categories);
    echo "✓ Created categories table\n";
} catch (PDOException $e) {
    echo "✗ Error creating categories table: " . $e->getMessage() . "\n";
}

// Step 3: Create products table
echo "\nSTEP 3: Creating products table...\n";
echo "----------------------------------------\n";

$create_products = "
CREATE TABLE `products` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `category_id` INT(11) NOT NULL,
    `name_de` VARCHAR(255) NOT NULL DEFAULT '',
    `name_en` VARCHAR(255) DEFAULT '',
    `name_tr` VARCHAR(255) DEFAULT '',
    `name_da` VARCHAR(255) DEFAULT '',
    `description_de` TEXT,
    `description_en` TEXT,
    `description_tr` TEXT,
    `description_da` TEXT,
    `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `image_url` VARCHAR(500) DEFAULT '',
    `available` TINYINT(1) DEFAULT 1,
    `badge_new` TINYINT(1) DEFAULT 0,
    `badge_popular` TINYINT(1) DEFAULT 0,
    `badge_limited` TINYINT(1) DEFAULT 0,
    `sort_order` INT(11) DEFAULT 999,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_category` (`category_id`),
    KEY `idx_available` (`available`),
    KEY `idx_sort_order` (`sort_order`),
    CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`)
        REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
";

try {
    $dbh->exec($create_products);
    echo "✓ Created products table\n";
} catch (PDOException $e) {
    echo "✗ Error creating products table: " . $e->getMessage() . "\n";
}

// Step 4: Insert sample categories
echo "\nSTEP 4: Inserting sample categories...\n";
echo "----------------------------------------\n";

$sample_categories = [
    [
        'name_de' => 'Shisha Tabak',
        'name_en' => 'Shisha Tobacco',
        'name_tr' => 'Nargile Tütünü',
        'name_da' => 'Vandpibe Tobak',
        'description_de' => 'Premium Shisha Tabak Auswahl',
        'description_en' => 'Premium Shisha Tobacco Selection',
        'description_tr' => 'Premium Nargile Tütünü Seçimi',
        'description_da' => 'Premium Vandpibe Tobak Udvalg',
        'icon' => 'fa-smoking',
        'sort_order' => 1,
        'is_main_category' => 1
    ],
    [
        'name_de' => 'Getränke',
        'name_en' => 'Beverages',
        'name_tr' => 'İçecekler',
        'name_da' => 'Drikkevarer',
        'description_de' => 'Kalte und heiße Getränke',
        'description_en' => 'Cold and hot beverages',
        'description_tr' => 'Soğuk ve sıcak içecekler',
        'description_da' => 'Kolde og varme drikkevarer',
        'icon' => 'fa-glass',
        'sort_order' => 2,
        'is_main_category' => 1
    ],
    [
        'name_de' => 'Snacks',
        'name_en' => 'Snacks',
        'name_tr' => 'Atıştırmalıklar',
        'name_da' => 'Snacks',
        'description_de' => 'Leckere Snacks und Kleinigkeiten',
        'description_en' => 'Delicious snacks and bites',
        'description_tr' => 'Lezzetli atıştırmalıklar',
        'description_da' => 'Lækre snacks',
        'icon' => 'fa-cookie-bite',
        'sort_order' => 3,
        'is_main_category' => 1
    ],
    [
        'name_de' => 'Desserts',
        'name_en' => 'Desserts',
        'name_tr' => 'Tatlılar',
        'name_da' => 'Desserter',
        'description_de' => 'Süße Versuchungen',
        'description_en' => 'Sweet temptations',
        'description_tr' => 'Tatlı ayartmalar',
        'description_da' => 'Søde fristelser',
        'icon' => 'fa-ice-cream',
        'sort_order' => 4,
        'is_main_category' => 1
    ]
];

$stmt = $dbh->prepare("
    INSERT INTO categories (
        name_de, name_en, name_tr, name_da,
        description_de, description_en, description_tr, description_da,
        icon, sort_order, is_main_category, is_active
    ) VALUES (
        :name_de, :name_en, :name_tr, :name_da,
        :desc_de, :desc_en, :desc_tr, :desc_da,
        :icon, :sort_order, :is_main, 1
    )
");

foreach ($sample_categories as $category) {
    try {
        $stmt->execute([
            ':name_de' => $category['name_de'],
            ':name_en' => $category['name_en'],
            ':name_tr' => $category['name_tr'],
            ':name_da' => $category['name_da'],
            ':desc_de' => $category['description_de'],
            ':desc_en' => $category['description_en'],
            ':desc_tr' => $category['description_tr'],
            ':desc_da' => $category['description_da'],
            ':icon' => $category['icon'],
            ':sort_order' => $category['sort_order'],
            ':is_main' => $category['is_main_category']
        ]);
        echo "✓ Created category: {$category['name_de']}\n";
    } catch (PDOException $e) {
        echo "✗ Error creating category {$category['name_de']}: " . $e->getMessage() . "\n";
    }
}

// Step 5: Insert sample products
echo "\nSTEP 5: Inserting sample products...\n";
echo "----------------------------------------\n";

// Get category IDs
$categories = $dbh->query("SELECT id, name_de FROM categories")->fetchAll(PDO::FETCH_KEY_PAIR);

$sample_products = [
    // Shisha Tabak products
    [
        'category' => 'Shisha Tabak',
        'name_de' => 'Al Fakher Doppelapfel',
        'name_en' => 'Al Fakher Double Apple',
        'name_tr' => 'Al Fakher Çift Elma',
        'name_da' => 'Al Fakher Dobbelt Æble',
        'description_de' => 'Klassischer Doppelapfel Geschmack',
        'description_en' => 'Classic double apple flavor',
        'description_tr' => 'Klasik çift elma aroması',
        'description_da' => 'Klassisk dobbelt æble smag',
        'price' => 15.99,
        'badge_popular' => 1
    ],
    [
        'category' => 'Shisha Tabak',
        'name_de' => 'Adalya Love 66',
        'name_en' => 'Adalya Love 66',
        'name_tr' => 'Adalya Love 66',
        'name_da' => 'Adalya Love 66',
        'description_de' => 'Melone, Wassermelone, Maracuja und Minze',
        'description_en' => 'Melon, watermelon, passion fruit and mint',
        'description_tr' => 'Kavun, karpuz, çarkıfelek ve nane',
        'description_da' => 'Melon, vandmelon, passionsfrugt og mynte',
        'price' => 16.99,
        'badge_new' => 1
    ],
    // Getränke products
    [
        'category' => 'Getränke',
        'name_de' => 'Türkischer Tee',
        'name_en' => 'Turkish Tea',
        'name_tr' => 'Türk Çayı',
        'name_da' => 'Tyrkisk Te',
        'description_de' => 'Traditioneller türkischer Schwarztee',
        'description_en' => 'Traditional Turkish black tea',
        'description_tr' => 'Geleneksel Türk çayı',
        'description_da' => 'Traditionel tyrkisk sort te',
        'price' => 3.50
    ],
    [
        'category' => 'Getränke',
        'name_de' => 'Ayran',
        'name_en' => 'Ayran',
        'name_tr' => 'Ayran',
        'name_da' => 'Ayran',
        'description_de' => 'Erfrischendes Joghurtgetränk',
        'description_en' => 'Refreshing yogurt drink',
        'description_tr' => 'Serinletici yoğurt içeceği',
        'description_da' => 'Forfriskende yoghurtdrik',
        'price' => 4.00
    ],
    // Snacks products
    [
        'category' => 'Snacks',
        'name_de' => 'Nüsse Mix',
        'name_en' => 'Mixed Nuts',
        'name_tr' => 'Karışık Kuruyemiş',
        'name_da' => 'Blandede Nødder',
        'description_de' => 'Geröstete und gesalzene Nüsse',
        'description_en' => 'Roasted and salted nuts',
        'description_tr' => 'Kavrulmuş ve tuzlu kuruyemiş',
        'description_da' => 'Ristede og saltede nødder',
        'price' => 6.50
    ]
];

$product_stmt = $dbh->prepare("
    INSERT INTO products (
        category_id, name_de, name_en, name_tr, name_da,
        description_de, description_en, description_tr, description_da,
        price, badge_new, badge_popular, badge_limited, available
    ) VALUES (
        :category_id, :name_de, :name_en, :name_tr, :name_da,
        :desc_de, :desc_en, :desc_tr, :desc_da,
        :price, :badge_new, :badge_popular, :badge_limited, 1
    )
");

foreach ($sample_products as $product) {
    // Find category ID
    $category_id = null;
    foreach ($categories as $id => $name) {
        if ($name === $product['category']) {
            $category_id = $id;
            break;
        }
    }

    if ($category_id) {
        try {
            $product_stmt->execute([
                ':category_id' => $category_id,
                ':name_de' => $product['name_de'],
                ':name_en' => $product['name_en'],
                ':name_tr' => $product['name_tr'],
                ':name_da' => $product['name_da'],
                ':desc_de' => $product['description_de'],
                ':desc_en' => $product['description_en'],
                ':desc_tr' => $product['description_tr'],
                ':desc_da' => $product['description_da'],
                ':price' => $product['price'],
                ':badge_new' => $product['badge_new'] ?? 0,
                ':badge_popular' => $product['badge_popular'] ?? 0,
                ':badge_limited' => $product['badge_limited'] ?? 0
            ]);
            echo "✓ Created product: {$product['name_de']}\n";
        } catch (PDOException $e) {
            echo "✗ Error creating product {$product['name_de']}: " . $e->getMessage() . "\n";
        }
    }
}

// Step 6: Verify the data
echo "\n===========================================\n";
echo "DATABASE RESET COMPLETE - VERIFICATION\n";
echo "===========================================\n\n";

try {
    $cat_count = $dbh->query("SELECT COUNT(*) FROM categories")->fetchColumn();
    $prod_count = $dbh->query("SELECT COUNT(*) FROM products")->fetchColumn();

    echo "✓ Categories created: $cat_count\n";
    echo "✓ Products created: $prod_count\n\n";

    echo "Categories in database:\n";
    echo "------------------------\n";
    $cats = $dbh->query("SELECT id, name_de, name_en, is_main_category FROM categories ORDER BY sort_order")->fetchAll();
    foreach ($cats as $cat) {
        $main = $cat['is_main_category'] ? '[MAIN]' : '[SUB]';
        echo "  {$main} ID:{$cat['id']} - {$cat['name_de']} ({$cat['name_en']})\n";
    }

    echo "\nProducts by category:\n";
    echo "------------------------\n";
    $prods = $dbh->query("
        SELECT c.name_de as category, p.name_de as product, p.price
        FROM products p
        JOIN categories c ON p.category_id = c.id
        ORDER BY c.sort_order, p.name_de
    ")->fetchAll();

    $current_cat = '';
    foreach ($prods as $prod) {
        if ($current_cat !== $prod['category']) {
            $current_cat = $prod['category'];
            echo "\n  {$current_cat}:\n";
        }
        echo "    - {$prod['product']} ({$prod['price']} €)\n";
    }

} catch (PDOException $e) {
    echo "✗ Error during verification: " . $e->getMessage() . "\n";
}

echo "\n===========================================\n";
echo "✓ DATABASE RESET COMPLETE!\n";
echo "===========================================\n";
echo "\nThe database has been completely reset with:\n";
echo "- New table structure with proper columns\n";
echo "- Support for DE, EN, TR, DA languages\n";
echo "- Sample categories and products\n";
echo "- Proper foreign key relationships\n";
echo "\nYou can now upload the updated API file.\n";
?>