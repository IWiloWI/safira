<?php
/**
 * Safira Lounge - Comprehensive Diagnostic Script
 *
 * Aufruf: http://test.safira-lounge.de/diagnostic.php
 *
 * Dieses Script prüft alle wichtigen Komponenten der Installation
 * und gibt detaillierte Fehlerinformationen aus.
 */

// Verhindere Caching
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Cache-Control: post-check=0, pre-check=0', false);
header('Pragma: no-cache');
header('Content-Type: text/html; charset=UTF-8');

// Error Reporting für Diagnostik
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Farben für Status
$STATUS_OK = '#4CAF50';
$STATUS_WARNING = '#FF9800';
$STATUS_ERROR = '#F44336';

// Diagnostic Ergebnisse
$diagnostics = [];
$hasErrors = false;
$hasWarnings = false;

// Helper Funktionen
function checkStatus($condition, $successMsg, $errorMsg, $isWarning = false) {
    global $diagnostics, $hasErrors, $hasWarnings;

    if ($condition) {
        $diagnostics[] = ['status' => 'OK', 'message' => $successMsg];
        return true;
    } else {
        if ($isWarning) {
            $diagnostics[] = ['status' => 'WARNING', 'message' => $errorMsg];
            $hasWarnings = true;
        } else {
            $diagnostics[] = ['status' => 'ERROR', 'message' => $errorMsg];
            $hasErrors = true;
        }
        return false;
    }
}

function testUrl($url, $expectedContent = null) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_HEADER, true);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($error) {
        return ['success' => false, 'error' => $error, 'code' => 0];
    }

    if ($expectedContent && strpos($response, $expectedContent) === false) {
        return ['success' => false, 'error' => 'Expected content not found', 'code' => $httpCode];
    }

    return ['success' => $httpCode >= 200 && $httpCode < 400, 'code' => $httpCode, 'response' => $response];
}

// Start Diagnostik
$diagnostics[] = ['status' => 'INFO', 'message' => 'Safira Lounge Diagnostic Tool v1.0'];
$diagnostics[] = ['status' => 'INFO', 'message' => 'Timestamp: ' . date('Y-m-d H:i:s')];
$diagnostics[] = ['status' => 'INFO', 'message' => 'Server: ' . $_SERVER['SERVER_SOFTWARE']];
$diagnostics[] = ['status' => 'INFO', 'message' => 'PHP Version: ' . phpversion()];

// 1. PHP Version Check
checkStatus(
    version_compare(PHP_VERSION, '7.4.0', '>='),
    'PHP Version ' . PHP_VERSION . ' ist kompatibel',
    'PHP Version ' . PHP_VERSION . ' ist zu alt (mindestens 7.4.0 erforderlich)'
);

// 2. Erforderliche PHP Extensions
$requiredExtensions = ['pdo', 'pdo_mysql', 'json', 'curl', 'mbstring'];
foreach ($requiredExtensions as $ext) {
    checkStatus(
        extension_loaded($ext),
        "PHP Extension '$ext' ist installiert",
        "PHP Extension '$ext' fehlt - diese ist erforderlich!"
    );
}

// 3. Verzeichnisstruktur prüfen
$diagnostics[] = ['status' => 'HEADER', 'message' => '=== VERZEICHNISSTRUKTUR ==='];

$currentDir = __DIR__;
$isInSafiraDir = strpos($currentDir, '/safira') !== false;
$rootPath = $isInSafiraDir ? dirname($currentDir) : $currentDir;

checkStatus(
    file_exists($rootPath . '/safira'),
    "Verzeichnis /safira existiert",
    "Verzeichnis /safira fehlt - Frontend kann nicht geladen werden!"
);

checkStatus(
    file_exists($rootPath . '/api'),
    "Verzeichnis /api existiert",
    "Verzeichnis /api fehlt - Backend API nicht verfügbar!"
);

// Prüfe wichtige Dateien
$importantFiles = [
    '/safira/index.html' => 'Frontend Index',
    '/safira/.htaccess' => 'Frontend Routing',
    '/api/index.php' => 'API Router',
    '/api/config.php' => 'API Konfiguration',
    '/api/.htaccess' => 'API Routing'
];

