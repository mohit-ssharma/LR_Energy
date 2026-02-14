<?php
require_once 'cors.php';  // CORS headers - MUST BE FIRST!

/**
 * Receive Data API Endpoint
 * URL: /api/receive_data.php
 * Method: POST
 * 
 * Receives SCADA data from PLC every 60 seconds
 * 
 * Features:
 * - API Key authentication
 * - JSON validation
 * - Duplicate timestamp protection
 * - Auto-populates: sync_status, api_logs, alerts
 */

require_once 'config.php';

$startTime = microtime(true);

// Set maximum execution time
set_time_limit(API_TIMEOUT);

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    logApiRequest('receive_data.php', 'POST', 405, 'Method not allowed');
    sendError('Method not allowed. Use POST.', 405);
}

// Validate API Key
$apiKey = $_SERVER['HTTP_X_API_KEY'] ?? '';
if (empty($apiKey)) {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        $apiKey = $matches[1];
    }
}
validateApiKey($apiKey);

// Validate IP if whitelist is set
validateIP();

// Get and validate JSON input
$rawInput = file_get_contents('php://input');

if (empty($rawInput)) {
    logApiRequest('receive_data.php', 'POST', 400, 'Empty request body');
    sendError('Empty request body', 400);
}

$data = json_decode($rawInput, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    logApiRequest('receive_data.php', 'POST', 400, 'Invalid JSON');
    sendError('Invalid JSON: ' . json_last_error_msg(), 400);
}

// Validate required fields
if (!isset($data['timestamp'])) {
    logApiRequest('receive_data.php', 'POST', 400, 'Missing timestamp');
    sendError('Missing required field: timestamp', 400);
}

// Validate timestamp format
$timestamp = $data['timestamp'];
if (!preg_match('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/', $timestamp)) {
    logApiRequest('receive_data.php', 'POST', 400, 'Invalid timestamp format');
    sendError('Invalid timestamp format. Use: YYYY-MM-DD HH:MM:SS', 400);
}

$dateTime = DateTime::createFromFormat('Y-m-d H:i:s', $timestamp);
if (!$dateTime || $dateTime->format('Y-m-d H:i:s') !== $timestamp) {
    sendError('Invalid timestamp value', 400);
}

$plantId = isset($data['plant_id']) ? $data['plant_id'] : PLANT_ID;

if (strlen($plantId) > 50) {
    sendError('plant_id too long (max 50 characters)', 400);
}

// Connect to database
$pdo = getDBConnection();
if (!$pdo) {
    logApiRequest('receive_data.php', 'POST', 500, 'Database connection failed');
    sendError('Database connection failed', 500);
}

