<?php
/**
 * DEBUG VERSION - Database Configuration for Safira Lounge
 * IONOS MariaDB Connection with Enhanced Debugging
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
    echo json_encode([
        'error' => 'Database connection failed',
        'debug_info' => [
            'host' => $host_name,
            'database' => $database,
            'user' => $user_name,
            'error_message' => $e->getMessage(),
            'timestamp' => date('c')
        ]
    ]);
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

// Enhanced JSON Response helper with debug info
function sendJson($data, $status = 200, $includeDebug = true) {
    http_response_code($status);

    if ($includeDebug) {
        $data['debug_info'] = [
            'timestamp' => date('c'),
            'memory_usage' => memory_get_usage(true),
            'peak_memory' => memory_get_peak_usage(true),
            'php_version' => phpversion(),
            'server_info' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'
        ];
    }

    echo json_encode($data, JSON_PRETTY_PRINT);
    exit();
}

// Enhanced Error response helper
function sendError($message, $status = 400, $debugInfo = null) {
    http_response_code($status);
    $response = [
        'error' => $message,
        'status_code' => $status,
        'timestamp' => date('c')
    ];

    if ($debugInfo) {
        $response['debug_details'] = $debugInfo;
    }

    echo json_encode($response, JSON_PRETTY_PRINT);
    exit();
}

// Database debugging helper
function getTableStructure($dbh, $tableName) {
    try {
        $query = "DESCRIBE $tableName";
        $stmt = $dbh->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll();
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}

// Get all columns for a table
function getTableColumns($dbh, $tableName) {
    try {
        $query = "SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA
                  FROM INFORMATION_SCHEMA.COLUMNS
                  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?";
        $stmt = $dbh->prepare($query);
        $stmt->execute([$tableName]);
        return $stmt->fetchAll();
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}

// Get database tables
function getDatabaseTables($dbh) {
    try {
        $query = "SHOW TABLES";
        $stmt = $dbh->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll();
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}
?>