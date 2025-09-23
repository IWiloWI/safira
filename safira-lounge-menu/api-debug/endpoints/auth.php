<?php
/**
 * DEBUG VERSION - Auth API Endpoint
 * Basic auth endpoint for completeness
 */

global $dbh;

sendError('Auth endpoint not implemented in debug version', 501, [
    'note' => 'This debug API focuses on database schema investigation',
    'available_debug_endpoints' => ['/debug', '/categories', '/products', '/health']
]);
?>