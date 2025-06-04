
<?php
namespace KeyEff\CallPanel\Models;

class UserAuth {
    
    public static function validatePassword($provided_password, $stored_password, $user_id = null) {
        debugLog("Validating password", [
            "user_id" => $user_id,
            "provided_password_length" => strlen($provided_password)
        ]);
        
        $result = password_verify($provided_password, $stored_password);
        debugLog("Password verification result", $result);
        
        return $result;
    }
    
    public static function hashPassword($password) {
        return password_hash($password, PASSWORD_DEFAULT);
    }
}
?>
