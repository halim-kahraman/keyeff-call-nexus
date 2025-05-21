
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

// Only admins and filialleiter can access statistics
if ($payload['role'] !== 'admin' && $payload['role'] !== 'filialleiter') {
    jsonResponse(false, 'Access denied', null, 403);
}

// Get filter parameters
$start_date = $_GET['start_date'] ?? date('Y-m-d', strtotime('-30 days'));
$end_date = $_GET['end_date'] ?? date('Y-m-d');
$filiale_id = null;

// Filter by filiale if not admin
if ($payload['role'] !== 'admin') {
    $filiale_id = $payload['filiale'];
}

$conn = getConnection();

// Get calls by day
$sql_calls_by_day = "
    SELECT 
        DATE(cl.created_at) as day, 
        COUNT(*) as total_calls,
        SUM(cl.duration) as total_duration
    FROM 
        call_logs cl
        JOIN users u ON cl.user_id = u.id
    WHERE 
        DATE(cl.created_at) BETWEEN ? AND ?
        " . ($filiale_id ? "AND u.filiale = ?" : "") . "
    GROUP BY 
        DATE(cl.created_at)
    ORDER BY 
        DATE(cl.created_at) ASC
";

$stmt_calls_by_day = $conn->prepare($sql_calls_by_day);
if ($filiale_id) {
    $stmt_calls_by_day->bind_param("sss", $start_date, $end_date, $filiale_id);
} else {
    $stmt_calls_by_day->bind_param("ss", $start_date, $end_date);
}
$stmt_calls_by_day->execute();
$result_calls_by_day = $stmt_calls_by_day->get_result();

$calls_by_day = [];
while ($row = $result_calls_by_day->fetch_assoc()) {
    $calls_by_day[] = [
        'day' => $row['day'],
        'total_calls' => (int)$row['total_calls'],
        'total_duration' => (int)$row['total_duration'],
        'avg_duration' => $row['total_calls'] > 0 ? round($row['total_duration'] / $row['total_calls']) : 0
    ];
}

// Get calls by outcome
$sql_calls_by_outcome = "
    SELECT 
        cl.outcome, 
        COUNT(*) as count
    FROM 
        call_logs cl
        JOIN users u ON cl.user_id = u.id
    WHERE 
        DATE(cl.created_at) BETWEEN ? AND ?
        " . ($filiale_id ? "AND u.filiale = ?" : "") . "
    GROUP BY 
        cl.outcome
";

$stmt_calls_by_outcome = $conn->prepare($sql_calls_by_outcome);
if ($filiale_id) {
    $stmt_calls_by_outcome->bind_param("sss", $start_date, $end_date, $filiale_id);
} else {
    $stmt_calls_by_outcome->bind_param("ss", $start_date, $end_date);
}
$stmt_calls_by_outcome->execute();
$result_calls_by_outcome = $stmt_calls_by_outcome->get_result();

$calls_by_outcome = [];
while ($row = $result_calls_by_outcome->fetch_assoc()) {
    $calls_by_outcome[] = [
        'outcome' => $row['outcome'],
        'count' => (int)$row['count']
    ];
}

// Get top callers
$sql_top_callers = "
    SELECT 
        u.id,
        u.name,
        COUNT(cl.id) as total_calls,
        SUM(cl.duration) as total_duration
    FROM 
        users u
        LEFT JOIN call_logs cl ON u.id = cl.user_id AND DATE(cl.created_at) BETWEEN ? AND ?
    WHERE 
        u.role = 'telefonist'
        " . ($filiale_id ? "AND u.filiale = ?" : "") . "
    GROUP BY 
        u.id, u.name
    ORDER BY 
        total_calls DESC
    LIMIT 10
";

$stmt_top_callers = $conn->prepare($sql_top_callers);
if ($filiale_id) {
    $stmt_top_callers->bind_param("sss", $start_date, $end_date, $filiale_id);
} else {
    $stmt_top_callers->bind_param("ss", $start_date, $end_date);
}
$stmt_top_callers->execute();
$result_top_callers = $stmt_top_callers->get_result();

$top_callers = [];
while ($row = $result_top_callers->fetch_assoc()) {
    $top_callers[] = [
        'id' => $row['id'],
        'name' => $row['name'],
        'total_calls' => (int)$row['total_calls'],
        'total_duration' => (int)$row['total_duration'],
        'avg_duration' => $row['total_calls'] > 0 ? round($row['total_duration'] / $row['total_calls']) : 0
    ];
}

// Get appointments by type
$sql_appointments = "
    SELECT 
        a.type,
        COUNT(*) as count
    FROM 
        appointments a
        JOIN users u ON a.user_id = u.id
    WHERE 
        DATE(a.appointment_date) BETWEEN ? AND ?
        " . ($filiale_id ? "AND u.filiale = ?" : "") . "
    GROUP BY 
        a.type
";

$stmt_appointments = $conn->prepare($sql_appointments);
if ($filiale_id) {
    $stmt_appointments->bind_param("sss", $start_date, $end_date, $filiale_id);
} else {
    $stmt_appointments->bind_param("ss", $start_date, $end_date);
}
$stmt_appointments->execute();
$result_appointments = $stmt_appointments->get_result();

$appointments_by_type = [];
while ($row = $result_appointments->fetch_assoc()) {
    $appointments_by_type[] = [
        'type' => $row['type'],
        'count' => (int)$row['count']
    ];
}

// Get summary
$sql_summary = "
    SELECT 
        COUNT(DISTINCT cl.id) as total_calls,
        COUNT(DISTINCT a.id) as total_appointments,
        COUNT(DISTINCT cl.customer_id) as total_customers_contacted
    FROM 
        users u
        LEFT JOIN call_logs cl ON u.id = cl.user_id AND DATE(cl.created_at) BETWEEN ? AND ?
        LEFT JOIN appointments a ON u.id = a.user_id AND DATE(a.appointment_date) BETWEEN ? AND ?
    WHERE 
        u.role = 'telefonist'
        " . ($filiale_id ? "AND u.filiale = ?" : "") . "
";

$stmt_summary = $conn->prepare($sql_summary);
if ($filiale_id) {
    $stmt_summary->bind_param("sssss", $start_date, $end_date, $start_date, $end_date, $filiale_id);
} else {
    $stmt_summary->bind_param("ssss", $start_date, $end_date, $start_date, $end_date);
}
$stmt_summary->execute();
$result_summary = $stmt_summary->get_result();
$summary = $result_summary->fetch_assoc();

// Return all statistics
jsonResponse(true, 'Statistics retrieved successfully', [
    'summary' => [
        'total_calls' => (int)$summary['total_calls'],
        'total_appointments' => (int)$summary['total_appointments'],
        'total_customers_contacted' => (int)$summary['total_customers_contacted'],
        'period' => [
            'start' => $start_date,
            'end' => $end_date
        ]
    ],
    'calls_by_day' => $calls_by_day,
    'calls_by_outcome' => $calls_by_outcome,
    'top_callers' => $top_callers,
    'appointments_by_type' => $appointments_by_type
]);
?>
