
<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/User.php';
require_once __DIR__ . '/../../models/Log.php';

use KeyEff\CallPanel\Models\User;
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

// Only admins can update users
if ($payload['role'] !== 'admin') {
    jsonResponse(false, 'Access denied', null, 403);
}

// Get user ID from URL
$user_id = $_GET['id'] ?? null;
if (!$user_id) {
    jsonResponse(false, 'User ID is required', null, 400);
}

// Get request data
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Validate required fields
if (!isset($data['name']) || !isset($data['email']) || !isset($data['role'])) {
    jsonResponse(false, 'Missing required fields', null, 400);
}

// Load existing user
$user = new User();
$existingUserData = $user->findById($user_id);

if (!$existingUserData) {
    jsonResponse(false, 'User not found', null, 404);
}

// Prepare update data
$name = trim($data['name']);
$email = trim($data['email']);
$role = $data['role'];
$filiale = $data['filiale'] ?? null;
$filiale_id = $data['filiale_id'] ?? null;
$avatar = $existingUserData['avatar'] ?? null; // Keep existing avatar

// Validate data
if (empty($name) || empty($email)) {
    jsonResponse(false, 'Name and email are required', null, 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(false, 'Invalid email format', null, 400);
}

if (!in_array($role, ['admin', 'filialleiter', 'telefonist'])) {
    jsonResponse(false, 'Invalid role', null, 400);
}

// Update password if provided
if (!empty($data['password'])) {
    if (!$user->updatePassword($user_id, $data['password'])) {
        jsonResponse(false, 'Failed to update password', null, 500);
    }
}

// Update user with all required parameters
if ($user->update($user_id, $name, $email, $role, $filiale, $filiale_id, $avatar)) {
    // Log the action
    $log = new Log();
    $log->create(
        $payload['user_id'],
        'update_user',
        'user',
        $user_id,
        "Updated user: {$name} ({$email})"
    );
    
    jsonResponse(true, 'User updated successfully', null);
} else {
    jsonResponse(false, 'Failed to update user', null, 500);
}
?>
