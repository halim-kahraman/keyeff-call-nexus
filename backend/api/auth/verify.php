
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

// Validate input
if (!isset($data['user_id']) || !isset($data['otp'])) {
    jsonResponse(false, 'User ID and OTP are required', null, 400);
}

$user_id = $data['user_id'];
$otp = $data['otp'];

// Find user by ID
$user = new User();
if (!$user->findById($user_id)) {
    jsonResponse(false, 'User not found', null, 404);
}

// Verify OTP
if (!$user->verifyOTP($otp)) {
    // Log failed verification
    $log = new Log();
    $log->create(
        $user_id,
        'verify_failed',
        'user',
        $user_id,
        'Failed 2FA verification attempt'
    );
    
    jsonResponse(false, 'Invalid or expired OTP', null, 401);
}

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
