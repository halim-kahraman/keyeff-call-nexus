
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
    
    // Demo users array
    private $demoUsers = [
        'admin@keyeff.de' => [
            'name' => 'Admin User',
            'password' => 'password',
            'role' => 'admin'
        ],
        'telefonist@keyeff.de' => [
            'name' => 'Telefonist User',
            'password' => 'password',
            'role' => 'telefonist'
        ],
        'filialleiter@keyeff.de' => [
            'name' => 'Filialleiter User',
            'password' => 'password',
            'role' => 'filialleiter'
        ]
    ];
    
    public function __construct() {
        $this->conn = getConnection();
        
        // Check connection
        if (!$this->conn) {
            debugLog("Database connection failed");
        }
    }
    
    // Create user
    public function create($name, $email, $password, $role, $filiale = null) {
        // For demo users, store the plain password (ONLY FOR DEMO!)
        $hashed_password = isset($this->demoUsers[$email]) 
            ? password_hash('password', PASSWORD_DEFAULT) 
            : password_hash($password, PASSWORD_DEFAULT);
        
        try {
            $sql = "INSERT INTO users (name, email, password, role, filiale) VALUES (?, ?, ?, ?, ?)";
            $stmt = $this->conn->prepare($sql);
            
            if (!$stmt) {
                debugLog("Prepare statement failed: " . $this->conn->error);
                return false;
            }
            
            $stmt->bind_param("sssss", $name, $email, $hashed_password, $role, $filiale);
            
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
        // Check if it's a demo user first
        if (isset($this->demoUsers[$email])) {
            debugLog('Demo user detected', $email);
            
            // Check if demo user exists in database
            try {
                $sql = "SELECT * FROM users WHERE email = ?";
                $stmt = $this->conn->prepare($sql);
                
                if (!$stmt) {
                    debugLog("Prepare statement failed: " . $this->conn->error);
                    
                    // Handle demo user directly if DB query fails
                    $demoUser = $this->demoUsers[$email];
                    $this->id = uniqid('demo_');
                    $this->name = $demoUser['name'];
                    $this->email = $email;
                    $this->password = password_hash('password', PASSWORD_DEFAULT); 
                    $this->role = $demoUser['role'];
                    $this->filiale = null;
                    $this->avatar = null;
                    $this->created_at = date('Y-m-d H:i:s');
                    $this->updated_at = date('Y-m-d H:i:s');
                    return true;
                }
                
                $stmt->bind_param("s", $email);
                $stmt->execute();
                $result = $stmt->get_result();
                
                // If demo user doesn't exist in database or query fails, create it in memory
                if($result->num_rows === 0) {
                    debugLog('Creating demo user in memory', $email);
                    $demoUser = $this->demoUsers[$email];
                    $this->id = uniqid('demo_'); // Generate a temporary ID
                    $this->name = $demoUser['name'];
                    $this->email = $email;
                    $this->password = password_hash('password', PASSWORD_DEFAULT); 
                    $this->role = $demoUser['role'];
                    $this->filiale = null;
                    $this->avatar = null;
                    $this->created_at = date('Y-m-d H:i:s');
                    $this->updated_at = date('Y-m-d H:i:s');
                    return true;
                } else {
                    // Demo user exists in database
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
            } catch (Exception $e) {
                debugLog("Exception in findByEmail for demo user", ['email' => $email, 'error' => $e->getMessage()]);
                
                // Fall back to in-memory demo user
                $demoUser = $this->demoUsers[$email];
                $this->id = uniqid('demo_');
                $this->name = $demoUser['name'];
                $this->email = $email;
                $this->password = password_hash('password', PASSWORD_DEFAULT); 
                $this->role = $demoUser['role'];
                $this->filiale = null;
                $this->avatar = null;
                $this->created_at = date('Y-m-d H:i:s');
                $this->updated_at = date('Y-m-d H:i:s');
                return true;
            }
        }
        
        // Regular user lookup
        try {
            $sql = "SELECT * FROM users WHERE email = ?";
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
                $this->filiale = $row['filiale'];
                $this->avatar = $row['avatar'];
                $this->created_at = $row['created_at'];
                $this->updated_at = $row['updated_at'];
                
                return true;
            }
        } catch (Exception $e) {
            debugLog("Exception in findByEmail for regular user", ['email' => $email, 'error' => $e->getMessage()]);
            return false;
        }
        
        debugLog('User not found', $email);
        return false;
    }
    
    // Read single user by ID
    public function findById($id) {
        // For demo users with temporary IDs
        if (strpos($id, 'demo_') === 0) {
            // We've already loaded the demo user data in findByEmail
            return true;
        }
        
        try {
            $sql = "SELECT * FROM users WHERE id = ?";
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
                $this->filiale = $row['filiale'];
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
        // Log for debugging
        debugLog("Validating password", [
            "stored_hash" => $this->password,
            "provided_password_length" => strlen($password)
        ]);
        
        // Special handling for demo users
        if (isset($this->demoUsers[$this->email]) && $password === 'password') {
            debugLog("Demo account password validation successful", ['email' => $this->email]);
            return true;
        }
        
        // Regular password validation
        $result = password_verify($password, $this->password);
        debugLog("Password verification result", $result);
        
        return $result;
    }
    
    // Generate OTP
    public function generateOTP() {
        $otp = sprintf("%06d", mt_rand(100000, 999999));
        
        // For demo users with temporary IDs
        if (strpos($this->id, 'demo_') === 0) {
            debugLog("Generated OTP for demo user", ['email' => $this->email, 'otp' => $otp]);
            return $otp;
        }
        
        try {
            $sql = "UPDATE users SET otp = ?, otp_expiry = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE id = ?";
            $stmt = $this->conn->prepare($sql);
            
            if (!$stmt) {
                debugLog("Prepare statement failed: " . $this->conn->error);
                return $otp; // Return OTP even if DB update fails (for demo)
            }
            
            $stmt->bind_param("si", $otp, $this->id);
            
            if($stmt->execute()) {
                return $otp;
            } else {
                debugLog("OTP update failed", ['error' => $stmt->error]);
                return $otp; // Return OTP even if DB update fails (for demo)
            }
        } catch (Exception $e) {
            debugLog("Exception in generateOTP", ['error' => $e->getMessage()]);
            return $otp; // Return OTP even if DB update fails (for demo)
        }
    }
    
    // Verify OTP
    public function verifyOTP($otp) {
        // For demo users with temporary IDs
        if (strpos($this->id, 'demo_') === 0) {
            debugLog("OTP verification for demo user", ['email' => $this->email]);
            return true; // Always succeed for demo users
        }
        
        try {
            $sql = "SELECT * FROM users WHERE id = ? AND otp = ? AND otp_expiry > NOW()";
            $stmt = $this->conn->prepare($sql);
            
            if (!$stmt) {
                debugLog("Prepare statement failed: " . $this->conn->error);
                return true; // Accept any OTP if DB query fails (for demo)
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
            return true; // Accept any OTP if exception occurs (for demo)
        }
        
        return false;
    }
    
    // Clear OTP
    private function clearOTP() {
        // For demo users with temporary IDs
        if (strpos($this->id, 'demo_') === 0) {
            return; // No need to clear for demo users
        }
        
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
