
<?php
require_once '../../config/database.php';
require_once '../../models/User.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
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
    
    $type = $_GET['type'] ?? null;
    $category = $_GET['category'] ?? null;
    
    $sql = "SELECT * FROM templates WHERE is_active = 1";
    $params = [];
    
    if ($type) {
        $sql .= " AND type = ?";
        $params[] = $type;
    }
    
    if ($category) {
        $sql .= " AND category = ?";
        $params[] = $category;
    }
    
    $sql .= " ORDER BY category, name";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $templates = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Parse JSON placeholders
    foreach ($templates as &$template) {
        $template['placeholders'] = json_decode($template['placeholders'], true) ?? [];
    }
    
    echo json_encode($templates);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
