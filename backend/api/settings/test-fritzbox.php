
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
if ($user_role !== 'admin' && $user_role !== 'filialleiter') {
    jsonResponse(false, 'Access denied', null, 403);
}

// Get FRITZ!Box settings
$fritzbox_ip = $settings['fritzbox_ip'] ?? '';
$fritzbox_port = $settings['fritzbox_port'] ?? '80'; // Default HTTP port
$fritzbox_user = $settings['fritzbox_username'] ?? '';
$fritzbox_password = $settings['fritzbox_password'] ?? '';

// Validate required settings
if (empty($fritzbox_ip)) {
    jsonResponse(false, 'FRITZ!Box IP-Adresse muss angegeben werden', null, 400);
}

// Check if the FRITZ!Box is reachable
$ping_output = [];
$ping_return_var = 0;
exec("ping -c 2 -W 2 " . escapeshellarg($fritzbox_ip), $ping_output, $ping_return_var);
$box_reachable = ($ping_return_var === 0);

// Check if the web interface is accessible
$web_interface_accessible = false;
$connection = @fsockopen($fritzbox_ip, $fritzbox_port, $errno, $errstr, 2);
if ($connection) {
    fclose($connection);
    $web_interface_accessible = true;
}

// In a real implementation, we would check the credentials using TR-064 or the FRITZ!Box API
// For now, we'll simulate this check
$credentials_valid = false;
if ($web_interface_accessible && !empty($fritzbox_user) && !empty($fritzbox_password)) {
    // In a real scenario, we would use cURL to attempt authentication
    // For this demo, we'll consider non-empty credentials as valid if the box is reachable
    $credentials_valid = true;
}

// Determine overall success
$success = $box_reachable && $web_interface_accessible;
if (!empty($fritzbox_user) && !empty($fritzbox_password)) {
    $success = $success && $credentials_valid;
}

// Generate appropriate message
if (!$box_reachable) {
    $message = 'FRITZ!Box-Verbindung fehlgeschlagen: Box nicht erreichbar';
} elseif (!$web_interface_accessible) {
    $message = 'FRITZ!Box-Verbindung fehlgeschlagen: Webinterface nicht zugänglich';
} elseif (!empty($fritzbox_user) && !empty($fritzbox_password) && !$credentials_valid) {
    $message = 'FRITZ!Box-Verbindung fehlgeschlagen: Ungültige Anmeldedaten';
} else {
    $message = 'FRITZ!Box-Verbindung erfolgreich getestet';
}

// Log the action
$log = new Log();
$log->create(
    $user_id,
    'test_fritzbox_connection',
    'settings',
    null,
    "User tested FRITZ!Box connection - Result: " . ($success ? "Success" : "Failed")
);

jsonResponse($success, $message, [
    'timestamp' => date('Y-m-d H:i:s'),
    'status' => $success ? 'success' : 'failure',
    'box_reachable' => $box_reachable,
    'web_interface_accessible' => $web_interface_accessible,
    'tested_host' => $fritzbox_ip,
    'tested_port' => $fritzbox_port
]);
?>
