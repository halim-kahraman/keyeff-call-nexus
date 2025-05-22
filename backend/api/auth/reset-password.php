
<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/User.php';
require_once __DIR__ . '/../../models/Log.php';
require_once __DIR__ . '/../../utils/mailer.php';

// Debug incoming request
debugLog('Reset password request received', [
    'method' => $_SERVER['REQUEST_METHOD'],
    'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'Not set',
    'origin' => $_SERVER['HTTP_ORIGIN'] ?? 'Not set',
    'headers' => getallheaders()
]);

// Ensure CORS headers are set again specifically for this endpoint
if (isset($_SERVER['HTTP_ORIGIN'])) {
    $allowed_origins = ['http://localhost:8080', 'http://localhost:5173'];
    if (in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) {
        header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
    }
}
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

// Handle OPTIONS preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    debugLog('Invalid request method', $_SERVER['REQUEST_METHOD']);
    jsonResponse(false, 'Invalid request method', null, 405);
}

// Get request data
$input = file_get_contents('php://input');
debugLog('Raw input', $input);
$data = json_decode($input, true);
debugLog('Parsed data', $data);

// Handle initial password reset request
if (isset($data['email']) && !isset($data['reset_code'])) {
    debugLog('Password reset request for email', $data['email']);
    
    // Find user by email
    $user = new User();
    $found = $user->findByEmail($data['email']);
    
    if (!$found) {
        debugLog('User not found for reset', $data['email']);
        // For security reasons, always return success even if email not found
        jsonResponse(true, 'If your email exists in our system, a reset code has been sent to it.');
    }
    
    // Generate OTP for password reset
    $otp = $user->generateOTP();
    
    if (!$otp) {
        debugLog('Failed to generate reset code', $data['email']);
        jsonResponse(false, 'Failed to generate reset code', null, 500);
    }
    
    // Log password reset attempt
    $log = new Log();
    $log->create(
        $user->id,
        'password_reset_request',
        'user',
        $user->id,
        'Password reset requested'
    );
    
    // Send reset email
    $emailSent = sendPasswordResetEmail($user->email, $user->name, $otp);
    
    debugLog('Reset code generated and email attempt', [
        'email' => $data['email'],
        'otp' => $otp,
        'email_sent' => $emailSent
    ]);
    
    // For demo purposes, include the OTP in the response (REMOVE IN PRODUCTION)
    jsonResponse(true, 'If your email exists in our system, a reset code has been sent to it.', [
        'reset_code' => $otp, // REMOVE THIS IN PRODUCTION! Just for demo
        'message' => 'If your email exists in our system, a reset code has been sent to it.',
        'email_success' => $emailSent
    ]);
}
// Handle password reset confirmation
else if (isset($data['email']) && isset($data['reset_code']) && isset($data['new_password'])) {
    debugLog('Password reset confirmation for email', $data['email']);
    
    // Find user by email
    $user = new User();
    $found = $user->findByEmail($data['email']);
    
    if (!$found) {
        debugLog('User not found for reset confirmation', $data['email']);
        jsonResponse(false, 'Invalid email or reset code', null, 400);
    }
    
    // Verify reset code/OTP
    if (!$user->verifyOTP($data['reset_code'])) {
        debugLog('Invalid reset code', [
            'email' => $data['email'],
            'code' => $data['reset_code']
        ]);
        jsonResponse(false, 'Invalid or expired reset code', null, 400);
    }
    
    // Update password
    if (!$user->updatePassword($data['new_password'])) {
        debugLog('Failed to update password', $data['email']);
        jsonResponse(false, 'Failed to update password', null, 500);
    }
    
    debugLog('Password reset successful', $data['email']);
    
    // Log password reset success
    $log = new Log();
    $log->create(
        $user->id,
        'password_reset_success',
        'user',
        $user->id,
        'Password reset successful'
    );
    
    jsonResponse(true, 'Password has been reset successfully. Please log in with your new password.');
}
else {
    debugLog('Invalid reset password request parameters', $data);
    jsonResponse(false, 'Invalid request parameters', null, 400);
}
?>
