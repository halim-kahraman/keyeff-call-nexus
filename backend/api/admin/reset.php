
<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Invalid request method', null, 405);
}

// Check authorization
$headers = apache_request_headers();
$auth_header = $headers['Authorization'] ?? null;

if (!$auth_header || !preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
    jsonResponse(false, 'Unauthorized', null, 401);
}

$token = $matches[1];
$payload = validateToken($token);

if (!$payload) {
    jsonResponse(false, 'Invalid token', null, 401);
}

// Only admins can reset test data
if ($payload['role'] !== 'admin') {
    jsonResponse(false, 'Access denied', null, 403);
}

// Get operation type from request
$data = json_decode(file_get_contents('php://input'), true);
$operation = $data['operation'] ?? 'all';

$conn = getConnection();

// Begin transaction
$conn->begin_transaction();

try {
    switch ($operation) {
        case 'all':
            // Delete all test data
            $conn->query("DELETE FROM call_logs WHERE id > 3");
            $conn->query("DELETE FROM appointments WHERE id > 0");
            $conn->query("DELETE FROM campaign_customers WHERE campaign_id > 1");
            $conn->query("DELETE FROM campaigns WHERE id > 1");
            $conn->query("DELETE FROM customer_contacts WHERE id > 5");
            $conn->query("DELETE FROM customer_contracts WHERE id > 3");
            $conn->query("DELETE FROM customers WHERE id > 3");
            
            // Reset auto-increment values
            $conn->query("ALTER TABLE call_logs AUTO_INCREMENT = 4");
            $conn->query("ALTER TABLE appointments AUTO_INCREMENT = 1");
            $conn->query("ALTER TABLE campaigns AUTO_INCREMENT = 2");
            $conn->query("ALTER TABLE customer_contacts AUTO_INCREMENT = 6");
            $conn->query("ALTER TABLE customer_contracts AUTO_INCREMENT = 4");
            $conn->query("ALTER TABLE customers AUTO_INCREMENT = 4");
            break;
            
        case 'customers':
            // Delete test customers
            $conn->query("DELETE FROM customer_contacts WHERE customer_id > 3");
            $conn->query("DELETE FROM customer_contracts WHERE customer_id > 3");
            $conn->query("DELETE FROM campaign_customers WHERE customer_id > 3");
            $conn->query("DELETE FROM call_logs WHERE customer_id > 3");
            $conn->query("DELETE FROM appointments WHERE customer_id > 3");
            $conn->query("DELETE FROM customers WHERE id > 3");
            
            // Reset auto-increment values
            $conn->query("ALTER TABLE customer_contacts AUTO_INCREMENT = 6");
            $conn->query("ALTER TABLE customer_contracts AUTO_INCREMENT = 4");
            $conn->query("ALTER TABLE customers AUTO_INCREMENT = 4");
            break;
            
        case 'calls':
            // Delete test call logs
            $conn->query("DELETE FROM call_logs WHERE id > 3");
            
            // Reset auto-increment value
            $conn->query("ALTER TABLE call_logs AUTO_INCREMENT = 4");
            break;
            
        case 'appointments':
            // Delete test appointments
            $conn->query("DELETE FROM appointments WHERE id > 0");
            
            // Reset auto-increment value
            $conn->query("ALTER TABLE appointments AUTO_INCREMENT = 1");
            break;
            
        case 'campaigns':
            // Delete test campaigns
            $conn->query("DELETE FROM campaign_customers WHERE campaign_id > 1");
            $conn->query("DELETE FROM campaigns WHERE id > 1");
            
            // Reset auto-increment value
            $conn->query("ALTER TABLE campaigns AUTO_INCREMENT = 2");
            break;
            
        default:
            jsonResponse(false, 'Invalid operation', null, 400);
            break;
    }
    
    // Commit transaction if everything went well
    $conn->commit();
    jsonResponse(true, 'Test data deleted successfully', ['operation' => $operation]);
    
} catch (Exception $e) {
    // Rollback if an error occurred
    $conn->rollback();
    jsonResponse(false, 'Error deleting test data: ' . $e->getMessage(), null, 500);
}
?>
