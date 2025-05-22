
<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/User.php';
require_once __DIR__ . '/../../models/Log.php';

// Debug incoming request
debugLog('Login request received', [
    'method' => $_SERVER['REQUEST_METHOD'],
    'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'Not set',
    'origin' => $_SERVER['HTTP_ORIGIN'] ?? 'Not set',
    'headers' => getallheaders()
]);

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

// Validate input
if (!isset($data['email']) || !isset($data['password'])) {
    debugLog('Missing credentials', $data);
    jsonResponse(false, 'Email and password are required', null, 400);
}

$email = $data['email'];
$password = $data['password'];

// Find user by email
$user = new User();
$found = $user->findByEmail($email);

if (!$found) {
    debugLog('User not found', $email);
    jsonResponse(false, 'Invalid credentials', null, 401);
}

// Debug the stored password for verification issues
debugLog('Password check', [
    'email' => $email,
    'stored_hash_length' => strlen($user->password),
    'password_provided_length' => strlen($password),
]);

// Verify password
if (!$user->validatePassword($password)) {
    debugLog('Invalid password for user', $email);
    jsonResponse(false, 'Invalid credentials', null, 401);
}

// Generate OTP for 2FA
$otp = $user->generateOTP();

if (!$otp) {
    debugLog('Failed to generate OTP', $email);
    jsonResponse(false, 'Failed to generate OTP', null, 500);
}

// In a real application, send OTP via email
// For demo purposes, we'll just return it (NEVER do this in production)
// Normally we would use PHPMailer here

// Log login attempt
$log = new Log();
$log->create(
    $user->id,
    'login_attempt',
    'user',
    $user->id,
    'Login attempt with 2FA initiated'
);

debugLog('OTP generated successfully', [
    'user_id' => $user->id,
    'otp' => $otp
]);

// Return pending state with temporary token
jsonResponse(true, 'OTP generated successfully', [
    'needs_verification' => true,
    'user_id' => $user->id,
    'otp' => $otp, // REMOVE THIS IN PRODUCTION! Just for demo
    'message' => 'A verification code has been sent to your email.'
]);
?>
