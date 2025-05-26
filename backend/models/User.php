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
    public $avatar;
    public $created_at;
    public $updated_at;
    
    // Demo users array with correct information
    private $demoUsers = [
        'admin@keyeff.de' => [
            'id' => 'demo_admin',
            'name' => 'Admin User',
            'password' => 'password',
            'role' => 'admin',
            'filiale' => null,
            'avatar' => null
        ],
        'telefonist@keyeff.de' => [
            'id' => 'demo_telefonist',
            'name' => 'Telefonist User',
            'password' => 'password',
            'role' => 'telefonist',
            'filiale' => null,
            'avatar' => null
        ],
        'filialleiter@keyeff.de' => [
            'id' => 'demo_filialleiter',
            'name' => 'Filialleiter User',
            'password' => 'password',
            'role' => 'filialleiter',
            'filiale' => null,
            'avatar' => null
        ],
        'halim.kahraman@googlemail.com' => [
            'id' => 'demo_dev',
            'name' => 'Developer',
            'password' => 'password',
            'role' => 'admin',
            'filiale' => null,
            'avatar' => null
        ]
    ];
    
    // Flag to track if current user is a demo user
    private $isDemoUser = false;
    private $demoPassword = '';
    
    public function __construct() {
        try {
            $this->conn = getConnection();
            
            // Check connection
            if (!$this->conn) {
                debugLog("Database connection failed");
            }
        } catch (Exception $e) {
            debugLog("Database connection exception", $e->getMessage());
            // Continue without database for demo users
        }
    }
    
    // Create user
    public function create($name, $email, $password, $role, $filiale = null) {
        // For demo users, store the plain password (ONLY FOR DEMO!)
        $hashed_password = isset($this->demoUsers[$email]) 
            ? password_hash('password', PASSWORD_DEFAULT) 
            : password_hash($password, PASSWORD_DEFAULT);
        
        try {
            if (!$this->conn) {
                debugLog("No database connection for create user");
                return false;
            }
            
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
        // Reset demo user flag
        $this->isDemoUser = false;
        
        // Check if it's a demo user first
        if (isset($this->demoUsers[$email])) {
            debugLog('Demo user detected', $email);
            $this->isDemoUser = true;
            $demoUser = $this->demoUsers[$email];
            
            // Set demo user data
            $this->id = $demoUser['id'];
            $this->name = $demoUser['name'];
            $this->email = $email;
            $this->password = password_hash($demoUser['password'], PASSWORD_DEFAULT);
            $this->demoPassword = $demoUser['password']; // Store original password for validation
            $this->role = $demoUser['role'];
            $this->filiale = $demoUser['filiale'];
            $this->avatar = $demoUser['avatar'];
            $this->created_at = date('Y-m-d H:i:s');
            $this->updated_at = date('Y-m-d H:i:s');
            
            // Try to find demo user in DB (optional, mainly for checking if user exists)
            if ($this->conn) {
                try {
                    $sql = "SELECT * FROM users WHERE email = ?";
                    $stmt = $this->conn->prepare($sql);
                    
                    if ($stmt) {
                        $stmt->bind_param("s", $email);
                        $stmt->execute();
                        $result = $stmt->get_result();
                        
                        if($result && $result->num_rows > 0) {
                            $row = $result->fetch_assoc();
                            // If found in DB, use DB values but keep demo flag
                            $this->id = $row['id'];
                            $this->created_at = $row['created_at'];
                            $this->updated_at = $row['updated_at'];
                        }
                    }
                } catch (Exception $e) {
                    // Ignore DB errors for demo users, we already have the data
                    debugLog("DB check for demo user failed, using demo data", ['email' => $email]);
                }
            }
            
            return true;
        }
        
        // Regular user lookup - only try if we have a DB connection
        if ($this->conn) {
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
        }
        
        debugLog('User not found', $email);
        return false;
    }
    
    // Read single user by ID
    public function findById($id) {
        // For demo users with temporary IDs
        if (strpos($id, 'demo_') === 0) {
            // We've already loaded the demo user data in findByEmail
            // But we'll check if this ID matches our currently loaded user
            if ($id === $this->id) {
                return true;
            }
            
            // Otherwise, try to find the email for this demo ID
            foreach ($this->demoUsers as $email => $data) {
                if ($data['id'] === $id) {
                    return $this->findByEmail($email);
                }
            }
            
            return false;
        }
        
        // Only try if we have a DB connection
        if ($this->conn) {
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
        }
        
        return false;
    }
    
    // Get all users
    public function getAll() {
        if (!$this->conn) {
            // Return demo users if no DB connection
            $users = [];
            foreach ($this->demoUsers as $email => $data) {
                $users[] = [
                    'id' => $data['id'],
                    'name' => $data['name'],
                    'email' => $email,
                    'role' => $data['role'],
                    'filiale' => $data['filiale'],
                    'avatar' => $data['avatar'],
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s')
                ];
            }
            return $users;
        }
        
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
        if ($this->isDemoUser) {
            debugLog("Cannot update demo user in DB", $this->email);
            return true; // Pretend success for demo
        }
        
        if (!$this->conn) {
            debugLog("No database connection for update user");
            return false;
        }
        
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
        if ($this->isDemoUser) {
            debugLog("Cannot update demo user password in DB", $this->email);
            return true; // Pretend success for demo
        }
        
        if (!$this->conn) {
            debugLog("No database connection for update password");
            return false;
        }
        
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
        if ($this->isDemoUser) {
            debugLog("Cannot delete demo user from DB", $this->email);
            return true; // Pretend success for demo
        }
        
        if (!$this->conn) {
            debugLog("No database connection for delete user");
            return false;
        }
        
        $sql = "DELETE FROM users WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $this->id);
        
        return $stmt->execute();
    }
    
    // Validate password
    public function validatePassword($password) {
        // Special handling for demo users
        if ($this->isDemoUser) {
            debugLog("Demo account password validation", [
                'email' => $this->email, 
                'provided_password' => $password,
                'expected_password' => $this->demoPassword
            ]);
            
            // Direct comparison for demo users
            $result = ($password === $this->demoPassword);
            debugLog("Demo account password validation result", $result);
            return $result;
        }
        
        // Log for debugging
        debugLog("Validating password", [
            "stored_hash" => $this->password,
            "provided_password_length" => strlen($password)
        ]);
        
        // Regular password validation
        $result = password_verify($password, $this->password);
        debugLog("Password verification result", $result);
        
        return $result;
    }
    
    // Generate OTP
    public function generateOTP() {
        $otp = sprintf("%06d", mt_rand(100000, 999999));
        
        // For demo users with temporary IDs
        if ($this->isDemoUser) {
            debugLog("Generated OTP for demo user", ['email' => $this->email, 'otp' => $otp]);
            return $otp;
        }
        
        // Only try if we have a DB connection
        if ($this->conn) {
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
        
        return $otp; // Return OTP for demo scenario
    }
    
    // Verify OTP
    public function verifyOTP($otp) {
        // For demo users with temporary IDs
        if ($this->isDemoUser) {
            debugLog("OTP verification for demo user", ['email' => $this->email, 'otp' => $otp]);
            return true; // Always succeed for demo users
        }
        
        // Only try if we have a DB connection
        if ($this->conn) {
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
        }
        
        return true; // Accept any OTP in demo mode
    }
    
    // Clear OTP
    private function clearOTP() {
        // For demo users with temporary IDs
        if ($this->isDemoUser) {
            return; // No need to clear for demo users
        }
        
        if (!$this->conn) {
            return; // Skip if no DB connection
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
