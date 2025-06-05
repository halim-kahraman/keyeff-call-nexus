
<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/Customer.php';

use KeyEff\CallPanel\Models\Customer;

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

// Get parameters
$filiale_id = $_GET['filiale_id'] ?? null;
$campaign_id = $_GET['campaign_id'] ?? null;

try {
    // Get customers
    $customer = new Customer();
    $customers = $customer->getAll($filiale_id, $campaign_id);

    // Format the data for frontend
    $formatted_customers = [];
    foreach ($customers as $cust) {
        $formatted_customers[] = [
            'id' => $cust['id'],
            'name' => $cust['name'],
            'company' => $cust['company'],
            'phone' => $cust['phone'],
            'email' => $cust['email'],
            'address' => $cust['address'],
            'contract' => [
                'type' => $cust['contract_type'],
                'status' => $cust['contract_status'],
                'expiryDate' => $cust['contract_expiry']
            ],
            'lastContact' => $cust['last_contact'],
            'priority' => $cust['priority'],
            'notes' => $cust['notes'],
            'filiale_id' => $cust['filiale_id'],
            'filiale_name' => $cust['filiale_name']
        ];
    }

    jsonResponse(true, 'Customers retrieved successfully', $formatted_customers);
} catch (Exception $e) {
    debugLog("Error fetching customers", $e->getMessage());
    jsonResponse(false, 'Error fetching customers: ' . $e->getMessage(), null, 500);
}
?>
