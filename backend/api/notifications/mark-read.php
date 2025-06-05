
<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';

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

$input = json_decode(file_get_contents('php://input'), true);
$notification_id = $input['id'] ?? null;

if (!$notification_id) {
    jsonResponse(false, 'Notification ID is required', null, 400);
}

$conn = getConnection();
$user_id = $payload['user_id'];

$sql = "UPDATE notifications SET is_read = 1 WHERE id = ? AND (user_id = ? OR user_id IS NULL)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $notification_id, $user_id);

if ($stmt->execute()) {
    jsonResponse(true, 'Notification marked as read', null);
} else {
    jsonResponse(false, 'Failed to mark notification as read', null, 500);
}
?>
