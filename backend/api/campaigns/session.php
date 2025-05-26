
<?php
require_once '../../config/database.php';
require_once '../../models/User.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
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
        // Check if campaign is in use
        $campaignId = $_GET['campaign_id'] ?? null;
        
        if (!$campaignId) {
            http_response_code(400);
            echo json_encode(['error' => 'Campaign ID required']);
            exit;
        }
        
        // Clean up expired sessions (older than 15 minutes)
        $cleanupSql = "UPDATE campaign_sessions SET is_active = 0 WHERE last_activity < DATE_SUB(NOW(), INTERVAL 15 MINUTE) AND is_active = 1";
        $pdo->exec($cleanupSql);
        
        $sql = "SELECT cs.*, u.name as user_name FROM campaign_sessions cs 
                JOIN users u ON cs.user_id = u.id 
                WHERE cs.campaign_id = ? AND cs.is_active = 1";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$campaignId]);
        $session = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($session) {
            echo json_encode([
                'in_use' => true,
                'user_name' => $session['user_name'],
                'started_at' => $session['started_at']
            ]);
        } else {
            echo json_encode(['in_use' => false]);
        }
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Start campaign session
        $input = json_decode(file_get_contents('php://input'), true);
        $campaignId = $input['campaign_id'] ?? null;
        
        if (!$campaignId) {
            http_response_code(400);
            echo json_encode(['error' => 'Campaign ID required']);
            exit;
        }
        
        // Clean up expired sessions first
        $cleanupSql = "UPDATE campaign_sessions SET is_active = 0 WHERE last_activity < DATE_SUB(NOW(), INTERVAL 15 MINUTE) AND is_active = 1";
        $pdo->exec($cleanupSql);
        
        // Check if campaign is already in use
        $checkSql = "SELECT cs.*, u.name as user_name FROM campaign_sessions cs 
                     JOIN users u ON cs.user_id = u.id 
                     WHERE cs.campaign_id = ? AND cs.is_active = 1";
        $checkStmt = $pdo->prepare($checkSql);
        $checkStmt->execute([$campaignId]);
        $existingSession = $checkStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($existingSession) {
            http_response_code(409);
            echo json_encode([
                'error' => 'Campaign in use',
                'message' => "Der User {$existingSession['user_name']} ist aktiv in Nutzung der Kampagne"
            ]);
            exit;
        }
        
        // Create new session
        $sql = "INSERT INTO campaign_sessions (campaign_id, user_id) VALUES (?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$campaignId, $user['id']]);
        
        echo json_encode(['success' => true, 'message' => 'Campaign session started']);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        // End campaign session
        $campaignId = $_GET['campaign_id'] ?? null;
        
        if (!$campaignId) {
            http_response_code(400);
            echo json_encode(['error' => 'Campaign ID required']);
            exit;
        }
        
        $sql = "UPDATE campaign_sessions SET is_active = 0 WHERE campaign_id = ? AND user_id = ? AND is_active = 1";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$campaignId, $user['id']]);
        
        echo json_encode(['success' => true, 'message' => 'Campaign session ended']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
