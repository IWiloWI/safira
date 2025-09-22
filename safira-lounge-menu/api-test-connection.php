<?php
/**
 * Database Connection Test - ROOT Version
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://test.safira-lounge.de');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

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
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    // Test query
    $query = "SELECT 1 as test";
    $stmt = $dbh->prepare($query);
    $stmt->execute();
    $result = $stmt->fetch();

    if ($result['test'] === 1) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Database connection successful',
            'timestamp' => date('c'),
            'database' => $database,
            'host' => $host_name,
            'location' => 'ROOT'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Database test failed']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Database connection failed: ' . $e->getMessage()
    ]);
}
?>