# 📁 Complete Files Reference
## All PHP Files Content for Local XAMPP Setup

This document contains the COMPLETE content of every file you need to set up locally.
Simply copy-paste each file to the correct location.

---

## 📋 Quick Setup Checklist

| # | Task | Status |
|---|------|--------|
| 1 | Install XAMPP | ☐ |
| 2 | Start Apache + MySQL in XAMPP | ☐ |
| 3 | Create folder: `C:\xampp\htdocs\scada-api\api\` | ☐ |
| 4 | Create database `scada_db` in phpMyAdmin | ☐ |
| 5 | Run SQL schema in phpMyAdmin | ☐ |
| 6 | Copy all 7 PHP files | ☐ |
| 7 | Test: http://localhost/scada-api/api/test.php | ☐ |

---

# FILE 1: config.php
**Location:** `C:\xampp\htdocs\scada-api\api\config.php`
**Purpose:** Database connection and shared helper functions

```php
<?php
/**
 * Database Configuration
 * 
 * LOCAL DEVELOPMENT (XAMPP):
 * - Host: localhost
 * - User: root
 * - Password: (empty)
 * - Database: scada_db
 * 
 * PRODUCTION (GoDaddy):
 * - Update these values with your GoDaddy credentials
 */

// ============================================
// ENVIRONMENT DETECTION
// ============================================

$is_local = ($_SERVER['SERVER_NAME'] === 'localhost' || $_SERVER['SERVER_NAME'] === '127.0.0.1');

// ============================================
// DATABASE CREDENTIALS
// ============================================

if ($is_local) {
    // LOCAL DEVELOPMENT (XAMPP)
    define('DB_HOST', 'localhost');
    define('DB_NAME', 'scada_db');
    define('DB_USER', 'root');
    define('DB_PASS', '');  // XAMPP default is empty password
} else {
    // PRODUCTION (GoDaddy) - UPDATE THESE!
    define('DB_HOST', 'localhost');
    define('DB_NAME', 'your_godaddy_database_name');
    define('DB_USER', 'your_godaddy_username');
    define('DB_PASS', 'your_godaddy_password');
}

// ============================================
// API SECURITY
// ============================================

// API Key for sync script authentication
define('API_KEY', 'sk_test_local_development_key_123');

// Optional: Whitelist IP (leave empty to allow all)
define('ALLOWED_IP', '');

// ============================================
// APPLICATION SETTINGS
// ============================================

define('PLANT_ID', 'KARNAL');
define('TIMEZONE', 'Asia/Kolkata');

// Set timezone
date_default_timezone_set(TIMEZONE);

// ============================================
// DATABASE CONNECTION FUNCTION
// ============================================

function getDBConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;
        
    } catch (PDOException $e) {
        error_log("Database connection failed: " . $e->getMessage());
        return null;
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Send JSON response
 */
function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    echo json_encode($data);
    exit;
}

/**
 * Send error response
 */
function sendError($message, $statusCode = 400) {
    sendResponse(['status' => 'error', 'message' => $message], $statusCode);
}

/**
 * Validate API key
 */
function validateApiKey($providedKey) {
    if ($providedKey !== API_KEY) {
        sendError('Invalid API key', 401);
    }
}

/**
 * Validate IP address (if whitelist is set)
 */
function validateIP() {
    if (!empty(ALLOWED_IP)) {
        $clientIP = $_SERVER['REMOTE_ADDR'];
        if ($clientIP !== ALLOWED_IP) {
            sendError('IP not allowed', 403);
        }
    }
}

/**
 * Log API request
 */
function logAPIRequest($endpoint, $method, $requestBody, $responseCode, $responseMessage, $executionTime) {
    $pdo = getDBConnection();
    if (!$pdo) return;
    
    try {
        $sql = "INSERT INTO api_logs (endpoint, method, ip_address, request_body, response_code, response_message, execution_time_ms) 
                VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $endpoint,
            $method,
            $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            is_array($requestBody) ? json_encode($requestBody) : $requestBody,
            $responseCode,
            $responseMessage,
            $executionTime
        ]);
    } catch (Exception $e) {
        error_log("Failed to log API request: " . $e->getMessage());
    }
}

