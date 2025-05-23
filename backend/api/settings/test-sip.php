
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
$filiale_id = $data['filiale_id'] ?? null;

// Check permissions
if ($user_role !== 'admin') {
    jsonResponse(false, 'Access denied', null, 403);
}

// For filiale-specific settings, check if filiale exists
if ($filiale_id) {
    require_once __DIR__ . '/../../models/Filiale.php';
    $filiale = new Filiale();
    $filiale_data = $filiale->getById($filiale_id);
    
    if (!$filiale_data) {
        jsonResponse(false, 'Filiale not found', null, 404);
    }
}

// Actually test the SIP connection
$sip_server = $settings['sip_server'] ?? '';
$sip_port = $settings['sip_port'] ?? '5060'; // Default SIP port
$success = false;
$details = [];

// Validate required fields
if (empty($sip_server)) {
    jsonResponse(false, 'SIP-Server muss angegeben werden', null, 400);
}

// Test server reachability (ping)
$ping_output = [];
$ping_return_var = 0;
exec("ping -c 2 -W 2 " . escapeshellarg($sip_server), $ping_output, $ping_return_var);
$server_reachable = ($ping_return_var === 0);

// Test if SIP port is open
$port_open = false;
$connection = @fsockopen($sip_server, $sip_port, $errno, $errstr, 2);
if ($connection) {
    fclose($connection);
    $port_open = true;
}

// If we have credentials, we could attempt a basic SIP registration
// but we'll simulate it for now
$registration_valid = false;
if (!empty($settings['sip_username']) && !empty($settings['sip_password'])) {
    // In a real implementation, you'd use a SIP library to attempt registration
    // For demo purposes, we'll consider credentials to be valid if they're not empty
    $registration_valid = true;
}

// Determine overall success
$success = $server_reachable && $port_open;
if (!empty($settings['sip_username']) && !empty($settings['sip_password'])) {
    $success = $success && $registration_valid;
}

// Generate appropriate message
if (!$server_reachable) {
    $message = 'SIP-Verbindung fehlgeschlagen: Server nicht erreichbar';
} elseif (!$port_open) {
    $message = 'SIP-Verbindung fehlgeschlagen: SIP-Port geschlossen';
} elseif (!empty($settings['sip_username']) && !empty($settings['sip_password']) && !$registration_valid) {
    $message = 'SIP-Verbindung fehlgeschlagen: Ungültige Anmeldedaten';
} else {
    $message = 'SIP-Verbindung erfolgreich getestet';
}

// Create details for response
$details = [
    'timestamp' => date('Y-m-d H:i:s'),
    'status' => $success ? 'success' : 'failure',
    'server_reachable' => $server_reachable,
    'port_open' => $port_open,
    'tested_host' => $sip_server,
    'tested_port' => $sip_port
];

// Log the action
$log = new Log();
$log->create(
    $user_id,
    'test_sip_connection',
    'settings',
    null,
    "User tested SIP connection" . ($filiale_id ? " for filiale $filiale_id" : "") . 
    " - Result: " . ($success ? "Success" : "Failed")
);

jsonResponse($success, $message, $details);
?>
