
<?php
require_once __DIR__ . '/../config/database.php';

class Filiale {
    private $conn;
    
    public $id;
    public $name;
    public $address;
    public $created_at;
    public $updated_at;
    
    public function __construct() {
        $this->conn = getConnection();
    }
    
    public function getAll() {
        $sql = "SELECT * FROM filialen ORDER BY name";
        $result = $this->conn->query($sql);
        
        $filialen = [];
        
        while($row = $result->fetch_assoc()) {
            $filialen[] = $row;
        }
        
        return $filialen;
    }
    
    public function getById($id) {
        $sql = "SELECT * FROM filialen WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        
        $result = $stmt->get_result();
        
        if($result->num_rows > 0) {
            return $result->fetch_assoc();
        }
        
        return null;
    }
    
    public function create($name, $address) {
        $sql = "INSERT INTO filialen (name, address) VALUES (?, ?)";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("ss", $name, $address);
        
        if($stmt->execute()) {
            return $this->conn->insert_id;
        }
        
        return false;
    }
    
    public function update($id, $name, $address) {
        $sql = "UPDATE filialen SET name = ?, address = ?, updated_at = NOW() WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("ssi", $name, $address, $id);
        
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
