<?php
require_once 'cors.php';  // CORS headers - MUST BE FIRST!

/**
 * Authentication API Endpoint
 * URL: /api/auth.php
 * Method: POST
 * 
 * Handles user login
 * 
 * Request Body:
 * {
 *   "email": "user@example.com",
 *   "password": "password"
 * }
 * 
 * Response:
 * {
 *   "status": "success",
 *   "user": {
 *     "id": 1,
 *     "email": "user@example.com",
 *     "role": "HEAD_OFFICE",
 *     "name": "User Name"
 *   },
 *   "token": "jwt_token_here"
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
        // Log failed attempt
        logAPIRequest('auth', 'POST', ['email' => $email], 401, 'User not found', 0);
        sendError('Invalid email or password', 401);
    }
    
    // Check if user is active
    if (!$user['is_active']) {
        sendError('Account is disabled', 403);
    }
    
    // Verify password using bcrypt hash
    $passwordValid = password_verify($password, $user['password']);
    
    if (!$passwordValid) {
        // Log failed attempt
        logAPIRequest('auth', 'POST', ['email' => $email], 401, 'Invalid password', 0);
        sendError('Invalid email or password', 401);
    }
    
    // Update last login
    $updateStmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
    $updateStmt->execute([$user['id']]);
    
    // Generate simple token (in production, use JWT)
    $token = base64_encode(json_encode([
        'user_id' => $user['id'],
        'email' => $user['email'],
        'role' => $user['role'],
        'exp' => time() + (24 * 60 * 60)  // 24 hours
    ]));
    
    $executionTime = round((microtime(true) - $startTime) * 1000);
    
    // Log successful login
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
