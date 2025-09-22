<?php
// Error reporting aktivieren
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Header setzen
header('Content-Type: text/plain; charset=utf-8');

echo "Settings Table Creation Script\n";
echo "================================\n\n";

// Database configuration
$host_name = 'db5018522360.hosting-data.io';
$database = 'dbs14708743';
$user_name = 'dbu3362598';
$password = '!Aramat1.';

echo "1. Connecting to database...\n";

try {
    $dbh = new PDO(
        "mysql:host=$host_name;dbname=$database;charset=utf8mb4",
        $user_name,
        $password
    );
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "   ✓ Database connected successfully\n\n";

    echo "2. Creating settings table...\n";

    // Simplified CREATE TABLE without JSON type for older MySQL versions
    $sql = "CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        restaurant_name TEXT,
        address TEXT,
        phone VARCHAR(50),
        email VARCHAR(100),
        opening_hours TEXT,
        social_media TEXT,
        theme TEXT,
        language VARCHAR(10) DEFAULT 'de',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )";

    $dbh->exec($sql);
    echo "   ✓ Settings table created/verified\n\n";

    echo "3. Checking existing data...\n";
    $count = $dbh->query("SELECT COUNT(*) FROM settings")->fetchColumn();
    echo "   Found $count existing entries\n\n";

    if ($count == 0) {
        echo "4. Inserting default settings...\n";

        $sql = "INSERT INTO settings (
            restaurant_name, address, phone, email,
            opening_hours, social_media, theme, language
        ) VALUES (
            :restaurant_name, :address, :phone, :email,
            :opening_hours, :social_media, :theme, :language
        )";

        $stmt = $dbh->prepare($sql);

        $result = $stmt->execute([
            'restaurant_name' => '{"de":"Safira Lounge","en":"Safira Lounge","da":"Safira Lounge"}',
            'address' => '{"de":"Flensburg, Deutschland","en":"Flensburg, Germany","da":"Flensborg, Tyskland"}',
            'phone' => '+49 461 123456',
            'email' => 'info@safira-lounge.de',
            'opening_hours' => '{"monday":"18:00-02:00","tuesday":"18:00-02:00","wednesday":"18:00-02:00","thursday":"18:00-02:00","friday":"18:00-03:00","saturday":"18:00-03:00","sunday":"18:00-02:00"}',
            'social_media' => '{"instagram":"@safira_lounge","facebook":"SafiraLounge","website":"https://safira-lounge.de"}',
            'theme' => '{"primaryColor":"#FF41FB","secondaryColor":"#000000","backgroundVideo":true}',
            'language' => 'de'
        ]);

        if ($result) {
            echo "   ✓ Default settings inserted successfully\n\n";
        } else {
            echo "   ✗ Failed to insert default settings\n\n";
        }
    } else {
        echo "4. Settings already exist, skipping insert\n\n";
    }

    echo "5. Verifying installation...\n";
    $test = $dbh->query("SELECT * FROM settings LIMIT 1")->fetch();
    if ($test) {
        echo "   ✓ Settings table is working correctly\n\n";
        echo "INSTALLATION SUCCESSFUL!\n";
    } else {
        echo "   ✗ Could not verify settings\n\n";
    }

} catch (PDOException $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "Line: " . $e->getLine() . "\n";
    echo "File: " . $e->getFile() . "\n";
} catch (Exception $e) {
    echo "GENERAL ERROR: " . $e->getMessage() . "\n";
}

echo "\n================================\n";
echo "Script completed.\n";
?>