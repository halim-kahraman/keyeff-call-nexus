<?php
namespace KeyEff\CallPanel\Models;

require_once __DIR__ . '/../config/database.php';

class Appointment {
    private $conn;
    
    // Appointment properties
    public $id;
    public $customer_id;
    public $user_id;
    public $title;
    public $date;
    public $time;
    public $type;
    public $description;
    public $status;
    public $created_at;
    public $updated_at;
    
    public function __construct() {
        $this->conn = getConnection();
    }
    
    // Create appointment
    public function create($customer_id, $user_id, $title, $date, $time, $type, $description = '', $status = 'scheduled') {
        $sql = "INSERT INTO appointments (customer_id, user_id, title, appointment_date, appointment_time, type, description, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("iissssss", $customer_id, $user_id, $title, $date, $time, $type, $description, $status);
        
        if($stmt->execute()) {
            return $this->conn->insert_id;
        }
        
        return false;
    }
    
    // Get all appointments
    public function getAll() {
        $sql = "SELECT a.*, c.name as customer_name, c.company as customer_company, u.name as user_name 
                FROM appointments a 
                JOIN customers c ON a.customer_id = c.id 
                JOIN users u ON a.user_id = u.id 
                ORDER BY a.appointment_date ASC, a.appointment_time ASC";
                
        $result = $this->conn->query($sql);
        $appointments = [];
        
        while($row = $result->fetch_assoc()) {
            $appointments[] = $row;
        }
        
        return $appointments;
    }
    
    // Get appointments by date range
    public function getByDateRange($start_date, $end_date, $user_id = null) {
        $sql = "SELECT a.*, c.name as customer_name, c.company as customer_company, u.name as user_name 
                FROM appointments a 
                JOIN customers c ON a.customer_id = c.id 
                JOIN users u ON a.user_id = u.id 
                WHERE a.appointment_date BETWEEN ? AND ?";
                
        if($user_id) {
            $sql .= " AND a.user_id = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("ssi", $start_date, $end_date, $user_id);
        } else {
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("ss", $start_date, $end_date);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        $appointments = [];
        
        while($row = $result->fetch_assoc()) {
            $appointments[] = $row;
        }
        
        return $appointments;
    }
    
    // Update appointment status
    public function updateStatus($id, $status) {
        $sql = "UPDATE appointments SET status = ?, updated_at = NOW() WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("si", $status, $id);
        
        return $stmt->execute();
    }
    
    // Sync appointment to KeyEff CRM
    public function syncToKeyEff($id) {
        $sql = "SELECT a.*, c.name as customer_name, c.company as customer_company, c.phone as customer_phone 
                FROM appointments a 
                JOIN customers c ON a.customer_id = c.id 
                WHERE a.id = ?";
                
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        
        $result = $stmt->get_result();
        
        if($result->num_rows > 0) {
            $appointment = $result->fetch_assoc();
            
            require_once __DIR__ . '/Setting.php';
            $setting = new Setting();
            $api_endpoint = $setting->get('api', 'endpoint');
            $api_token = $setting->get('api', 'token');
            
            if(!$api_endpoint || !$api_token) {
                return ['success' => false, 'message' => 'API settings not configured'];
            }
            
            $data = [
                'customer_name' => $appointment['customer_name'],
                'customer_company' => $appointment['customer_company'],
                'customer_phone' => $appointment['customer_phone'],
                'appointment_date' => $appointment['appointment_date'],
                'appointment_time' => $appointment['appointment_time'],
                'appointment_type' => $appointment['type'],
                'description' => $appointment['description'],
                'status' => $appointment['status']
            ];
            
            $ch = curl_init($api_endpoint . '/appointments');
            
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $api_token
            ]);
            
            $response = curl_exec($ch);
            $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            
            if(curl_errno($ch)) {
                curl_close($ch);
                return ['success' => false, 'message' => 'cURL Error: ' . curl_error($ch)];
            }
            
            curl_close($ch);
            
            $response_data = json_decode($response, true);
            
            if($http_code >= 200 && $http_code < 300) {
                $sql = "UPDATE appointments SET synced_to_crm = 1, updated_at = NOW() WHERE id = ?";
                $stmt = $this->conn->prepare($sql);
                $stmt->bind_param("i", $id);
                $stmt->execute();
                
                return ['success' => true, 'message' => 'Appointment synced to KeyEff CRM', 'data' => $response_data];
            } else {
                return ['success' => false, 'message' => 'API Error: ' . ($response_data['message'] ?? 'Unknown error'), 'http_code' => $http_code];
            }
        }
        
        return ['success' => false, 'message' => 'Appointment not found'];
    }
}
?>