foreach ($importantFiles as $file => $description) {
    checkStatus(
        file_exists($rootPath . $file),
        "$description ($file) existiert",
        "$description ($file) fehlt!",
        strpos($file, '.htaccess') !== false // .htaccess als Warning
    );
}

// 4. Datenbank-Verbindung testen
$diagnostics[] = ['status' => 'HEADER', 'message' => '=== DATENBANK-VERBINDUNG ==='];

$dbConnected = false;
try {
    $host_name = 'db5018522360.hosting-data.io';
    $database = 'dbs14708743';
    $user_name = 'dbu3362598';
    $password = '!Aramat1.';

    $dbh = new PDO(
        "mysql:host=$host_name;dbname=$database;charset=utf8mb4",
        $user_name,
        $password,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    checkStatus(true,
        "Datenbankverbindung erfolgreich (Host: $host_name, DB: $database)",
        "Datenbankverbindung fehlgeschlagen"
    );

    // Teste Tabellen
    $tables = $dbh->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    $expectedTables = ['products', 'categories', 'settings', 'subcategories'];

    foreach ($expectedTables as $table) {
        checkStatus(
            in_array($table, $tables),
            "Tabelle '$table' existiert",
            "Tabelle '$table' fehlt in der Datenbank!",
            $table === 'settings' // settings als Warning
        );
    }

    // Zähle Einträge
    $productCount = $dbh->query("SELECT COUNT(*) FROM products")->fetchColumn();
    $categoryCount = $dbh->query("SELECT COUNT(*) FROM categories")->fetchColumn();

    $diagnostics[] = ['status' => 'INFO', 'message' => "Anzahl Produkte: $productCount"];
    $diagnostics[] = ['status' => 'INFO', 'message' => "Anzahl Kategorien: $categoryCount"];

    $dbConnected = true;

} catch (PDOException $e) {
    checkStatus(false,
        "Datenbankverbindung erfolgreich",
        "Datenbankfehler: " . $e->getMessage()
    );
}

// 5. API Endpoints testen
$diagnostics[] = ['status' => 'HEADER', 'message' => '=== API ENDPOINTS ==='];

$baseUrl = 'http://test.safira-lounge.de';
$apiEndpoints = [
    '/api/test-connection.php' => 'Database Test',
    '/api/health' => 'Health Check',
    '/api/products' => 'Products Endpoint',
    '/api/categories' => 'Categories Endpoint',
    '/api/settings' => 'Settings Endpoint'
];

foreach ($apiEndpoints as $endpoint => $description) {
    $result = testUrl($baseUrl . $endpoint);
    checkStatus(
        $result['success'],
        "$description ($endpoint) - HTTP {$result['code']}",
        "$description ($endpoint) - Fehler: " . ($result['error'] ?? "HTTP {$result['code']}"),
        strpos($endpoint, 'settings') !== false
    );
}

// 6. Frontend Erreichbarkeit
$diagnostics[] = ['status' => 'HEADER', 'message' => '=== FRONTEND TESTS ==='];

$frontendUrl = $baseUrl . '/safira';
$result = testUrl($frontendUrl, '<div id="root">');
checkStatus(
    $result['success'] && strpos($result['response'], '<div id="root">') !== false,
    "Frontend erreichbar unter $frontendUrl",
    "Frontend nicht erreichbar oder fehlerhaft!"
);

// Prüfe Static Assets
$staticAssets = [
    '/safira/static/js/main.fcd852e3.js' => 'JavaScript Bundle',
    '/safira/static/css/main.73148772.css' => 'CSS Bundle',
    '/safira/images/safira_logo.png' => 'Logo'
];

foreach ($staticAssets as $asset => $description) {
    $assetUrl = $baseUrl . $asset;
    $result = testUrl($assetUrl);
    checkStatus(
        $result['success'],
        "$description geladen ($asset)",
        "$description nicht erreichbar ($asset)",
        true // Assets als Warning
    );
}

// 7. CORS und Headers prüfen
$diagnostics[] = ['status' => 'HEADER', 'message' => '=== CORS & HEADERS ==='];

$ch = curl_init($baseUrl . '/api/products');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_NOBODY, true);
$headers = curl_exec($ch);
curl_close($ch);

checkStatus(
    strpos($headers, 'Access-Control-Allow-Origin') !== false,
    "CORS Headers sind gesetzt",
    "CORS Headers fehlen - Frontend kann nicht auf API zugreifen!",
    false
);

