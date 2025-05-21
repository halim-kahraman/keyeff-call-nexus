
<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/Setting.php';
require_once __DIR__ . '/../../models/Log.php';

// Check if request method is GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
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

// Check required permissions based on category
$category = $_GET['category'] ?? null;
$user_id = $payload['user_id'];
$user_role = $payload['role'];

if (!$category) {
    jsonResponse(false, 'Category is required', null, 400);
}

// Check permissions based on category
if (($category === 'api' || $category === 'smtp') && $user_role !== 'admin') {
    jsonResponse(false, 'Access denied', null, 403);
}

// For filiale-specific settings, check if user has access
$filiale_id = $_GET['filiale_id'] ?? null;

if ($filiale_id && $user_role !== 'admin' && $payload['filiale'] != $filiale_id) {
    jsonResponse(false, 'Access denied to this filiale', null, 403);
}

// Get settings
$setting = new Setting();
$settings = $setting->getAllByCategory($category, $filiale_id);

// Log access
$log = new Log();
$log->create(
    $user_id,
    'view_settings',
    'settings',
    null,
    "User viewed $category settings" . ($filiale_id ? " for filiale $filiale_id" : "")
);

jsonResponse(true, 'Settings retrieved successfully', $settings);
?>
