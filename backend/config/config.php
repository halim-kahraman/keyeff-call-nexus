
<?php
// General Configuration
define('APP_NAME', 'KeyEff Call Panel');
define('APP_VERSION', '1.0.0');

// Detect environment
$is_localhost = (strpos($_SERVER['HTTP_HOST'] ?? '', 'localhost') !== false);
$is_preview = (strpos($_SERVER['HTTP_HOST'] ?? '', 'lovable') !== false);

// Define URLs based on environment
if ($is_preview) {
    // For Lovable preview - use relative paths
    define('API_URL', '/api'); // Mock API path for preview
    define('APP_URL', ''); // Relative path for frontend
} elseif ($is_localhost) {
    // For local development
    define('API_URL', 'http://localhost/keyeff_callpanel/backend'); // PHP backend URL
    define('APP_URL', 'http://localhost:8080'); // Frontend URL
} else {
    // Production fallback - adjust as needed
    define('API_URL', '/keyeff_callpanel/backend'); // Relative path for backend
    define('APP_URL', '/keyeff_callpanel'); // Relative path for frontend
}

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

// IMPORTANT: Set CORS headers BEFORE session start or any output
function setCorsHeaders() {
    // Check if the request has an origin header
    if (isset($_SERVER['HTTP_ORIGIN'])) {
        // Detect environment for allowed origins
        $is_localhost = (strpos($_SERVER['HTTP_HOST'] ?? '', 'localhost') !== false);
        $is_preview = (strpos($_SERVER['HTTP_HOST'] ?? '', 'lovable') !== false);
        
        if ($is_preview) {
            // For Lovable preview, allow Lovable domains
            $allowed_origins = ['https://lovable.dev', 'https://lovable.app'];
        } else {
            // For local development
            $allowed_origins = ['http://localhost:8080', 'http://localhost:5173', 'http://localhost'];
        }
        
        // Check if origin is allowed
        if (in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) {
            header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
            header('Access-Control-Allow-Credentials: true');
        } else {
            // Fallback for unknown origins - wildcard
            header("Access-Control-Allow-Origin: *");
        }
    } else {
        // Fallback for requests without origin
        header("Access-Control-Allow-Origin: *");
    }
    
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Access-Control-Max-Age: 1728000');
}

// Handle preflight OPTIONS requests BEFORE ANY output
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    setCorsHeaders();
    header("HTTP/1.1 200 OK");
    exit;
}

// Set CORS headers before any content
setCorsHeaders();

// Set default content type for API responses
header('Content-Type: application/json; charset=UTF-8');

// Start session AFTER setting all headers
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Error reporting for development
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Function to generate JSON response
function jsonResponse($success = true, $message = '', $data = null, $status = 200) {
    // Set status code
    http_response_code($status);
    
    // Re-apply CORS headers to ensure they're present
    setCorsHeaders();
    
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
