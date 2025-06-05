
<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/User.php';

use KeyEff\CallPanel\Models\User;

// CORS is already handled in config.php

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    jsonResponse(true, 'Options request handled', null);
}

// Verify authentication
$headers = apache_request_headers();
$authHeader = $headers['Authorization'] ?? '';

if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
    jsonResponse(false, 'Unauthorized', null, 401);
}

$token = $matches[1];
$payload = validateToken($token);

if (!$payload) {
    jsonResponse(false, 'Invalid token', null, 401);
}

try {
    $conn = getConnection();
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Get current connections
        $sql = "SELECT cs.*, f.name as filiale_name FROM connection_sessions cs 
                JOIN filialen f ON cs.filiale_id = f.id 
                WHERE cs.user_id = ? AND cs.status IN ('connecting', 'connected') 
                ORDER BY cs.started_at DESC";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $payload['user_id']);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $connections = [];
        while($row = $result->fetch_assoc()) {
            $connections[] = $row;
        }
        
        jsonResponse(true, 'Connections retrieved successfully', $connections);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Start new connection
        $input = json_decode(file_get_contents('php://input'), true);
        
        $filialeId = $input['filiale_id'] ?? null;
        $connectionType = $input['connection_type'] ?? null;
        
        if (!$filialeId || !$connectionType) {
            jsonResponse(false, 'Filiale ID and connection type required', null, 400);
        }
        
        $sql = "INSERT INTO connection_sessions (user_id, filiale_id, connection_type, connection_data) VALUES (?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $connectionData = json_encode($input['connection_data'] ?? []);
        $stmt->bind_param("iiss", $payload['user_id'], $filialeId, $connectionType, $connectionData);
        $stmt->execute();
        
        $sessionId = $conn->insert_id;
        jsonResponse(true, 'Connection started successfully', ['session_id' => $sessionId]);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        // Update connection status
        $input = json_decode(file_get_contents('php://input'), true);
        
        $sessionId = $input['session_id'] ?? null;
        $status = $input['status'] ?? null;
        
        if (!$sessionId || !$status) {
            jsonResponse(false, 'Session ID and status required', null, 400);
        }
        
        $sql = "UPDATE connection_sessions SET status = ?, connection_data = ? WHERE id = ? AND user_id = ?";
        $stmt = $conn->prepare($sql);
        $connectionData = json_encode($input['connection_data'] ?? []);
        $stmt->bind_param("ssii", $status, $connectionData, $sessionId, $payload['user_id']);
        $stmt->execute();
        
        jsonResponse(true, 'Connection updated successfully', null);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        // End connection
        $sessionId = $_GET['session_id'] ?? null;
        
        if (!$sessionId) {
            jsonResponse(false, 'Session ID required', null, 400);
        }
        
        $sql = "UPDATE connection_sessions SET status = 'disconnected', ended_at = NOW() WHERE id = ? AND user_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ii", $sessionId, $payload['user_id']);
        $stmt->execute();
        
        jsonResponse(true, 'Connection ended successfully', null);
    }
    
} catch (Exception $e) {
    debugLog("Error in connections management", $e->getMessage());
    jsonResponse(false, 'Database error: ' . $e->getMessage(), null, 500);
}
?>
