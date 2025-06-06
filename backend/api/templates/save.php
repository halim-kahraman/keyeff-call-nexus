
<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/Template.php';

use KeyEff\CallPanel\Models\Template;

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

$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['name']) || empty($data['type'])) {
    jsonResponse(false, 'Name and type are required', null, 400);
}

try {
    $template = new Template();
    $templateId = $template->create(
        $data['name'],
        $data['type'],
        $data['category'] ?? 'general',
        $data['subject'] ?? null,
        $data['content'] ?? '',
        $data['placeholders'] ?? null
    );

    if ($templateId) {
        jsonResponse(true, 'Template created successfully', ['id' => $templateId]);
    } else {
        jsonResponse(false, 'Failed to create template', null, 500);
    }
} catch (Exception $e) {
    debugLog("Error creating template", $e->getMessage());
    jsonResponse(false, 'Error creating template: ' . $e->getMessage(), null, 500);
}
?>
