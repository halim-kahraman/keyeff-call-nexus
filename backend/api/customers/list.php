
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

try {
    // Get customers
    $customer = new Customer();
    $customers = $customer->getAll();

    // Format the data for frontend
    $formatted_customers = [];
    foreach ($customers as $cust) {
        $formatted_customers[] = [
            'id' => $cust['id'],
            'name' => $cust['name'],
            'company' => $cust['company'],
            'phone' => $cust['phone'],
            'contract' => [
                'type' => $cust['contract_type'],
                'status' => $cust['contract_status'],
                'expiryDate' => $cust['contract_expiry']
            ],
            'lastContact' => $cust['last_contact'],
            'priority' => $cust['priority'],
            'notes' => $cust['notes']
        ];
    }

    jsonResponse(true, 'Customers retrieved successfully', $formatted_customers);
} catch (Exception $e) {
    debugLog("Error fetching customers", $e->getMessage());
    jsonResponse(false, 'Error fetching customers: ' . $e->getMessage(), null, 500);
}
?>
