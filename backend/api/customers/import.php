
<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../models/Customer.php';

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

// Only admin and filialleiter can import customers
if (!in_array($payload['role'], ['admin', 'filialleiter'])) {
    jsonResponse(false, 'Insufficient permissions', null, 403);
}

// Check if file was uploaded
if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    jsonResponse(false, 'No file uploaded or upload error', null, 400);
}

// Get request data
$filiale_id = $_POST['filiale_id'] ?? null;
$campaign_id = $_POST['campaign_id'] ?? null;
$create_campaign = isset($_POST['create_campaign']) ? filter_var($_POST['create_campaign'], FILTER_VALIDATE_BOOLEAN) : false;
$campaign_name = $_POST['campaign_name'] ?? null;
$campaign_desc = $_POST['campaign_description'] ?? null;

// Validate input
if (!$filiale_id) {
    jsonResponse(false, 'Filiale ID is required', null, 400);
}

// If creating a new campaign, validate campaign name
if ($create_campaign && !$campaign_name) {
    jsonResponse(false, 'Campaign name is required', null, 400);
}

// Determine file type and process accordingly
$file_tmp = $_FILES['file']['tmp_name'];
$file_name = $_FILES['file']['name'];
$file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));

// Create a new campaign if requested
if ($create_campaign) {
    // Create the campaign
    $db = getConnection();
    $sql = "INSERT INTO campaigns (name, description, filiale_id, created_by) VALUES (?, ?, ?, ?)";
    $stmt = $db->prepare($sql);
    $stmt->bind_param("ssii", $campaign_name, $campaign_desc, $filiale_id, $payload['user_id']);
    
    if (!$stmt->execute()) {
        jsonResponse(false, 'Failed to create campaign', null, 500);
    }
    
    $campaign_id = $stmt->insert_id;
    $db->close();
}

// Process the file
$customer_data = [];
$import_type = '';

if ($file_ext === 'csv') {
    $import_type = 'csv';
    if (($handle = fopen($file_tmp, "r")) !== FALSE) {
        $headers = fgetcsv($handle, 1000, ",");
        while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
            $customer = [];
            foreach ($headers as $i => $header) {
                if (isset($data[$i])) {
                    $customer[trim(strtolower($header))] = $data[$i];
                }
            }
            $customer_data[] = $customer;
        }
        fclose($handle);
    }
} elseif (in_array($file_ext, ['xlsx', 'xls'])) {
    $import_type = 'excel';
    require_once __DIR__ . '/../../vendor/autoload.php';
    
    $reader = new \PhpOffice\PhpSpreadsheet\Reader\Xlsx();
    $spreadsheet = $reader->load($file_tmp);
    $worksheet = $spreadsheet->getActiveSheet();
    $rows = $worksheet->toArray();
    
    // First row is headers
    $headers = array_map('strtolower', array_map('trim', $rows[0]));
    
    for ($i = 1; $i < count($rows); $i++) {
        $customer = [];
        foreach ($headers as $j => $header) {
            if (isset($rows[$i][$j])) {
                $customer[$header] = $rows[$i][$j];
            }
        }
        if (!empty($customer['name'])) { // Only add if the customer has a name
            $customer_data[] = $customer;
        }
    }
} else {
    jsonResponse(false, 'Unsupported file format', null, 400);
}

// Process the data
$customer = new Customer();
$result = $customer->importCustomers([
    'filename' => $file_name,
    'customers' => $customer_data
], $filiale_id, $campaign_id, $payload['user_id'], $import_type);

// Log the action
$log = new Log();
$log->create(
    $payload['user_id'],
    'import_customers',
    'customers',
    null,
    "User imported " . count($customer_data) . " customers from $file_name" . ($campaign_id ? " to campaign $campaign_id" : "")
);

jsonResponse($result['success'], $result['success'] ? 'Customers imported successfully' : 'Import failed', [
    'imported' => $result['imported'],
    'failed' => $result['failed'],
    'errors' => $result['errors'],
    'campaign_id' => $campaign_id
]);
?>
