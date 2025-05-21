
<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/Appointment.php';

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

// Get filter parameters
$start_date = $_GET['start_date'] ?? date('Y-m-d');
$end_date = $_GET['end_date'] ?? date('Y-m-d', strtotime('+30 days'));
$user_id = null;

// Filter by user if not admin and not filialleiter
if ($payload['role'] !== 'admin' && $payload['role'] !== 'filialleiter') {
    $user_id = $payload['user_id'];
}

// Get appointments
$appointment = new Appointment();
$appointments = $appointment->getByDateRange($start_date, $end_date, $user_id);

// Format for calendar display
$formatted_appointments = [];
foreach ($appointments as $apt) {
    $formatted_appointments[] = [
        'id' => $apt['id'],
        'title' => $apt['title'],
        'start' => $apt['appointment_date'] . 'T' . $apt['appointment_time'],
        'customer' => [
            'name' => $apt['customer_name'],
            'company' => $apt['customer_company']
        ],
        'type' => $apt['type'],
        'status' => $apt['status'],
        'description' => $apt['description'],
        'user' => $apt['user_name']
    ];
}

jsonResponse(true, 'Appointments retrieved successfully', $formatted_appointments);
?>
