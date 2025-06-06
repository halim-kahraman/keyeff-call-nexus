<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/Campaign.php';

use KeyEff\CallPanel\Models\Campaign;

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

// Get filiale_id from query string
$filiale_id = isset($_GET['filiale_id']) ? (int)$_GET['filiale_id'] : null;

// Get campaigns
$campaign = new Campaign();

// If user is admin, they can see all campaigns or filter by filiale
// Otherwise, users can only see campaigns for their filiale
if ($payload['role'] === 'admin') {
    $campaigns = $filiale_id ? $campaign->getByFiliale($filiale_id) : $campaign->getAll();
} else {
    // For non-admin users, use their assigned filiale
    $filiale_id = $payload['filiale_id'] ?? null;
    if (!$filiale_id) {
        jsonResponse(false, 'User is not assigned to a filiale', null, 400);
    }
    $campaigns = $campaign->getByFiliale($filiale_id);
}

jsonResponse(true, 'Campaigns retrieved successfully', $campaigns);
?>
