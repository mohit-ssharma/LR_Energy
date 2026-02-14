<?php
require_once 'cors.php';  // CORS headers - MUST BE FIRST!

/**
 * Receive Data API Endpoint
 * URL: /api/receive_data.php
 * Method: POST
 * 
 * Receives SCADA data from sync script every 60 seconds
 * 
 * Security Features:
 * - API Key authentication
 * - JSON validation
 * - Duplicate timestamp protection
 * - Execution time < 5 seconds
 * - Rate limiting ready
 * 
 * Headers:
 * - X-API-Key: Your API key
 * - Content-Type: application/json
 */

require_once 'config.php';

$startTime = microtime(true);

// Set maximum execution time
set_time_limit(API_TIMEOUT);

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed. Use POST.', 405);
}

// Validate API Key
$apiKey = $_SERVER['HTTP_X_API_KEY'] ?? '';
if (empty($apiKey)) {
    // Also check Authorization header
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

// Check if input is empty
if (empty($rawInput)) {
    sendError('Empty request body', 400);
}

// Validate JSON format
$data = json_decode($rawInput, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    sendError('Invalid JSON: ' . json_last_error_msg(), 400);
}

// Validate required fields
if (!isset($data['timestamp'])) {
    sendError('Missing required field: timestamp', 400);
}

// Validate timestamp format (YYYY-MM-DD HH:MM:SS)
$timestamp = $data['timestamp'];
if (!preg_match('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/', $timestamp)) {
    sendError('Invalid timestamp format. Use: YYYY-MM-DD HH:MM:SS', 400);
}

// Validate timestamp is a real date
$dateTime = DateTime::createFromFormat('Y-m-d H:i:s', $timestamp);
if (!$dateTime || $dateTime->format('Y-m-d H:i:s') !== $timestamp) {
    sendError('Invalid timestamp value', 400);
}

// Get plant_id (default to configured PLANT_ID)
$plantId = isset($data['plant_id']) ? $data['plant_id'] : PLANT_ID;

// Validate plant_id length
if (strlen($plantId) > 50) {
    sendError('plant_id too long (max 50 characters)', 400);
}

// Connect to database
$pdo = getDBConnection();
if (!$pdo) {
    sendError('Database connection failed', 500);
}

try {
    // ============================================
    // DUPLICATE TIMESTAMP PROTECTION
    // ============================================
    $checkDuplicate = $pdo->prepare("
        SELECT id FROM scada_readings 
        WHERE plant_id = ? AND timestamp = ?
        LIMIT 1
    ");
    $checkDuplicate->execute([$plantId, $timestamp]);
    
    if ($checkDuplicate->fetch()) {
        // Duplicate found - return success but indicate it was a duplicate
        $executionTime = round((microtime(true) - $startTime) * 1000);
        sendResponse([
            'status' => 'duplicate',
            'message' => 'Data for this timestamp already exists',
            'timestamp' => $timestamp,
            'plant_id' => $plantId,
            'execution_time_ms' => $executionTime
        ], 200);
    }

    // ============================================
    // VALIDATE NUMERIC FIELDS
    // ============================================
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

    // Validate numeric fields
    foreach ($numericFields as $field) {
        if (isset($data[$field]) && $data[$field] !== null) {
            if (!is_numeric($data[$field])) {
                sendError("Field '$field' must be numeric", 400);
            }
        }
    }

    // Validate boolean fields (0 or 1)
    foreach ($booleanFields as $field) {
        if (isset($data[$field]) && $data[$field] !== null) {
            if (!in_array($data[$field], [0, 1, '0', '1'], true)) {
                sendError("Field '$field' must be 0 or 1", 400);
            }
        }
    }

    // ============================================
    // INSERT DATA
    // ============================================
    
    // Define all fields in order
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

    // Build SQL
    $placeholders = implode(', ', array_fill(0, count($allFields), '?'));
    $fieldList = implode(', ', $allFields);
    
    $sql = "INSERT INTO scada_readings ($fieldList) VALUES ($placeholders)";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($values);
    
    $insertId = $pdo->lastInsertId();
    
    // Calculate execution time
    $executionTime = round((microtime(true) - $startTime) * 1000);
    
    // Check if execution time exceeded threshold
    $warning = null;
    if ($executionTime > (API_TIMEOUT * 1000 * 0.8)) {
        $warning = 'Execution time approaching limit';
    }
    
    // Count non-null fields received
    $fieldsReceived = 0;
    foreach (array_slice($allFields, 2) as $field) {
        if (isset($data[$field]) && $data[$field] !== null) {
            $fieldsReceived++;
        }
    }

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
    
    if ($warning) {
        $response['warning'] = $warning;
    }
    
    sendResponse($response, 201);

} catch (PDOException $e) {
    error_log("Database error in receive_data.php: " . $e->getMessage());
    
    // Check for duplicate entry error
    if ($e->getCode() == 23000) {
        sendError('Duplicate entry for this timestamp', 409);
    }
    
    sendError('Database error: ' . $e->getMessage(), 500);
}

// ============================================
// UPDATE SYNC STATUS
// ============================================
try {
    $syncSql = "INSERT INTO sync_status (plant_id, last_sync_time, records_synced, sync_status) 
                VALUES (?, NOW(), 1, 'success')
                ON DUPLICATE KEY UPDATE 
                last_sync_time = NOW(), 
                records_synced = records_synced + 1,
                sync_status = 'success'";
    $syncStmt = $pdo->prepare($syncSql);
    $syncStmt->execute([$plantId]);
} catch (Exception $e) {
    // Log but don't fail the request
    error_log("Failed to update sync status: " . $e->getMessage());
}
?>
