<?php
// Datenbank-Test ohne Headers
$host_name = 'db5018522360.hosting-data.io';
$database = 'dbs14708743';
$user_name = 'dbu3362598';
$password = '!Aramat1.';

try {
    $dbh = new PDO("mysql:host=$host_name;dbname=$database", $user_name, $password);
    echo "DB OK";
} catch (Exception $e) {
    echo "DB ERROR: " . $e->getMessage();
}
?>