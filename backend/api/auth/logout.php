
<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/Log.php';

// Check if authorization header exists
$headers = apache_request_headers();
$auth_header = $headers['Authorization'] ?? null;

if ($auth_header && preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
    $token = $matches[1];
    
    // Validate token
    $payload = validateToken($token);
    
    if ($payload && isset($payload['user_id'])) {
        // Log logout
        $log = new Log();
        $log->create(
            $payload['user_id'],
            'logout',
            'user',
            $payload['user_id'],
            'User logged out'
        );
    }
}

// In a real JWT implementation, we would add the token to a blacklist
// Or use short-lived tokens with refresh tokens

jsonResponse(true, 'Logged out successfully');
?>
