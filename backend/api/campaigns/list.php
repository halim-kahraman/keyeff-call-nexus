
<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/Campaign.php';

use KeyEff\CallPanel\Models\Campaign;

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

try {
    $campaign = new Campaign();
    $campaigns = $campaign->getAll();
    
    jsonResponse(true, 'Campaigns retrieved successfully', $campaigns);
} catch (Exception $e) {
    debugLog("Error fetching campaigns", $e->getMessage());
    jsonResponse(false, 'Error fetching campaigns: ' . $e->getMessage(), null, 500);
}
?>
