
<?php
namespace KeyEff\CallPanel\Models;

class UserOTP {
    private $repository;
    
    public function __construct($repository) {
        $this->repository = $repository;
    }
    
    public function generate($user_id) {
        $otp = sprintf("%06d", mt_rand(100000, 999999));
        
        if($this->repository->updateOTP($user_id, $otp)) {
            return $otp;
        } else {
            debugLog("OTP update failed");
            return false;
        }
    }
    
    public function verify($user_id, $otp) {
        if($this->repository->verifyOTP($user_id, $otp)) {
            // Clear OTP after successful verification
            $this->repository->clearOTP($user_id);
            return true;
        }
        
        return false;
    }
}
?>
