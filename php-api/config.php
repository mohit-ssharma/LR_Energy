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
// CORS HEADERS - MUST BE FIRST!
// ============================================
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-API-Key, Authorization');
header('Access-Control-Max-Age: 86400');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

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

// API Key for sync script authentication (Production)
define('API_KEY', 'sk_prod_LREnergy_283669e54e512351a5bde265e20da2149fd4b54569a7e12b1ee8226746a6a2a7');

// Optional: Whitelist IP (leave empty to allow all)
define('ALLOWED_IP', '');

// API Timeout (seconds) - ensures execution < 5 seconds
define('API_TIMEOUT', 5);

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
