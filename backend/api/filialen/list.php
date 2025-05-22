
<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/Filiale.php';
require_once __DIR__ . '/../../models/Log.php';

// CORS is already handled in config.php

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

// Get all filialen
$filiale = new Filiale();
$filialen = $filiale->getAll();

// Log the action
$log = new Log();
$log->create(
    $payload['user_id'],
    'view_filialen',
    'filiale',
    null,
    "User viewed list of filialen"
);

jsonResponse(true, 'Filialen retrieved successfully', $filialen);
?>
