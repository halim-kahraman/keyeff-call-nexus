
<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/User.php';
require_once __DIR__ . '/../../models/Log.php';

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Invalid request method', null, 405);
}

// Get request data
$data = json_decode(file_get_contents('php://input'), true);

// Handle initial password reset request
if (isset($data['email']) && !isset($data['reset_code'])) {
    // Find user by email
    $user = new User();
    $found = $user->findByEmail($data['email']);
    
    if (!$found) {
        // For security reasons, always return success even if email not found
        jsonResponse(true, 'If your email exists in our system, a reset code has been sent to it.');
    }
    
    // Generate OTP for password reset
    $otp = $user->generateOTP();
    
    if (!$otp) {
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
    
    // In a real application, send reset code via email
    // For demo purposes, we'll just return it (NEVER do this in production)
    jsonResponse(true, 'Reset code generated successfully', [
        'reset_code' => $otp, // REMOVE THIS IN PRODUCTION! Just for demo
        'message' => 'If your email exists in our system, a reset code has been sent to it.'
    ]);
}
// Handle password reset confirmation
else if (isset($data['email']) && isset($data['reset_code']) && isset($data['new_password'])) {
    // Find user by email
    $user = new User();
    $found = $user->findByEmail($data['email']);
    
    if (!$found) {
        jsonResponse(false, 'Invalid email or reset code', null, 400);
    }
    
    // Verify reset code/OTP
    if (!$user->verifyOTP($data['reset_code'])) {
        jsonResponse(false, 'Invalid or expired reset code', null, 400);
    }
    
    // Update password
    if (!$user->updatePassword($data['new_password'])) {
        jsonResponse(false, 'Failed to update password', null, 500);
    }
    
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
    jsonResponse(false, 'Invalid request parameters', null, 400);
}
?>
