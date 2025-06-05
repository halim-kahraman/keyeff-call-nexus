
<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';

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

$conn = getConnection();
$user_id = $payload['user_id'];
$role = $payload['role'];
$filiale_id = $payload['filiale_id'];

$where_clause = "";
$params = [];
$types = "";

if ($role === 'telefonist') {
    $where_clause = "WHERE a.user_id = ?";
    $params[] = $user_id;
    $types = "i";
} elseif ($role === 'filialleiter') {
    $where_clause = "WHERE u.filiale_id = ?";
    $params[] = $filiale_id;
    $types = "i";
}

$sql = "SELECT a.*, c.name as customer_name 
        FROM appointments a 
        LEFT JOIN customers c ON a.customer_id = c.id 
        LEFT JOIN users u ON a.user_id = u.id 
        $where_clause 
        ORDER BY a.appointment_date DESC, a.appointment_time DESC";

$stmt = $conn->prepare($sql);
if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}
$stmt->execute();

$result = $stmt->get_result();
$appointments = [];

while($row = $result->fetch_assoc()) {
    $appointments[] = $row;
}

jsonResponse(true, 'Appointments retrieved successfully', $appointments);
?>
