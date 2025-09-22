<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://test.safira-lounge.de');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Check if this is a login request
$requestUri = $_SERVER['REQUEST_URI'] ?? '';
$isLogin = strpos($requestUri, '/auth/login') !== false || isset($_GET['action']) && $_GET['action'] === 'login';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $isLogin) {
    $input = json_decode(file_get_contents('php://input'), true);
    $username = $input['username'] ?? '';
    $password = $input['password'] ?? '';

    if ($username === 'admin' && $password === 'admin123') {
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => 'admin',
                'username' => 'admin',
                'email' => 'admin@safira-lounge.de',
                'role' => 'admin'
            ],
            'token' => 'admin_token_' . time(),
            'expiresAt' => date('c', time() + 86400)
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Invalid credentials']);
    }
} else {
    echo json_encode(['status' => 'LOGIN TEST API WORKING', 'timestamp' => date('c')]);
}
?>