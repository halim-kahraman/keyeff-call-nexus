
<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/Customer.php';
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
if (!isset($data['customer_id']) || !isset($data['log_text']) || !isset($data['outcome'])) {
    jsonResponse(false, 'Customer ID, log text and outcome are required', null, 400);
}

$customer_id = $data['customer_id'];
$log_text = $data['log_text'];
$outcome = $data['outcome'];
$duration = $data['duration'] ?? 0;
$user_id = $payload['user_id'];

// Add call log
$customer = new Customer();
$log_id = $customer->addCallLog($customer_id, $user_id, $log_text, $outcome, $duration);

if (!$log_id) {
    jsonResponse(false, 'Failed to save call log', null, 500);
}

// Log the action
$log = new Log();
$log->create(
    $user_id,
    'add_call_log',
    'call_log',
    $log_id,
    "User logged a call with customer ID $customer_id"
);

jsonResponse(true, 'Call log saved successfully', [
    'log_id' => $log_id,
    'timestamp' => date('Y-m-d H:i:s')
]);
?>
