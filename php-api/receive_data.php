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
    sendError('Method not allowed. Use POST.', 405);
}

// Validate API Key - Support multiple methods for PLC compatibility
// Method 1: X-API-Key header (preferred)
// Method 2: Authorization: Bearer header
// Method 3: URL query parameter ?api_key= (for PLCs that can't set headers)
// Method 4: JSON body "api_key" field (for PLCs that can't set headers)

$apiKey = '';

// Check header first
if (!empty($_SERVER['HTTP_X_API_KEY'])) {
    $apiKey = $_SERVER['HTTP_X_API_KEY'];
} elseif (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        $apiKey = $matches[1];
    }
}

// Check URL query parameter (for Siemens PLC LHTTP compatibility)
if (empty($apiKey) && isset($_GET['api_key'])) {
    $apiKey = $_GET['api_key'];
}

// Will also check JSON body after parsing (below)
$checkJsonApiKey = empty($apiKey);

if (empty($apiKey) && !$checkJsonApiKey) {
    validateApiKey($apiKey);
}

// Validate IP if whitelist is set
validateIP();

// Get and validate JSON input
$rawInput = file_get_contents('php://input');

if (empty($rawInput)) {
    sendError('Empty request body', 400);
}

$data = json_decode($rawInput, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    sendError('Invalid JSON: ' . json_last_error_msg(), 400);
}

// Validate required fields
if (!isset($data['timestamp'])) {
    sendError('Missing required field: timestamp', 400);
}

