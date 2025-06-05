<?php
namespace KeyEff\CallPanel\Models;

require_once __DIR__ . '/../config/database.php';

class Setting {
    private $conn;
    
    // Setting properties
    public $id;
    public $category;
    public $key;
    public $value;
    public $filiale_id;
    public $created_at;
    public $updated_at;
    
    public function __construct() {
        $this->conn = getConnection();
    }
    
    // Create or update setting
    public function save($category, $key, $value, $filiale_id = null) {
        // Check if setting exists
        $sql = "SELECT id FROM settings WHERE category = ? AND `key` = ? AND (filiale_id = ? OR (filiale_id IS NULL AND ? IS NULL))";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("ssii", $category, $key, $filiale_id, $filiale_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if($result->num_rows > 0) {
            // Update existing setting
            $row = $result->fetch_assoc();
            $id = $row['id'];
            
            $sql = "UPDATE settings SET value = ?, updated_at = NOW() WHERE id = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("si", $value, $id);
            
            return $stmt->execute();
        } else {
            // Create new setting
            $sql = "INSERT INTO settings (category, `key`, value, filiale_id) VALUES (?, ?, ?, ?)";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("sssi", $category, $key, $value, $filiale_id);
            
            return $stmt->execute();
        }
    }
    
    // Get setting by key
    public function get($category, $key, $filiale_id = null) {
        $sql = "SELECT * FROM settings WHERE category = ? AND `key` = ? AND (filiale_id = ? OR (filiale_id IS NULL AND ? IS NULL))";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("ssii", $category, $key, $filiale_id, $filiale_id);
        $stmt->execute();
        
        $result = $stmt->get_result();
        
        if($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            return $row['value'];
        }
        
        return null;
    }
    
    // Get all settings by category
    public function getAllByCategory($category, $filiale_id = null) {
        $sql = "SELECT * FROM settings WHERE category = ? AND (filiale_id = ? OR (filiale_id IS NULL AND ? IS NULL))";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("sii", $category, $filiale_id, $filiale_id);
        $stmt->execute();
        
        $result = $stmt->get_result();
        $settings = [];
        
        while($row = $result->fetch_assoc()) {
            $settings[$row['key']] = $row['value'];
        }
        
        return $settings;
    }
    
    // Delete setting
    public function delete($category, $key, $filiale_id = null) {
        $sql = "DELETE FROM settings WHERE category = ? AND `key` = ? AND (filiale_id = ? OR (filiale_id IS NULL AND ? IS NULL))";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("ssii", $category, $key, $filiale_id, $filiale_id);
        
        return $stmt->execute();
    }
}
?>
