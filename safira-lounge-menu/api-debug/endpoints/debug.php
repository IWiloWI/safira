<?php
/**
 * DEBUG Endpoint - Database Schema Investigation
 * Provides detailed database structure information
 */

global $dbh;

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['REQUEST_URI'];

// Parse path segments
$segments = explode('/', trim(parse_url($path, PHP_URL_PATH), '/'));
$debugIndex = array_search('debug', $segments);

if ($method !== 'GET') {
    sendError('Only GET method allowed for debug endpoint', 405);
}

// Handle different debug operations
$operation = $segments[$debugIndex + 1] ?? 'overview';

switch ($operation) {
    case 'overview':
        debugOverview($dbh);
        break;

    case 'tables':
        debugTables($dbh);
        break;

    case 'categories':
        debugCategoriesTable($dbh);
        break;

    case 'products':
        debugProductsTable($dbh);
        break;

    case 'sample-data':
        debugSampleData($dbh);
        break;

    case 'test-query':
        testCategoriesQuery($dbh);
        break;

    default:
        sendError('Unknown debug operation', 400, [
            'available_operations' => ['overview', 'tables', 'categories', 'products', 'sample-data', 'test-query'],
            'requested_operation' => $operation
        ]);
}

/**
 * Debug Overview
 */
function debugOverview($dbh) {
    try {
        $tables = getDatabaseTables($dbh);
        $version = $dbh->query('SELECT VERSION() as version')->fetch();

        sendJson([
            'debug_overview' => [
                'database_version' => $version['version'],
                'tables_found' => count($tables),
                'tables' => array_map(function($table) {
                    return array_values($table)[0];
                }, $tables)
            ],
            'available_debug_endpoints' => [
                '/debug/tables - Show all table structures',
                '/debug/categories - Detailed categories table info',
                '/debug/products - Detailed products table info',
                '/debug/sample-data - Show sample data from tables',
                '/debug/test-query - Test categories query'
            ]
        ]);

    } catch (PDOException $e) {
        sendError('Failed to get debug overview', 500, [
            'error_message' => $e->getMessage(),
            'error_code' => $e->getCode()
        ]);
    }
}

/**
 * Debug All Tables
 */
function debugTables($dbh) {
    try {
        $tables = getDatabaseTables($dbh);
        $tableStructures = [];

        foreach ($tables as $table) {
            $tableName = array_values($table)[0];
            $tableStructures[$tableName] = [
                'structure' => getTableStructure($dbh, $tableName),
                'columns' => getTableColumns($dbh, $tableName),
                'row_count' => getTableRowCount($dbh, $tableName)
            ];
        }

        sendJson([
            'database_tables' => $tableStructures
        ]);

    } catch (PDOException $e) {
        sendError('Failed to get table structures', 500, [
            'error_message' => $e->getMessage()
        ]);
    }
}

/**
 * Debug Categories Table Specifically
 */
function debugCategoriesTable($dbh) {
    try {
        $structure = getTableStructure($dbh, 'categories');
        $columns = getTableColumns($dbh, 'categories');
        $rowCount = getTableRowCount($dbh, 'categories');

        // Get sample data
        $sampleQuery = "SELECT * FROM categories LIMIT 3";
        $stmt = $dbh->prepare($sampleQuery);
        $stmt->execute();
        $sampleData = $stmt->fetchAll();

        sendJson([
            'categories_table_debug' => [
                'table_structure' => $structure,
                'column_details' => $columns,
                'row_count' => $rowCount,
                'sample_data' => $sampleData,
                'analysis' => [
                    'columns_found' => array_column($columns, 'COLUMN_NAME'),
                    'data_types' => array_combine(
                        array_column($columns, 'COLUMN_NAME'),
                        array_column($columns, 'DATA_TYPE')
                    )
                ]
            ]
        ]);

    } catch (PDOException $e) {
        sendError('Failed to debug categories table', 500, [
            'error_message' => $e->getMessage(),
            'error_code' => $e->getCode()
        ]);
    }
}

/**
 * Debug Products Table
 */
function debugProductsTable($dbh) {
    try {
        $structure = getTableStructure($dbh, 'products');
        $columns = getTableColumns($dbh, 'products');
        $rowCount = getTableRowCount($dbh, 'products');

        sendJson([
            'products_table_debug' => [
                'table_structure' => $structure,
                'column_details' => $columns,
                'row_count' => $rowCount,
                'analysis' => [
                    'columns_found' => array_column($columns, 'COLUMN_NAME'),
                    'data_types' => array_combine(
                        array_column($columns, 'COLUMN_NAME'),
                        array_column($columns, 'DATA_TYPE')
                    )
                ]
            ]
        ]);

    } catch (PDOException $e) {
        sendError('Failed to debug products table', 500, [
            'error_message' => $e->getMessage()
        ]);
    }
}

/**
 * Debug Sample Data
 */
function debugSampleData($dbh) {
    try {
        $data = [];

        // Categories sample
        $stmt = $dbh->prepare("SELECT * FROM categories LIMIT 5");
        $stmt->execute();
        $data['categories_sample'] = $stmt->fetchAll();

        // Products sample
        $stmt = $dbh->prepare("SELECT * FROM products LIMIT 5");
        $stmt->execute();
        $data['products_sample'] = $stmt->fetchAll();

        sendJson([
            'sample_data' => $data,
            'note' => 'This shows the actual data structure and column names from the database'
        ]);

    } catch (PDOException $e) {
        sendError('Failed to get sample data', 500, [
            'error_message' => $e->getMessage()
        ]);
    }
}

/**
 * Test Categories Query
 */
function testCategoriesQuery($dbh) {
    try {
        // Test the exact query from the API
        $query = "SELECT * FROM categories ORDER BY name LIMIT 3";
        $stmt = $dbh->prepare($query);
        $stmt->execute();
        $rawResults = $stmt->fetchAll();

        // Test individual column access
        $columnTests = [];
        if (!empty($rawResults)) {
            $firstRow = $rawResults[0];
            foreach ($firstRow as $columnName => $value) {
                $columnTests[$columnName] = [
                    'value' => $value,
                    'type' => gettype($value),
                    'length' => is_string($value) ? strlen($value) : 'N/A'
                ];
            }
        }

        sendJson([
            'query_test' => [
                'query_executed' => $query,
                'results_count' => count($rawResults),
                'raw_results' => $rawResults,
                'column_analysis' => $columnTests,
                'first_row_keys' => !empty($rawResults) ? array_keys($rawResults[0]) : [],
                'json_decode_test' => !empty($rawResults) ? [
                    'name_raw' => $rawResults[0]['name'] ?? 'COLUMN_NOT_FOUND',
                    'name_decoded' => json_decode($rawResults[0]['name'] ?? '{}'),
                    'description_raw' => $rawResults[0]['description'] ?? 'COLUMN_NOT_FOUND',
                    'description_decoded' => json_decode($rawResults[0]['description'] ?? '{}')
                ] : 'No data to test'
            ]
        ]);

    } catch (PDOException $e) {
        sendError('Failed to test query', 500, [
            'error_message' => $e->getMessage(),
            'error_code' => $e->getCode(),
            'query_attempted' => $query ?? 'Unknown'
        ]);
    }
}

/**
 * Helper function to get table row count
 */
function getTableRowCount($dbh, $tableName) {
    try {
        $query = "SELECT COUNT(*) as count FROM $tableName";
        $stmt = $dbh->prepare($query);
        $stmt->execute();
        $result = $stmt->fetch();
        return $result['count'];
    } catch (PDOException $e) {
        return 'Error: ' . $e->getMessage();
    }
}
?>