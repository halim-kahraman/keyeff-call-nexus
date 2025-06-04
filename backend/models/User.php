
<?php
namespace KeyEff\CallPanel\Models;

require_once __DIR__ . '/UserRepository.php';
require_once __DIR__ . '/UserAuth.php';
require_once __DIR__ . '/UserOTP.php';
require_once __DIR__ . '/UserValidator.php';

class User {
    private $repository;
    private $otp;
    
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
        $this->repository = new UserRepository();
        $this->otp = new UserOTP($this->repository);
    }
    
    // Static method to verify JWT token
    public static function verifyToken($token) {
        if (!$token) {
            return false;
        }
        
        try {
            // Split token into parts
            $tokenParts = explode('.', $token);
            if (count($tokenParts) !== 3) {
                return false;
            }
            
            list($header, $payload, $signature) = $tokenParts;
            
            // Verify signature
            $expectedSignature = base64_encode(hash_hmac('sha256', $header . '.' . $payload, JWT_SECRET, true));
            
            if (!hash_equals($expectedSignature, $signature)) {
                return false;
            }
            
            // Decode payload
            $decodedPayload = json_decode(base64_decode($payload), true);
            
            // Check expiration
            if (isset($decodedPayload['exp']) && $decodedPayload['exp'] < time()) {
                return false;
            }
            
            return $decodedPayload;
            
        } catch (Exception $e) {
            debugLog('Token verification error', $e->getMessage());
            return false;
        }
    }
    
    // Create user
    public function create($name, $email, $password, $role, $filiale = null, $filiale_id = null) {
        return $this->repository->create($name, $email, $password, $role, $filiale, $filiale_id);
    }
    
    // Read single user by email
    public function findByEmail($email) {
        $data = $this->repository->findByEmail($email);
        
        if ($data) {
            $this->populateFromArray($data);
            return true;
        }
        
        return false;
    }
    
    // Read single user by ID
    public function findById($id) {
        $data = $this->repository->findById($id);
        
        if ($data) {
            $this->populateFromArray($data);
            return true;
        }
        
        return false;
    }
    
    // Get all users
    public function getAll() {
        return $this->repository->getAll();
    }
    
    // Update user
    public function update() {
        return $this->repository->update(
            $this->id, 
            $this->name, 
            $this->email, 
            $this->role, 
            $this->filiale, 
            $this->filiale_id, 
            $this->avatar
        );
    }
    
    // Update password
    public function updatePassword($password) {
        if ($this->repository->updatePassword($this->id, $password)) {
            $this->password = UserAuth::hashPassword($password);
            return true;
        }
        
        return false;
    }
    
    // Delete user
    public function delete() {
        return $this->repository->delete($this->id);
    }
    
    // Validate password
    public function validatePassword($password) {
        return UserAuth::validatePassword($password, $this->password, $this->id);
    }
    
    // Generate OTP
    public function generateOTP() {
        return $this->otp->generate($this->id);
    }
    
    // Verify OTP
    public function verifyOTP($otp) {
        return $this->otp->verify($this->id, $otp);
    }
    
    // Private helper method to populate object from array
    private function populateFromArray($data) {
        $this->id = $data['id'];
        $this->name = $data['name'];
        $this->email = $data['email'];
        $this->password = $data['password'];
        $this->role = $data['role'];
        $this->filiale = $data['filiale_name'] ?? $data['filiale'];
        $this->filiale_id = $data['filiale_id'];
        $this->avatar = $data['avatar'];
        $this->created_at = $data['created_at'];
        $this->updated_at = $data['updated_at'];
    }
}
?>
