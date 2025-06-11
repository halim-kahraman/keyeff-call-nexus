
<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/Setting.php';
require_once __DIR__ . '/../../models/FilialeSetting.php';
require_once __DIR__ . '/../../models/Log.php';

use KeyEff\CallPanel\Models\Setting;
use KeyEff\CallPanel\Models\FilialeSetting;
use KeyEff\CallPanel\Models\Log;

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

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!isset($data['category'])) {
    jsonResponse(false, 'Category is required', null, 400);
}

$category = $data['category'];
$filiale_id = $data['filiale_id'] ?? null;

if ($filiale_id === 'global') {
    $filiale_id = null;
}

$success = true;

// Use appropriate model based on whether it's global or filiale-specific
if ($filiale_id === null) {
    // Global settings - use Setting model
    $setting = new Setting();
    foreach ($data as $key => $value) {
        if ($key === 'category' || $key === 'filiale_id') {
            continue;
        }
        
        if (!$setting->save($category, $key, $value, null)) {
            $success = false;
            break;
        }
    }
} else {
    // Filiale-specific settings - use FilialeSetting model
    $filialeSetting = new FilialeSetting();
    foreach ($data as $key => $value) {
        if ($key === 'category' || $key === 'filiale_id') {
            continue;
        }
        
        // Prefix the key with category for better organization
        $setting_key = $category . '_' . $key;
        if (!$filialeSetting->save($filiale_id, $setting_key, $value)) {
            $success = false;
            break;
        }
    }
}

if ($success) {
    $log = new Log();
    $log->create(
        $payload['user_id'],
        'update_settings',
        'settings',
        null,
        "Updated $category settings for filiale " . ($filiale_id ?? 'global')
    );
    
    jsonResponse(true, 'Settings saved successfully', null);
} else {
    jsonResponse(false, 'Failed to save settings', null, 500);
}
?>
