<?php
// Database Reset Script with Subcategory Support
// WARNING: This will DELETE ALL DATA and recreate tables from scratch

header('Content-Type: text/plain; charset=utf-8');
echo "===========================================\n";
echo "SAFIRA DATABASE RESET WITH SUBCATEGORIES\n";
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

$tables_to_drop = ['products', 'subcategories', 'categories', 'tobacco_catalog', 'admin_users'];

foreach ($tables_to_drop as $table) {
    try {
        $dbh->exec("DROP TABLE IF EXISTS `$table`");
        echo "✓ Dropped table: $table\n";
    } catch (PDOException $e) {
        echo "✗ Error dropping $table: " . $e->getMessage() . "\n";
    }
}

echo "\n";

// Step 2: Create categories table (Main categories only)
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
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_sort_order` (`sort_order`),
    KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
";

try {
    $dbh->exec($create_categories);
    echo "✓ Created categories table\n";
} catch (PDOException $e) {
    echo "✗ Error creating categories table: " . $e->getMessage() . "\n";
}

// Step 3: Create subcategories table
echo "\nSTEP 3: Creating subcategories table...\n";
echo "----------------------------------------\n";

$create_subcategories = "
CREATE TABLE `subcategories` (
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
    `image_url` VARCHAR(500) DEFAULT '',
    `icon` VARCHAR(100) DEFAULT 'fa-folder',
    `sort_order` INT(11) DEFAULT 999,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_category` (`category_id`),
    KEY `idx_sort_order` (`sort_order`),
    KEY `idx_is_active` (`is_active`),
    CONSTRAINT `fk_subcategories_category` FOREIGN KEY (`category_id`)
        REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
";

try {
    $dbh->exec($create_subcategories);
    echo "✓ Created subcategories table\n";
} catch (PDOException $e) {
    echo "✗ Error creating subcategories table: " . $e->getMessage() . "\n";
}

// Step 4: Create products table
echo "\nSTEP 4: Creating products table...\n";
echo "----------------------------------------\n";

$create_products = "
CREATE TABLE `products` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `category_id` INT(11) DEFAULT NULL,
    `subcategory_id` INT(11) DEFAULT NULL,
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
    KEY `idx_subcategory` (`subcategory_id`),
    KEY `idx_available` (`available`),
    KEY `idx_sort_order` (`sort_order`),
    CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`)
        REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `fk_products_subcategory` FOREIGN KEY (`subcategory_id`)
        REFERENCES `subcategories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
";

try {
    $dbh->exec($create_products);
    echo "✓ Created products table with subcategory support\n";
} catch (PDOException $e) {
    echo "✗ Error creating products table: " . $e->getMessage() . "\n";
}

// Step 5: Insert sample main categories
echo "\nSTEP 5: Inserting sample main categories...\n";
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
        'sort_order' => 1
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
        'sort_order' => 2
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
        'sort_order' => 3
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
        'sort_order' => 4
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
        :icon, :sort_order, 1, 1
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
            ':sort_order' => $category['sort_order']
        ]);
        echo "✓ Created category: {$category['name_de']}\n";
    } catch (PDOException $e) {
        echo "✗ Error creating category {$category['name_de']}: " . $e->getMessage() . "\n";
    }
}

// Step 6: Insert sample subcategories
echo "\nSTEP 6: Inserting sample subcategories...\n";
echo "----------------------------------------\n";

// Get category IDs
$categories = $dbh->query("SELECT id, name_de FROM categories")->fetchAll(PDO::FETCH_KEY_PAIR);

