
<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/Template.php';

use KeyEff\CallPanel\Models\Template;

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
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

$template_id = $_GET['id'] ?? null;

if (!$template_id) {
    jsonResponse(false, 'Template ID is required', null, 400);
}

try {
    $template = new Template();
    $success = $template->delete($template_id);

    if ($success) {
        jsonResponse(true, 'Template deleted successfully', null);
    } else {
        jsonResponse(false, 'Failed to delete template', null, 500);
    }
} catch (Exception $e) {
    debugLog("Error deleting template", $e->getMessage());
    jsonResponse(false, 'Error deleting template: ' . $e->getMessage(), null, 500);
}
?>
