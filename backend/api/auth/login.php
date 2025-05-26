
<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/User.php';
require_once __DIR__ . '/../../models/Log.php';

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Invalid request method', null, 405);
}

// Get request data
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Validate input
if (!isset($data['email']) || !isset($data['password'])) {
    jsonResponse(false, 'Email and password are required', null, 400);
}

$email = $data['email'];
$password = $data['password'];

// Find user by email
$user = new User();
$found = $user->findByEmail($email);

if (!$found) {
    jsonResponse(false, 'Invalid credentials', null, 401);
}

// Verify password
if (!$user->validatePassword($password)) {
    jsonResponse(false, 'Invalid credentials', null, 401);
}

// Generate OTP for 2FA
$otp = $user->generateOTP();

if (!$otp) {
    jsonResponse(false, 'Failed to generate OTP', null, 500);
}

// Log login attempt
$log = new Log();
$log->create(
    $user->id,
    'login_attempt',
    'user',
    $user->id,
    'Login attempt with 2FA initiated'
);

// Return pending state with temporary token
jsonResponse(true, 'OTP generated successfully', [
    'needs_verification' => true,
    'user_id' => $user->id,
    'message' => 'A verification code has been sent to your email.'
]);
?>
