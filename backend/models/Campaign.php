
<?php
require_once __DIR__ . '/../config/database.php';

class Campaign {
    private $conn;
    
    // Campaign properties
    public $id;
    public $name;
    public $description;
    public $filiale_id;
    public $start_date;
    public $end_date;
    public $status;
    public $created_by;
    public $created_at;
    public $updated_at;
    
    public function __construct() {
        $this->conn = getConnection();
    }
    
    // Get all campaigns
    public function getAll() {
        $sql = "SELECT 
                c.*, 
                u.name as created_by_name,
                f.name as filiale_name,
                (SELECT COUNT(*) FROM campaign_customers cc WHERE cc.campaign_id = c.id) as customer_count,
                (SELECT COUNT(*) FROM campaign_customers cc WHERE cc.campaign_id = c.id AND cc.status = 'Completed') as completed_count
                FROM campaigns c
                LEFT JOIN users u ON c.created_by = u.id
                LEFT JOIN filialen f ON c.filiale_id = f.id
                ORDER BY c.created_at DESC";
        
        $result = $this->conn->query($sql);
        $campaigns = [];
        
        while($row = $result->fetch_assoc()) {
            // Calculate completion percentage
            $row['completion'] = $row['customer_count'] > 0 ? round(($row['completed_count'] / $row['customer_count']) * 100) : 0;
            $campaigns[] = $row;
        }
        
        return $campaigns;
    }
    
    // Get campaigns by filiale
    public function getByFiliale($filiale_id) {
        $sql = "SELECT 
                c.*, 
                u.name as created_by_name,
                f.name as filiale_name,
                (SELECT COUNT(*) FROM campaign_customers cc WHERE cc.campaign_id = c.id) as customer_count,
                (SELECT COUNT(*) FROM campaign_customers cc WHERE cc.campaign_id = c.id AND cc.status = 'Completed') as completed_count
                FROM campaigns c
                LEFT JOIN users u ON c.created_by = u.id
                LEFT JOIN filialen f ON c.filiale_id = f.id
                WHERE c.filiale_id = ? OR c.filiale_id IS NULL
                ORDER BY c.created_at DESC";
                
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $filiale_id);
        $stmt->execute();
        
        $result = $stmt->get_result();
        $campaigns = [];
        
        while($row = $result->fetch_assoc()) {
            // Calculate completion percentage
            $row['completion'] = $row['customer_count'] > 0 ? round(($row['completed_count'] / $row['customer_count']) * 100) : 0;
            $campaigns[] = $row;
        }
        
        return $campaigns;
    }
    
    // Get single campaign with all details
    public function getById($id) {
        $sql = "SELECT 
                c.*, 
                u.name as created_by_name,
                f.name as filiale_name
                FROM campaigns c
                LEFT JOIN users u ON c.created_by = u.id
                LEFT JOIN filialen f ON c.filiale_id = f.id
                WHERE c.id = ?";
                
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        
        $result = $stmt->get_result();
        
        if($result->num_rows > 0) {
            $campaign = $result->fetch_assoc();
            
            // Get customer count
            $sql = "SELECT COUNT(*) as count FROM campaign_customers WHERE campaign_id = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $count_result = $stmt->get_result();
            $count_row = $count_result->fetch_assoc();
            $campaign['customer_count'] = $count_row['count'];
            
            // Get completion count and percentage
            $sql = "SELECT COUNT(*) as count FROM campaign_customers WHERE campaign_id = ? AND status = 'Completed'";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $completed_result = $stmt->get_result();
            $completed_row = $completed_result->fetch_assoc();
            $campaign['completed_count'] = $completed_row['count'];
            $campaign['completion'] = $campaign['customer_count'] > 0 ? round(($campaign['completed_count'] / $campaign['customer_count']) * 100) : 0;
            
            return $campaign;
        }
        
        return null;
    }
    
    // Get customers in campaign
    public function getCustomers($campaign_id) {
        $sql = "SELECT 
                c.*,
                cc.status as campaign_status,
                cc.assigned_to,
                u.name as assigned_user_name,
                (SELECT GROUP_CONCAT(contract.id) FROM customer_contracts contract WHERE contract.customer_id = c.id) as contract_ids,
                (SELECT GROUP_CONCAT(contract.contract_type) FROM customer_contracts contract WHERE contract.customer_id = c.id) as contract_types,
                (SELECT GROUP_CONCAT(contract.contract_status) FROM customer_contracts contract WHERE contract.customer_id = c.id) as contract_statuses,
                (SELECT GROUP_CONCAT(contract.contract_expiry) FROM customer_contracts contract WHERE contract.customer_id = c.id) as contract_expiry_dates,
                (SELECT GROUP_CONCAT(contact.phone) FROM customer_contacts contact WHERE contact.customer_id = c.id AND contact.is_primary = 1) as primary_phones
                FROM customers c
                JOIN campaign_customers cc ON c.id = cc.customer_id
                LEFT JOIN users u ON cc.assigned_to = u.id
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
    
    // Create a new campaign
    public function create($name, $description, $filiale_id, $created_by) {
        $sql = "INSERT INTO campaigns (name, description, filiale_id, created_by) VALUES (?, ?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("ssis", $name, $description, $filiale_id, $created_by);
        
        if($stmt->execute()) {
            return $this->conn->insert_id;
        }
        
        return false;
    }
    
    // Update campaign
    public function update($id, $name, $description, $status, $start_date, $end_date) {
        $sql = "UPDATE campaigns SET name = ?, description = ?, status = ?, start_date = ?, end_date = ?, updated_at = NOW() WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("sssssi", $name, $description, $status, $start_date, $end_date, $id);
        
        return $stmt->execute();
    }
    
    // Add customer to campaign
    public function addCustomer($campaign_id, $customer_id, $assigned_to = null) {
        // Check if already exists
        $check_sql = "SELECT 1 FROM campaign_customers WHERE campaign_id = ? AND customer_id = ?";
        $check_stmt = $this->conn->prepare($check_sql);
        $check_stmt->bind_param("ii", $campaign_id, $customer_id);
        $check_stmt->execute();
        
        if($check_stmt->get_result()->num_rows > 0) {
            // Already exists, update assigned_to if provided
            if($assigned_to !== null) {
                $update_sql = "UPDATE campaign_customers SET assigned_to = ? WHERE campaign_id = ? AND customer_id = ?";
                $update_stmt = $this->conn->prepare($update_sql);
                $update_stmt->bind_param("iii", $assigned_to, $campaign_id, $customer_id);
                return $update_stmt->execute();
            }
            return true;
        }
        
        // Insert new record
        $sql = "INSERT INTO campaign_customers (campaign_id, customer_id, assigned_to) VALUES (?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("iii", $campaign_id, $customer_id, $assigned_to);
        
        return $stmt->execute();
    }
    
    // Update customer status in campaign
    public function updateCustomerStatus($campaign_id, $customer_id, $status) {
        $sql = "UPDATE campaign_customers SET status = ? WHERE campaign_id = ? AND customer_id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("sii", $status, $campaign_id, $customer_id);
        
        return $stmt->execute();
    }
    
    // Remove customer from campaign
    public function removeCustomer($campaign_id, $customer_id) {
        $sql = "DELETE FROM campaign_customers WHERE campaign_id = ? AND customer_id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("ii", $campaign_id, $customer_id);
        
        return $stmt->execute();
    }
}
?>
