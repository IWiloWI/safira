<?php
/**
 * Direkte Lösung für das Wasser-Varianten Problem
 * Führe diese Datei direkt im Browser aus: http://test.safira-lounge.de/scripts/fix-wasser-direct.php
 */

// Database configuration
$host = 'localhost';
$dbname = 'safira_lounge';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "<h2>🔧 Lösung für Wasser-Varianten Problem</h2>\n";

    // 1. Füge Varianten für Wasser hinzu
    echo "<h3>1. Füge Varianten für Wasser hinzu (ID: 121)</h3>\n";

    // Erst prüfen ob schon Varianten existieren
    $checkStmt = $pdo->prepare("SELECT COUNT(*) as count FROM product_sizes WHERE product_id = 121");
    $checkStmt->execute();
    $existingVariants = $checkStmt->fetch(PDO::FETCH_ASSOC)['count'];

    if ($existingVariants > 0) {
        echo "<p>⚠️ Wasser hat bereits $existingVariants Varianten. Lösche alte zuerst...</p>\n";
        $deleteStmt = $pdo->prepare("DELETE FROM product_sizes WHERE product_id = 121");
        $deleteStmt->execute();
    }

    // Füge neue Varianten hinzu
    $variantStmt = $pdo->prepare("
        INSERT INTO product_sizes (product_id, size, price, available, description, sort_order) VALUES
        (121, '0.3L', 2.50, 1, 'Kleine Flasche', 0),
        (121, '0.5L', 3.50, 1, 'Große Flasche', 1),
        (121, '1.0L', 5.00, 1, 'Liter Flasche', 2)
    ");
    $variantStmt->execute();
    echo "<p>✅ 3 Wasser-Varianten hinzugefügt: 0.3L (2.50€), 0.5L (3.50€), 1.0L (5.00€)</p>\n";

    // 2. Aktualisiere Wasser-Produkt
    echo "<h3>2. Aktualisiere Wasser-Produkt</h3>\n";
    $updateWasserStmt = $pdo->prepare("UPDATE products SET has_variants = 1, price = 0 WHERE id = 121");
    $updateWasserStmt->execute();
    echo "<p>✅ Wasser-Produkt aktualisiert: has_variants = 1, price = 0</p>\n";

    // 3. Aktualisiere alle anderen Produkte mit Varianten
    echo "<h3>3. Aktualisiere alle anderen Produkte mit Varianten</h3>\n";
    $updateAllStmt = $pdo->prepare("
        UPDATE products
        SET has_variants = 1, price = 0
        WHERE id IN (
            SELECT DISTINCT product_id
            FROM product_sizes
            WHERE available = 1
        )
    ");
    $updateAllStmt->execute();
    $affectedRows = $updateAllStmt->rowCount();
    echo "<p>✅ $affectedRows Produkte mit Varianten aktualisiert</p>\n";

    // 4. Zeige Ergebnisse
    echo "<h3>4. Ergebnisse - Alle Produkte mit Varianten:</h3>\n";
    $resultStmt = $pdo->query("
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
    $results = $resultStmt->fetchAll(PDO::FETCH_ASSOC);

    echo "<table border='1' style='border-collapse: collapse; width: 100%;'>\n";
    echo "<tr><th>ID</th><th>Name</th><th>Hauptpreis</th><th>Hat Varianten</th><th>Anzahl Varianten</th><th>Varianten</th></tr>\n";
    foreach ($results as $product) {
        echo "<tr>\n";
        echo "<td>{$product['id']}</td>\n";
        echo "<td><strong>{$product['name']}</strong></td>\n";
        echo "<td>{$product['main_price']}€</td>\n";
        echo "<td>" . ($product['has_variants'] ? '✅ Ja' : '❌ Nein') . "</td>\n";
        echo "<td>{$product['variant_count']}</td>\n";
        echo "<td>{$product['variants']}</td>\n";
        echo "</tr>\n";
    }
    echo "</table>\n";

    echo "<h3>🎉 Erfolgreich abgeschlossen!</h3>\n";
    echo "<p><strong>Das Wasser-Produkt sollte jetzt in der App korrekte Varianten-Preise anzeigen statt '0.00 €'</strong></p>\n";
    echo "<p>Gehe zur Webseite und prüfe das Wasser-Produkt: <a href='http://test.safira-lounge.de' target='_blank'>http://test.safira-lounge.de</a></p>\n";

} catch (Exception $e) {
    echo "<p>❌ Fehler: " . htmlspecialchars($e->getMessage()) . "</p>\n";
}
?>