// 8. Session Test
$diagnostics[] = ['status' => 'HEADER', 'message' => '=== SESSION & AUTH ==='];

session_start();
$_SESSION['test'] = 'value';
checkStatus(
    isset($_SESSION['test']),
    "PHP Sessions funktionieren",
    "PHP Sessions funktionieren nicht - Admin-Login wird nicht möglich sein!"
);

// 9. Schreibrechte prüfen
$diagnostics[] = ['status' => 'HEADER', 'message' => '=== SCHREIBRECHTE ==='];

$testFile = $rootPath . '/api/test_write_' . time() . '.tmp';
$canWrite = @file_put_contents($testFile, 'test');
if ($canWrite) {
    @unlink($testFile);
}

checkStatus(
    $canWrite !== false,
    "API Verzeichnis ist beschreibbar",
    "API Verzeichnis ist nicht beschreibbar - Logs können nicht geschrieben werden",
    true
);

// 10. Performance Checks
$diagnostics[] = ['status' => 'HEADER', 'message' => '=== PERFORMANCE ==='];

$startTime = microtime(true);
if ($dbConnected) {
    try {
        $dbh->query("SELECT * FROM products LIMIT 100")->fetchAll();
        $dbTime = round((microtime(true) - $startTime) * 1000, 2);

        checkStatus(
            $dbTime < 1000,
            "Datenbank-Abfrage schnell ($dbTime ms)",
            "Datenbank-Abfrage langsam ($dbTime ms)",
            true
        );
    } catch (Exception $e) {
        $diagnostics[] = ['status' => 'WARNING', 'message' => 'Performance-Test übersprungen'];
    }
}

// Zusammenfassung erstellen
$summary = [
    'total' => count(array_filter($diagnostics, function($d) {
        return in_array($d['status'], ['OK', 'WARNING', 'ERROR']);
    })),
    'ok' => count(array_filter($diagnostics, function($d) { return $d['status'] === 'OK'; })),
    'warnings' => count(array_filter($diagnostics, function($d) { return $d['status'] === 'WARNING'; })),
    'errors' => count(array_filter($diagnostics, function($d) { return $d['status'] === 'ERROR'; }))
];

