
<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/Appointment.php';

use KeyEff\CallPanel\Models\Appointment;

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(false, 'Invalid request method', null, 405);
}

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

// Get parameters with default values to prevent undefined warnings
$filiale_id = isset($_GET['filiale_id']) ? $_GET['filiale_id'] : null;
$customer_id = isset($_GET['customer_id']) ? $_GET['customer_id'] : null;
$date_from = isset($_GET['date_from']) ? $_GET['date_from'] : null;
$date_to = isset($_GET['date_to']) ? $_GET['date_to'] : null;
$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;

// Role-based filtering
if ($payload['role'] !== 'admin' && !isset($_GET['filiale_id'])) {
    $filiale_id = $payload['filiale_id']; // Force filiale_id for non-admin users
}

try {
    $appointment = new Appointment();
    $appointments = $appointment->getAll($filiale_id, $customer_id, $date_from, $date_to, $user_id);
    
    jsonResponse(true, 'Appointments retrieved successfully', $appointments);
} catch (Exception $e) {
    debugLog("Error fetching appointments", $e->getMessage());
    jsonResponse(false, 'Error fetching appointments: ' . $e->getMessage(), null, 500);
}
?>
