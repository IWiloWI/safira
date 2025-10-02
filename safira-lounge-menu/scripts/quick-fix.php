<?php
/**
 * Quick fix script for variant products
 * Execute this directly via web browser or curl
 */

// Database configuration - adjust as needed
$host = 'localhost';
$dbname = 'safira_lounge';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "<h2>🔧 Fixing Products with Variants</h2>\n";

    // First, show products that need fixing
    echo "<h3>Products that need fixing:</h3>\n";
    $checkStmt = $pdo->query("
        SELECT
            p.id,
            p.name_de as name,
            p.price as main_price,
            p.has_variants,
            COUNT(ps.id) as variant_count
        FROM products p
        LEFT JOIN product_sizes ps ON p.id = ps.product_id AND ps.available = 1
        WHERE p.id IN (
            SELECT DISTINCT product_id
            FROM product_sizes
            WHERE available = 1
        )
        GROUP BY p.id, p.name_de, p.price, p.has_variants
        ORDER BY p.name_de
    ");
    $productsToFix = $checkStmt->fetchAll(PDO::FETCH_ASSOC);

    echo "<table border='1'>\n";
    echo "<tr><th>ID</th><th>Name</th><th>Current Price</th><th>Has Variants</th><th>Variant Count</th></tr>\n";
    foreach ($productsToFix as $product) {
        echo "<tr>\n";
        echo "<td>{$product['id']}</td>\n";
        echo "<td>{$product['name']}</td>\n";
        echo "<td>{$product['main_price']}</td>\n";
        echo "<td>" . ($product['has_variants'] ? 'Yes' : 'No') . "</td>\n";
        echo "<td>{$product['variant_count']}</td>\n";
        echo "</tr>\n";
    }
    echo "</table>\n";

    // Now update them
    echo "<h3>Applying fix...</h3>\n";
    $updateStmt = $pdo->prepare("
        UPDATE products
        SET has_variants = 1, price = 0
        WHERE id IN (
            SELECT DISTINCT product_id
            FROM product_sizes
            WHERE available = 1
        )
    ");
    $updateStmt->execute();

    $affectedRows = $updateStmt->rowCount();
    echo "<p>✅ Updated $affectedRows products.</p>\n";

    // Show results
    echo "<h3>Results after fix:</h3>\n";
    $verifyStmt = $pdo->query("
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
        ORDER BY p.name_de
    ");
    $fixedProducts = $verifyStmt->fetchAll(PDO::FETCH_ASSOC);

    echo "<table border='1'>\n";
    echo "<tr><th>ID</th><th>Name</th><th>Price</th><th>Has Variants</th><th>Variant Count</th><th>Variants</th></tr>\n";
    foreach ($fixedProducts as $product) {
        echo "<tr>\n";
        echo "<td>{$product['id']}</td>\n";
        echo "<td>{$product['name']}</td>\n";
        echo "<td>{$product['main_price']}</td>\n";
        echo "<td>" . ($product['has_variants'] ? 'Yes' : 'No') . "</td>\n";
        echo "<td>{$product['variant_count']}</td>\n";
        echo "<td>{$product['variants']}</td>\n";
        echo "</tr>\n";
    }
    echo "</table>\n";

    echo "<p>🎉 Fix completed! Products with variants now have price=0 and has_variants=1.</p>\n";

} catch (Exception $e) {
    echo "<p>❌ Error: " . $e->getMessage() . "</p>\n";
}
?>