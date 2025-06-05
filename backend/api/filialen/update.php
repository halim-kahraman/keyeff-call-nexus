
<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/Filiale.php';
require_once __DIR__ . '/../../models/Log.php';

use KeyEff\CallPanel\Models\Filiale;
use KeyEff\CallPanel\Models\Log;

// Check if request method is PUT
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
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

// Check permissions
if ($payload['role'] !== 'admin') {
    jsonResponse(false, 'Access denied', null, 403);
}

// Get filiale ID from URL
$filiale_id = $_GET['id'] ?? null;

if (!$filiale_id) {
    jsonResponse(false, 'Filiale ID ist erforderlich', null, 400);
}

// Get request data
$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (empty($data['name']) || empty($data['address'])) {
    jsonResponse(false, 'Name und Adresse sind erforderlich', null, 400);
}

try {
    $filiale = new Filiale();
    $success = $filiale->update(
        $filiale_id,
        $data['name'],
        $data['address'],
        $data['city'] ?? null,
        $data['postal_code'] ?? null,
        $data['phone'] ?? null,
        $data['email'] ?? null,
        $data['manager_id'] ?? null,
        $data['status'] ?? 'active'
    );

    if ($success) {
        // Log the action
        $log = new Log();
        $log->create(
            $payload['user_id'],
            'update_filiale',
            'filiale',
            $filiale_id,
            "User updated filiale: " . $data['name']
        );

        jsonResponse(true, 'Filiale erfolgreich aktualisiert', null);
    } else {
        jsonResponse(false, 'Fehler beim Aktualisieren der Filiale', null, 500);
    }
} catch (Exception $e) {
    debugLog("Error updating filiale", $e->getMessage());
    jsonResponse(false, 'Error updating filiale: ' . $e->getMessage(), null, 500);
}
?>