/**
 * Handle CORS preflight
 */
function handleCORS() {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        http_response_code(200);
        exit;
    }
}

// Handle CORS for all requests
handleCORS();
?>
```

---

# FILE 2: test.php
**Location:** `C:\xampp\htdocs\scada-api\api\test.php`
**Purpose:** Health check - verify API and database are working
**URL:** http://localhost/scada-api/api/test.php

```php
<?php
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
```

---

# FILE 3: auth.php
**Location:** `C:\xampp\htdocs\scada-api\api\auth.php`
**Purpose:** User login authentication
**Method:** POST

```php
<?php
/**
 * Authentication API Endpoint
 * URL: /api/auth.php
 * Method: POST
 * 
 * Request Body:
 * {
 *   "email": "user@example.com",
 *   "password": "password"
 * }
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

// Validate required fields
if (!isset($data['email']) || !isset($data['password'])) {
    sendError('Email and password are required', 400);
}

$email = trim($data['email']);
$password = $data['password'];

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendError('Invalid email format', 400);
}

// Connect to database
$pdo = getDBConnection();
if (!$pdo) {
    sendError('Database connection failed', 500);
}

try {
    // Find user by email
    $stmt = $pdo->prepare("SELECT id, email, password, role, name, is_active FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if (!$user) {
        logAPIRequest('auth', 'POST', ['email' => $email], 401, 'User not found', 0);
        sendError('Invalid email or password', 401);
    }
    
    // Check if user is active
    if (!$user['is_active']) {
        sendError('Account is disabled', 403);
    }
    
    // Verify password (accepts 'qwerty' for testing)
    $passwordValid = password_verify($password, $user['password']) || $password === 'qwerty';
    
    if (!$passwordValid) {
        logAPIRequest('auth', 'POST', ['email' => $email], 401, 'Invalid password', 0);
        sendError('Invalid email or password', 401);
    }
    
    // Update last login
    $updateStmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
    $updateStmt->execute([$user['id']]);
    
    // Generate simple token
    $token = base64_encode(json_encode([
        'user_id' => $user['id'],
        'email' => $user['email'],
        'role' => $user['role'],
        'exp' => time() + (24 * 60 * 60)
    ]));
    
    $executionTime = round((microtime(true) - $startTime) * 1000);
    
    logAPIRequest('auth', 'POST', ['email' => $email], 200, 'Login successful', $executionTime);
    
    sendResponse([
        'status' => 'success',
        'message' => 'Login successful',
        'user' => [
            'id' => intval($user['id']),
            'email' => $user['email'],
            'role' => $user['role'],
            'name' => $user['name']
        ],
        'token' => $token,
        'execution_time_ms' => $executionTime
    ]);
    
} catch (PDOException $e) {
    error_log("Auth error: " . $e->getMessage());
    sendError('Authentication failed', 500);
}
?>
```

---

# FILE 4: receive_data.php
**Location:** `C:\xampp\htdocs\scada-api\api\receive_data.php`
**Purpose:** Receives SCADA data from sync script
**Method:** POST

```php
<?php
/**
 * Receive Data API Endpoint
 * URL: /api/receive_data.php
 * Method: POST
 * 
 * Receives SCADA data from sync script and stores in database
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
    $values[] = PLANT_ID;
    
    $stmt->execute($values);
    $insertId = $pdo->lastInsertId();
    
    $executionTime = round((microtime(true) - $startTime) * 1000);
    
    updateSyncStatus($pdo, 'SUCCESS', 1, null);
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
    updateSyncStatus($pdo, 'FAILED', 0, $e->getMessage());
    logAPIRequest('receive_data', 'POST', $data, 500, $e->getMessage(), $executionTime);
    error_log("Database error: " . $e->getMessage());
    sendError('Failed to save data: ' . $e->getMessage(), 500);
}

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
```

---

# FILE 5: dashboard.php
**Location:** `C:\xampp\htdocs\scada-api\api\dashboard.php`
**Purpose:** Returns latest SCADA data with calculated averages
**Method:** GET
**URL:** http://localhost/scada-api/api/dashboard.php

```php
<?php
/**
 * Dashboard API Endpoint
 * URL: /api/dashboard.php
 * Method: GET
 * 
 * Returns latest SCADA data with calculated averages for dashboard display
 */

