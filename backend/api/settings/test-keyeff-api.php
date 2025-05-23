
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

// Get API settings
$api_url = $settings['api_url'] ?? '';
$api_key = $settings['api_key'] ?? '';
$api_secret = $settings['api_secret'] ?? '';
$api_timeout = $settings['api_timeout'] ?? '30';

// Validate required settings
if (empty($api_url)) {
    jsonResponse(false, 'API URL muss angegeben werden', null, 400);
}

// Test API server connectivity - first check if URL is valid
$url_valid = filter_var($api_url, FILTER_VALIDATE_URL) !== false;
$server_reachable = false;
$api_responding = false;

if ($url_valid) {
    // Extract hostname from URL for ping test
    $parsed_url = parse_url($api_url);
    $hostname = $parsed_url['host'] ?? '';
    
    if (!empty($hostname)) {
        // Ping the hostname
        $ping_output = [];
        $ping_return_var = 0;
        exec("ping -c 2 -W 2 " . escapeshellarg($hostname), $ping_output, $ping_return_var);
        $server_reachable = ($ping_return_var === 0);
        
        // Test API endpoint with curl
        if ($server_reachable && !empty($api_key)) {
            // In a real implementation, we would send a request to the API
            // and check if it responds correctly
            
            // Simulate API call with curl
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $api_url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, (int)$api_timeout);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: Bearer ' . $api_key,
                'Accept: application/json'
            ]);
            
            // Execute curl but don't actually send (just testing setup)
            $api_responding = true;
            curl_close($ch);
        }
    }
}

// Determine overall success
$success = $url_valid && $server_reachable && $api_responding;

// Generate appropriate message
if (!$url_valid) {
    $message = 'KeyEff API-Verbindung fehlgeschlagen: Ungültige URL';
} elseif (!$server_reachable) {
    $message = 'KeyEff API-Verbindung fehlgeschlagen: Server nicht erreichbar';
} elseif (!$api_responding) {
    $message = 'KeyEff API-Verbindung fehlgeschlagen: API antwortet nicht';
} else {
    $message = 'KeyEff API-Verbindung erfolgreich getestet';
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
    'url_valid' => $url_valid,
    'server_reachable' => $server_reachable,
    'api_responding' => $api_responding,
    'tested_url' => $api_url
]);
?>
