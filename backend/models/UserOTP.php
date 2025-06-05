<?php
namespace KeyEff\CallPanel\Models;

require_once __DIR__ . '/User.php';

class UserOTP {
    private $user;
    
    public function __construct() {
        $this->user = new User();
    }
    
    public function generateOTP($userId) {
        $otp = sprintf("%06d", mt_rand(1, 999999));
        
        if ($this->user->updateOTP($userId, $otp)) {
            return $otp;
        }
        
        return false;
    }
    
    public function verifyOTP($userId, $otp) {
        return $this->user->verifyOTP($userId, $otp);
    }
    
    public function clearOTP($userId) {
        $this->user->clearOTP($userId);
    }
}
?>
