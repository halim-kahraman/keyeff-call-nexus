
<?php
namespace KeyEff\CallPanel\Models;

class UserOTPManager {
    private $conn;
    
    public function __construct($connection) {
        $this->conn = $connection;
    }
    
    public function updateOTP($id, $otp) {
        try {
            $sql = "UPDATE users SET otp = ?, otp_expiry = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE id = ?";
            $stmt = $this->conn->prepare($sql);
            
            if (!$stmt) {
                debugLog("Prepare statement failed: " . $this->conn->error);
                return false;
            }
            
            $stmt->bind_param("si", $otp, $id);
            
            return $stmt->execute();
        } catch (Exception $e) {
            debugLog("Exception in updateOTP", ['error' => $e->getMessage()]);
            return false;
        }
    }
    
    public function verifyOTP($id, $otp) {
        try {
            $sql = "SELECT * FROM users WHERE id = ? AND otp = ? AND otp_expiry > NOW()";
            $stmt = $this->conn->prepare($sql);
            
            if (!$stmt) {
                debugLog("Prepare statement failed: " . $this->conn->error);
                return false;
            }
            
            $stmt->bind_param("is", $id, $otp);
            $stmt->execute();
            
            $result = $stmt->get_result();
            
            return $result->num_rows > 0;
        } catch (Exception $e) {
            debugLog("Exception in verifyOTP", ['error' => $e->getMessage()]);
            return false;
        }
    }
    
    public function clearOTP($id) {
        try {
            $sql = "UPDATE users SET otp = NULL, otp_expiry = NULL WHERE id = ?";
            $stmt = $this->conn->prepare($sql);
            
            if (!$stmt) {
                debugLog("Prepare statement failed: " . $this->conn->error);
                return;
            }
            
            $stmt->bind_param("i", $id);
            $stmt->execute();
        } catch (Exception $e) {
            debugLog("Exception in clearOTP", ['error' => $e->getMessage()]);
        }
    }
}
?>
