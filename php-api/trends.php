<?php
require_once 'cors.php';  // CORS headers - MUST BE FIRST!

/**
 * Trends API Endpoint
 * URL: /api/trends.php
 * Method: GET
 * 
 * Returns historical data for trend charts
 * 
 * Query Parameters:
 * - hours: number of hours to fetch (default: 24, max: 168)
 * - interval: data aggregation interval in minutes (default: auto)
 * - parameters: comma-separated list of parameters (optional, default: all)
 * 
 * Example: /api/trends.php?hours=24&parameters=raw_biogas_flow,ch4_concentration
 */

require_once 'config.php';

$startTime = microtime(true);

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Method not allowed. Use GET.', 405);
}

// Get query parameters
$hours = isset($_GET['hours']) ? intval($_GET['hours']) : 24;
$hours = min(max($hours, 1), 168);  // Limit: 1 to 168 hours (1 week)

$requestedParams = isset($_GET['parameters']) ? explode(',', $_GET['parameters']) : null;

// Check if raw data is requested (no grouping)
$rawData = isset($_GET['raw']) && $_GET['raw'] === 'true';

// Auto-calculate interval based on hours (only if not requesting raw data)
if ($rawData) {
    $interval = 1;      // 1 minute (raw data, no averaging)
} elseif ($hours <= 1) {
    $interval = 1;      // 1 minute (raw data)
} elseif ($hours <= 12) {
    $interval = 5;      // 5 minutes
} elseif ($hours <= 24) {
    $interval = 10;     // 10 minutes
} elseif ($hours <= 72) {
    $interval = 30;     // 30 minutes
} else {
    $interval = 60;     // 1 hour
}

// Override with custom interval if provided
if (isset($_GET['interval'])) {
    $interval = intval($_GET['interval']);
    $interval = min(max($interval, 1), 60);
}

// Connect to database
$pdo = getDBConnection();
if (!$pdo) {
    sendError('Database connection failed', 500);
}

try {
    // Define all available parameters
    $allParams = [
        'raw_biogas_flow', 'purified_gas_flow', 'product_gas_flow',
        'ch4_concentration', 'co2_level', 'o2_concentration', 'h2s_content', 'dew_point',
        'd1_temp_bottom', 'd1_temp_top', 'd1_gas_pressure', 'd1_air_pressure', 'd1_slurry_height', 'd1_gas_level',
        'd2_temp_bottom', 'd2_temp_top', 'd2_gas_pressure', 'd2_air_pressure', 'd2_slurry_height', 'd2_gas_level',
        'buffer_tank_level', 'lagoon_tank_level',
        'feed_fm1_flow', 'feed_fm2_flow', 'fresh_water_flow', 'recycle_water_flow',
        'psa_efficiency', 'lt_panel_power', 'compressor_status'
    ];
    
    // Filter requested parameters
    $params = $requestedParams ? array_intersect($requestedParams, $allParams) : $allParams;
    
    if (empty($params)) {
        sendError('No valid parameters requested', 400);
    }
    
    // Build query based on whether raw data or grouped data is requested
    if ($rawData || $interval === 1) {
        // RAW DATA: Return every individual record without grouping/averaging
        $selectClauses = ["DATE_FORMAT(timestamp, '%Y-%m-%d %H:%i:%s') as timestamp"];
        foreach ($params as $param) {
            $selectClauses[] = "ROUND($param, 2) as $param";
        }
        $selectClause = implode(', ', $selectClauses);
        
        $sql = "
            SELECT $selectClause
            FROM scada_readings 
            WHERE plant_id = '" . PLANT_ID . "' 
            AND timestamp >= DATE_SUB(NOW(), INTERVAL $hours HOUR)
            ORDER BY timestamp ASC
        ";
    } else {
        // GROUPED DATA: Average values over interval periods
        $selectClauses = ["DATE_FORMAT(MIN(timestamp), '%Y-%m-%d %H:%i') as timestamp"];
        foreach ($params as $param) {
            $selectClauses[] = "ROUND(AVG($param), 2) as $param";
        }
        $selectClause = implode(', ', $selectClauses);
        
        $sql = "
            SELECT $selectClause
            FROM scada_readings 
            WHERE plant_id = '" . PLANT_ID . "' 
            AND timestamp >= DATE_SUB(NOW(), INTERVAL $hours HOUR)
            GROUP BY FLOOR(UNIX_TIMESTAMP(timestamp) / ($interval * 60))
            ORDER BY timestamp ASC
        ";
    }
    
    $stmt = $pdo->query($sql);
    $data = $stmt->fetchAll();
    
    // Get statistics for the full period requested (24hr/12hr/etc)
    $statsSelect = [];
    foreach ($params as $param) {
        $statsSelect[] = "MIN($param) as min_$param";
        $statsSelect[] = "MAX($param) as max_$param";
        $statsSelect[] = "AVG($param) as avg_$param";
    }
    $statsSelectClause = implode(', ', $statsSelect);
    
    $statsSQL = "
        SELECT 
            COUNT(*) as total_records,
            $statsSelectClause
        FROM scada_readings 
        WHERE plant_id = '" . PLANT_ID . "' 
        AND timestamp >= DATE_SUB(NOW(), INTERVAL $hours HOUR)
    ";
    
    $stmtStats = $pdo->query($statsSQL);
    $stats = $stmtStats->fetch();
    
    // Get separate 12-hour statistics (always from last 12 hours)
    $stats12hrSQL = "
        SELECT 
            COUNT(*) as total_records,
            $statsSelectClause
        FROM scada_readings 
        WHERE plant_id = '" . PLANT_ID . "' 
        AND timestamp >= DATE_SUB(NOW(), INTERVAL 12 HOUR)
    ";
    $stmtStats12hr = $pdo->query($stats12hrSQL);
    $stats12hr = $stmtStats12hr->fetch();
    
    // Get separate 24-hour statistics (always from last 24 hours)
    $stats24hrSQL = "
        SELECT 
            COUNT(*) as total_records,
            $statsSelectClause
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
            'min' => round(floatval($stats["min_$param"]), 2),
            'max' => round(floatval($stats["max_$param"]), 2),
            'avg' => round(floatval($stats["avg_$param"]), 2),
            'avg_12hr' => round(floatval($stats12hr["avg_$param"]), 2),
            'avg_24hr' => round(floatval($stats24hr["avg_$param"]), 2)
        ];
    }
    
    $executionTime = round((microtime(true) - $startTime) * 1000);
    
    $response = [
        'status' => 'success',
        'query' => [
            'hours' => $hours,
            'interval_minutes' => $interval,
            'parameters' => $params
        ],
        'data_points' => count($data),
        'total_records' => intval($stats['total_records']),
        'expected_records' => $hours * 60,
        'coverage_percent' => round((intval($stats['total_records']) / ($hours * 60)) * 100, 1),
        'statistics' => $statistics,
        'stats_12hr_records' => intval($stats12hr['total_records']),
        'stats_24hr_records' => intval($stats24hr['total_records']),
        'data' => $data,
        'execution_time_ms' => $executionTime
    ];
    
    sendResponse($response);
    
} catch (PDOException $e) {
    error_log("Trends query error: " . $e->getMessage());
    sendError('Failed to fetch trends: ' . $e->getMessage(), 500);
}
?>
