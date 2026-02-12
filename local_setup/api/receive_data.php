<?php
/**
 * Receive Data API Endpoint
 * URL: /api/receive_data.php
 * Method: POST
 * 
 * Receives SCADA data from sync script and stores in database
 * 
 * Required Headers:
 * - Content-Type: application/json
 * 
 * Required Body:
 * - api_key: string
 * - timestamp: string (Y-m-d H:i:s)
 * - [all 36 sensor fields]
 */

require_once 'config.php';

$startTime = microtime(true);

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed. Use POST.', 405);
}

// Get JSON input
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data) {
    sendError('Invalid JSON data', 400);
}

// Validate API key
if (!isset($data['api_key'])) {
    sendError('API key is required', 401);
}
validateApiKey($data['api_key']);

// Validate IP (if whitelist is configured)
validateIP();

// Validate required fields
if (!isset($data['timestamp'])) {
    sendError('Timestamp is required', 400);
}

// Connect to database
$pdo = getDBConnection();
if (!$pdo) {
    sendError('Database connection failed', 500);
}

// Define all expected fields
$fields = [
    'timestamp',
    'raw_biogas_flow', 'raw_biogas_totalizer',
    'purified_gas_flow', 'purified_gas_totalizer',
    'product_gas_flow', 'product_gas_totalizer',
    'ch4_concentration', 'co2_level', 'o2_concentration', 'h2s_content', 'dew_point',
    'd1_temp_bottom', 'd1_temp_top', 'd1_gas_pressure', 'd1_air_pressure', 'd1_slurry_height', 'd1_gas_level',
    'd2_temp_bottom', 'd2_temp_top', 'd2_gas_pressure', 'd2_air_pressure', 'd2_slurry_height', 'd2_gas_level',
    'buffer_tank_level', 'lagoon_tank_level',
    'feed_fm1_flow', 'feed_fm1_totalizer',
    'feed_fm2_flow', 'feed_fm2_totalizer',
    'fresh_water_flow', 'fresh_water_totalizer',
    'recycle_water_flow', 'recycle_water_totalizer',
    'psa_efficiency', 'lt_panel_power', 'compressor_status'
];

// Build SQL query
$columns = implode(', ', $fields) . ', plant_id';
$placeholders = implode(', ', array_fill(0, count($fields), '?')) . ', ?';

$sql = "INSERT INTO scada_readings ($columns) VALUES ($placeholders)";

try {
    $stmt = $pdo->prepare($sql);
    
    // Build values array
    $values = [];
    foreach ($fields as $field) {
        $values[] = isset($data[$field]) ? $data[$field] : null;
    }
    $values[] = PLANT_ID;  // Add plant_id
    
    $stmt->execute($values);
    $insertId = $pdo->lastInsertId();
    
    $executionTime = round((microtime(true) - $startTime) * 1000);
    
    // Log successful sync
    updateSyncStatus($pdo, 'SUCCESS', 1, null);
    
    // Log API request
    logAPIRequest('receive_data', 'POST', $data, 200, 'Data saved', $executionTime);
    
    sendResponse([
        'status' => 'success',
        'message' => 'Data saved successfully',
        'id' => (int)$insertId,
        'timestamp' => $data['timestamp'],
        'execution_time_ms' => $executionTime
    ]);
    
} catch (PDOException $e) {
    $executionTime = round((microtime(true) - $startTime) * 1000);
    
    // Log failed sync
    updateSyncStatus($pdo, 'FAILED', 0, $e->getMessage());
    
    // Log API request
    logAPIRequest('receive_data', 'POST', $data, 500, $e->getMessage(), $executionTime);
    
    error_log("Database error: " . $e->getMessage());
    sendError('Failed to save data: ' . $e->getMessage(), 500);
}

/**
 * Update sync status table
 */
function updateSyncStatus($pdo, $status, $recordsSynced, $errorMessage) {
    try {
        $sql = "INSERT INTO sync_status (plant_id, last_sync_time, last_sync_status, records_synced, error_message, ip_address) 
                VALUES (?, NOW(), ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            PLANT_ID,
            $status,
            $recordsSynced,
            $errorMessage,
            $_SERVER['REMOTE_ADDR'] ?? 'unknown'
        ]);
    } catch (Exception $e) {
        error_log("Failed to update sync status: " . $e->getMessage());
    }
}
?>
