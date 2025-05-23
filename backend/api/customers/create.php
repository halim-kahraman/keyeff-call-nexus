
<?php
// Include required files
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/Customer.php';

// Get request headers
$headers = getallheaders();
$token = null;

// Extract token from Authorization header
if (isset($headers['Authorization'])) {
    $auth = $headers['Authorization'];
    if (strpos($auth, 'Bearer ') === 0) {
        $token = substr($auth, 7);
    }
}

// Check if user is authenticated
if (!$token) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized: No token provided'
    ]);
    exit;
}

// Get the request method
$method = $_SERVER['REQUEST_METHOD'];

// Handle POST request to create a new customer
if ($method === 'POST') {
    // Get the JSON data from the request body
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    // Validate required fields
    if (!isset($data['name']) || empty($data['name'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Name ist ein Pflichtfeld'
        ]);
        exit;
    }
    
    try {
        // Initialize the Customer model
        $customer = new Customer();
        
        // Create the customer
        $result = $customer->createCustomer([
            'name' => $data['name'],
            'company' => $data['company'] ?? '',
            'email' => $data['email'] ?? '',
            'phone' => $data['phone'] ?? '',
            'mobile_phone' => $data['mobile_phone'] ?? '',
            'address' => $data['address'] ?? '',
            'city' => $data['city'] ?? '',
            'postal_code' => $data['postal_code'] ?? '',
            'notes' => $data['notes'] ?? '',
            'priority' => $data['priority'] ?? 'medium',
            'filiale_id' => $data['filiale_id'] ?? null,
            'campaign_id' => $data['campaign_id'] ?? null
        ]);
        
        if ($result) {
            // Return success response
            echo json_encode([
                'success' => true,
                'message' => 'Kunde erfolgreich angelegt',
                'data' => [
                    'id' => $result
                ]
            ]);
        } else {
            // Return error response
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Fehler beim Anlegen des Kunden'
            ]);
        }
    } catch (Exception $e) {
        // Return error response
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Server error: ' . $e->getMessage()
        ]);
    }
} else {
    // Return error for unsupported methods
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method Not Allowed'
    ]);
}
?>
