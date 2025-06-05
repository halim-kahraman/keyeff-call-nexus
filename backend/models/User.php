
<?php
namespace KeyEff\CallPanel\Models;

require_once __DIR__ . '/UserRepository.php';

class User {
    private $repository;
    public $id;
    public $name;
    public $email;
    public $role;
    public $filiale;
    public $filiale_id;
    public $password;
    public $otp;
    public $otp_expiry;
    public $created_at;
    public $updated_at;
    
    public function __construct() {
        $this->repository = new UserRepository();
    }
    
    public function create($name, $email, $password, $role, $filiale = null, $filiale_id = null) {
        return $this->repository->create($name, $email, $password, $role, $filiale, $filiale_id);
    }
    
    public function findByEmail($email) {
        $userData = $this->repository->findByEmail($email);
        if ($userData) {
            $this->populateFromArray($userData);
            return $userData;
        }
        return false;
    }
    
    public function findById($id) {
        $userData = $this->repository->findById($id);
        if ($userData) {
            $this->populateFromArray($userData);
            return $userData;
        }
        return false;
    }
    
    public function getAll() {
        return $this->repository->getAll();
    }
    
    public function update($id, $name, $email, $role, $filiale, $filiale_id, $avatar) {
        return $this->repository->update($id, $name, $email, $role, $filiale, $filiale_id, $avatar);
    }
    
    public function updatePassword($id, $password) {
        return $this->repository->updatePassword($id, $password);
    }
    
    public function delete($id) {
        return $this->repository->delete($id);
    }
    
    public function updateOTP($id, $otp) {
        return $this->repository->updateOTP($id, $otp);
    }
    
    public function verifyOTP($id, $otp) {
        return $this->repository->verifyOTP($id, $otp);
    }
    
    public function clearOTP($id) {
        return $this->repository->clearOTP($id);
    }
    
    // Neue Methoden für Login-Funktionalität
    public function validatePassword($password) {
        if (!$this->password) {
            return false;
        }
        return password_verify($password, $this->password);
    }
    
    public function generateOTP() {
        $otp = sprintf("%06d", mt_rand(100000, 999999));
        
        if ($this->updateOTP($this->id, $otp)) {
            return $otp;
        }
        
        return false;
    }
    
    private function populateFromArray($data) {
        $this->id = $data['id'] ?? null;
        $this->name = $data['name'] ?? null;
        $this->email = $data['email'] ?? null;
        $this->role = $data['role'] ?? null;
        $this->filiale = $data['filiale'] ?? null;
        $this->filiale_id = $data['filiale_id'] ?? null;
        $this->password = $data['password'] ?? null;
        $this->otp = $data['otp'] ?? null;
        $this->otp_expiry = $data['otp_expiry'] ?? null;
        $this->created_at = $data['created_at'] ?? null;
        $this->updated_at = $data['updated_at'] ?? null;
    }
}
?>
