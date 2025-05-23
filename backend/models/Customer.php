
<?php
require_once __DIR__ . '/../config/database.php';

class Customer {
    private $conn;
    
    // Customer properties
    public $id;
    public $name;
    public $company;
    public $email;
    public $address;
    public $city;
    public $postal_code;
    public $priority;
    public $notes;
    public $filiale_id;
    public $campaign_id;
    public $last_contact;
    public $created_at;
    public $updated_at;
    
    public function __construct() {
        $this->conn = getConnection();
    }
    
    // Get all customers
    public function getAll($filiale_id = null) {
        $where_clause = $filiale_id ? "WHERE c.filiale_id = ?" : "";
        
        $sql = "SELECT c.*, 
                (SELECT GROUP_CONCAT(cc.id) FROM customer_contracts cc WHERE cc.customer_id = c.id) as contract_ids,
                (SELECT GROUP_CONCAT(cc.contract_type) FROM customer_contracts cc WHERE cc.customer_id = c.id) as contract_types,
                (SELECT GROUP_CONCAT(cc.contract_status) FROM customer_contracts cc WHERE cc.customer_id = c.id) as contract_statuses,
                (SELECT GROUP_CONCAT(cc.contract_expiry) FROM customer_contracts cc WHERE cc.customer_id = c.id) as contract_expiry_dates,
                (SELECT GROUP_CONCAT(cont.phone) FROM customer_contacts cont WHERE cont.customer_id = c.id AND cont.is_primary = 1) as primary_phones
                FROM customers c
                $where_clause
                ORDER BY 
                CASE 
                    WHEN priority = 'high' THEN 1 
                    WHEN priority = 'medium' THEN 2 
                    WHEN priority = 'low' THEN 3 
                    ELSE 4 
                END, 
                last_contact ASC";
        
        $stmt = $this->conn->prepare($sql);
        
        if ($filiale_id) {
            $stmt->bind_param("i", $filiale_id);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        $customers = [];
        
        while($row = $result->fetch_assoc()) {
            $customers[] = $row;
        }
        
        return $customers;
    }
    
    // Get customers by campaign
    public function getByFiliale($filiale_id) {
        return $this->getAll($filiale_id);
    }
    
    // Get customers by campaign
    public function getByCampaign($campaign_id) {
        $sql = "SELECT c.*, 
                cc.status as campaign_status,
                (SELECT GROUP_CONCAT(cont.id) FROM customer_contracts cont WHERE cont.customer_id = c.id) as contract_ids,
                (SELECT GROUP_CONCAT(cont.contract_type) FROM customer_contracts cont WHERE cont.customer_id = c.id) as contract_types,
                (SELECT GROUP_CONCAT(cont.contract_status) FROM customer_contracts cont WHERE cont.customer_id = c.id) as contract_statuses,
                (SELECT GROUP_CONCAT(cont.contract_expiry) FROM customer_contracts cont WHERE cont.customer_id = c.id) as contract_expiry_dates,
                (SELECT GROUP_CONCAT(phone.phone) FROM customer_contacts phone WHERE phone.customer_id = c.id AND phone.is_primary = 1) as primary_phones
                FROM customers c
                JOIN campaign_customers cc ON c.id = cc.customer_id
                WHERE cc.campaign_id = ?
                ORDER BY 
                CASE 
                    WHEN c.priority = 'high' THEN 1 
                    WHEN c.priority = 'medium' THEN 2 
                    WHEN c.priority = 'low' THEN 3 
                    ELSE 4 
                END, 
                cc.status ASC, c.last_contact ASC";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $campaign_id);
        $stmt->execute();
        
        $result = $stmt->get_result();
        $customers = [];
        
        while($row = $result->fetch_assoc()) {
            $customers[] = $row;
        }
        
        return $customers;
    }
    
    // Get single customer with all details
    public function getById($id) {
        $sql = "SELECT c.* FROM customers c WHERE c.id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        
        $result = $stmt->get_result();
        
        if($result->num_rows > 0) {
            $customer = $result->fetch_assoc();
            
            // Get contracts
            $sql = "SELECT * FROM customer_contracts WHERE customer_id = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $contracts_result = $stmt->get_result();
            
            $customer['contracts'] = [];
            while($contract = $contracts_result->fetch_assoc()) {
                $customer['contracts'][] = $contract;
            }
            
            // Get contact numbers
            $sql = "SELECT * FROM customer_contacts WHERE customer_id = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $contacts_result = $stmt->get_result();
            
            $customer['contacts'] = [];
            while($contact = $contacts_result->fetch_assoc()) {
                $customer['contacts'][] = $contact;
            }
            
            return $customer;
        }
        
        return null;
    }
    
    // Get customer contacts
    public function getCustomerContacts($customer_id) {
        $sql = "SELECT * FROM customer_contacts WHERE customer_id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $customer_id);
        $stmt->execute();
        
        $result = $stmt->get_result();
        $contacts = [];
        
        while($row = $result->fetch_assoc()) {
            $contacts[] = $row;
        }
        
        return $contacts;
    }
    
    // Get customer contracts
    public function getCustomerContracts($customer_id) {
        $sql = "SELECT * FROM customer_contracts WHERE customer_id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $customer_id);
        $stmt->execute();
        
        $result = $stmt->get_result();
        $contracts = [];
        
        while($row = $result->fetch_assoc()) {
            $contracts[] = $row;
        }
        
        return $contracts;
    }
    
    // Update last contact
    public function updateLastContact($id) {
        $sql = "UPDATE customers SET last_contact = NOW(), updated_at = NOW() WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $id);
        
        return $stmt->execute();
    }
    
    // Add call log
    public function addCallLog($id, $user_id, $log_text, $outcome, $duration, $contract_id = null, $contact_id = null, $campaign_id = null) {
        $sql = "INSERT INTO call_logs (customer_id, user_id, contract_id, contact_id, campaign_id, log_text, outcome, duration) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("iiiiissi", $id, $user_id, $contract_id, $contact_id, $campaign_id, $log_text, $outcome, $duration);
        
        if($stmt->execute()) {
            // Update last contact date
            $this->updateLastContact($id);
            return $this->conn->insert_id;
        }
        
        return false;
    }
    
    // Get call logs for customer
    public function getCallLogs($id) {
        $sql = "SELECT cl.*, u.name as user_name,
                cc.contract_type, cc.contract_number,
                cont.phone, cont.contact_type
                FROM call_logs cl 
                JOIN users u ON cl.user_id = u.id 
                LEFT JOIN customer_contracts cc ON cl.contract_id = cc.id
                LEFT JOIN customer_contacts cont ON cl.contact_id = cont.id
                WHERE cl.customer_id = ? 
                ORDER BY cl.created_at DESC";
                
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        
        $result = $stmt->get_result();
        $logs = [];
        
        while($row = $result->fetch_assoc()) {
            $logs[] = $row;
        }
        
        return $logs;
    }
    
    // Import customers from CSV or Excel
    public function importCustomers($data, $filiale_id, $campaign_id, $user_id, $import_type) {
        $import_log_sql = "INSERT INTO import_logs (user_id, import_type, file_name, campaign_id, total_records) VALUES (?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($import_log_sql);
        $filename = $data['filename'] ?? 'manual-import';
        $total = count($data['customers'] ?? []);
        
        $stmt->bind_param("isiii", $user_id, $import_type, $filename, $campaign_id, $total);
        $stmt->execute();
        $import_id = $this->conn->insert_id;
        
        $success = 0;
        $failed = 0;
        $errors = [];
        
        // Begin transaction
        $this->conn->begin_transaction();
        
        try {
            foreach ($data['customers'] as $customer) {
                // Insert customer
                $customer_sql = "INSERT INTO customers (name, company, email, address, city, postal_code, notes, priority, filiale_id, campaign_id, imported_by, import_source) 
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                                
                $customer_stmt = $this->conn->prepare($customer_sql);
                $source = $import_type;
                $customer_stmt->bind_param("ssssssssiiis", 
                    $customer['name'], 
                    $customer['company'], 
                    $customer['email'], 
                    $customer['address'], 
                    $customer['city'], 
                    $customer['postal_code'], 
                    $customer['notes'], 
                    $customer['priority'],
                    $filiale_id,
                    $campaign_id,
                    $user_id,
                    $source
                );
                
                if ($customer_stmt->execute()) {
                    $customer_id = $this->conn->insert_id;
                    
                    // Insert contract if provided
                    if (!empty($customer['contract_type'])) {
                        $contract_sql = "INSERT INTO customer_contracts (customer_id, contract_number, contract_type, contract_status, contract_start, contract_expiry, monthly_value, primary_contact) 
                                        VALUES (?, ?, ?, ?, ?, ?, ?, 1)";
                                        
                        $contract_stmt = $this->conn->prepare($contract_sql);
                        $contract_stmt->bind_param("isssssd", 
                            $customer_id,
                            $customer['contract_number'] ?? '',
                            $customer['contract_type'],
                            $customer['contract_status'] ?? 'Aktiv',
                            $customer['contract_start'] ?? NULL,
                            $customer['contract_expiry'] ?? NULL,
                            $customer['monthly_value'] ?? 0
                        );
                        
                        $contract_stmt->execute();
                        $contract_id = $this->conn->insert_id;
                        
                        // Insert primary phone
                        if (!empty($customer['phone'])) {
                            $phone_sql = "INSERT INTO customer_contacts (customer_id, contract_id, phone, contact_type, is_primary) 
                                        VALUES (?, ?, ?, 'Hauptnummer', 1)";
                                        
                            $phone_stmt = $this->conn->prepare($phone_sql);
                            $phone_stmt->bind_param("iis", $customer_id, $contract_id, $customer['phone']);
                            $phone_stmt->execute();
                        }
                        
                        // Insert mobile phone if provided
                        if (!empty($customer['mobile_phone'])) {
                            $mobile_sql = "INSERT INTO customer_contacts (customer_id, contract_id, phone, contact_type, is_primary) 
                                        VALUES (?, ?, ?, 'Mobil', 0)";
                                        
                            $mobile_stmt = $this->conn->prepare($mobile_sql);
                            $mobile_stmt->bind_param("iis", $customer_id, $contract_id, $customer['mobile_phone']);
                            $mobile_stmt->execute();
                        }
                    } else {
                        // No contract, but still insert phone if provided
                        if (!empty($customer['phone'])) {
                            $phone_sql = "INSERT INTO customer_contacts (customer_id, phone, contact_type, is_primary) 
                                        VALUES (?, ?, 'Hauptnummer', 1)";
                                        
                            $phone_stmt = $this->conn->prepare($phone_sql);
                            $phone_stmt->bind_param("is", $customer_id, $customer['phone']);
                            $phone_stmt->execute();
                        }
                    }
                    
                    // Link to campaign if campaign_id provided
                    if ($campaign_id) {
                        $campaign_sql = "INSERT INTO campaign_customers (campaign_id, customer_id) VALUES (?, ?)";
                        $campaign_stmt = $this->conn->prepare($campaign_sql);
                        $campaign_stmt->bind_param("ii", $campaign_id, $customer_id);
                        $campaign_stmt->execute();
                    }
                    
                    $success++;
                } else {
                    $failed++;
                    $errors[] = "Error inserting customer: " . $customer['name'] . " - " . $this->conn->error;
                }
            }
            
            // Commit transaction if no errors
            $this->conn->commit();
            
            // Update import log
            $update_log_sql = "UPDATE import_logs SET completed_at = NOW(), successful_records = ?, failed_records = ?, error_details = ? WHERE id = ?";
            $error_details = !empty($errors) ? json_encode($errors) : NULL;
            $update_stmt = $this->conn->prepare($update_log_sql);
            $update_stmt->bind_param("iisi", $success, $failed, $error_details, $import_id);
            $update_stmt->execute();
            
            return [
                'success' => true,
                'imported' => $success,
                'failed' => $failed,
                'errors' => $errors
            ];
            
        } catch (Exception $e) {
            // Roll back transaction on error
            $this->conn->rollback();
            
            // Update import log with error
            $update_log_sql = "UPDATE import_logs SET completed_at = NOW(), successful_records = 0, failed_records = ?, error_details = ? WHERE id = ?";
            $error_msg = "Transaction failed: " . $e->getMessage();
            $update_stmt = $this->conn->prepare($update_log_sql);
            $update_stmt->bind_param("isi", $total, $error_msg, $import_id);
            $update_stmt->execute();
            
            return [
                'success' => false,
                'imported' => 0,
                'failed' => $total,
                'errors' => [$error_msg]
            ];
        }
    }
}
?>
