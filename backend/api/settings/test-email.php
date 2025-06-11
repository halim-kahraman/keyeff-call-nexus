<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/Setting.php';
require_once __DIR__ . '/../../models/Log.php';
require_once __DIR__ . '/../../utils/mailer.php';

use KeyEff\CallPanel\Models\Setting;
use KeyEff\CallPanel\Models\Log;

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

// Test email configuration using the enhanced mailer
$test_result = testEmailConfiguration();

if (!$test_result['success']) {
    jsonResponse(false, $test_result['message'], $test_result['details']);
}

// Send test email with 2FA template
$test_email = $settings['mail_from'] ?? MAIL_FROM;
$test_name = 'Test User';
$test_code = sprintf('%06d', rand(100000, 999999));

try {
    // Test sending a 2FA email
    $email_sent = send2FAEmail($test_email, $test_name, $test_code);
    
    if ($email_sent) {
        $message = 'E-Mail-Konfiguration erfolgreich getestet';
        $details = array_merge($test_result['details'], [
            'test_email_sent' => true,
            'test_recipient' => $test_email,
            'phpmailer_available' => class_exists('PHPMailer\\PHPMailer\\PHPMailer'),
            'composer_status' => file_exists(__DIR__ . '/../../vendor/autoload.php') ? 'installed' : 'missing'
        ]);
        
        // Log the successful test
        $log = new Log();
        $log->create(
            $user_id,
            'test_email_configuration',
            'settings',
            null,
            "User tested email configuration successfully - Test email sent to {$test_email}"
        );
        
        jsonResponse(true, $message, $details);
    } else {
        jsonResponse(false, 'Test-E-Mail konnte nicht gesendet werden', [
            'smtp_configured' => true,
            'email_function_failed' => true
        ]);
    }
    
} catch (Exception $e) {
    jsonResponse(false, 'E-Mail-Test fehlgeschlagen: ' . $e->getMessage(), [
        'exception' => $e->getMessage(),
        'smtp_test' => $test_result
    ]);
}
?>
