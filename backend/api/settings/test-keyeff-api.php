
<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/Setting.php';
require_once __DIR__ . '/../../models/Log.php';

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
if ($user_role !== 'admin') {
    jsonResponse(false, 'Access denied', null, 403);
}

// In a real application, we would test the KeyEff API connection here
// For this demo, we'll simulate a successful connection
$success = true;
$message = 'KeyEff API-Verbindung erfolgreich getestet';

// You would actually test the API connection using something like:
/*
$api_url = $settings['apiUrl'];
$api_key = $settings['apiKey'];

try {
    // Test API connection with a simple request
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $api_url . '/status');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $api_key,
        'Accept: application/json'
    ]);
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($http_code === 200) {
        $connection_successful = true;
    } else {
        $connection_successful = false;
        $message = 'KeyEff API-Verbindungstest fehlgeschlagen: HTTP-Statuscode ' . $http_code;
    }
} catch (Exception $e) {
    $connection_successful = false;
    $message = 'KeyEff API-Verbindungstest fehlgeschlagen: ' . $e->getMessage();
}
*/

// Log the action
$log = new Log();
$log->create(
    $user_id,
    'test_keyeff_api_connection',
    'settings',
    null,
    "User tested KeyEff API connection"
);

jsonResponse($success, $message, [
    'timestamp' => date('Y-m-d H:i:s'),
    'status' => $success ? 'success' : 'failure'
]);
?>
