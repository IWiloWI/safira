<?php
/**
 * Create settings table in database
 * Run this once: http://test.safira-lounge.de/api/create-settings-table.php
 */

// Database configuration
$host_name = 'db5018522360.hosting-data.io';
$database = 'dbs14708743';
$user_name = 'dbu3362598';
$password = '!Aramat1.';

try {
    $dbh = new PDO(
        "mysql:host=$host_name;dbname=$database;charset=utf8mb4",
        $user_name,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );

    // Create settings table
    $sql = "CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        restaurant_name JSON,
        address JSON,
        phone VARCHAR(50),
        email VARCHAR(100),
        opening_hours JSON,
        social_media JSON,
        theme JSON,
        language VARCHAR(10) DEFAULT 'de',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

    $dbh->exec($sql);

    // Insert default settings if table is empty
    $count = $dbh->query("SELECT COUNT(*) FROM settings")->fetchColumn();

    if ($count == 0) {
        $defaultSettings = [
            'restaurant_name' => json_encode([
                'de' => 'Safira Lounge',
                'en' => 'Safira Lounge',
                'da' => 'Safira Lounge'
            ]),
            'address' => json_encode([
                'de' => 'Flensburg, Deutschland',
                'en' => 'Flensburg, Germany',
                'da' => 'Flensborg, Tyskland'
            ]),
            'phone' => '+49 461 123456',
            'email' => 'info@safira-lounge.de',
            'opening_hours' => json_encode([
                'monday' => '18:00-02:00',
                'tuesday' => '18:00-02:00',
                'wednesday' => '18:00-02:00',
                'thursday' => '18:00-02:00',
                'friday' => '18:00-03:00',
                'saturday' => '18:00-03:00',
                'sunday' => '18:00-02:00'
            ]),
            'social_media' => json_encode([
                'instagram' => '@safira_lounge',
                'facebook' => 'SafiraLounge',
                'website' => 'https://safira-lounge.de'
            ]),
            'theme' => json_encode([
                'primaryColor' => '#FF41FB',
                'secondaryColor' => '#000000',
                'backgroundVideo' => true
            ]),
            'language' => 'de'
        ];

        $stmt = $dbh->prepare("INSERT INTO settings (
            restaurant_name, address, phone, email,
            opening_hours, social_media, theme, language
        ) VALUES (
            :restaurant_name, :address, :phone, :email,
            :opening_hours, :social_media, :theme, :language
        )");

        $stmt->execute($defaultSettings);

        echo json_encode([
            'success' => true,
            'message' => 'Settings table created and initialized with default values'
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'message' => 'Settings table already exists with ' . $count . ' entries'
        ]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>