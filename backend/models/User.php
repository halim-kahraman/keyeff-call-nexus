
<?php
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
    public $avatar;
    public $created_at;
    public $updated_at;
    
    public function __construct() {
        $this->conn = getConnection();
    }
    
    // Create user
    public function create($name, $email, $password, $role, $filiale = null) {
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        
        $sql = "INSERT INTO users (name, email, password, role, filiale) VALUES (?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("sssss", $name, $email, $hashed_password, $role, $filiale);
        
        if($stmt->execute()) {
            return $this->conn->insert_id;
        }
        
        return false;
    }
    
    // Read single user by email
    public function findByEmail($email) {
        $sql = "SELECT * FROM users WHERE email = ?";
        $stmt = $this->conn->prepare($sql);
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
            $this->filiale = $row['filiale'];
            $this->avatar = $row['avatar'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            
            return true;
        }
        
        return false;
    }
    
    // Read single user by ID
    public function findById($id) {
        $sql = "SELECT * FROM users WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
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
            $this->filiale = $row['filiale'];
            $this->avatar = $row['avatar'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            
            return true;
        }
        
        return false;
    }
    
    // Get all users
    public function getAll() {
        $sql = "SELECT id, name, email, role, filiale, avatar, created_at, updated_at FROM users";
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
                avatar = ?, 
                updated_at = NOW() 
                WHERE id = ?";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("sssssi", $this->name, $this->email, $this->role, $this->filiale, $this->avatar, $this->id);
        
        return $stmt->execute();
    }
    
    // Update password
    public function updatePassword($password) {
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        
        $sql = "UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("si", $hashed_password, $this->id);
        
        return $stmt->execute();
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
        return password_verify($password, $this->password);
    }
    
    // Generate OTP
    public function generateOTP() {
        $otp = sprintf("%06d", mt_rand(100000, 999999));
        
        $sql = "UPDATE users SET otp = ?, otp_expiry = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("si", $otp, $this->id);
        
        if($stmt->execute()) {
            return $otp;
        }
        
        return false;
    }
    
    // Verify OTP
    public function verifyOTP($otp) {
        $sql = "SELECT * FROM users WHERE id = ? AND otp = ? AND otp_expiry > NOW()";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("is", $this->id, $otp);
        $stmt->execute();
        
        $result = $stmt->get_result();
        
        if($result->num_rows > 0) {
            // Clear OTP after successful verification
            $this->clearOTP();
            return true;
        }
        
        return false;
    }
    
    // Clear OTP
    private function clearOTP() {
        $sql = "UPDATE users SET otp = NULL, otp_expiry = NULL WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $this->id);
        $stmt->execute();
    }
}
?>
