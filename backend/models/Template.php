
<?php
namespace KeyEff\CallPanel\Models;

require_once __DIR__ . '/../config/database.php';

class Template {
    private $conn;
    
    public $id;
    public $name;
    public $type;
    public $category;
    public $subject;
    public $content;
    public $placeholders;
    public $is_active;
    public $created_at;
    public $updated_at;
    
    public function __construct() {
        $this->conn = getConnection();
    }
    
    public function getAll($type = null) {
        $sql = "SELECT * FROM templates WHERE is_active = 1";
        $params = [];
        $types = "";
        
        if ($type) {
            $sql .= " AND type = ?";
            $params[] = $type;
            $types = "s";
        }
        
        $sql .= " ORDER BY created_at DESC";
        
        $stmt = $this->conn->prepare($sql);
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        $stmt->execute();
        
        $result = $stmt->get_result();
        $templates = [];
        
        while($row = $result->fetch_assoc()) {
            if ($row['placeholders']) {
                $row['placeholders'] = json_decode($row['placeholders'], true);
            }
            $templates[] = $row;
        }
        
        return $templates;
    }
    
    public function getById($id) {
        $sql = "SELECT * FROM templates WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        
        $result = $stmt->get_result();
        
        if($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            if ($row['placeholders']) {
                $row['placeholders'] = json_decode($row['placeholders'], true);
            }
            return $row;
        }
        
        return null;
    }
    
    public function create($name, $type, $category, $subject, $content, $placeholders = null) {
        $sql = "INSERT INTO templates (name, type, category, subject, content, placeholders) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        
        $placeholders_json = $placeholders ? json_encode($placeholders) : null;
        $stmt->bind_param("ssssss", $name, $type, $category, $subject, $content, $placeholders_json);
        
        if($stmt->execute()) {
            return $this->conn->insert_id;
        }
        
        return false;
    }
    
    public function update($id, $name, $type, $category, $subject, $content, $placeholders = null) {
        $sql = "UPDATE templates SET name = ?, type = ?, category = ?, subject = ?, content = ?, placeholders = ?, updated_at = NOW() WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        
        $placeholders_json = $placeholders ? json_encode($placeholders) : null;
        $stmt->bind_param("ssssssi", $name, $type, $category, $subject, $content, $placeholders_json, $id);
        
        return $stmt->execute();
    }
    
    public function delete($id) {
        $sql = "UPDATE templates SET is_active = 0 WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $id);
        
        return $stmt->execute();
    }
}
?>
