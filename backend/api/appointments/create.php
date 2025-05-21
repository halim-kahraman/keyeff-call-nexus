
<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/Appointment.php';
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
if (!isset($data['customer_id']) || !isset($data['date']) || !isset($data['time']) || !isset($data['type'])) {
    jsonResponse(false, 'Customer ID, date, time and type are required', null, 400);
}

$customer_id = $data['customer_id'];
$date = $data['date'];
$time = $data['time'];
$type = $data['type'];
$description = $data['description'] ?? '';
$user_id = $payload['user_id'];

// Create title based on appointment type
$title = '';
switch ($type) {
    case 'beratung':
        $title = 'Beratungsgespräch';
        break;
    case 'vertragsverlaengerung':
        $title = 'Vertragsverlängerung';
        break;
    case 'praesentation':
        $title = 'Produktpräsentation';
        break;
    case 'service':
        $title = 'Service-Termin';
        break;
    default:
        $title = 'Termin';
}

// Create appointment
$appointment = new Appointment();
$appointment_id = $appointment->create(
    $customer_id,
    $user_id,
    $title,
    $date,
    $time,
    $type,
    $description
);

if (!$appointment_id) {
    jsonResponse(false, 'Failed to create appointment', null, 500);
}

// Try to sync to KeyEff CRM
$sync_result = $appointment->syncToKeyEff($appointment_id);

// Log the action
$log = new Log();
$log->create(
    $user_id,
    'create_appointment',
    'appointment',
    $appointment_id,
    "User created a $type appointment with customer ID $customer_id"
);

jsonResponse(true, 'Appointment created successfully', [
    'appointment_id' => $appointment_id,
    'sync_status' => $sync_result['success'],
    'sync_message' => $sync_result['message'] ?? null
]);
?>
