<?php
namespace KeyEff\CallPanel\Models;

require_once __DIR__ . '/UserRepository.php';

class User {
    private $repository;
    
    public function __construct() {
        $this->repository = new UserRepository();
    }
    
    public function create($name, $email, $password, $role, $filiale = null, $filiale_id = null) {
        return $this->repository->create($name, $email, $password, $role, $filiale, $filiale_id);
    }
    
    public function findByEmail($email) {
        return $this->repository->findByEmail($email);
    }
    
    public function findById($id) {
        return $this->repository->findById($id);
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
}
?>