// Validate timestamp format
$timestamp = $data['timestamp'];
if (!preg_match('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/', $timestamp)) {
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
 * Check thresholds and create alerts
 * 
 * THRESHOLD REFERENCE:
 * ====================
 * Gas Composition:
 *   - CH4: ≥96% = Accepted, <96% = Warning
 *   - CO2: <5% = Normal, ≥5% = Warning
 *   - O2: <0.5% = Normal, ≥0.5% = Warning, ≥2% = Critical (explosion risk)
 *   - H2S: <500 ppm = Normal, ≥500 = Warning, ≥1000 = Critical (safety hazard)
 *   - Dew Point: -80 to -40 mg/m³ = Normal
 * 
 * Digester:
 *   - Temperature: 30-45°C = Normal, >50°C = Critical (bacteria death)
 *   - Gas Pressure: 10-50 mbar = Normal
 *   - Slurry Height: 2-8 m = Normal
 *   - Gas Level: 30-90% = Normal
 * 
 * Tanks:
 *   - Buffer/Lagoon: 20-95% = Normal
 * 
 * Equipment:
 *   - PSA Efficiency: ≥85% = Normal
 *   - LT Panel Power: 50-400 kW = Normal
 */
function checkAndCreateAlerts($pdo, $plantId, $data) {
    // Define all thresholds
    $thresholds = [
        // ========== GAS COMPOSITION ==========
        'ch4_concentration' => ['min' => 96, 'max' => 100, 'severity' => 'WARNING', 'name' => 'CH₄ Concentration'],
        'co2_level' => ['min' => 0, 'max' => 5, 'severity' => 'WARNING', 'name' => 'CO₂ Level'],
        'o2_concentration' => ['min' => 0, 'max' => 0.5, 'severity' => 'WARNING', 'name' => 'O₂ Concentration'],
        'h2s_content' => ['min' => 0, 'max' => 500, 'severity' => 'WARNING', 'name' => 'H₂S Content'],
        'dew_point' => ['min' => -80, 'max' => -40, 'severity' => 'WARNING', 'name' => 'Dew Point'],
        
        // ========== GAS FLOW ==========
        'raw_biogas_flow' => ['min' => 500, 'max' => 2000, 'severity' => 'WARNING', 'name' => 'Raw Biogas Flow'],
        'purified_gas_flow' => ['min' => 400, 'max' => 1800, 'severity' => 'WARNING', 'name' => 'Purified Gas Flow'],
        'product_gas_flow' => ['min' => 350, 'max' => 1700, 'severity' => 'WARNING', 'name' => 'Product Gas Flow'],
        
        // ========== DIGESTER 1 ==========
        'd1_temp_bottom' => ['min' => 30, 'max' => 45, 'severity' => 'WARNING', 'name' => 'Digester 1 Temperature'],
        'd1_gas_pressure' => ['min' => 10, 'max' => 50, 'severity' => 'WARNING', 'name' => 'Digester 1 Gas Pressure'],
        'd1_slurry_height' => ['min' => 2, 'max' => 8, 'severity' => 'WARNING', 'name' => 'Digester 1 Slurry Height'],
        'd1_gas_level' => ['min' => 30, 'max' => 90, 'severity' => 'WARNING', 'name' => 'Digester 1 Gas Level'],
        
        // ========== DIGESTER 2 ==========
        'd2_temp_bottom' => ['min' => 30, 'max' => 45, 'severity' => 'WARNING', 'name' => 'Digester 2 Temperature'],
        'd2_gas_pressure' => ['min' => 10, 'max' => 50, 'severity' => 'WARNING', 'name' => 'Digester 2 Gas Pressure'],
        'd2_slurry_height' => ['min' => 2, 'max' => 8, 'severity' => 'WARNING', 'name' => 'Digester 2 Slurry Height'],
        'd2_gas_level' => ['min' => 30, 'max' => 90, 'severity' => 'WARNING', 'name' => 'Digester 2 Gas Level'],
        
        // ========== TANK LEVELS ==========
        'buffer_tank_level' => ['min' => 20, 'max' => 95, 'severity' => 'WARNING', 'name' => 'Buffer Tank Level'],
        'lagoon_tank_level' => ['min' => 20, 'max' => 95, 'severity' => 'WARNING', 'name' => 'Lagoon Tank Level'],
        
        // ========== EQUIPMENT ==========
        'psa_efficiency' => ['min' => 85, 'max' => 100, 'severity' => 'WARNING', 'name' => 'PSA Efficiency'],
        'lt_panel_power' => ['min' => 50, 'max' => 400, 'severity' => 'WARNING', 'name' => 'LT Panel Power'],
    ];
    
    // Critical thresholds (override severity for extreme values)
    $criticalThresholds = [
        'h2s_content' => ['max' => 1000, 'name' => 'H₂S Content - DANGER'],
        'o2_concentration' => ['max' => 2, 'name' => 'O₂ Concentration - Explosion Risk'],
        'd1_temp_bottom' => ['max' => 50, 'name' => 'Digester 1 Temperature - Critical'],
        'd2_temp_bottom' => ['max' => 50, 'name' => 'Digester 2 Temperature - Critical'],
    ];
    
    try {
        // Check WARNING thresholds
        foreach ($thresholds as $field => $config) {
            if (!isset($data[$field]) || $data[$field] === null) continue;
            
            $value = floatval($data[$field]);
            $alertMessage = null;
            $thresholdValue = null;
            $severity = $config['severity'];
            
            if ($value < $config['min']) {
                $alertMessage = "{$config['name']} is below minimum ({$value} < {$config['min']})";
                $thresholdValue = $config['min'];
            } elseif ($value > $config['max']) {
                $alertMessage = "{$config['name']} exceeds maximum ({$value} > {$config['max']})";
                $thresholdValue = $config['max'];
            }
            
            if ($alertMessage) {
                createAlert($pdo, $plantId, $field, $value, $thresholdValue, $severity, $alertMessage);
            }
        }
        
        // Check CRITICAL thresholds (higher priority)
        foreach ($criticalThresholds as $field => $config) {
            if (!isset($data[$field]) || $data[$field] === null) continue;
            
            $value = floatval($data[$field]);
            
            if (isset($config['max']) && $value > $config['max']) {
                $alertMessage = "🚨 CRITICAL: {$config['name']} ({$value} > {$config['max']})";
                createAlert($pdo, $plantId, $field . '_critical', $value, $config['max'], 'CRITICAL', $alertMessage);
            }
            if (isset($config['min']) && $value < $config['min']) {
                $alertMessage = "🚨 CRITICAL: {$config['name']} ({$value} < {$config['min']})";
                createAlert($pdo, $plantId, $field . '_critical', $value, $config['min'], 'CRITICAL', $alertMessage);
            }
        }
        
    } catch (Exception $e) {
        error_log("Failed to check alerts: " . $e->getMessage());
    }
}

/**
 * Create alert if not duplicate
 */
function createAlert($pdo, $plantId, $parameter, $value, $threshold, $severity, $message) {
    try {
        // Check if similar active alert exists in last hour
        $checkSql = "SELECT id FROM alerts 
                     WHERE plant_id = ? AND parameter = ? AND status = 'ACTIVE' 
                     AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
                     LIMIT 1";
        $checkStmt = $pdo->prepare($checkSql);
        $checkStmt->execute([$plantId, $parameter]);
        
        if (!$checkStmt->fetch()) {
            $insertSql = "INSERT INTO alerts (plant_id, parameter, current_value, threshold_value, severity, message) 
                          VALUES (?, ?, ?, ?, ?, ?)";
            $insertStmt = $pdo->prepare($insertSql);
            $insertStmt->execute([$plantId, $parameter, $value, $threshold, $severity, $message]);
        }
    } catch (Exception $e) {
        error_log("Failed to create alert: " . $e->getMessage());
    }
}
?>
