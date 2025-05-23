
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

// Actually test the VPN connection
$vpn_server = $settings['vpn_server'] ?? '';
$vpn_port = $settings['vpn_port'] ?? '';

// Check if we have required fields
if (empty($vpn_server) || empty($vpn_port)) {
    jsonResponse(false, 'VPN-Server und Port müssen angegeben werden', null, 400);
}

// Try to ping the VPN server
$success = false;
$output = [];
$return_var = 0;

// Check if the server responds to ping (2 seconds timeout, 2 packets)
exec("ping -c 2 -W 2 " . escapeshellarg($vpn_server), $output, $return_var);

// Check if port is open using netcat or fsockopen
$port_open = false;
$connection = @fsockopen($vpn_server, $vpn_port, $errno, $errstr, 2);
if ($connection) {
    fclose($connection);
    $port_open = true;
}

// Determine success based on ping and port test
$success = ($return_var === 0 && $port_open);
$message = $success ? 'VPN-Verbindung erfolgreich getestet' : 'VPN-Verbindung fehlgeschlagen: Server nicht erreichbar oder Port geschlossen';

// Additional error details
$details = [
    'timestamp' => date('Y-m-d H:i:s'),
    'status' => $success ? 'success' : 'failure',
    'server_reachable' => $return_var === 0,
    'port_open' => $port_open,
    'tested_host' => $vpn_server,
    'tested_port' => $vpn_port
];

// Log the action
$log = new Log();
$log->create(
    $user_id,
    'test_vpn_connection',
    'settings',
    null,
    "User tested VPN connection" . ($filiale_id ? " for filiale $filiale_id" : "") . 
    " - Result: " . ($success ? "Success" : "Failed")
);

jsonResponse($success, $message, $details);
?>
