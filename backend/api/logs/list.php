<?php
header('Content-Type: application/json; charset=utf-8');
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
    if (isset($_GET['entity_id']) && !empty($_GET['entity_id'])) {
        $filters['entity_id'] = $_GET['entity_id'];
    }
    if (isset($_GET['start_date']) && !empty($_GET['start_date'])) {
        $filters['start_date'] = $_GET['start_date'];
    }
    if (isset($_GET['end_date']) && !empty($_GET['end_date'])) {
        $filters['end_date'] = $_GET['end_date'];
    }
    
    // Pagination
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 100;
    $offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;
    $filters['limit'] = $limit;
    $filters['offset'] = $offset;
    
    $logs = $log->getAll($filters);
    $total = $log->getCount($filters);
    
    // Return the response in the expected format
    echo json_encode([
        'success' => true,
        'data' => [
            'data' => $logs,
            'total' => $total,
            'limit' => $limit,
            'offset' => $offset
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Internal server error: ' . $e->getMessage()
    ]);
}
?>
