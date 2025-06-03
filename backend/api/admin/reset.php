
<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
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

// Only admins can use admin tools
if ($payload['role'] !== 'admin') {
    jsonResponse(false, 'Access denied', null, 403);
}

// Get request data
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Validate input
if (!isset($data['operation'])) {
    jsonResponse(false, 'Operation parameter is required', null, 400);
}

$operation = $data['operation'];
$user_id = $payload['user_id'];

$conn = getConnection();
$success = false;
$message = '';

try {
    switch ($operation) {
        case 'all':
            // Delete all test data
            $conn->query("DELETE FROM appointments WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 DAY)");
            $conn->query("DELETE FROM call_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 DAY)");
            $conn->query("DELETE FROM customers WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 DAY)");
            $conn->query("DELETE FROM campaigns WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 DAY)");
            $message = 'Alle Testdaten wurden erfolgreich gelöscht';
            $success = true;
            break;
            
        case 'customers':
            $result = $conn->query("DELETE FROM customers WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 DAY)");
            $success = $result !== false;
            $message = $success ? 'Kundendaten wurden erfolgreich gelöscht' : 'Fehler beim Löschen der Kundendaten';
            break;
            
        case 'calls':
            $result = $conn->query("DELETE FROM call_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 DAY)");
            $success = $result !== false;
            $message = $success ? 'Anrufdaten wurden erfolgreich gelöscht' : 'Fehler beim Löschen der Anrufdaten';
            break;
            
        case 'appointments':
            $result = $conn->query("DELETE FROM appointments WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 DAY)");
            $success = $result !== false;
            $message = $success ? 'Termindaten wurden erfolgreich gelöscht' : 'Fehler beim Löschen der Termindaten';
            break;
            
        case 'campaigns':
            $result = $conn->query("DELETE FROM campaigns WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 DAY)");
            $success = $result !== false;
            $message = $success ? 'Kampagnendaten wurden erfolgreich gelöscht' : 'Fehler beim Löschen der Kampagnendaten';
            break;
            
        default:
            jsonResponse(false, 'Invalid operation', null, 400);
            break;
    }
    
    // Log the action
    $log = new Log();
    $log->create(
        $user_id,
        'admin_reset_data',
        'admin',
        null,
        "Admin reset operation: $operation - " . ($success ? "Success" : "Failed")
    );
    
    jsonResponse($success, $message, null);
    
} catch (Exception $e) {
    error_log("Admin reset error: " . $e->getMessage());
    jsonResponse(false, 'Database error occurred: ' . $e->getMessage(), null, 500);
}
?>
