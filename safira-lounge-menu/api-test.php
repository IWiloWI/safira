<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://test.safira-lounge.de');

$host_name = 'db5018522360.hosting-data.io';
$database = 'dbs14708743';
$user_name = 'dbu3362598';
$password = '!Aramat1.';

try {
    $dbh = new PDO("mysql:host=$host_name;dbname=$database", $user_name, $password);
    $stmt = $dbh->query("SELECT 1 as test");
    $result = $stmt->fetch();

    echo json_encode([
        'status' => 'success',
        'message' => 'Database connection successful',
        'location' => 'ROOT'
    ]);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>