$sample_subcategories = [
    // Getränke Subcategories
    [
        'category' => 'Getränke',
        'name_de' => 'Heiße Getränke',
        'name_en' => 'Hot Beverages',
        'name_tr' => 'Sıcak İçecekler',
        'name_da' => 'Varme Drikkevarer',
        'description_de' => 'Tee, Kaffee und mehr',
        'description_en' => 'Tea, coffee and more',
        'icon' => 'fa-coffee',
        'sort_order' => 1
    ],
    [
        'category' => 'Getränke',
        'name_de' => 'Kalte Getränke',
        'name_en' => 'Cold Beverages',
        'name_tr' => 'Soğuk İçecekler',
        'name_da' => 'Kolde Drikkevarer',
        'description_de' => 'Erfrischende kalte Getränke',
        'description_en' => 'Refreshing cold beverages',
        'icon' => 'fa-glass-water',
        'sort_order' => 2
    ],
    [
        'category' => 'Getränke',
        'name_de' => 'Softdrinks',
        'name_en' => 'Soft Drinks',
        'name_tr' => 'Meşrubatlar',
        'name_da' => 'Sodavand',
        'description_de' => 'Cola, Fanta und mehr',
        'description_en' => 'Cola, Fanta and more',
        'icon' => 'fa-bottle-water',
        'sort_order' => 3
    ],
    // Shisha Tabak Subcategories
    [
        'category' => 'Shisha Tabak',
        'name_de' => 'Fruchtig',
        'name_en' => 'Fruity',
        'name_tr' => 'Meyveli',
        'name_da' => 'Frugtig',
        'description_de' => 'Fruchtige Tabaksorten',
        'description_en' => 'Fruity tobacco flavors',
        'icon' => 'fa-apple',
        'sort_order' => 1
    ],
    [
        'category' => 'Shisha Tabak',
        'name_de' => 'Minzig',
        'name_en' => 'Minty',
        'name_tr' => 'Naneli',
        'name_da' => 'Mynteagtig',
        'description_de' => 'Erfrischende Minze-Sorten',
        'description_en' => 'Refreshing mint flavors',
        'icon' => 'fa-leaf',
        'sort_order' => 2
    ]
];