try {
    // Check for duplicate
    $checkDuplicate = $pdo->prepare("
        SELECT id FROM scada_readings 
        WHERE plant_id = ? AND timestamp = ?
        LIMIT 1
    ");
    $checkDuplicate->execute([$plantId, $timestamp]);
    
    if ($checkDuplicate->fetch()) {
        $executionTime = round((microtime(true) - $startTime) * 1000);
        logApiRequest('receive_data.php', 'POST', 200, 'Duplicate data', $executionTime);
        sendResponse([
            'status' => 'duplicate',
            'message' => 'Data for this timestamp already exists',
            'timestamp' => $timestamp,
            'plant_id' => $plantId,
            'execution_time_ms' => $executionTime
        ], 200);
    }

    // Validate numeric fields
    $numericFields = [
        'raw_biogas_flow', 'raw_biogas_totalizer',
        'purified_gas_flow', 'purified_gas_totalizer',
        'product_gas_flow', 'product_gas_totalizer',
        'ch4_concentration', 'co2_level', 'o2_concentration', 'h2s_content', 'dew_point',
        'd1_temp_bottom', 'd1_temp_top', 'd1_gas_pressure', 'd1_air_pressure', 'd1_slurry_height', 'd1_gas_level',
        'd2_temp_bottom', 'd2_temp_top', 'd2_gas_pressure', 'd2_air_pressure', 'd2_slurry_height', 'd2_gas_level',
        'buffer_tank_level', 'lagoon_tank_level',
        'feed_fm1_flow', 'feed_fm1_totalizer', 'feed_fm2_flow', 'feed_fm2_totalizer',
        'fresh_water_flow', 'fresh_water_totalizer', 'recycle_water_flow', 'recycle_water_totalizer',
        'psa_efficiency', 'lt_panel_power'
    ];

    $booleanFields = ['psa_status', 'compressor_status'];

    foreach ($numericFields as $field) {
        if (isset($data[$field]) && $data[$field] !== null) {
            if (!is_numeric($data[$field])) {
                sendError("Field '$field' must be numeric", 400);
            }
        }
    }

    foreach ($booleanFields as $field) {
        if (isset($data[$field]) && $data[$field] !== null) {
            if (!in_array($data[$field], [0, 1, '0', '1'], true)) {
                sendError("Field '$field' must be 0 or 1", 400);
            }
        }
    }

    // Define all fields
    $allFields = [
        'plant_id', 'timestamp',
        'raw_biogas_flow', 'raw_biogas_totalizer',
        'purified_gas_flow', 'purified_gas_totalizer',
        'product_gas_flow', 'product_gas_totalizer',
        'ch4_concentration', 'co2_level', 'o2_concentration', 'h2s_content', 'dew_point',
        'd1_temp_bottom', 'd1_temp_top', 'd1_gas_pressure', 'd1_air_pressure', 'd1_slurry_height', 'd1_gas_level',
        'd2_temp_bottom', 'd2_temp_top', 'd2_gas_pressure', 'd2_air_pressure', 'd2_slurry_height', 'd2_gas_level',
        'buffer_tank_level', 'lagoon_tank_level',
        'feed_fm1_flow', 'feed_fm1_totalizer', 'feed_fm2_flow', 'feed_fm2_totalizer',
        'fresh_water_flow', 'fresh_water_totalizer', 'recycle_water_flow', 'recycle_water_totalizer',
        'psa_status', 'psa_efficiency', 'lt_panel_power', 'compressor_status'
    ];

    // Build values array
    $values = [];
    $values[] = $plantId;
    $values[] = $timestamp;
    
    foreach (array_slice($allFields, 2) as $field) {
        $values[] = isset($data[$field]) ? $data[$field] : null;
    }

    // Insert data
    $placeholders = implode(', ', array_fill(0, count($allFields), '?'));
    $fieldList = implode(', ', $allFields);
    
    $sql = "INSERT INTO scada_readings ($fieldList) VALUES ($placeholders)";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($values);
    
    $insertId = $pdo->lastInsertId();
    
    // Calculate execution time
    $executionTime = round((microtime(true) - $startTime) * 1000);
    
    // Count non-null fields received
    $fieldsReceived = 0;
    foreach (array_slice($allFields, 2) as $field) {
        if (isset($data[$field]) && $data[$field] !== null) {
            $fieldsReceived++;
        }
    }

    // ============================================
    // UPDATE SYNC STATUS
    // ============================================
    updateSyncStatus($pdo, $plantId, 'SUCCESS', 1);

    // ============================================
    // CHECK ALERTS (Threshold monitoring)
    // ============================================
    checkAndCreateAlerts($pdo, $plantId, $data);

    // ============================================
    // LOG API REQUEST
    // ============================================
    logApiRequest('receive_data.php', 'POST', 201, 'Data stored', $executionTime);

    // Send success response
    $response = [
        'status' => 'success',
        'message' => 'Data received and stored',
        'record_id' => intval($insertId),
        'timestamp' => $timestamp,
        'plant_id' => $plantId,
        'fields_received' => $fieldsReceived,
        'total_fields' => count($allFields) - 2,
        'execution_time_ms' => $executionTime
    ];
    
    sendResponse($response, 201);

} catch (PDOException $e) {
    error_log("Database error in receive_data.php: " . $e->getMessage());
    logApiRequest('receive_data.php', 'POST', 500, $e->getMessage());
    
    if ($e->getCode() == 23000) {
        sendError('Duplicate entry for this timestamp', 409);
    }
    
    sendError('Database error: ' . $e->getMessage(), 500);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Update sync_status table
 */
function updateSyncStatus($pdo, $plantId, $status, $recordCount) {
    try {
        $sql = "INSERT INTO sync_status (plant_id, last_sync_time, last_sync_status, records_synced, ip_address) 
                VALUES (?, NOW(), ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                last_sync_time = NOW(), 
                last_sync_status = VALUES(last_sync_status),
                records_synced = records_synced + VALUES(records_synced),
                ip_address = VALUES(ip_address)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$plantId, $status, $recordCount, $_SERVER['REMOTE_ADDR'] ?? null]);
    } catch (Exception $e) {
        error_log("Failed to update sync status: " . $e->getMessage());
    }
}

/**
 * Log API request
 */
function logApiRequest($endpoint, $method, $responseCode, $message, $executionTime = null) {
    global $pdo;
    if (!$pdo) return;
    
    try {
        $sql = "INSERT INTO api_logs (endpoint, method, ip_address, response_code, response_message, execution_time_ms) 
                VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $endpoint,
            $method,
            $_SERVER['REMOTE_ADDR'] ?? null,
            $responseCode,
            substr($message, 0, 255),
            $executionTime
        ]);
    } catch (Exception $e) {
        error_log("Failed to log API request: " . $e->getMessage());
    }
}

