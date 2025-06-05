
<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/Setting.php';
require_once __DIR__ . '/../../models/Log.php';

use KeyEff\CallPanel\Models\Setting;
use KeyEff\CallPanel\Models\Log;

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Invalid request method', null, 405);
}

// Check authorization
$headers = apache_request_headers();
$auth_header = $headers['Authorization'] ?? null;

if (!$auth_header || !preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
    jsonResponse(false, 'Unauthorized', null, 401);
}

$token = $matches[1];
$payload = validateToken($token);

if (!$payload) {
    jsonResponse(false, 'Invalid token', null, 401);
}

// Get request data
$data = json_decode(file_get_contents('php://input'), true);

// Validate input
if (!isset($data['settings']) || !is_array($data['settings'])) {
    jsonResponse(false, 'Invalid settings data', null, 400);
}

$user_id = $payload['user_id'];
$user_role = $payload['role'];
$settings = $data['settings'];

// Check permissions
if ($user_role !== 'admin' && $user_role !== 'filialleiter') {
    jsonResponse(false, 'Access denied', null, 403);
}

// Get KeyEff API settings
$api_url = $settings['keyeff_api_url'] ?? '';
$api_key = $settings['keyeff_api_key'] ?? '';

// Validate required settings
if (empty($api_url) || empty($api_key)) {
    jsonResponse(false, 'API-URL und API-Schlüssel müssen angegeben werden', null, 400);
}

// Test API connection
$success = false;
$response_data = null;

// Make a test request to the API
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $api_url . '/test');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $api_key,
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_error = curl_error($ch);
curl_close($ch);

if ($response !== false && $http_code === 200) {
    $success = true;
    $message = 'KeyEff API-Verbindung erfolgreich getestet';
} else {
    $message = 'KeyEff API-Verbindung fehlgeschlagen: ' . ($curl_error ?: 'HTTP ' . $http_code);
}

// Log the action
$log = new Log();
$log->create(
    $user_id,
    'test_keyeff_api_connection',
    'settings',
    null,
    "User tested KeyEff API connection - Result: " . ($success ? "Success" : "Failed")
);

jsonResponse($success, $message, [
    'timestamp' => date('Y-m-d H:i:s'),
    'status' => $success ? 'success' : 'failure',
    'http_code' => $http_code,
    'tested_url' => $api_url
]);
?>
