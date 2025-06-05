<?php
namespace KeyEff\CallPanel\Models;

require_once __DIR__ . '/User.php';

class UserAuth {
    private $user;
    
    public function __construct() {
        $this->user = new User();
    }
    
    public function authenticate($email, $password) {
        $userData = $this->user->findByEmail($email);
        
        if (!$userData) {
            debugLog('User not found during authentication', $email);
            return false;
        }
        
        if (!password_verify($password, $userData['password'])) {
            debugLog('Password verification failed', $email);
            return false;
        }
        
        debugLog('User authenticated successfully', $email);
        return $userData;
    }
    
    public function register($name, $email, $password, $role, $filiale = null, $filiale_id = null) {
        return $this->user->create($name, $email, $password, $role, $filiale, $filiale_id);
    }
}
?>
