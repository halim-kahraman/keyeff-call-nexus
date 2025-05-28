
<?php
namespace KeyEff\CallPanel\Models;

require_once __DIR__ . '/../config/database.php';

class User {
    private $conn;
    
    // User properties
    public $id;
    public $name;
    public $email;
    public $password;
    public $role;
    public $filiale;
    public $filiale_id;
    public $avatar;
    public $created_at;
    public $updated_at;
    
    public function __construct() {
        try {
            $this->conn = getConnection();
            
            if (!$this->conn) {
                debugLog("Database connection failed");
                throw new Exception("Database connection failed");
            }
        } catch (Exception $e) {
            debugLog("Database connection exception", $e->getMessage());
            throw $e;
        }
    }
    
    // Create user
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
    
    // Read single user by email
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
                $row = $result->fetch_assoc();
                
                $this->id = $row['id'];
                $this->name = $row['name'];
                $this->email = $row['email'];
                $this->password = $row['password'];
                $this->role = $row['role'];
                $this->filiale = $row['filiale_name'] ?? $row['filiale'];
                $this->filiale_id = $row['filiale_id'];
                $this->avatar = $row['avatar'];
                $this->created_at = $row['created_at'];
                $this->updated_at = $row['updated_at'];
                
                return true;
            }
        } catch (Exception $e) {
            debugLog("Exception in findByEmail", ['email' => $email, 'error' => $e->getMessage()]);
            return false;
        }
        
        debugLog('User not found', $email);
        return false;
    }
    
    // Read single user by ID
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
                $row = $result->fetch_assoc();
                
                $this->id = $row['id'];
                $this->name = $row['name'];
                $this->email = $row['email'];
                $this->password = $row['password'];
                $this->role = $row['role'];
                $this->filiale = $row['filiale_name'] ?? $row['filiale'];
                $this->filiale_id = $row['filiale_id'];
                $this->avatar = $row['avatar'];
                $this->created_at = $row['created_at'];
                $this->updated_at = $row['updated_at'];
                
                return true;
            }
        } catch (Exception $e) {
            debugLog("Exception in findById", ['id' => $id, 'error' => $e->getMessage()]);
            return false;
        }
        
        return false;
    }
    
    // Get all users
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
    
    // Update user
    public function update() {
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
        $stmt->bind_param("ssssisi", $this->name, $this->email, $this->role, $this->filiale, $this->filiale_id, $this->avatar, $this->id);
        
        return $stmt->execute();
    }
    
    // Update password
    public function updatePassword($password) {
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        
        $sql = "UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("si", $hashed_password, $this->id);
        
        if ($stmt->execute()) {
            $this->password = $hashed_password;
            return true;
        }
        
        return false;
    }
    
    // Delete user
    public function delete() {
        $sql = "DELETE FROM users WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $this->id);
        
        return $stmt->execute();
    }
    
    // Validate password
    public function validatePassword($password) {
        debugLog("Validating password", [
            "user_id" => $this->id,
            "provided_password_length" => strlen($password)
        ]);
        
        $result = password_verify($password, $this->password);
        debugLog("Password verification result", $result);
        
        return $result;
    }
    
    // Generate OTP
    public function generateOTP() {
        $otp = sprintf("%06d", mt_rand(100000, 999999));
        
        try {
            $sql = "UPDATE users SET otp = ?, otp_expiry = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE id = ?";
            $stmt = $this->conn->prepare($sql);
            
            if (!$stmt) {
                debugLog("Prepare statement failed: " . $this->conn->error);
                return false;
            }
            
            $stmt->bind_param("si", $otp, $this->id);
            
            if($stmt->execute()) {
                return $otp;
            } else {
                debugLog("OTP update failed", ['error' => $stmt->error]);
                return false;
            }
        } catch (Exception $e) {
            debugLog("Exception in generateOTP", ['error' => $e->getMessage()]);
            return false;
        }
    }
    
    // Verify OTP
    public function verifyOTP($otp) {
        try {
            $sql = "SELECT * FROM users WHERE id = ? AND otp = ? AND otp_expiry > NOW()";
            $stmt = $this->conn->prepare($sql);
            
            if (!$stmt) {
                debugLog("Prepare statement failed: " . $this->conn->error);
                return false;
            }
            
            $stmt->bind_param("is", $this->id, $otp);
            $stmt->execute();
            
            $result = $stmt->get_result();
            
            if($result->num_rows > 0) {
                // Clear OTP after successful verification
                $this->clearOTP();
                return true;
            }
        } catch (Exception $e) {
            debugLog("Exception in verifyOTP", ['error' => $e->getMessage()]);
            return false;
        }
        
        return false;
    }
    
    // Clear OTP
    private function clearOTP() {
        try {
            $sql = "UPDATE users SET otp = NULL, otp_expiry = NULL WHERE id = ?";
            $stmt = $this->conn->prepare($sql);
            
            if (!$stmt) {
                debugLog("Prepare statement failed: " . $this->conn->error);
                return;
            }
            
            $stmt->bind_param("i", $this->id);
            $stmt->execute();
        } catch (Exception $e) {
            debugLog("Exception in clearOTP", ['error' => $e->getMessage()]);
        }
    }
}
?>
