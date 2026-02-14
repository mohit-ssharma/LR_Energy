<?php
require_once 'cors.php';  // CORS headers - MUST BE FIRST!

/**
 * Test API Endpoint
 * URL: /api/test.php
 * Method: GET
 * 
 * Tests database connection and API status
 */

require_once 'config.php';

$startTime = microtime(true);

// Test database connection
$pdo = getDBConnection();
$dbStatus = $pdo ? 'connected' : 'failed';

// Get record count if connected
$recordCount = 0;
$latestTimestamp = null;

if ($pdo) {
    try {
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM scada_readings");
        $result = $stmt->fetch();
        $recordCount = $result['count'];
        
        $stmt = $pdo->query("SELECT timestamp FROM scada_readings ORDER BY timestamp DESC LIMIT 1");
        $result = $stmt->fetch();
        $latestTimestamp = $result ? $result['timestamp'] : null;
    } catch (Exception $e) {
        // Ignore errors
    }
}

$executionTime = round((microtime(true) - $startTime) * 1000);

$response = [
    'status' => 'success',
    'message' => 'API is working',
    'environment' => ($_SERVER['SERVER_NAME'] === 'localhost') ? 'local' : 'production',
    'database' => $dbStatus,
    'records' => $recordCount,
    'latest_data' => $latestTimestamp,
    'server_time' => date('Y-m-d H:i:s'),
    'timezone' => TIMEZONE,
    'execution_time_ms' => $executionTime
];

sendResponse($response);
?>
