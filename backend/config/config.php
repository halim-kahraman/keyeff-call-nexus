
<?php
// General Configuration
define('APP_NAME', 'KeyEff Call Panel');
define('APP_VERSION', '1.0.0');

// Define URLs based on environment - use relative paths for local development
define('API_URL', '/keyeff_callpanel/backend'); // PHP backend URL - relative path
define('APP_URL', '/keyeff_callpanel'); // Frontend URL - relative path

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

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Simplified CORS Headers for same-site setup
function setCorsHeaders() {
    // Allow requests from anywhere in development - we'll restrict in production
    header("Access-Control-Allow-Origin: *");
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Access-Control-Max-Age: 1728000');
}

// Set CORS headers for all requests
setCorsHeaders();

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    header("HTTP/1.1 200 OK");
    exit;
}

// Default content type for API responses
header('Content-Type: application/json; charset=UTF-8');

// Error reporting for development
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Function to generate JSON response
function jsonResponse($success = true, $message = '', $data = null, $status = 200) {
    http_response_code($status);
    
    // Ensure JSON content type
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
    // Simple JWT validation for demo
    // In production, use a proper JWT library
    
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

// Debug function for development
function debugLog($message, $data = null) {
    $logFile = __DIR__ . '/../debug.log';
    $timestamp = date('Y-m-d H:i:s');
    $logEntry = "[{$timestamp}] {$message}";
    
    if ($data !== null) {
        $logEntry .= ': ' . json_encode($data, JSON_UNESCAPED_UNICODE);
    }
    
    file_put_contents($logFile, $logEntry . PHP_EOL, FILE_APPEND);
}
?>
