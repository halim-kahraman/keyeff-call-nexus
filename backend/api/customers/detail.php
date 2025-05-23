
<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/Customer.php';

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

// Get customer id from query string
$customer_id = isset($_GET['id']) ? (int)$_GET['id'] : null;

if (!$customer_id) {
    jsonResponse(false, 'Customer ID is required', null, 400);
}

// Get customer details
$customer = new Customer();
$customer_data = $customer->getById($customer_id);

if (!$customer_data) {
    jsonResponse(false, 'Customer not found', null, 404);
}

// Get customer call logs
$call_logs = $customer->getCallLogs($customer_id);
$customer_data['call_logs'] = $call_logs;

// Log the action
$log = new Log();
$log->create(
    $payload['user_id'],
    'view_customer',
    'customers',
    $customer_id,
    "User viewed customer details for ID $customer_id"
);

jsonResponse(true, 'Customer retrieved successfully', $customer_data);
?>