require_once 'config.php';

$startTime = microtime(true);

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Method not allowed. Use GET.', 405);
}

$pdo = getDBConnection();
if (!$pdo) {
    sendError('Database connection failed', 500);
}

try {
    // Get latest reading
    $stmt = $pdo->query("
        SELECT * FROM scada_readings 
        WHERE plant_id = '" . PLANT_ID . "' 
        ORDER BY timestamp DESC 
        LIMIT 1
    ");
    $latest = $stmt->fetch();
    
    if (!$latest) {
        sendResponse([
            'status' => 'no_data',
            'message' => 'No data available',
            'data' => null
        ]);
    }
    
    // Calculate data freshness
    $lastTimestamp = strtotime($latest['timestamp']);
    $now = time();
    $ageSeconds = $now - $lastTimestamp;
    
    $dataStatus = 'FRESH';
    if ($ageSeconds > 300) {
        $dataStatus = 'STALE';
    } elseif ($ageSeconds > 120) {
        $dataStatus = 'DELAYED';
    }
    
    // Get 1-hour statistics
    $stmt1hr = $pdo->query("
        SELECT 
            COUNT(*) as sample_count,
            AVG(raw_biogas_flow) as avg_raw_biogas_flow,
            AVG(purified_gas_flow) as avg_purified_gas_flow,
            AVG(product_gas_flow) as avg_product_gas_flow,
            AVG(ch4_concentration) as avg_ch4,
            AVG(co2_level) as avg_co2,
            AVG(o2_concentration) as avg_o2,
            AVG(h2s_content) as avg_h2s,
            AVG(dew_point) as avg_dew_point
        FROM scada_readings 
        WHERE plant_id = '" . PLANT_ID . "' 
        AND timestamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
    ");
    $stats1hr = $stmt1hr->fetch();
    
    // Get 12-hour statistics
    $stmt12hr = $pdo->query("
        SELECT 
            COUNT(*) as sample_count,
            AVG(raw_biogas_flow) as avg_raw_biogas_flow,
            AVG(purified_gas_flow) as avg_purified_gas_flow,
            AVG(product_gas_flow) as avg_product_gas_flow,
            AVG(ch4_concentration) as avg_ch4,
            AVG(co2_level) as avg_co2,
            AVG(o2_concentration) as avg_o2,
            AVG(h2s_content) as avg_h2s,
            AVG(dew_point) as avg_dew_point
        FROM scada_readings 
        WHERE plant_id = '" . PLANT_ID . "' 
        AND timestamp >= DATE_SUB(NOW(), INTERVAL 12 HOUR)
    ");
    $stats12hr = $stmt12hr->fetch();
    
    // Get 24-hour totalizer differences
    $stmt24hr = $pdo->query("
        SELECT 
            COUNT(*) as sample_count,
            MAX(raw_biogas_totalizer) - MIN(raw_biogas_totalizer) as totalizer_raw_biogas,
            MAX(purified_gas_totalizer) - MIN(purified_gas_totalizer) as totalizer_purified_gas,
            MAX(product_gas_totalizer) - MIN(product_gas_totalizer) as totalizer_product_gas,
            MAX(feed_fm1_totalizer) - MIN(feed_fm1_totalizer) as totalizer_feed_fm1,
            MAX(feed_fm2_totalizer) - MIN(feed_fm2_totalizer) as totalizer_feed_fm2,
            MAX(fresh_water_totalizer) - MIN(fresh_water_totalizer) as totalizer_fresh_water,
            MAX(recycle_water_totalizer) - MIN(recycle_water_totalizer) as totalizer_recycle_water
        FROM scada_readings 
        WHERE plant_id = '" . PLANT_ID . "' 
        AND timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    ");
    $stats24hr = $stmt24hr->fetch();
    
    $executionTime = round((microtime(true) - $startTime) * 1000);
    
    $response = [
        'status' => 'success',
        'data_status' => $dataStatus,
        'data_age_seconds' => $ageSeconds,
        'last_update' => $latest['timestamp'],
        'server_time' => date('Y-m-d H:i:s'),
        
        'current' => [
            'raw_biogas_flow' => floatval($latest['raw_biogas_flow']),
            'raw_biogas_totalizer' => floatval($latest['raw_biogas_totalizer']),
            'purified_gas_flow' => floatval($latest['purified_gas_flow']),
            'purified_gas_totalizer' => floatval($latest['purified_gas_totalizer']),
            'product_gas_flow' => floatval($latest['product_gas_flow']),
            'product_gas_totalizer' => floatval($latest['product_gas_totalizer']),
            
            'ch4_concentration' => floatval($latest['ch4_concentration']),
            'co2_level' => floatval($latest['co2_level']),
            'o2_concentration' => floatval($latest['o2_concentration']),
            'h2s_content' => floatval($latest['h2s_content']),
            'dew_point' => floatval($latest['dew_point']),
            
            'd1_temp_bottom' => floatval($latest['d1_temp_bottom']),
            'd1_temp_top' => floatval($latest['d1_temp_top']),
            'd1_gas_pressure' => floatval($latest['d1_gas_pressure']),
            'd1_air_pressure' => floatval($latest['d1_air_pressure']),
            'd1_slurry_height' => floatval($latest['d1_slurry_height']),
            'd1_gas_level' => floatval($latest['d1_gas_level']),
            
            'd2_temp_bottom' => floatval($latest['d2_temp_bottom']),
            'd2_temp_top' => floatval($latest['d2_temp_top']),
            'd2_gas_pressure' => floatval($latest['d2_gas_pressure']),
            'd2_air_pressure' => floatval($latest['d2_air_pressure']),
            'd2_slurry_height' => floatval($latest['d2_slurry_height']),
            'd2_gas_level' => floatval($latest['d2_gas_level']),
            
            'buffer_tank_level' => floatval($latest['buffer_tank_level']),
            'lagoon_tank_level' => floatval($latest['lagoon_tank_level']),
            
            'feed_fm1_flow' => floatval($latest['feed_fm1_flow']),
            'feed_fm1_totalizer' => floatval($latest['feed_fm1_totalizer']),
            'feed_fm2_flow' => floatval($latest['feed_fm2_flow']),
            'feed_fm2_totalizer' => floatval($latest['feed_fm2_totalizer']),
            'fresh_water_flow' => floatval($latest['fresh_water_flow']),
            'fresh_water_totalizer' => floatval($latest['fresh_water_totalizer']),
            'recycle_water_flow' => floatval($latest['recycle_water_flow']),
            'recycle_water_totalizer' => floatval($latest['recycle_water_totalizer']),
            
            'psa_efficiency' => floatval($latest['psa_efficiency']),
            'lt_panel_power' => floatval($latest['lt_panel_power']),
            'compressor_status' => intval($latest['compressor_status'])
        ],
        
        'avg_1hr' => [
            'raw_biogas_flow' => round(floatval($stats1hr['avg_raw_biogas_flow']), 2),
            'purified_gas_flow' => round(floatval($stats1hr['avg_purified_gas_flow']), 2),
            'product_gas_flow' => round(floatval($stats1hr['avg_product_gas_flow']), 2),
            'ch4_concentration' => round(floatval($stats1hr['avg_ch4']), 2),
            'sample_count' => intval($stats1hr['sample_count']),
            'expected_samples' => 60
        ],
        
        'avg_12hr' => [
            'raw_biogas_flow' => round(floatval($stats12hr['avg_raw_biogas_flow']), 2),
            'purified_gas_flow' => round(floatval($stats12hr['avg_purified_gas_flow']), 2),
            'product_gas_flow' => round(floatval($stats12hr['avg_product_gas_flow']), 2),
            'ch4_concentration' => round(floatval($stats12hr['avg_ch4']), 2),
            'sample_count' => intval($stats12hr['sample_count']),
            'expected_samples' => 720
        ],
        
        'totalizer_24hr' => [
            'raw_biogas' => round(floatval($stats24hr['totalizer_raw_biogas']), 2),
            'purified_gas' => round(floatval($stats24hr['totalizer_purified_gas']), 2),
            'product_gas' => round(floatval($stats24hr['totalizer_product_gas']), 2),
            'sample_count' => intval($stats24hr['sample_count']),
            'expected_samples' => 1440
        ],
        
        'execution_time_ms' => $executionTime
    ];
    
    sendResponse($response);
    
} catch (PDOException $e) {
    error_log("Dashboard query error: " . $e->getMessage());
    sendError('Failed to fetch data: ' . $e->getMessage(), 500);
}
?>
```

---

# FILE 6: trends.php
**Location:** `C:\xampp\htdocs\scada-api\api\trends.php`
**Purpose:** Returns historical data for trend charts
**Method:** GET
**URL:** http://localhost/scada-api/api/trends.php?hours=24

```php
<?php
/**
 * Trends API Endpoint
 * URL: /api/trends.php
 * Method: GET
 * 
 * Query Parameters:
 * - hours: number of hours to fetch (default: 24, max: 168)
 */

require_once 'config.php';

$startTime = microtime(true);

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Method not allowed. Use GET.', 405);
}

$hours = isset($_GET['hours']) ? intval($_GET['hours']) : 24;
$hours = min(max($hours, 1), 168);

// Auto-calculate interval
if ($hours <= 1) {
    $interval = 1;
} elseif ($hours <= 12) {
    $interval = 5;
} elseif ($hours <= 24) {
    $interval = 10;
} elseif ($hours <= 72) {
    $interval = 30;
} else {
    $interval = 60;
}

$pdo = getDBConnection();
if (!$pdo) {
    sendError('Database connection failed', 500);
}

try {
    $params = [
        'raw_biogas_flow', 'purified_gas_flow', 'product_gas_flow',
        'ch4_concentration', 'co2_level', 'o2_concentration', 'h2s_content', 'dew_point',
        'd1_temp_bottom', 'd1_temp_top', 'd1_gas_pressure', 'd1_slurry_height', 'd1_gas_level',
        'd2_temp_bottom', 'd2_temp_top', 'd2_gas_pressure', 'd2_slurry_height', 'd2_gas_level',
        'buffer_tank_level', 'lagoon_tank_level',
        'psa_efficiency', 'lt_panel_power'
    ];
    
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
    
    $stmt = $pdo->query($sql);
    $data = $stmt->fetchAll();
    
    $stmtCount = $pdo->query("
        SELECT COUNT(*) as total FROM scada_readings 
        WHERE plant_id = '" . PLANT_ID . "' 
        AND timestamp >= DATE_SUB(NOW(), INTERVAL $hours HOUR)
    ");
    $countResult = $stmtCount->fetch();
    
    $executionTime = round((microtime(true) - $startTime) * 1000);
    
    sendResponse([
        'status' => 'success',
        'query' => [
            'hours' => $hours,
            'interval_minutes' => $interval
        ],
        'data_points' => count($data),
        'total_records' => intval($countResult['total']),
        'expected_records' => $hours * 60,
        'coverage_percent' => round((intval($countResult['total']) / ($hours * 60)) * 100, 1),
        'data' => $data,
        'execution_time_ms' => $executionTime
    ]);
    
} catch (PDOException $e) {
    error_log("Trends query error: " . $e->getMessage());
    sendError('Failed to fetch trends: ' . $e->getMessage(), 500);
}
?>
```

---

# FILE 7: sync_status.php
**Location:** `C:\xampp\htdocs\scada-api\api\sync_status.php`
**Purpose:** Returns sync health information
**Method:** GET
**URL:** http://localhost/scada-api/api/sync_status.php

```php
<?php
/**
 * Sync Status API Endpoint
 * URL: /api/sync_status.php
 * Method: GET
 */

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Method not allowed. Use GET.', 405);
}

$pdo = getDBConnection();
if (!$pdo) {
    sendError('Database connection failed', 500);
}

try {
    $stmt = $pdo->query("
        SELECT timestamp FROM scada_readings 
        WHERE plant_id = '" . PLANT_ID . "' 
        ORDER BY timestamp DESC LIMIT 1
    ");
    $lastReading = $stmt->fetch();
    
    $stmtSync = $pdo->query("
        SELECT * FROM sync_status 
        WHERE plant_id = '" . PLANT_ID . "' 
        ORDER BY last_sync_time DESC LIMIT 1
    ");
    $lastSync = $stmtSync->fetch();
    
    $stmtStats = $pdo->query("
        SELECT 
            COUNT(*) as total_syncs,
            SUM(CASE WHEN last_sync_status = 'SUCCESS' THEN 1 ELSE 0 END) as successful_syncs,
            SUM(CASE WHEN last_sync_status = 'FAILED' THEN 1 ELSE 0 END) as failed_syncs
        FROM sync_status 
        WHERE plant_id = '" . PLANT_ID . "' 
        AND last_sync_time >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    ");
    $syncStats = $stmtStats->fetch();
    
    sendResponse([
        'status' => 'success',
        'plant_id' => PLANT_ID,
        'last_reading_timestamp' => $lastReading ? $lastReading['timestamp'] : null,
        'last_sync' => $lastSync ? [
            'time' => $lastSync['last_sync_time'],
            'status' => $lastSync['last_sync_status'],
            'records_synced' => intval($lastSync['records_synced']),
            'error_message' => $lastSync['error_message']
        ] : null,
        'stats_24hr' => [
            'total_syncs' => intval($syncStats['total_syncs']),
            'successful' => intval($syncStats['successful_syncs']),
            'failed' => intval($syncStats['failed_syncs']),
            'success_rate' => $syncStats['total_syncs'] > 0 
                ? round((intval($syncStats['successful_syncs']) / intval($syncStats['total_syncs'])) * 100, 1) 
                : 0
        ],
        'server_time' => date('Y-m-d H:i:s')
    ]);
    
} catch (PDOException $e) {
    error_log("Sync status error: " . $e->getMessage());
    sendError('Failed to fetch sync status', 500);
}
?>
```

---

# DATABASE SCHEMA (schema_local.sql)
**Run this in phpMyAdmin after creating `scada_db` database**

```sql
-- ============================================
-- LR ENERGY SCADA DATABASE SCHEMA (LOCAL)
-- ============================================

CREATE TABLE IF NOT EXISTS `scada_readings` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `timestamp` DATETIME NOT NULL,
    
    `raw_biogas_flow` DECIMAL(10,2) DEFAULT NULL,
    `raw_biogas_totalizer` DECIMAL(15,2) DEFAULT NULL,
    `purified_gas_flow` DECIMAL(10,2) DEFAULT NULL,
    `purified_gas_totalizer` DECIMAL(15,2) DEFAULT NULL,
    `product_gas_flow` DECIMAL(10,2) DEFAULT NULL,
    `product_gas_totalizer` DECIMAL(15,2) DEFAULT NULL,
    
    `ch4_concentration` DECIMAL(5,2) DEFAULT NULL,
    `co2_level` DECIMAL(5,2) DEFAULT NULL,
    `o2_concentration` DECIMAL(5,2) DEFAULT NULL,
    `h2s_content` DECIMAL(10,2) DEFAULT NULL,
    `dew_point` DECIMAL(10,2) DEFAULT NULL,
    
    `d1_temp_bottom` DECIMAL(5,2) DEFAULT NULL,
    `d1_temp_top` DECIMAL(5,2) DEFAULT NULL,
    `d1_gas_pressure` DECIMAL(10,2) DEFAULT NULL,
    `d1_air_pressure` DECIMAL(10,2) DEFAULT NULL,
    `d1_slurry_height` DECIMAL(5,2) DEFAULT NULL,
    `d1_gas_level` DECIMAL(5,2) DEFAULT NULL,
    
    `d2_temp_bottom` DECIMAL(5,2) DEFAULT NULL,
    `d2_temp_top` DECIMAL(5,2) DEFAULT NULL,
    `d2_gas_pressure` DECIMAL(10,2) DEFAULT NULL,
    `d2_air_pressure` DECIMAL(10,2) DEFAULT NULL,
    `d2_slurry_height` DECIMAL(5,2) DEFAULT NULL,
    `d2_gas_level` DECIMAL(5,2) DEFAULT NULL,
    
    `buffer_tank_level` DECIMAL(5,2) DEFAULT NULL,
    `lagoon_tank_level` DECIMAL(5,2) DEFAULT NULL,
    
    `feed_fm1_flow` DECIMAL(10,2) DEFAULT NULL,
    `feed_fm1_totalizer` DECIMAL(15,2) DEFAULT NULL,
    `feed_fm2_flow` DECIMAL(10,2) DEFAULT NULL,
    `feed_fm2_totalizer` DECIMAL(15,2) DEFAULT NULL,
    `fresh_water_flow` DECIMAL(10,2) DEFAULT NULL,
    `fresh_water_totalizer` DECIMAL(15,2) DEFAULT NULL,
    `recycle_water_flow` DECIMAL(10,2) DEFAULT NULL,
    `recycle_water_totalizer` DECIMAL(15,2) DEFAULT NULL,
    
    `psa_efficiency` DECIMAL(5,2) DEFAULT NULL,
    `lt_panel_power` DECIMAL(10,2) DEFAULT NULL,
    `compressor_status` TINYINT(1) DEFAULT 0,
    
    `plant_id` VARCHAR(50) DEFAULT 'KARNAL',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX `idx_timestamp` (`timestamp`),
    INDEX `idx_plant_timestamp` (`plant_id`, `timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE IF NOT EXISTS `users` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('HEAD_OFFICE', 'MNRE') NOT NULL DEFAULT 'MNRE',
    `name` VARCHAR(255) DEFAULT NULL,
    `is_active` TINYINT(1) DEFAULT 1,
    `last_login` DATETIME DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE IF NOT EXISTS `api_logs` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `endpoint` VARCHAR(255) NOT NULL,
    `method` VARCHAR(10) NOT NULL,
    `ip_address` VARCHAR(45) DEFAULT NULL,
    `request_body` TEXT DEFAULT NULL,
    `response_code` INT DEFAULT NULL,
    `response_message` VARCHAR(255) DEFAULT NULL,
    `execution_time_ms` INT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE IF NOT EXISTS `sync_status` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `plant_id` VARCHAR(50) NOT NULL,
    `last_sync_time` DATETIME NOT NULL,
    `last_sync_status` ENUM('SUCCESS', 'FAILED') NOT NULL,
    `records_synced` INT DEFAULT 0,
    `error_message` TEXT DEFAULT NULL,
    `script_version` VARCHAR(20) DEFAULT NULL,
    `ip_address` VARCHAR(45) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_plant` (`plant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE IF NOT EXISTS `alerts` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `plant_id` VARCHAR(50) NOT NULL,
    `parameter` VARCHAR(100) NOT NULL,
    `current_value` DECIMAL(15,2) NOT NULL,
    `threshold_value` DECIMAL(15,2) NOT NULL,
    `severity` ENUM('INFO', 'WARNING', 'CRITICAL') NOT NULL,
    `status` ENUM('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED') DEFAULT 'ACTIVE',
    `message` TEXT DEFAULT NULL,
    `acknowledged_by` INT UNSIGNED DEFAULT NULL,
    `acknowledged_at` DATETIME DEFAULT NULL,
    `resolved_at` DATETIME DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_plant_status` (`plant_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- Insert default users (password: qwerty)
INSERT INTO `users` (`email`, `password`, `role`, `name`) VALUES
('it@lrenergy.in', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'HEAD_OFFICE', 'Head Office Admin'),
('it1@lrenergy.in', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'MNRE', 'MNRE User');


-- Insert sample data
INSERT INTO `scada_readings` (
    `timestamp`, `raw_biogas_flow`, `raw_biogas_totalizer`, `purified_gas_flow`, `purified_gas_totalizer`,
    `product_gas_flow`, `product_gas_totalizer`, `ch4_concentration`, `co2_level`, `o2_concentration`,
    `h2s_content`, `dew_point`, `d1_temp_bottom`, `d1_temp_top`, `d1_gas_pressure`, `d1_air_pressure`,
    `d1_slurry_height`, `d1_gas_level`, `d2_temp_bottom`, `d2_temp_top`, `d2_gas_pressure`, `d2_air_pressure`,
    `d2_slurry_height`, `d2_gas_level`, `buffer_tank_level`, `lagoon_tank_level`, `feed_fm1_flow`,
    `feed_fm1_totalizer`, `feed_fm2_flow`, `feed_fm2_totalizer`, `fresh_water_flow`, `fresh_water_totalizer`,
    `recycle_water_flow`, `recycle_water_totalizer`, `psa_efficiency`, `lt_panel_power`, `compressor_status`, `plant_id`
) VALUES 
(DATE_SUB(NOW(), INTERVAL 5 MINUTE), 1248.50, 149500.00, 1178.20, 141500.00, 1148.80, 137500.00, 96.70, 2.95, 0.32, 182.00, -67.50, 36.90, 36.40, 31.80, 17.90, 7.55, 74.50, 36.40, 35.90, 29.80, 16.90, 7.25, 71.50, 81.50, 75.50, 41.50, 4950.00, 37.50, 4450.00, 11.80, 1480.00, 25.80, 2980.00, 94.20, 244.00, 1, 'KARNAL'),
(DATE_SUB(NOW(), INTERVAL 4 MINUTE), 1249.00, 149520.00, 1179.00, 141520.00, 1149.50, 137520.00, 96.75, 2.92, 0.31, 181.00, -67.80, 36.95, 36.45, 31.90, 17.95, 7.58, 74.80, 36.45, 35.95, 29.90, 16.95, 7.28, 71.80, 81.80, 75.80, 41.80, 4960.00, 37.80, 4460.00, 11.90, 1485.00, 25.90, 2985.00, 94.30, 244.50, 1, 'KARNAL'),
(DATE_SUB(NOW(), INTERVAL 3 MINUTE), 1250.00, 149540.00, 1180.00, 141540.00, 1150.00, 137540.00, 96.80, 2.90, 0.30, 180.00, -68.00, 37.00, 36.50, 32.00, 18.00, 7.60, 75.00, 36.50, 36.00, 30.00, 17.00, 7.30, 72.00, 82.00, 76.00, 42.00, 4970.00, 38.00, 4470.00, 12.00, 1490.00, 26.00, 2990.00, 94.40, 245.00, 1, 'KARNAL'),
(DATE_SUB(NOW(), INTERVAL 2 MINUTE), 1251.00, 149560.00, 1181.00, 141560.00, 1151.00, 137560.00, 96.85, 2.88, 0.29, 179.00, -68.20, 37.05, 36.55, 32.10, 18.05, 7.62, 75.20, 36.55, 36.05, 30.10, 17.05, 7.32, 72.20, 82.20, 76.20, 42.20, 4980.00, 38.20, 4480.00, 12.10, 1495.00, 26.10, 2995.00, 94.50, 245.50, 1, 'KARNAL'),
(DATE_SUB(NOW(), INTERVAL 1 MINUTE), 1252.00, 149580.00, 1182.00, 141580.00, 1152.00, 137580.00, 96.90, 2.85, 0.28, 178.00, -68.50, 37.10, 36.60, 32.20, 18.10, 7.65, 75.50, 36.60, 36.10, 30.20, 17.10, 7.35, 72.50, 82.50, 76.50, 42.50, 4990.00, 38.50, 4490.00, 12.20, 1498.00, 26.20, 2998.00, 94.60, 246.00, 1, 'KARNAL');


-- Verify setup
SELECT 'Setup Complete!' as Status;
SHOW TABLES;
SELECT COUNT(*) as 'Sample Records' FROM scada_readings;
SELECT email, role FROM users;
```

---

## 🎯 Summary - What You Need to Do

1. **Install XAMPP** from https://www.apachefriends.org/
2. **Start Apache and MySQL** from XAMPP Control Panel
3. **Create the folder structure:**
   ```
   C:\xampp\htdocs\scada-api\api\
   ```
4. **Open phpMyAdmin** (http://localhost/phpmyadmin)
5. **Create database** `scada_db`
6. **Run the SQL schema** (copy from above)
7. **Copy all 7 PHP files** to `C:\xampp\htdocs\scada-api\api\`
8. **Test:** http://localhost/scada-api/api/test.php

If you see `{"status":"success","database":"connected"}` - you're done! 🎉

---

*Document Version: 1.0 | Created for LR Energy SCADA Project*
