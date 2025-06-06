
<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';

// Check authorization
$headers = apache_request_headers();
$auth_header = $headers['Authorization'] ?? null;

if (!$auth_header || !preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
    jsonResponse(false, 'Unauthorized', null, 401);
}

$token = $matches[1];
$payload = validateToken($token);

if (!$payload) {
    jsonResponse(false, 'Invalid token', null, 401);
}

$conn = getConnection();
$user_id = $payload['user_id'];
$role = $payload['role'];
$filiale = $payload['filiale'];

// Build queries based on user role
$where_clause = "";
$params = [];

if ($role === 'telefonist') {
    $where_clause = "AND cl.user_id = ?";
    $params[] = $user_id;
} elseif ($role === 'filialleiter') {
    $where_clause = "AND u.filiale = ?";
    $params[] = $filiale;
}

// Get today's calls
$sql_today_calls = "
    SELECT COUNT(*) as count 
    FROM call_logs cl 
    JOIN users u ON cl.user_id = u.id 
    WHERE DATE(cl.created_at) = CURDATE() $where_clause
";
$stmt_today_calls = $conn->prepare($sql_today_calls);
if (!empty($params)) {
    $stmt_today_calls->bind_param(str_repeat("s", count($params)), ...$params);
}
$stmt_today_calls->execute();
$today_calls = $stmt_today_calls->get_result()->fetch_assoc()['count'];

// Get today's appointments
$sql_today_appointments = "
    SELECT COUNT(*) as count 
    FROM appointments a 
    JOIN users u ON a.user_id = u.id 
    WHERE DATE(a.created_at) = CURDATE() $where_clause
";
$stmt_today_appointments = $conn->prepare($sql_today_appointments);
if (!empty($params)) {
    $stmt_today_appointments->bind_param(str_repeat("s", count($params)), ...$params);
}
$stmt_today_appointments->execute();
$today_appointments = $stmt_today_appointments->get_result()->fetch_assoc()['count'];

// Get success rate (calls with positive outcome)
$sql_success_rate = "
    SELECT 
        COUNT(*) as total_calls,
        SUM(CASE WHEN cl.outcome IN ('termin', 'interessiert', 'rueckruf') THEN 1 ELSE 0 END) as successful_calls
    FROM call_logs cl 
    JOIN users u ON cl.user_id = u.id 
    WHERE DATE(cl.created_at) = CURDATE() $where_clause
";
$stmt_success_rate = $conn->prepare($sql_success_rate);
if (!empty($params)) {
    $stmt_success_rate->bind_param(str_repeat("s", count($params)), ...$params);
}
$stmt_success_rate->execute();
$success_data = $stmt_success_rate->get_result()->fetch_assoc();
$success_rate = $success_data['total_calls'] > 0 ? 
    round(($success_data['successful_calls'] / $success_data['total_calls']) * 100) : 0;

// Get upcoming appointments
$sql_upcoming = "
    SELECT COUNT(*) as count 
    FROM appointments a 
    JOIN users u ON a.user_id = u.id 
    WHERE a.appointment_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY) $where_clause
";
$stmt_upcoming = $conn->prepare($sql_upcoming);
if (!empty($params)) {
    $stmt_upcoming->bind_param(str_repeat("s", count($params)), ...$params);
}
$stmt_upcoming->execute();
$upcoming_appointments = $stmt_upcoming->get_result()->fetch_assoc()['count'];

// Get pending callbacks - use call_logs with outcome 'rueckruf'
$sql_callbacks = "
    SELECT COUNT(*) as count 
    FROM call_logs cl 
    JOIN users u ON cl.user_id = u.id 
    WHERE cl.outcome = 'rueckruf' AND DATE(cl.created_at) >= CURDATE() $where_clause
";
$stmt_callbacks = $conn->prepare($sql_callbacks);
if (!empty($params)) {
    $stmt_callbacks->bind_param(str_repeat("s", count($params)), ...$params);
}
$stmt_callbacks->execute();
$pending_callbacks = $stmt_callbacks->get_result()->fetch_assoc()['count'];

// Get daily target (default values based on role)
$daily_target = $role === 'telefonist' ? 20 : 80;

// Get active users (admin only)
$active_users = 0;
if ($role === 'admin') {
    $sql_active_users = "
        SELECT COUNT(DISTINCT u.id) as count 
        FROM users u 
        LEFT JOIN call_logs cl ON u.id = cl.user_id 
        WHERE DATE(cl.created_at) = CURDATE()
    ";
    $stmt_active_users = $conn->prepare($sql_active_users);
    $stmt_active_users->execute();
    $active_users = $stmt_active_users->get_result()->fetch_assoc()['count'];
}

// Get expiring contracts from customer_contracts table - FIXED
$expiring_contracts = 0;
$sql_expiring = "
    SELECT COUNT(*) as count 
    FROM customer_contracts cc
    JOIN customers c ON cc.customer_id = c.id
    WHERE cc.contract_expiry IS NOT NULL 
    AND cc.contract_expiry BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
";

if ($role === 'filialleiter') {
    $sql_expiring .= " AND c.filiale_id = ?";
    $stmt_expiring = $conn->prepare($sql_expiring);
    $stmt_expiring->bind_param("s", $filiale);
} else {
    $stmt_expiring = $conn->prepare($sql_expiring);
}

// Check if customer_contracts table exists, if not use fallback
$result = $conn->query("SHOW TABLES LIKE 'customer_contracts'");
if ($result->num_rows > 0) {
    $stmt_expiring->execute();
    $expiring_contracts = $stmt_expiring->get_result()->fetch_assoc()['count'];
}

jsonResponse(true, 'Dashboard statistics retrieved successfully', [
    'daily_calls' => (int)$today_calls,
    'daily_target' => $daily_target,
    'appointments' => (int)$today_appointments,
    'success_rate' => (int)$success_rate,
    'upcoming_appointments' => (int)$upcoming_appointments,
    'pending_callbacks' => (int)$pending_callbacks,
    'expiring_contracts' => (int)$expiring_contracts,
    'active_users' => (int)$active_users
]);
?>
