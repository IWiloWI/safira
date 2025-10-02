<?php
// Simple script to check PHP errors from safira_error.log
$logFile = __DIR__ . '/safira_error.log';

if (file_exists($logFile)) {
    echo "=== SAFIRA ERROR LOG ===\n";
    $lines = file($logFile, FILE_IGNORE_NEW_LINES);
    $recentLines = array_slice($lines, -50); // Last 50 lines

    foreach ($recentLines as $line) {
        echo $line . "\n";
    }
} else {
    echo "Error log file not found: $logFile\n";
}

// Also check if there are any syntax errors in the API file
echo "\n=== SYNTAX CHECK ===\n";
$output = [];
$returnVar = 0;
exec('php -l ' . __DIR__ . '/safira-api-fixed.php 2>&1', $output, $returnVar);

foreach ($output as $line) {
    echo $line . "\n";
}

if ($returnVar === 0) {
    echo "✅ No syntax errors found\n";
} else {
    echo "❌ Syntax errors detected\n";
}
?>