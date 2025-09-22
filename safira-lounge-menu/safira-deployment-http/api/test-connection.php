<?php
/**
 * Database Connection Test
 * Test if database connection works
 */

require_once 'config.php';

try {
    // Test database connection
    $query = "SELECT 1 as test";
    $stmt = $dbh->prepare($query);
    $stmt->execute();
    $result = $stmt->fetch();

    if ($result['test'] === 1) {
        sendJson([
            'status' => 'success',
            'message' => 'Database connection successful',
            'timestamp' => date('c'),
            'database' => 'dbs14708743',
            'host' => 'db5018522360.hosting-data.io'
        ]);
    } else {
        sendError('Database test failed', 500);
    }

} catch (Exception $e) {
    sendError('Database connection failed: ' . $e->getMessage(), 500);
}
?>