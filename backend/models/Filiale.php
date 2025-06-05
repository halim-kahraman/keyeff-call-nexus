<?php
namespace KeyEff\CallPanel\Models;

require_once __DIR__ . '/../config/database.php';

class Filiale {
    private $conn;
    
    public $id;
    public $name;
    public $address;
    public $city;
    public $postal_code;
    public $phone;
    public $email;
    public $manager_id;
    public $status;
    public $created_at;
    public $updated_at;
    
    public function __construct() {
        $this->conn = getConnection();
    }
    
    public function getAll() {
        $sql = "SELECT f.*, u.name as manager_name FROM filialen f 
                LEFT JOIN users u ON f.manager_id = u.id 
                ORDER BY f.name";
        $result = $this->conn->query($sql);
        
        $filialen = [];
        
        while($row = $result->fetch_assoc()) {
            $filialen[] = $row;
        }
        
        return $filialen;
    }
    
    public function getById($id) {
        $sql = "SELECT f.*, u.name as manager_name FROM filialen f 
                LEFT JOIN users u ON f.manager_id = u.id 
                WHERE f.id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        
        $result = $stmt->get_result();
        
        if($result->num_rows > 0) {
            return $result->fetch_assoc();
        }
        
        return null;
    }
    
    public function create($name, $address, $city = null, $postal_code = null, $phone = null, $email = null, $manager_id = null, $status = 'active') {
        $sql = "INSERT INTO filialen (name, address, city, postal_code, phone, email, manager_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("sssssiis", $name, $address, $city, $postal_code, $phone, $email, $manager_id, $status);
        
        if($stmt->execute()) {
            return $this->conn->insert_id;
        }
        
        return false;
    }
    
    public function update($id, $name, $address, $city = null, $postal_code = null, $phone = null, $email = null, $manager_id = null, $status = 'active') {
        $sql = "UPDATE filialen SET name = ?, address = ?, city = ?, postal_code = ?, phone = ?, email = ?, manager_id = ?, status = ?, updated_at = NOW() WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("sssssiisi", $name, $address, $city, $postal_code, $phone, $email, $manager_id, $status, $id);
        
        return $stmt->execute();
    }
    
    public function delete($id) {
        $sql = "DELETE FROM filialen WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $id);
        
        return $stmt->execute();
    }
}
?>
