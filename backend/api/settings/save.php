
<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/Setting.php';
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

// Get request data
$data = json_decode(file_get_contents('php://input'), true);

// Validate input
if (!isset($data['category']) || !isset($data['settings'])) {
    jsonResponse(false, 'Category and settings are required', null, 400);
}

$category = $data['category'];
$settings = $data['settings'];
$filiale_id = $data['filiale_id'] ?? null;
$user_id = $payload['user_id'];
$user_role = $payload['role'];

// Check permissions based on category
if (($category === 'api' || $category === 'smtp') && $user_role !== 'admin') {
    jsonResponse(false, 'Access denied', null, 403);
}

// For filiale-specific settings, check if user has access
if ($filiale_id && $user_role !== 'admin' && $payload['filiale'] != $filiale_id) {
    jsonResponse(false, 'Access denied to this filiale', null, 403);
}

// Save settings
$setting = new Setting();
$success = true;
$saved_settings = [];

foreach ($settings as $key => $value) {
    // Skip empty values
    if ($value === '') {
        continue;
    }
    
    // For password fields, check if it's the placeholder (don't update if it is)
    if (strpos($key, 'password') !== false && $value === '********') {
        continue;
    }
    
    $result = $setting->save($category, $key, $value, $filiale_id);
    
    if (!$result) {
        $success = false;
    } else {
        $saved_settings[$key] = $value;
    }
}

// Log the action
$log = new Log();
$log->create(
    $user_id,
    'update_settings',
    'settings',
    null,
    "User updated $category settings" . ($filiale_id ? " for filiale $filiale_id" : "")
);

if ($success) {
    jsonResponse(true, 'Settings saved successfully', $saved_settings);
} else {
    jsonResponse(false, 'Some settings failed to save', $saved_settings, 500);
}
?>
