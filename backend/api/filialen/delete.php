
<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/Filiale.php';
require_once __DIR__ . '/../../models/Log.php';

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

// Only admins can delete filialen
if ($payload['role'] !== 'admin') {
    jsonResponse(false, 'Access denied', null, 403);
}

// Get filiale ID from URL
$id = $_GET['id'] ?? null;
if (!$id) {
    jsonResponse(false, 'Filiale ID is required', null, 400);
}

// Delete filiale
$filiale = new Filiale();
$success = $filiale->delete($id);

if (!$success) {
    jsonResponse(false, 'Failed to delete filiale', null, 500);
}

// Log the action
$log = new Log();
$log->create(
    $payload['user_id'],
    'delete_filiale',
    'filiale',
    $id,
    "Admin deleted filiale"
);

jsonResponse(true, 'Filiale deleted successfully', null);
?>
