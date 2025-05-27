
<?php
// General Configuration
define('APP_NAME', 'KeyEff Call Panel');
define('APP_VERSION', '1.0.0');

// Local Production Configuration
define('API_URL', 'http://localhost/keyeff_callpanel/backend');
define('APP_URL', 'http://localhost/keyeff_callpanel/public');

// JWT Secret for Token Generation
define('JWT_SECRET', 'KeyEff_SecretKey_Change_This_In_Production');
define('JWT_EXPIRY', 86400); // 24 hours in seconds

// Email settings for password reset and notifications
define('MAIL_HOST', 'smtp.example.com');
define('MAIL_PORT', 587);
define('MAIL_USERNAME', 'noreply@keyeff.de');
define('MAIL_PASSWORD', 'your_email_password');
define('MAIL_FROM', 'noreply@keyeff.de');
define('MAIL_FROM_NAME', 'KeyEff Call Panel');
define('MAIL_ENCRYPTION', 'tls');

// Time zone
date_default_timezone_set('Europe/Berlin');

// Local development mode - enable debug for local testing
define('DEBUG_MODE', true);

// Set CORS headers for local development
function setCorsHeaders() {
    // Local development CORS - allow localhost on different ports
    $allowed_origins = [
        'http://localhost:8080', 
        'http://localhost:3000',
        'http://localhost/keyeff_callpanel/public',
        'http://localhost/keyeff_callpanel'
    ];
    
    if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) {
        header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
    } else {
        header("Access-Control-Allow-Origin: http://localhost/keyeff_callpanel/public");
    }
    
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Access-Control-Max-Age: 1728000');
}

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    setCorsHeaders();
    header("HTTP/1.1 200 OK");
    exit;
}

// Set CORS headers
setCorsHeaders();

// Set default content type for API responses
header('Content-Type: application/json; charset=UTF-8');

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Error reporting for local development
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Function to generate JSON response
function jsonResponse($success = true, $message = '', $data = null, $status = 200) {
    http_response_code($status);
    setCorsHeaders();
    header('Content-Type: application/json; charset=UTF-8');
    
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

// Function to validate JWT token
function validateToken($token) {
    $parts = explode('.', $token);
    if (count($parts) != 3) {
        return false;
    }
    
    list($header, $payload, $signature) = $parts;
    
    // Decode payload
    $payload = json_decode(base64_decode($payload), true);
    
    // Check if token is expired
    if (isset($payload['exp']) && $payload['exp'] < time()) {
        return false;
    }
    
    return $payload;
}

// Debug function for local development
function debugLog($message, $data = null) {
    if (DEBUG_MODE) {
        error_log("DEBUG: $message");
        if ($data !== null) {
            error_log("DEBUG DATA: " . json_encode($data));
        }
    }
}
?>
