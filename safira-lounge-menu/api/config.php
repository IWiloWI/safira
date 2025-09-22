<?php
/**
 * Database Configuration for Safira Lounge
 * IONOS MariaDB Connection
 */

// Database credentials
$host_name = 'db5018522360.hosting-data.io';
$database = 'dbs14708743';
$user_name = 'dbu3362598';
$password = '!Aramat1.';

// Global database connection
$dbh = null;

try {
    $dbh = new PDO(
        "mysql:host=$host_name;dbname=$database;charset=utf8mb4",
        $user_name,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    error_log("Database connection error: " . $e->getMessage());
    die();
}

// CORS Headers - Updated for HTTP deployment
function setCorsHeaders() {
    // Allow specific origin for production
    $allowed_origin = 'http://test.safira-lounge.de';
    header("Access-Control-Allow-Origin: $allowed_origin");
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Allow-Credentials: true');
    header('Content-Type: application/json');

    // Handle preflight requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

// JSON Response helper
function sendJson($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit();
}

// Error response helper
function sendError($message, $status = 400) {
    http_response_code($status);
    echo json_encode(['error' => $message]);
    exit();
}
?>