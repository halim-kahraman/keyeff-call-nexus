
<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/User.php';
require_once __DIR__ . '/../../models/Log.php';

use KeyEff\CallPanel\Models\User;
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

// Only admins can delete users
if ($payload['role'] !== 'admin') {
    jsonResponse(false, 'Access denied', null, 403);
}

// Get user ID from URL
$user_id = $_GET['id'] ?? null;
if (!$user_id) {
    jsonResponse(false, 'User ID is required', null, 400);
}

// Prevent self-deletion
if ($user_id == $payload['user_id']) {
    jsonResponse(false, 'Cannot delete your own account', null, 400);
}

// Load user to delete
$user = new User();
if (!$user->findById($user_id)) {
    jsonResponse(false, 'User not found', null, 404);
}

$user_name = $user->name;
$user_email = $user->email;

// Delete user
if ($user->delete()) {
    // Log the action
    $log = new Log();
    $log->create(
        $payload['user_id'],
        'delete_user',
        'user',
        $user_id,
        "Deleted user: $user_name ($user_email)"
    );
    
    jsonResponse(true, 'User deleted successfully', null);
} else {
    jsonResponse(false, 'Failed to delete user', null, 500);
}
?>
