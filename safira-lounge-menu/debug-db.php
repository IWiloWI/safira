<?php
// Debug database structure and content
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://test.safira-lounge.de');

$host_name = 'db5018522360.hosting-data.io';
$database = 'dbs14708743';
$user_name = 'dbu3362598';
$password = '!Aramat1.';

try {
    $dbh = new PDO("mysql:host=$host_name;dbname=$database", $user_name, $password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Get table structure
    $tablesStmt = $dbh->query("SHOW TABLES");
    $tables = $tablesStmt->fetchAll(PDO::FETCH_COLUMN);

    $result = ['tables' => []];

    foreach ($tables as $table) {
        // Get table structure
        $structStmt = $dbh->query("DESCRIBE $table");
        $structure = $structStmt->fetchAll(PDO::FETCH_ASSOC);

        // Get sample data
        $dataStmt = $dbh->query("SELECT * FROM $table LIMIT 2");
        $sampleData = $dataStmt->fetchAll(PDO::FETCH_ASSOC);

        $result['tables'][$table] = [
            'structure' => $structure,
            'sampleData' => $sampleData
        ];
    }

    echo json_encode($result, JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>