<?php
require_once 'cors.php';  // CORS headers - MUST BE FIRST!

/**
 * Trends Data API Endpoint
 * URL: /api/trends.php
 * Method: GET
 * 
 * Returns time-series data for charts with proper interval grouping.
 * 
 * Query Parameters:
 * - hours: Number of hours to fetch (1, 12, 24, or 168 for 7 days)
 * - parameters: Comma-separated list of parameters to fetch (optional)
 * 
 * Interval Logic:
 * - 1 hour: 10 intervals of 6 minutes each
 * - 12 hours: 10 intervals of 72 minutes each
 * - 24 hours: 10 intervals of 144 minutes each
 * - 7 days (168 hours): 7 intervals of 1 day each
 * 
 * Each interval returns AVG of all readings within that time window.
 */

require_once 'config.php';

$startTime = microtime(true);

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Method not allowed. Use GET.', 405);
}

// Get query parameters
$hours = isset($_GET['hours']) ? intval($_GET['hours']) : 24;
$hours = min(max($hours, 1), 168);  // Limit: 1 to 168 hours (1 week)

$requestedParams = isset($_GET['parameters']) ? explode(',', $_GET['parameters']) : null;

// Calculate interval based on hours to get exactly 10 entries (or 7 for week)
if ($hours <= 1) {
    // 1 hour: 10 intervals of 6 minutes each
    $intervalSeconds = 360;  // 6 minutes
    $numIntervals = 10;
    $intervalLabel = '6 min';
} elseif ($hours <= 12) {
    // 12 hours: 10 intervals of 72 minutes each
    $intervalSeconds = 4320;  // 72 minutes
    $numIntervals = 10;
    $intervalLabel = '72 min';
} elseif ($hours <= 24) {
    // 24 hours: 10 intervals of 144 minutes each
    $intervalSeconds = 8640;  // 144 minutes
    $numIntervals = 10;
    $intervalLabel = '144 min';
} else {
    // 7 days: 7 intervals of 1 day each
    $intervalSeconds = 86400;  // 1 day
    $numIntervals = 7;
    $intervalLabel = '1 day';
}

$pdo = getDBConnection();
if (!$pdo) {
    sendError('Database connection failed', 500);
}

