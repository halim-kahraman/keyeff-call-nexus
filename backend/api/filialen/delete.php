
<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/Filiale.php';
require_once __DIR__ . '/../../models/Log.php';

use KeyEff\CallPanel\Models\Filiale;
use KeyEff\CallPanel\Models\Log;

// Check if request method is DELETE
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
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

try {
    $filiale = new Filiale();
    
    // Get filiale data before deletion for logging
    $filiale_data = $filiale->getById($filiale_id);
    
    if (!$filiale_data) {
        jsonResponse(false, 'Filiale nicht gefunden', null, 404);
    }
    
    $success = $filiale->delete($filiale_id);

    if ($success) {
        // Log the action
        $log = new Log();
        $log->create(
            $payload['user_id'],
            'delete_filiale',
            'filiale',
            $filiale_id,
            "User deleted filiale: " . $filiale_data['name']
        );

        jsonResponse(true, 'Filiale erfolgreich gelöscht', null);
    } else {
        jsonResponse(false, 'Fehler beim Löschen der Filiale', null, 500);
    }
} catch (Exception $e) {
    debugLog("Error deleting filiale", $e->getMessage());
    jsonResponse(false, 'Error deleting filiale: ' . $e->getMessage(), null, 500);
}
?>
