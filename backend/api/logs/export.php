<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../models/Log.php';
require_once __DIR__ . '/../../config/config.php';

use KeyEff\CallPanel\Models\Log;

try {
    // Verify authentication
    $headers = getallheaders();
    $token = null;
    
    if (isset($headers['Authorization'])) {
        $authHeader = $headers['Authorization'];
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            $token = $matches[1];
        }
    }
    
    if (!$token) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit();
    }
    
    // Verify user is admin (simplified for now)
    // In a real implementation, you'd verify the JWT token here
    
    $log = new Log();
    
    // Get filters from query parameters
    $filters = [];
    if (isset($_GET['user_id']) && !empty($_GET['user_id'])) {
        $filters['user_id'] = $_GET['user_id'];
    }
    if (isset($_GET['action']) && !empty($_GET['action'])) {
        $filters['action'] = $_GET['action'];
    }
    if (isset($_GET['entity']) && !empty($_GET['entity'])) {
        $filters['entity'] = $_GET['entity'];
    }
    if (isset($_GET['start_date']) && !empty($_GET['start_date'])) {
        $filters['start_date'] = $_GET['start_date'];
    }
    if (isset($_GET['end_date']) && !empty($_GET['end_date'])) {
        $filters['end_date'] = $_GET['end_date'];
    }
    
    $filename = $log->exportCSV($filters);
    
    if ($filename) {
        $filepath = __DIR__ . '/../../exports/' . $filename;
        
        if (file_exists($filepath)) {
            header('Content-Type: application/octet-stream');
            header('Content-Disposition: attachment; filename="' . $filename . '"');
            header('Content-Length: ' . filesize($filepath));
            
            readfile($filepath);
            
            // Clean up the file after download
            unlink($filepath);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Export file not found']);
        }
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to export logs']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error: ' . $e->getMessage()]);
}
?>
