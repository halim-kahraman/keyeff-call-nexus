<?php
namespace KeyEff\CallPanel\Models;

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/UserCRUD.php';
require_once __DIR__ . '/UserOTPManager.php';

class UserRepository {
    private $conn;
    private $crud;
    private $otpManager;
    
    public function __construct() {
        try {
            $this->conn = getConnection();
            
            if (!$this->conn) {
                debugLog("Database connection failed");
                throw new Exception("Database connection failed");
            }
            
            $this->crud = new UserCRUD($this->conn);
            $this->otpManager = new UserOTPManager($this->conn);
        } catch (Exception $e) {
            debugLog("Database connection exception", $e->getMessage());
            throw $e;
        }
    }
    
    public function create($name, $email, $password, $role, $filiale = null, $filiale_id = null) {
        return $this->crud->create($name, $email, $password, $role, $filiale, $filiale_id);
    }
    
    public function findByEmail($email) {
        return $this->crud->findByEmail($email);
    }
    
    public function findById($id) {
        return $this->crud->findById($id);
    }
    
    public function getAll() {
        return $this->crud->getAll();
    }
    
    public function update($id, $name, $email, $role, $filiale, $filiale_id, $avatar) {
        return $this->crud->update($id, $name, $email, $role, $filiale, $filiale_id, $avatar);
    }
    
    public function updatePassword($id, $password) {
        return $this->crud->updatePassword($id, $password);
    }
    
    public function delete($id) {
        return $this->crud->delete($id);
    }
    
    public function updateOTP($id, $otp) {
        return $this->otpManager->updateOTP($id, $otp);
    }
    
    public function verifyOTP($id, $otp) {
        return $this->otpManager->verifyOTP($id, $otp);
    }
    
    public function clearOTP($id) {
        return $this->otpManager->clearOTP($id);
    }
}
?>
