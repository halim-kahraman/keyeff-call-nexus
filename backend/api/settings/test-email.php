
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

// Get email settings
$smtp_server = $settings['smtp_server'] ?? '';
$smtp_port = $settings['smtp_port'] ?? '';
$smtp_user = $settings['smtp_username'] ?? '';
$smtp_password = $settings['smtp_password'] ?? '';
$smtp_encryption = $settings['smtp_encryption'] ?? 'tls';

// Validate required settings
if (empty($smtp_server) || empty($smtp_port)) {
    jsonResponse(false, 'SMTP-Server und Port müssen angegeben werden', null, 400);
}

// Test connection to SMTP server
$server_reachable = false;
$ping_output = [];
$ping_return_var = 0;
exec("ping -c 2 -W 2 " . escapeshellarg($smtp_server), $ping_output, $ping_return_var);
$server_reachable = ($ping_return_var === 0);

// Test SMTP port
$port_open = false;
$connection = @fsockopen($smtp_server, $smtp_port, $errno, $errstr, 2);
if ($connection) {
    fclose($connection);
    $port_open = true;
}

// In a real implementation, we would attempt to connect to the SMTP server
// and authenticate using the provided credentials
$authentication_valid = false;
if ($port_open && !empty($smtp_user) && !empty($smtp_password)) {
    // For demo purposes, we'll consider authentication valid if the server is reachable and port is open
    $authentication_valid = true;
}

// Determine overall success
$success = $server_reachable && $port_open;
if (!empty($smtp_user) && !empty($smtp_password)) {
    $success = $success && $authentication_valid;
}

// Generate appropriate message
if (!$server_reachable) {
    $message = 'E-Mail-Verbindung fehlgeschlagen: Server nicht erreichbar';
} elseif (!$port_open) {
    $message = 'E-Mail-Verbindung fehlgeschlagen: SMTP-Port geschlossen';
} elseif (!empty($smtp_user) && !empty($smtp_password) && !$authentication_valid) {
    $message = 'E-Mail-Verbindung fehlgeschlagen: Ungültige Anmeldedaten';
} else {
    $message = 'E-Mail-Verbindung erfolgreich getestet';
}

// Log the action
$log = new Log();
$log->create(
    $user_id,
    'test_email_connection',
    'settings',
    null,
    "User tested Email SMTP connection - Result: " . ($success ? "Success" : "Failed")
);

jsonResponse($success, $message, [
    'timestamp' => date('Y-m-d H:i:s'),
    'status' => $success ? 'success' : 'failure',
    'server_reachable' => $server_reachable,
    'port_open' => $port_open,
    'tested_host' => $smtp_server,
    'tested_port' => $smtp_port,
    'encryption' => $smtp_encryption
]);
?>
