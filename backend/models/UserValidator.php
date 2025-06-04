
<?php
namespace KeyEff\CallPanel\Models;

class UserValidator {
    
    public static function validateEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL);
    }
    
    public static function validateRole($role) {
        return in_array($role, ['admin', 'filialleiter', 'telefonist']);
    }
    
    public static function validateRequiredFields($data, $required_fields) {
        foreach ($required_fields as $field) {
            if (!isset($data[$field]) || empty(trim($data[$field]))) {
                return false;
            }
        }
        return true;
    }
    
    public static function sanitizeString($string) {
        return trim($string);
    }
}
?>
