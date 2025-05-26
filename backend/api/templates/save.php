
<?php
require_once '../../config/database.php';
require_once '../../models/User.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Verify authentication and admin role
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';

if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$token = $matches[1];
$user = User::verifyToken($token);

if (!$user || $user['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Admin access required']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON input']);
    exit;
}

$required = ['name', 'type', 'category', 'content'];
foreach ($required as $field) {
    if (!isset($input[$field]) || empty($input[$field])) {
        http_response_code(400);
        echo json_encode(['error' => "Field '$field' is required"]);
        exit;
    }
}

try {
    $pdo = getDBConnection();
    
    $placeholders = json_encode($input['placeholders'] ?? []);
    
    if (isset($input['id']) && $input['id']) {
        // Update existing template
        $sql = "UPDATE templates SET name = ?, type = ?, category = ?, subject = ?, content = ?, placeholders = ? WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $input['name'],
            $input['type'],
            $input['category'],
            $input['subject'] ?? null,
            $input['content'],
            $placeholders,
            $input['id']
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Template updated successfully']);
    } else {
        // Create new template
        $sql = "INSERT INTO templates (name, type, category, subject, content, placeholders) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $input['name'],
            $input['type'],
            $input['category'],
            $input['subject'] ?? null,
            $input['content'],
            $placeholders
        ]);
        
        $templateId = $pdo->lastInsertId();
        echo json_encode(['success' => true, 'id' => $templateId, 'message' => 'Template created successfully']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