$subcat_stmt = $dbh->prepare("
    INSERT INTO subcategories (
        category_id, name_de, name_en, name_tr, name_da,
        description_de, description_en, description_tr, description_da,
        icon, sort_order, is_active
    ) VALUES (
        :category_id, :name_de, :name_en, :name_tr, :name_da,
        :desc_de, :desc_en, :desc_tr, :desc_da,
        :icon, :sort_order, 1
    )
");

foreach ($sample_subcategories as $subcategory) {
    // Find category ID
    $category_id = null;
    foreach ($categories as $id => $name) {
        if ($name === $subcategory['category']) {
            $category_id = $id;
            break;
        }
    }

    if ($category_id) {
        try {
            $subcat_stmt->execute([
                ':category_id' => $category_id,
                ':name_de' => $subcategory['name_de'],
                ':name_en' => $subcategory['name_en'],
                ':name_tr' => $subcategory['name_tr'],
                ':name_da' => $subcategory['name_da'],
                ':desc_de' => $subcategory['description_de'],
                ':desc_en' => $subcategory['description_en'],
                ':desc_tr' => $subcategory['description_tr'] ?? '',
                ':desc_da' => $subcategory['description_da'] ?? '',
                ':icon' => $subcategory['icon'],
                ':sort_order' => $subcategory['sort_order']
            ]);
            echo "✓ Created subcategory: {$subcategory['name_de']} (under {$subcategory['category']})\n";
        } catch (PDOException $e) {
            echo "✗ Error creating subcategory {$subcategory['name_de']}: " . $e->getMessage() . "\n";
        }
    }
}

// Step 7: Insert sample products
echo "\nSTEP 7: Inserting sample products...\n";
echo "----------------------------------------\n";

// Get subcategory IDs
$subcategories = $dbh->query("SELECT id, name_de, category_id FROM subcategories")->fetchAll(PDO::FETCH_ASSOC);

$sample_products = [
    // Products in "Heiße Getränke" subcategory
    [
        'subcategory' => 'Heiße Getränke',
        'name_de' => 'Türkischer Tee',
        'name_en' => 'Turkish Tea',
        'name_tr' => 'Türk Çayı',
        'name_da' => 'Tyrkisk Te',
        'description_de' => 'Traditioneller türkischer Schwarztee',
        'description_en' => 'Traditional Turkish black tea',
        'price' => 3.50
    ],
    [
        'subcategory' => 'Heiße Getränke',
        'name_de' => 'Türkischer Kaffee',
        'name_en' => 'Turkish Coffee',
        'name_tr' => 'Türk Kahvesi',
        'name_da' => 'Tyrkisk Kaffe',
        'description_de' => 'Traditioneller türkischer Kaffee',
        'description_en' => 'Traditional Turkish coffee',
        'price' => 4.00
    ],
    // Products in "Kalte Getränke" subcategory
    [
        'subcategory' => 'Kalte Getränke',
        'name_de' => 'Ayran',
        'name_en' => 'Ayran',
        'name_tr' => 'Ayran',
        'name_da' => 'Ayran',
        'description_de' => 'Erfrischendes Joghurtgetränk',
        'description_en' => 'Refreshing yogurt drink',
        'price' => 4.00
    ],
    // Products in "Fruchtig" subcategory
    [
        'subcategory' => 'Fruchtig',
        'name_de' => 'Al Fakher Doppelapfel',
        'name_en' => 'Al Fakher Double Apple',
        'name_tr' => 'Al Fakher Çift Elma',
        'name_da' => 'Al Fakher Dobbelt Æble',
        'description_de' => 'Klassischer Doppelapfel Geschmack',
        'description_en' => 'Classic double apple flavor',
        'price' => 15.99,
        'badge_popular' => 1
    ]
];

$product_stmt = $dbh->prepare("
    INSERT INTO products (
        category_id, subcategory_id, name_de, name_en, name_tr, name_da,
        description_de, description_en, description_tr, description_da,
        price, badge_new, badge_popular, badge_limited, available
    ) VALUES (
        :category_id, :subcategory_id, :name_de, :name_en, :name_tr, :name_da,
        :desc_de, :desc_en, :desc_tr, :desc_da,
        :price, :badge_new, :badge_popular, :badge_limited, 1
    )
");

foreach ($sample_products as $product) {
    // Find subcategory and category IDs
    $subcategory_id = null;
    $category_id = null;

    foreach ($subcategories as $subcat) {
        if ($subcat['name_de'] === $product['subcategory']) {
            $subcategory_id = $subcat['id'];
            $category_id = $subcat['category_id'];
            break;
        }
    }

    if ($subcategory_id) {
        try {
            $product_stmt->execute([
                ':category_id' => $category_id,
                ':subcategory_id' => $subcategory_id,
                ':name_de' => $product['name_de'],
                ':name_en' => $product['name_en'],
                ':name_tr' => $product['name_tr'] ?? $product['name_en'],
                ':name_da' => $product['name_da'] ?? $product['name_en'],
                ':desc_de' => $product['description_de'],
                ':desc_en' => $product['description_en'],
                ':desc_tr' => $product['description_tr'] ?? $product['description_en'],
                ':desc_da' => $product['description_da'] ?? $product['description_en'],
                ':price' => $product['price'],
                ':badge_new' => $product['badge_new'] ?? 0,
                ':badge_popular' => $product['badge_popular'] ?? 0,
                ':badge_limited' => $product['badge_limited'] ?? 0
            ]);
            echo "✓ Created product: {$product['name_de']} (in {$product['subcategory']})\n";
        } catch (PDOException $e) {
            echo "✗ Error creating product {$product['name_de']}: " . $e->getMessage() . "\n";
        }
    }
}

// Step 8: Verify the data
echo "\n===========================================\n";
echo "DATABASE RESET COMPLETE - VERIFICATION\n";
echo "===========================================\n\n";

try {
    $cat_count = $dbh->query("SELECT COUNT(*) FROM categories")->fetchColumn();
    $subcat_count = $dbh->query("SELECT COUNT(*) FROM subcategories")->fetchColumn();
    $prod_count = $dbh->query("SELECT COUNT(*) FROM products")->fetchColumn();

    echo "✓ Categories created: $cat_count\n";
    echo "✓ Subcategories created: $subcat_count\n";
    echo "✓ Products created: $prod_count\n\n";

    echo "Categories Structure:\n";
    echo "------------------------\n";
    $cats = $dbh->query("SELECT id, name_de FROM categories ORDER BY sort_order")->fetchAll();
    foreach ($cats as $cat) {
        echo "\n📁 {$cat['name_de']} (ID: {$cat['id']})\n";

        // Show subcategories
        $subcats = $dbh->prepare("SELECT id, name_de FROM subcategories WHERE category_id = ? ORDER BY sort_order");
        $subcats->execute([$cat['id']]);
        $subcatList = $subcats->fetchAll();

        foreach ($subcatList as $subcat) {
            echo "  └─ 📂 {$subcat['name_de']} (ID: {$subcat['id']})\n";

            // Show products in subcategory
            $prods = $dbh->prepare("SELECT name_de, price FROM products WHERE subcategory_id = ? ORDER BY name_de");
            $prods->execute([$subcat['id']]);
            $prodList = $prods->fetchAll();

            foreach ($prodList as $prod) {
                echo "      └─ {$prod['name_de']} ({$prod['price']} €)\n";
            }
        }
    }

} catch (PDOException $e) {
    echo "✗ Error during verification: " . $e->getMessage() . "\n";
}

echo "\n===========================================\n";
echo "✓ DATABASE RESET COMPLETE WITH SUBCATEGORIES!\n";
echo "===========================================\n";
echo "\nThe database now has:\n";
echo "- Separate categories and subcategories tables\n";
echo "- Products linked to both categories AND subcategories\n";
echo "- Full multi-language support (DE, EN, TR, DA)\n";
echo "- Sample data with proper relationships\n";
echo "\nYou can now use the Subcategory Manager in the admin panel!\n";
?>