/**
 * Check thresholds and create alerts
 */
function checkAndCreateAlerts($pdo, $plantId, $data) {
    // Define thresholds
    $thresholds = [
        'ch4_concentration' => ['min' => 90, 'max' => 100, 'severity' => 'WARNING', 'name' => 'CH4 Concentration'],
        'h2s_content' => ['min' => 0, 'max' => 500, 'severity' => 'CRITICAL', 'name' => 'H2S Content'],
        'o2_concentration' => ['min' => 0, 'max' => 1, 'severity' => 'WARNING', 'name' => 'O2 Concentration'],
        'd1_temp_bottom' => ['min' => 30, 'max' => 45, 'severity' => 'WARNING', 'name' => 'Digester 1 Temperature'],
        'd2_temp_bottom' => ['min' => 30, 'max' => 45, 'severity' => 'WARNING', 'name' => 'Digester 2 Temperature'],
        'buffer_tank_level' => ['min' => 20, 'max' => 95, 'severity' => 'WARNING', 'name' => 'Buffer Tank Level'],
        'psa_efficiency' => ['min' => 85, 'max' => 100, 'severity' => 'WARNING', 'name' => 'PSA Efficiency'],
    ];
    
    try {
        foreach ($thresholds as $field => $config) {
            if (!isset($data[$field]) || $data[$field] === null) continue;
            
            $value = floatval($data[$field]);
            $alertMessage = null;
            $thresholdValue = null;
            
            if ($value < $config['min']) {
                $alertMessage = "{$config['name']} is below minimum threshold";
                $thresholdValue = $config['min'];
            } elseif ($value > $config['max']) {
                $alertMessage = "{$config['name']} exceeds maximum threshold";
                $thresholdValue = $config['max'];
            }
            
            if ($alertMessage) {
                // Check if similar active alert exists
                $checkSql = "SELECT id FROM alerts 
                             WHERE plant_id = ? AND parameter = ? AND status = 'ACTIVE' 
                             AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
                             LIMIT 1";
                $checkStmt = $pdo->prepare($checkSql);
                $checkStmt->execute([$plantId, $field]);
                
                if (!$checkStmt->fetch()) {
                    // Create new alert
                    $insertSql = "INSERT INTO alerts (plant_id, parameter, current_value, threshold_value, severity, message) 
                                  VALUES (?, ?, ?, ?, ?, ?)";
                    $insertStmt = $pdo->prepare($insertSql);
                    $insertStmt->execute([
                        $plantId,
                        $field,
                        $value,
                        $thresholdValue,
                        $config['severity'],
                        $alertMessage
                    ]);
                }
            }
        }
    } catch (Exception $e) {
        error_log("Failed to check alerts: " . $e->getMessage());
    }
}
?>
