
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

if ($payload['role'] !== 'admin') {
    jsonResponse(false, 'Access denied', null, 403);
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!isset($data['operation'])) {
    jsonResponse(false, 'Operation parameter is required', null, 400);
}

$operation = $data['operation'];
$user_id = $payload['user_id'];

$conn = getConnection();
$success = false;
$message = '';
$affected_rows = 0;

try {
    $conn->autocommit(false);
    
    switch ($operation) {
        case 'all':
            $tables = ['appointments', 'call_logs', 'customers', 'campaigns'];
            foreach ($tables as $table) {
                $result = $conn->query("DELETE FROM $table");
                if ($result) {
                    $affected_rows += $conn->affected_rows;
                }
            }
            $message = "Alle Testdaten wurden erfolgreich gelöscht ($affected_rows Datensätze)";
            $success = true;
            break;
            
        case 'customers':
            $result = $conn->query("DELETE FROM customers");
            $success = $result !== false;
            $affected_rows = $conn->affected_rows;
            $message = $success ? "Kundendaten wurden erfolgreich gelöscht ($affected_rows Datensätze)" : 'Fehler beim Löschen der Kundendaten';
            break;
            
        case 'calls':
            $result = $conn->query("DELETE FROM call_logs");
            $success = $result !== false;
            $affected_rows = $conn->affected_rows;
            $message = $success ? "Anrufdaten wurden erfolgreich gelöscht ($affected_rows Datensätze)" : 'Fehler beim Löschen der Anrufdaten';
            break;
            
        case 'appointments':
            $result = $conn->query("DELETE FROM appointments");
            $success = $result !== false;
            $affected_rows = $conn->affected_rows;
            $message = $success ? "Termindaten wurden erfolgreich gelöscht ($affected_rows Datensätze)" : 'Fehler beim Löschen der Termindaten';
            break;
            
        case 'campaigns':
            $result = $conn->query("DELETE FROM campaigns");
            $success = $result !== false;
            $affected_rows = $conn->affected_rows;
            $message = $success ? "Kampagnendaten wurden erfolgreich gelöscht ($affected_rows Datensätze)" : 'Fehler beim Löschen der Kampagnendaten';
            break;
            
        default:
            jsonResponse(false, 'Invalid operation', null, 400);
            break;
    }
    
    if ($success) {
        $conn->commit();
    } else {
        $conn->rollback();
    }
    
    $log = new Log();
    $log->create(
        $user_id,
        'admin_reset_data',
        'admin',
        null,
        "Admin reset operation: $operation - " . ($success ? "Success ($affected_rows rows)" : "Failed")
    );
    
    jsonResponse($success, $message, ['affected_rows' => $affected_rows]);
    
} catch (Exception $e) {
    $conn->rollback();
    error_log("Admin reset error: " . $e->getMessage());
    jsonResponse(false, 'Database error occurred: ' . $e->getMessage(), null, 500);
} finally {
    $conn->autocommit(true);
}
?>