?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Safira Lounge - Diagnostic Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #FF41FB 0%, #8B008B 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }

        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }

        .header .subtitle {
            opacity: 0.9;
            font-size: 1.1em;
        }

        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
            border-bottom: 1px solid #dee2e6;
        }

        .summary-item {
            text-align: center;
            padding: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .summary-item .number {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .summary-item.ok .number { color: <?php echo $STATUS_OK; ?>; }
        .summary-item.warning .number { color: <?php echo $STATUS_WARNING; ?>; }
        .summary-item.error .number { color: <?php echo $STATUS_ERROR; ?>; }

        .diagnostics {
            padding: 30px;
        }

        .diagnostic-item {
            padding: 15px 20px;
            margin-bottom: 10px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            transition: transform 0.2s;
        }

        .diagnostic-item:hover {
            transform: translateX(5px);
        }

        .diagnostic-item.ok {
            background: #e8f5e9;
            border-left: 4px solid <?php echo $STATUS_OK; ?>;
        }

        .diagnostic-item.warning {
            background: #fff3e0;
            border-left: 4px solid <?php echo $STATUS_WARNING; ?>;
        }

        .diagnostic-item.error {
            background: #ffebee;
            border-left: 4px solid <?php echo $STATUS_ERROR; ?>;
        }

        .diagnostic-item.info {
            background: #e3f2fd;
            border-left: 4px solid #2196F3;
            font-style: italic;
        }

        .diagnostic-item.header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-weight: bold;
            margin-top: 20px;
            margin-bottom: 15px;
        }

        .status-icon {
            width: 30px;
            height: 30px;
            margin-right: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
        }

        .message {
            flex: 1;
        }

        .actions {
            padding: 30px;
            background: #f8f9fa;
            border-top: 1px solid #dee2e6;
        }

        .actions h2 {
            margin-bottom: 20px;
            color: #495057;
        }

        .action-list {
            list-style: none;
        }

        .action-list li {
            padding: 10px 15px;
            margin-bottom: 10px;
            background: white;
            border-radius: 5px;
            border-left: 3px solid <?php echo $STATUS_ERROR; ?>;
        }

        .button {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #FF41FB 0%, #8B008B 100%);
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 5px;
            transition: transform 0.2s;
        }

        .button:hover {
            transform: scale(1.05);
        }

        .footer {
            padding: 20px;
            text-align: center;
            background: #f8f9fa;
            color: #6c757d;
        }

        @media (max-width: 768px) {
            .summary {
                grid-template-columns: 1fr;
            }

            .header h1 {
                font-size: 1.8em;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 Safira Lounge Diagnostic</h1>
            <div class="subtitle">System Status Report - <?php echo date('d.m.Y H:i:s'); ?></div>
        </div>

        <div class="summary">
            <div class="summary-item ok">
                <div class="number"><?php echo $summary['ok']; ?></div>
                <div class="label">Tests Bestanden</div>
            </div>
            <div class="summary-item warning">
                <div class="number"><?php echo $summary['warnings']; ?></div>
                <div class="label">Warnungen</div>
            </div>
            <div class="summary-item error">
                <div class="number"><?php echo $summary['errors']; ?></div>
                <div class="label">Fehler</div>
            </div>
            <div class="summary-item">
                <div class="number" style="color: #6c757d;"><?php echo $summary['total']; ?></div>
                <div class="label">Gesamt Tests</div>
            </div>
        </div>

        <div class="diagnostics">
            <?php foreach ($diagnostics as $diagnostic): ?>
                <?php
                    $class = strtolower($diagnostic['status']);
                    $icon = '';
                    switch($diagnostic['status']) {
                        case 'OK': $icon = '✅'; break;
                        case 'WARNING': $icon = '⚠️'; break;
                        case 'ERROR': $icon = '❌'; break;
                        case 'INFO': $icon = 'ℹ️'; break;
                        case 'HEADER': $icon = '📋'; break;
                    }
                ?>
                <div class="diagnostic-item <?php echo $class; ?>">
                    <div class="status-icon"><?php echo $icon; ?></div>
                    <div class="message"><?php echo htmlspecialchars($diagnostic['message']); ?></div>
                </div>
            <?php endforeach; ?>
        </div>

        <?php if ($hasErrors): ?>
        <div class="actions">
            <h2>🔧 Erforderliche Maßnahmen</h2>
            <ul class="action-list">
                <?php if (in_array('Verzeichnis /safira fehlt', array_column($diagnostics, 'message'))): ?>
                    <li>📁 Laden Sie das Frontend in das Verzeichnis <code>/safira</code> hoch</li>
                <?php endif; ?>
                <?php if (in_array('Verzeichnis /api fehlt', array_column($diagnostics, 'message'))): ?>
                    <li>📁 Laden Sie die API in das Verzeichnis <code>/api</code> (im Root) hoch</li>
                <?php endif; ?>
                <?php if (strpos(json_encode($diagnostics), 'Datenbankfehler') !== false): ?>
                    <li>🗄️ Prüfen Sie die Datenbank-Zugangsdaten in <code>/api/config.php</code></li>
                <?php endif; ?>
                <?php if (strpos(json_encode($diagnostics), 'CORS Headers fehlen') !== false): ?>
                    <li>🔐 Aktivieren Sie CORS Headers in <code>/api/config.php</code></li>
                <?php endif; ?>
                <?php if (strpos(json_encode($diagnostics), 'Frontend nicht erreichbar') !== false): ?>
                    <li>🌐 Stellen Sie sicher, dass die Domain auf <code>/safira</code> zeigt</li>
                <?php endif; ?>
            </ul>
        </div>
        <?php endif; ?>

        <div class="footer">
            <a href="http://test.safira-lounge.de/safira" class="button">Frontend öffnen</a>
            <a href="http://test.safira-lounge.de/api/products" class="button">API testen</a>
            <a href="<?php echo $_SERVER['REQUEST_URI']; ?>" class="button">Neu laden</a>

            <p style="margin-top: 20px;">
                <?php if (!$hasErrors && !$hasWarnings): ?>
                    ✨ System läuft einwandfrei!
                <?php elseif (!$hasErrors): ?>
                    ⚠️ System läuft mit Warnungen
                <?php else: ?>
                    ❌ Kritische Fehler gefunden - Bitte beheben!
                <?php endif; ?>
            </p>
        </div>
    </div>
</body>
</html>