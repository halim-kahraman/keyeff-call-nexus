
<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/User.php';
require_once __DIR__ . '/../../models/Log.php';

use KeyEff\CallPanel\Models\User;
use KeyEff\CallPanel\Models\Log;

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

// Only admins can create users
if ($payload['role'] !== 'admin') {
    jsonResponse(false, 'Access denied', null, 403);
}

// Get request data
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Validate required fields
if (!isset($data['name']) || !isset($data['email']) || !isset($data['password']) || !isset($data['role'])) {
    jsonResponse(false, 'Missing required fields', null, 400);
}

$name = trim($data['name']);
$email = trim($data['email']);
$password = $data['password'];
$role = $data['role'];
$filiale = $data['filiale'] ?? null;
$filiale_id = $data['filiale_id'] ?? null;

// Validate data
if (empty($name) || empty($email) || empty($password)) {
    jsonResponse(false, 'All fields are required', null, 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(false, 'Invalid email format', null, 400);
}

if (!in_array($role, ['admin', 'filialleiter', 'telefonist'])) {
    jsonResponse(false, 'Invalid role', null, 400);
}

// Create user
$user = new User();
$user_id = $user->create($name, $email, $password, $role, $filiale, $filiale_id);

if ($user_id) {
    // Log the action
    $log = new Log();
    $log->create(
        $payload['user_id'],
        'create_user',
        'user',
        $user_id,
        "Created new user: $name ($email)"
    );
    
    jsonResponse(true, 'User created successfully', ['user_id' => $user_id]);
} else {
    jsonResponse(false, 'Failed to create user', null, 500);
}
?>
