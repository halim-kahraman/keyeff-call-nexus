
<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/Log.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
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

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!isset($data['title']) || !isset($data['appointment_date']) || !isset($data['appointment_time'])) {
    jsonResponse(false, 'Title, date and time are required', null, 400);
}

$conn = getConnection();
$user_id = $payload['user_id'];

$sql = "INSERT INTO appointments (user_id, title, appointment_date, appointment_time, customer_id, type, notes) VALUES (?, ?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("isssiss", 
    $user_id,
    $data['title'],
    $data['appointment_date'],
    $data['appointment_time'],
    $data['customer_id'] ?? null,
    $data['type'] ?? 'beratung',
    $data['notes'] ?? ''
);

if ($stmt->execute()) {
    $appointment_id = $conn->insert_id;
    
    $log = new Log();
    $log->create(
        $user_id,
        'create_appointment',
        'appointment',
        $appointment_id,
        "Created appointment: " . $data['title']
    );
    
    jsonResponse(true, 'Appointment created successfully', ['id' => $appointment_id]);
} else {
    jsonResponse(false, 'Failed to create appointment', null, 500);
}
?>
