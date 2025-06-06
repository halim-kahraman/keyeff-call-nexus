
<?php
require_once __DIR__ . '/../../config/config.php';

use KeyEff\CallPanel\Models\User;
use KeyEff\CallPanel\Models\Log;

require_once __DIR__ . '/../../models/User.php';
require_once __DIR__ . '/../../models/Log.php';

// Debug incoming request
debugLog('2FA Verification request received', [
    'method' => $_SERVER['REQUEST_METHOD'],
    'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'Not set',
    'origin' => $_SERVER['HTTP_ORIGIN'] ?? 'Not set'
]);

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
if (!isset($data['user_id']) || !isset($data['otp'])) {
    debugLog('Missing user_id or OTP', $data);
    jsonResponse(false, 'User ID and OTP are required', null, 400);
}

$user_id = $data['user_id'];
$otp = $data['otp'];

// Find user by ID
$user = new User();
if (!$user->findById($user_id)) {
    debugLog('User not found', $user_id);
    jsonResponse(false, 'User not found', null, 404);
}

// Verify OTP - fix the function call with proper parameters
if (!$user->verifyOTP($user_id, $otp)) {
    // Log failed verification
    $log = new Log();
    $log->create(
        $user_id,
        'verify_failed',
        'user',
        $user_id,
        'Failed 2FA verification attempt'
    );
    
    debugLog('Invalid or expired OTP', [
        'user_id' => $user_id,
        'otp' => $otp
    ]);
    
    jsonResponse(false, 'Invalid or expired OTP', null, 401);
}

// Clear OTP after successful verification
$user->clearOTP($user_id);

// Generate simple JWT token (in production, use a proper JWT library)
$token_payload = [
    'user_id' => $user->id,
    'name' => $user->name,
    'email' => $user->email,
    'role' => $user->role,
    'filiale' => $user->filiale,
    'exp' => time() + JWT_EXPIRY
];

$token_header = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
$token_payload = base64_encode(json_encode($token_payload));
$token_signature = base64_encode(hash_hmac('sha256', $token_header . '.' . $token_payload, JWT_SECRET, true));
$token = $token_header . '.' . $token_payload . '.' . $token_signature;

// Log successful login
$log = new Log();
$log->create(
    $user->id,
    'login_success',
    'user',
    $user->id,
    'User logged in successfully'
);

debugLog('Login successful', [
    'user_id' => $user->id,
    'name' => $user->name,
    'email' => $user->email,
    'role' => $user->role
]);

// Return user data and token
jsonResponse(true, 'Login successful', [
    'token' => $token,
    'user' => [
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'role' => $user->role,
        'filiale' => $user->filiale,
        'avatar' => $user->avatar ?: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' . $user->role,
    ]
]);
?>
