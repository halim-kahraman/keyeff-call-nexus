
<?php
namespace KeyEff\CallPanel\Models;

class UserValidator {
    
    public static function validateEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }
    
    public static function validatePassword($password) {
        return strlen($password) >= 6;
    }
    
    public static function validateRole($role) {
        $allowedRoles = ['admin', 'filialleiter', 'telefonist'];
        return in_array($role, $allowedRoles);
    }
    
    public static function validateUserData($data) {
        $errors = [];
        
        if (empty($data['name'])) {
            $errors[] = 'Name ist erforderlich';
        }
        
        if (empty($data['email']) || !self::validateEmail($data['email'])) {
            $errors[] = 'Gültige E-Mail-Adresse ist erforderlich';
        }
        
        if (!empty($data['password']) && !self::validatePassword($data['password'])) {
            $errors[] = 'Passwort muss mindestens 6 Zeichen lang sein';
        }
        
        if (empty($data['role']) || !self::validateRole($data['role'])) {
            $errors[] = 'Gültige Rolle ist erforderlich';
        }
        
        return $errors;
    }
}
?>
