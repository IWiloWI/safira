<?php
// Fix missing categories that prevent products from being displayed
// Run this script to add missing categories and subcategories to database

$host_name = 'db5018522360.hosting-data.io';
$database = 'dbs14708743';
$user_name = 'dbu3362598';
$password = '!Aramat1.';

try {
    $dbh = new PDO("mysql:host=$host_name;dbname=$database;charset=utf8mb4", $user_name, $password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "Connected to database successfully.\n";

    // Check current state
    echo "\n=== CURRENT STATE ===\n";
    $stmt = $dbh->query("SELECT id, name_de, is_active FROM categories ORDER BY id");
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Existing categories:\n";
    foreach ($categories as $cat) {
        echo "- ID: {$cat['id']}, Name: {$cat['name_de']}, Active: {$cat['is_active']}\n";
    }

    $stmt = $dbh->query("SELECT category_id, COUNT(*) as count FROM products GROUP BY category_id ORDER BY category_id");
    $productCounts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "\nProducts by category:\n";
    foreach ($productCounts as $count) {
        echo "- Category {$count['category_id']}: {$count['count']} products\n";
    }

    // Insert missing categories
    echo "\n=== FIXING CATEGORIES ===\n";

    // Category 1: Shisha Tabak
    $stmt = $dbh->prepare("
        INSERT IGNORE INTO categories
        (id, name_de, name_en, name_tr, name_da, description_de, description_en, description_tr, description_da, icon, image_url, is_active, sort_order, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    ");

    $result1 = $stmt->execute([
        1, 'Shisha Tabak', 'Shisha Tobacco', 'Nargile Tütünü', 'Vandpibe Tobak',
        'Premium Shisha Tabak Auswahl', 'Premium Shisha Tobacco Selection', 'Premium Nargile Tütünü Seçimi', 'Premium Vandpibe Tobak Udvalg',
        'fa-smoking', '', 1, 1
    ]);

    // Category 2: Getränke
    $result2 = $stmt->execute([
        2, 'Getränke', 'Beverages', 'İçecekler', 'Drikkevarer',
        'Erfrischende Getränke', 'Refreshing Beverages', 'Serinletici İçecekler', 'Forfriskende Drikkevarer',
        'fa-coffee', '', 1, 2
    ]);

    echo "Category 1 (Shisha): " . ($result1 ? "✓" : "✗") . "\n";
    echo "Category 2 (Getränke): " . ($result2 ? "✓" : "✗") . "\n";

    // Insert missing subcategories
    echo "\n=== FIXING SUBCATEGORIES ===\n";

    $stmt = $dbh->prepare("
        INSERT IGNORE INTO subcategories
        (id, category_id, name_de, name_en, name_tr, name_da, description_de, description_en, description_tr, description_da, icon, image_url, is_active, sort_order, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    ");

    // Subcategory 1: Heißgetränke
    $result3 = $stmt->execute([
        1, 2, 'Heißgetränke', 'Hot Beverages', 'Sıcak İçecekler', 'Varme Drikkevarer',
        'Warme und wohltuende Getränke', 'Warm and comforting drinks', 'Sıcak ve rahatlatıcı içecekler', 'Varme og beroligende drikkevarer',
        'fa-coffee', '', 1, 1
    ]);

    // Subcategory 2: Kaltgetränke
    $result4 = $stmt->execute([
        2, 2, 'Kaltgetränke', 'Cold Beverages', 'Soğuk İçecekler', 'Kolde Drikkevarer',
        'Erfrischende kalte Getränke', 'Refreshing cold drinks', 'Serinletici soğuk içecekler', 'Forfriskende kolde drikkevarer',
        'fa-glass-water', '', 1, 2
    ]);

    // Subcategory 4: Fruchtig (if not exists)
    $result5 = $stmt->execute([
        4, 1, 'Fruchtig', 'Fruity', 'Meyveli', 'Frugtig',
        'Fruchtige Tabaksorten', 'Fruity tobacco flavors', 'Meyveli tütün çeşitleri', 'Frugtige tobakssmagsarter',
        'fa-apple', '', 1, 1
    ]);

    echo "Subcategory 1 (Heißgetränke): " . ($result3 ? "✓" : "✗") . "\n";
    echo "Subcategory 2 (Kaltgetränke): " . ($result4 ? "✓" : "✗") . "\n";
    echo "Subcategory 4 (Fruchtig): " . ($result5 ? "✓" : "✗") . "\n";

    // Verify results
    echo "\n=== VERIFICATION ===\n";
    $stmt = $dbh->query("SELECT id, name_de, is_active FROM categories ORDER BY id");
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Categories after fix:\n";
    foreach ($categories as $cat) {
        echo "- ID: {$cat['id']}, Name: {$cat['name_de']}, Active: {$cat['is_active']}\n";
    }

    $stmt = $dbh->query("SELECT id, category_id, name_de, is_active FROM subcategories ORDER BY category_id, id");
    $subcategories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "\nSubcategories after fix:\n";
    foreach ($subcategories as $subcat) {
        echo "- ID: {$subcat['id']}, Category: {$subcat['category_id']}, Name: {$subcat['name_de']}, Active: {$subcat['is_active']}\n";
    }

    echo "\n✅ Fix completed! All products should now be visible.\n";

} catch (PDOException $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo "❌ General error: " . $e->getMessage() . "\n";
}
?>