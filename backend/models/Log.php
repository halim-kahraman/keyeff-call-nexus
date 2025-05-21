
<?php
require_once __DIR__ . '/../config/database.php';

class Log {
    private $conn;
    
    // Log properties
    public $id;
    public $user_id;
    public $action;
    public $entity;
    public $entity_id;
    public $details;
    public $ip_address;
    public $user_agent;
    public $created_at;
    
    public function __construct() {
        $this->conn = getConnection();
    }
    
    // Create a new log entry
    public function create($user_id, $action, $entity, $entity_id = null, $details = null) {
        $ip_address = $_SERVER['REMOTE_ADDR'] ?? null;
        $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? null;
        
        $sql = "INSERT INTO logs (user_id, action, entity, entity_id, details, ip_address, user_agent) 
                VALUES (?, ?, ?, ?, ?, ?, ?)";
                
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("ississs", $user_id, $action, $entity, $entity_id, $details, $ip_address, $user_agent);
        
        return $stmt->execute();
    }
    
    // Get all logs with filtering options
    public function getAll($filters = []) {
        $sql = "SELECT l.*, u.name as user_name 
                FROM logs l 
                LEFT JOIN users u ON l.user_id = u.id 
                WHERE 1=1";
        
        $params = [];
        $types = "";
        
        // Apply filters
        if(isset($filters['user_id']) && !empty($filters['user_id'])) {
            $sql .= " AND l.user_id = ?";
            $params[] = $filters['user_id'];
            $types .= "i";
        }
        
        if(isset($filters['action']) && !empty($filters['action'])) {
            $sql .= " AND l.action = ?";
            $params[] = $filters['action'];
            $types .= "s";
        }
        
        if(isset($filters['entity']) && !empty($filters['entity'])) {
            $sql .= " AND l.entity = ?";
            $params[] = $filters['entity'];
            $types .= "s";
        }
        
        if(isset($filters['entity_id']) && !empty($filters['entity_id'])) {
            $sql .= " AND l.entity_id = ?";
            $params[] = $filters['entity_id'];
            $types .= "i";
        }
        
        if(isset($filters['start_date']) && !empty($filters['start_date'])) {
            $sql .= " AND DATE(l.created_at) >= ?";
            $params[] = $filters['start_date'];
            $types .= "s";
        }
        
        if(isset($filters['end_date']) && !empty($filters['end_date'])) {
            $sql .= " AND DATE(l.created_at) <= ?";
            $params[] = $filters['end_date'];
            $types .= "s";
        }
        
        // Add sorting
        $sql .= " ORDER BY l.created_at DESC";
        
        // Add pagination
        if(isset($filters['limit']) && is_numeric($filters['limit'])) {
            $sql .= " LIMIT ?";
            $params[] = $filters['limit'];
            $types .= "i";
            
            if(isset($filters['offset']) && is_numeric($filters['offset'])) {
                $sql .= " OFFSET ?";
                $params[] = $filters['offset'];
                $types .= "i";
            }
        }
        
        $stmt = $this->conn->prepare($sql);
        
        if(!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        $logs = [];
        
        while($row = $result->fetch_assoc()) {
            $logs[] = $row;
        }
        
        return $logs;
    }
    
    // Get log count with filters
    public function getCount($filters = []) {
        $sql = "SELECT COUNT(*) as count FROM logs l WHERE 1=1";
        
        $params = [];
        $types = "";
        
        // Apply filters
        if(isset($filters['user_id']) && !empty($filters['user_id'])) {
            $sql .= " AND l.user_id = ?";
            $params[] = $filters['user_id'];
            $types .= "i";
        }
        
        if(isset($filters['action']) && !empty($filters['action'])) {
            $sql .= " AND l.action = ?";
            $params[] = $filters['action'];
            $types .= "s";
        }
        
        if(isset($filters['entity']) && !empty($filters['entity'])) {
            $sql .= " AND l.entity = ?";
            $params[] = $filters['entity'];
            $types .= "s";
        }
        
        if(isset($filters['start_date']) && !empty($filters['start_date'])) {
            $sql .= " AND DATE(l.created_at) >= ?";
            $params[] = $filters['start_date'];
            $types .= "s";
        }
        
        if(isset($filters['end_date']) && !empty($filters['end_date'])) {
            $sql .= " AND DATE(l.created_at) <= ?";
            $params[] = $filters['end_date'];
            $types .= "s";
        }
        
        $stmt = $this->conn->prepare($sql);
        
        if(!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        
        return $row['count'];
    }
    
    // Export logs as CSV
    public function exportCSV($filters = []) {
        $logs = $this->getAll($filters);
        
        if(empty($logs)) {
            return false;
        }
        
        $filename = 'log_export_' . date('Y-m-d_H-i-s') . '.csv';
        $filepath = __DIR__ . '/../exports/' . $filename;
        
        // Create exports directory if it doesn't exist
        if(!file_exists(__DIR__ . '/../exports/')) {
            mkdir(__DIR__ . '/../exports/', 0755, true);
        }
        
        $file = fopen($filepath, 'w');
        
        // Add BOM for Excel
        fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
        
        // Add headers
        fputcsv($file, ['ID', 'User', 'Action', 'Entity', 'Entity ID', 'Details', 'IP Address', 'User Agent', 'Created At']);
        
        // Add data
        foreach($logs as $log) {
            fputcsv($file, [
                $log['id'],
                $log['user_name'] ?? $log['user_id'],
                $log['action'],
                $log['entity'],
                $log['entity_id'],
                $log['details'],
                $log['ip_address'],
                $log['user_agent'],
                $log['created_at']
            ]);
        }
        
        fclose($file);
        
        return $filename;
    }
}
?>
