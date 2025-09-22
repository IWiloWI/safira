<?php
// Direct categories endpoint
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://test.safira-lounge.de');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Database connection
require_once 'config.php';

try {
    $query = "SELECT * FROM categories ORDER BY display_order";
    $stmt = $dbh->prepare($query);
    $stmt->execute();
    $categories = $stmt->fetchAll();

    $result = [];
    foreach ($categories as $cat) {
        $result[] = [
            'id' => $cat['id'],
            'name' => json_decode($cat['name']),
            'icon' => $cat['icon'],
            'description' => json_decode($cat['description'] ?? '{}')
        ];
    }

    echo json_encode($result);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to fetch categories',
        'message' => $e->getMessage()
    ]);
}
?>