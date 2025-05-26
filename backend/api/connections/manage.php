
<?php
require_once '../../config/database.php';
require_once '../../models/User.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Verify authentication
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';

if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$token = $matches[1];
$user = User::verifyToken($token);

if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid token']);
    exit;
}

try {
    $pdo = getDBConnection();
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Get current connections
        $sql = "SELECT cs.*, f.name as filiale_name FROM connection_sessions cs 
                JOIN filialen f ON cs.filiale_id = f.id 
                WHERE cs.user_id = ? AND cs.status IN ('connecting', 'connected') 
                ORDER BY cs.started_at DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$user['id']]);
        $connections = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($connections);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Start new connection
        $input = json_decode(file_get_contents('php://input'), true);
        
        $filialeId = $input['filiale_id'] ?? null;
        $connectionType = $input['connection_type'] ?? null;
        
        if (!$filialeId || !$connectionType) {
            http_response_code(400);
            echo json_encode(['error' => 'Filiale ID and connection type required']);
            exit;
        }
        
        $sql = "INSERT INTO connection_sessions (user_id, filiale_id, connection_type, connection_data) VALUES (?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $user['id'],
            $filialeId,
            $connectionType,
            json_encode($input['connection_data'] ?? [])
        ]);
        
        $sessionId = $pdo->lastInsertId();
        echo json_encode(['success' => true, 'session_id' => $sessionId]);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        // Update connection status
        $input = json_decode(file_get_contents('php://input'), true);
        
        $sessionId = $input['session_id'] ?? null;
        $status = $input['status'] ?? null;
        
        if (!$sessionId || !$status) {
            http_response_code(400);
            echo json_encode(['error' => 'Session ID and status required']);
            exit;
        }
        
        $sql = "UPDATE connection_sessions SET status = ?, connection_data = ? WHERE id = ? AND user_id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $status,
            json_encode($input['connection_data'] ?? []),
            $sessionId,
            $user['id']
        ]);
        
        echo json_encode(['success' => true]);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        // End connection
        $sessionId = $_GET['session_id'] ?? null;
        
        if (!$sessionId) {
            http_response_code(400);
            echo json_encode(['error' => 'Session ID required']);
            exit;
        }
        
        $sql = "UPDATE connection_sessions SET status = 'disconnected', ended_at = NOW() WHERE id = ? AND user_id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$sessionId, $user['id']]);
        
        echo json_encode(['success' => true]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
