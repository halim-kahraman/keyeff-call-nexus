<?php
namespace KeyEff\CallPanel\Models;

class UserCRUD {
    private $conn;
    
    public function __construct($connection) {
        $this->conn = $connection;
    }
    
    public function create($name, $email, $password, $role, $filiale = null, $filiale_id = null) {
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        
        try {
            $sql = "INSERT INTO users (name, email, password, role, filiale, filiale_id) VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $this->conn->prepare($sql);
            
            if (!$stmt) {
                debugLog("Prepare statement failed: " . $this->conn->error);
                return false;
            }
            
            $stmt->bind_param("sssssi", $name, $email, $hashed_password, $role, $filiale, $filiale_id);
            
            if($stmt->execute()) {
                debugLog("User created successfully", ['email' => $email, 'id' => $this->conn->insert_id]);
                return $this->conn->insert_id;
            } else {
                debugLog("User creation failed", ['email' => $email, 'error' => $stmt->error]);
                return false;
            }
        } catch (Exception $e) {
            debugLog("Exception in create user", ['email' => $email, 'error' => $e->getMessage()]);
            return false;
        }
    }
    
    public function findByEmail($email) {
        try {
            $sql = "SELECT u.*, f.name as filiale_name FROM users u 
                    LEFT JOIN filialen f ON u.filiale_id = f.id 
                    WHERE u.email = ?";
            $stmt = $this->conn->prepare($sql);
            
            if (!$stmt) {
                debugLog("Prepare statement failed: " . $this->conn->error);
                return false;
            }
            
            $stmt->bind_param("s", $email);
            $stmt->execute();
            
            $result = $stmt->get_result();
            
            if($result->num_rows > 0) {
                return $result->fetch_assoc();
            }
        } catch (Exception $e) {
            debugLog("Exception in findByEmail", ['email' => $email, 'error' => $e->getMessage()]);
            return false;
        }
        
        debugLog('User not found', $email);
        return false;
    }
    
    public function findById($id) {
        try {
            $sql = "SELECT u.*, f.name as filiale_name FROM users u 
                    LEFT JOIN filialen f ON u.filiale_id = f.id 
                    WHERE u.id = ?";
            $stmt = $this->conn->prepare($sql);
            
            if (!$stmt) {
                debugLog("Prepare statement failed: " . $this->conn->error);
                return false;
            }
            
            $stmt->bind_param("i", $id);
            $stmt->execute();
            
            $result = $stmt->get_result();
            
            if($result->num_rows > 0) {
                return $result->fetch_assoc();
            }
        } catch (Exception $e) {
            debugLog("Exception in findById", ['id' => $id, 'error' => $e->getMessage()]);
            return false;
        }
        
        return false;
    }
    
    public function getAll() {
        $sql = "SELECT u.id, u.name, u.email, u.role, u.filiale, u.filiale_id, u.avatar, u.created_at, u.updated_at, f.name as filiale_name 
                FROM users u 
                LEFT JOIN filialen f ON u.filiale_id = f.id 
                ORDER BY u.name";
        $result = $this->conn->query($sql);
        
        $users = [];
        
        while($row = $result->fetch_assoc()) {
            $users[] = $row;
        }
        
        return $users;
    }
    
    public function update($id, $name, $email, $role, $filiale, $filiale_id, $avatar) {
        $sql = "UPDATE users SET 
                name = ?, 
                email = ?, 
                role = ?, 
                filiale = ?, 
                filiale_id = ?,
                avatar = ?, 
                updated_at = NOW() 
                WHERE id = ?";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("ssssisi", $name, $email, $role, $filiale, $filiale_id, $avatar, $id);
        
        return $stmt->execute();
    }
    
    public function updatePassword($id, $password) {
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        
        $sql = "UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("si", $hashed_password, $id);
        
        return $stmt->execute();
    }
    
    public function delete($id) {
        $sql = "DELETE FROM users WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $id);
        
        return $stmt->execute();
    }
}
?>
