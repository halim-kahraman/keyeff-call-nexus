
<?php
require_once __DIR__ . '/../config/database.php';

class Customer {
    private $conn;
    
    // Customer properties
    public $id;
    public $name;
    public $company;
    public $phone;
    public $contract_type;
    public $contract_status;
    public $contract_expiry;
    public $last_contact;
    public $priority;
    public $notes;
    public $created_at;
    public $updated_at;
    
    public function __construct() {
        $this->conn = getConnection();
    }
    
    // Get all customers
    public function getAll() {
        $sql = "SELECT * FROM customers ORDER BY 
                CASE 
                    WHEN priority = 'high' THEN 1 
                    WHEN priority = 'medium' THEN 2 
                    WHEN priority = 'low' THEN 3 
                    ELSE 4 
                END, 
                contract_expiry ASC";
        
        $result = $this->conn->query($sql);
        $customers = [];
        
        while($row = $result->fetch_assoc()) {
            $customers[] = $row;
        }
        
        return $customers;
    }
    
    // Get single customer
    public function getById($id) {
        $sql = "SELECT * FROM customers WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        
        $result = $stmt->get_result();
        
        if($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            return $row;
        }
        
        return null;
    }
    
    // Update last contact
    public function updateLastContact($id) {
        $sql = "UPDATE customers SET last_contact = NOW(), updated_at = NOW() WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $id);
        
        return $stmt->execute();
    }
    
    // Add call log
    public function addCallLog($id, $user_id, $log_text, $outcome, $duration) {
        $sql = "INSERT INTO call_logs (customer_id, user_id, log_text, outcome, duration) VALUES (?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("iissi", $id, $user_id, $log_text, $outcome, $duration);
        
        if($stmt->execute()) {
            // Update last contact date
            $this->updateLastContact($id);
            return $this->conn->insert_id;
        }
        
        return false;
    }
    
    // Get call logs for customer
    public function getCallLogs($id) {
        $sql = "SELECT cl.*, u.name as user_name 
                FROM call_logs cl 
                JOIN users u ON cl.user_id = u.id 
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
}
?>
