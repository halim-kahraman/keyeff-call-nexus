
<?php
namespace KeyEff\CallPanel\Models;

require_once __DIR__ . '/../config/database.php';

class Customer {
    private $conn;
    
    public $id;
    public $name;
    public $email;
    public $phone;
    public $address;
    public $company;
    public $notes;
    public $priority;
    public $contract_type;
    public $contract_status;
    public $contract_expiry;
    public $last_contact;
    public $filiale_id;
    public $campaign_id;
    public $created_at;
    public $updated_at;
    
    public function __construct() {
        $this->conn = getConnection();
    }
    
    public function getAll($filiale_id = null, $campaign_id = null) {
        $sql = "SELECT c.*, f.name as filiale_name FROM customers c 
                LEFT JOIN filialen f ON c.filiale_id = f.id 
                WHERE 1=1";
        
        $params = [];
        $types = "";
        
        if ($filiale_id) {
            $sql .= " AND c.filiale_id = ?";
            $params[] = $filiale_id;
            $types .= "i";
        }
        
        if ($campaign_id) {
            $sql .= " AND c.campaign_id = ?";
            $params[] = $campaign_id;
            $types .= "i";
        }
        
        $sql .= " ORDER BY c.name";
        
        $stmt = $this->conn->prepare($sql);
        
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        
        $customers = [];
        while($row = $result->fetch_assoc()) {
            $customers[] = $row;
        }
        
        return $customers;
    }
    
    public function getById($id) {
        $sql = "SELECT c.*, f.name as filiale_name FROM customers c 
                LEFT JOIN filialen f ON c.filiale_id = f.id 
                WHERE c.id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        
        $result = $stmt->get_result();
        
        if($result->num_rows > 0) {
            return $result->fetch_assoc();
        }
        
        return null;
    }
    
    public function create($name, $email = null, $phone = null, $address = null, $company = null, $filiale_id = null, $campaign_id = null) {
        $sql = "INSERT INTO customers (name, email, phone, address, company, filiale_id, campaign_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("sssssii", $name, $email, $phone, $address, $company, $filiale_id, $campaign_id);
        
        if($stmt->execute()) {
            return $this->conn->insert_id;
        }
        
        return false;
    }
    
    public function update($id, $name, $email = null, $phone = null, $address = null, $company = null, $notes = null, $priority = null) {
        $sql = "UPDATE customers SET 
                name = ?, 
                email = ?, 
                phone = ?, 
                address = ?, 
                company = ?, 
                notes = ?, 
                priority = ?, 
                updated_at = NOW() 
                WHERE id = ?";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("sssssssi", $name, $email, $phone, $address, $company, $notes, $priority, $id);
        
        return $stmt->execute();
    }
    
    public function delete($id) {
        $sql = "DELETE FROM customers WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $id);
        
        return $stmt->execute();
    }
}
?>
