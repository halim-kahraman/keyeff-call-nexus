
<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/Setting.php';

use KeyEff\CallPanel\Models\Setting;

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
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

$category = $_GET['category'] ?? null;
$filiale_id = $_GET['filiale_id'] ?? null;

if (!$category) {
    jsonResponse(false, 'Category parameter is required', null, 400);
}

if ($filiale_id === 'global') {
    $filiale_id = null;
}

try {
    $setting = new Setting();
    $settings = $setting->getAllByCategory($category, $filiale_id);

    jsonResponse(true, 'Settings retrieved successfully', $settings);
} catch (Exception $e) {
    debugLog("Error fetching settings", $e->getMessage());
    jsonResponse(false, 'Error fetching settings: ' . $e->getMessage(), null, 500);
}
?>
