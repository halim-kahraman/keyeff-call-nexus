
<?php
namespace KeyEff\CallPanel\Models;

require_once __DIR__ . '/../config/database.php';

class FilialeSetting {
    private $conn;
    
    public $id;
    public $filiale_id;
    public $setting_key;
    public $setting_value;
    public $created_at;
    public $updated_at;
    
    public function __construct() {
        $this->conn = getConnection();
    }
    
    // Create or update filiale setting
    public function save($filiale_id, $setting_key, $setting_value) {
        // Check if setting exists
        $sql = "SELECT id FROM filiale_settings WHERE filiale_id = ? AND setting_key = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("is", $filiale_id, $setting_key);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if($result->num_rows > 0) {
            // Update existing setting
            $row = $result->fetch_assoc();
            $id = $row['id'];
            
            $sql = "UPDATE filiale_settings SET setting_value = ?, updated_at = NOW() WHERE id = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("si", $setting_value, $id);
            
            return $stmt->execute();
        } else {
            // Create new setting
            $sql = "INSERT INTO filiale_settings (filiale_id, setting_key, setting_value) VALUES (?, ?, ?)";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("iss", $filiale_id, $setting_key, $setting_value);
            
            return $stmt->execute();
        }
    }
    
    // Get setting by key for specific filiale
    public function get($filiale_id, $setting_key) {
        $sql = "SELECT setting_value FROM filiale_settings WHERE filiale_id = ? AND setting_key = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("is", $filiale_id, $setting_key);
        $stmt->execute();
        
        $result = $stmt->get_result();
        
        if($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            return $row['setting_value'];
        }
        
        return null;
    }
    
    // Get all settings for specific filiale by category
    public function getAllByCategory($filiale_id, $category) {
        $sql = "SELECT setting_key, setting_value FROM filiale_settings WHERE filiale_id = ? AND setting_key LIKE ?";
        $stmt = $this->conn->prepare($sql);
        $category_pattern = $category . '_%';
        $stmt->bind_param("is", $filiale_id, $category_pattern);
        $stmt->execute();
        
        $result = $stmt->get_result();
        $settings = [];
        
        while($row = $result->fetch_assoc()) {
            // Remove category prefix from key
            $key = str_replace($category . '_', '', $row['setting_key']);
            $settings[$key] = $row['setting_value'];
        }
        
        return $settings;
    }
    
    // Get all settings for specific filiale
    public function getAllForFiliale($filiale_id) {
        $sql = "SELECT setting_key, setting_value FROM filiale_settings WHERE filiale_id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $filiale_id);
        $stmt->execute();
        
        $result = $stmt->get_result();
        $settings = [];
        
        while($row = $result->fetch_assoc()) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }
        
        return $settings;
    }
    
    // Delete setting
    public function delete($filiale_id, $setting_key) {
        $sql = "DELETE FROM filiale_settings WHERE filiale_id = ? AND setting_key = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("is", $filiale_id, $setting_key);
        
        return $stmt->execute();
    }
}
?>
