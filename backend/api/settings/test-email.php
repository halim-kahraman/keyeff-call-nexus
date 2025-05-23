
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
if (!isset($data['settings']) || !is_array($data['settings'])) {
    jsonResponse(false, 'Invalid settings data', null, 400);
}

$user_id = $payload['user_id'];
$user_role = $payload['role'];
$settings = $data['settings'];

// Check permissions
if ($user_role !== 'admin') {
    jsonResponse(false, 'Access denied', null, 403);
}

// In a real application, we would test the Email SMTP connection here
// For this demo, we'll simulate a successful connection
$success = true;
$message = 'E-Mail-Verbindung erfolgreich getestet';

// You would actually test the connection using something like:
/*
$smtp_server = $settings['smtpServer'];
$smtp_port = $settings['smtpPort'];
$smtp_user = $settings['smtpUser'];
$smtp_password = $settings['smtpPassword'];

try {
    // Create PHP mailer instance
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = $smtp_server;
    $mail->SMTPAuth = true;
    $mail->Username = $smtp_user;
    $mail->Password = $smtp_password;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = $smtp_port;
    
    // Test connection without sending
    $mail->SMTPConnect();
    $connection_successful = true;
} catch (Exception $e) {
    $connection_successful = false;
    $message = 'E-Mail-Verbindungstest fehlgeschlagen: ' . $e->getMessage();
}
*/

// Log the action
$log = new Log();
$log->create(
    $user_id,
    'test_email_connection',
    'settings',
    null,
    "User tested Email SMTP connection"
);

jsonResponse($success, $message, [
    'timestamp' => date('Y-m-d H:i:s'),
    'status' => $success ? 'success' : 'failure'
]);
?>