try {
    // Define all available parameters
    $availableParams = [
        'raw_biogas_flow', 'purified_gas_flow', 'product_gas_flow',
        'ch4_concentration', 'co2_level', 'o2_concentration', 'h2s_content', 'dew_point',
        'd1_temp_bottom', 'd1_temp_top', 'd1_gas_pressure', 'd1_air_pressure', 'd1_slurry_height', 'd1_gas_level',
        'd2_temp_bottom', 'd2_temp_top', 'd2_gas_pressure', 'd2_air_pressure', 'd2_slurry_height', 'd2_gas_level',
        'buffer_tank_level', 'lagoon_tank_level',
        'feed_fm1_flow', 'feed_fm2_flow', 'fresh_water_flow', 'recycle_water_flow',
        'psa_efficiency', 'lt_panel_power'
    ];
    
    // Filter to requested parameters or use all
    if ($requestedParams) {
        $params = array_intersect($requestedParams, $availableParams);
    } else {
        $params = $availableParams;
    }
    
    if (empty($params)) {
        sendError('No valid parameters requested', 400);
    }
    
    // Build SELECT clause for AVG of each parameter
    $selectClauses = [];
    foreach ($params as $param) {
        $selectClauses[] = "ROUND(AVG($param), 2) as $param";
    }
    $selectClause = implode(', ', $selectClauses);
    
    // Calculate start time
    $startTimeSQL = "DATE_SUB(NOW(), INTERVAL $hours HOUR)";
    
    if ($hours >= 168) {
        // 7 days: Group by DATE
        $sql = "
            SELECT 
                DATE(timestamp) as date_bucket,
                DATE_FORMAT(MIN(timestamp), '%Y-%m-%d') as timestamp,
                DATE_FORMAT(MIN(timestamp), '%a') as day_name,
                DATE_FORMAT(MIN(timestamp), '%d %b') as day_label,
                COUNT(*) as records_in_interval,
                $selectClause
            FROM scada_readings 
            WHERE plant_id = '" . PLANT_ID . "' 
            AND timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY DATE(timestamp)
            ORDER BY date_bucket ASC
            LIMIT 7
        ";
    } else {
        // 1hr, 12hr, 24hr: Group by time bucket
        $sql = "
            SELECT 
                FLOOR(UNIX_TIMESTAMP(timestamp) / $intervalSeconds) as time_bucket,
                DATE_FORMAT(FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(timestamp) / $intervalSeconds) * $intervalSeconds), '%Y-%m-%d %H:%i:%s') as timestamp,
                DATE_FORMAT(FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(timestamp) / $intervalSeconds) * $intervalSeconds), '%H:%i') as time_label,
                COUNT(*) as records_in_interval,
                $selectClause
            FROM scada_readings 
            WHERE plant_id = '" . PLANT_ID . "' 
            AND timestamp >= $startTimeSQL
            GROUP BY time_bucket
            ORDER BY time_bucket ASC
            LIMIT $numIntervals
        ";
    }
    
    $stmt = $pdo->query($sql);
    $data = $stmt->fetchAll();
    
    // Get separate 12-hour statistics
    $stats12hrSQL = "
        SELECT 
            COUNT(*) as total_records,
            " . implode(', ', array_map(function($p) { return "ROUND(AVG($p), 2) as avg_$p, ROUND(MIN($p), 2) as min_$p, ROUND(MAX($p), 2) as max_$p"; }, $params)) . "
        FROM scada_readings 
        WHERE plant_id = '" . PLANT_ID . "' 
        AND timestamp >= DATE_SUB(NOW(), INTERVAL 12 HOUR)
    ";
    $stmtStats12hr = $pdo->query($stats12hrSQL);
    $stats12hr = $stmtStats12hr->fetch();
    
    // Get separate 24-hour statistics
    $stats24hrSQL = "
        SELECT 
            COUNT(*) as total_records,
            " . implode(', ', array_map(function($p) { return "ROUND(AVG($p), 2) as avg_$p, ROUND(MIN($p), 2) as min_$p, ROUND(MAX($p), 2) as max_$p"; }, $params)) . "
        FROM scada_readings 
        WHERE plant_id = '" . PLANT_ID . "' 
        AND timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    ";
    $stmtStats24hr = $pdo->query($stats24hrSQL);
    $stats24hr = $stmtStats24hr->fetch();
    
    // Build statistics response with separate 12hr and 24hr averages
    $statistics = [];
    foreach ($params as $param) {
        $statistics[$param] = [
            'min' => floatval($stats24hr["min_$param"]),
            'max' => floatval($stats24hr["max_$param"]),
            'avg' => floatval($stats24hr["avg_$param"]),
            'avg_12hr' => floatval($stats12hr["avg_$param"]),
            'avg_24hr' => floatval($stats24hr["avg_$param"])
        ];
    }
    
    // Count total records in the time range
    $totalRecordsSQL = "
        SELECT COUNT(*) as total 
        FROM scada_readings 
        WHERE plant_id = '" . PLANT_ID . "' 
        AND timestamp >= $startTimeSQL
    ";
    $totalStmt = $pdo->query($totalRecordsSQL);
    $totalRecords = $totalStmt->fetch()['total'];
    
    $executionTime = round((microtime(true) - $startTime) * 1000);
    
    $response = [
        'status' => 'success',
        'query' => [
            'hours' => $hours,
            'interval_seconds' => $intervalSeconds,
            'interval_label' => $intervalLabel,
            'num_intervals' => $numIntervals,
            'parameters' => $params
        ],
        'data_points' => count($data),
        'total_records' => intval($totalRecords),
        'expected_intervals' => $numIntervals,
        'coverage_percent' => count($data) > 0 ? round((count($data) / $numIntervals) * 100, 1) : 0,
        'statistics' => $statistics,
        'stats_12hr_records' => intval($stats12hr['total_records']),
        'stats_24hr_records' => intval($stats24hr['total_records']),
        'data' => $data,
        'execution_time_ms' => $executionTime
    ];
    
    sendResponse($response);
    
} catch (PDOException $e) {
    error_log("Trends query error: " . $e->getMessage());
    sendError('Failed to fetch trends data: ' . $e->getMessage(), 500);
}
?>
