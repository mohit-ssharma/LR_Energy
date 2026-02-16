<?php
/**
 * Direct Auth Test - Simulates exact frontend login request
 */

require_once 'cors.php';
require_once 'config.php';

header('Content-Type: text/html');

echo "<h1>Direct Auth Test</h1>";

// Simulate the exact login request
$testEmail = 'mnre@lrenergy.in';
$testPassword = 'mnre@mnre';

echo "<h2>Testing Login:</h2>";
echo "<p>Email: <strong>$testEmail</strong></p>";
echo "<p>Password: <strong>$testPassword</strong></p>";

try {
    $pdo = getDBConnection();
    
    if (!$pdo) {
        echo "<p style='color:red;'>❌ Database connection failed</p>";
        exit;
    }
    
    echo "<p style='color:green;'>✅ Database connected</p>";
    
    // Find user by email (exactly like auth.php does)
    $stmt = $pdo->prepare("SELECT id, email, password, role, name, is_active FROM users WHERE email = ?");
    $stmt->execute([$testEmail]);
    $user = $stmt->fetch();
    
    if (!$user) {
        echo "<p style='color:red;'>❌ User not found!</p>";
        exit;
    }
    
    echo "<p style='color:green;'>✅ User found: " . $user['email'] . "</p>";
    echo "<p>Role: " . $user['role'] . "</p>";
    echo "<p>Is Active: " . ($user['is_active'] ? 'Yes' : 'No') . "</p>";
    
    // Check if active
    if (!$user['is_active']) {
        echo "<p style='color:red;'>❌ Account is disabled!</p>";
        exit;
    }
    
    echo "<p style='color:green;'>✅ Account is active</p>";
    
    // Verify password (exactly like auth.php does)
    $passwordValid = password_verify($testPassword, $user['password']);
    
    if ($passwordValid) {
        echo "<h2 style='color:green;'>✅ LOGIN SHOULD WORK!</h2>";
        echo "<p>Password verification passed.</p>";
        
        // Generate token like auth.php does
        $token = base64_encode(json_encode([
            'user_id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
            'exp' => time() + (24 * 60 * 60)
        ]));
        
        echo "<h3>Expected Response:</h3>";
        echo "<pre>";
        echo json_encode([
            'status' => 'success',
            'message' => 'Login successful',
            'user' => [
                'id' => intval($user['id']),
                'email' => $user['email'],
                'role' => $user['role'],
                'name' => $user['name']
            ],
            'token' => $token
        ], JSON_PRETTY_PRINT);
        echo "</pre>";
        
    } else {
        echo "<h2 style='color:red;'>❌ PASSWORD VERIFICATION FAILED!</h2>";
        echo "<p>Stored hash: " . substr($user['password'], 0, 30) . "...</p>";
        
        // Force update password
        echo "<h3>Forcing password update...</h3>";
        $newHash = password_hash($testPassword, PASSWORD_DEFAULT);
        $updateStmt = $pdo->prepare("UPDATE users SET password = ? WHERE email = ?");
        $result = $updateStmt->execute([$newHash, $testEmail]);
        
        if ($result) {
            echo "<p style='color:green;'>✅ Password force-updated! Try login again.</p>";
        }
    }
    
    // Also show all users in database
    echo "<h2>All Users in Database:</h2>";
    $allUsers = $pdo->query("SELECT id, email, role, is_active FROM users")->fetchAll();
    echo "<table border='1' cellpadding='10'>";
    echo "<tr><th>ID</th><th>Email</th><th>Role</th><th>Active</th></tr>";
    foreach ($allUsers as $u) {
        echo "<tr>";
        echo "<td>" . $u['id'] . "</td>";
        echo "<td>" . $u['email'] . "</td>";
        echo "<td>" . $u['role'] . "</td>";
        echo "<td>" . ($u['is_active'] ? 'Yes' : 'No') . "</td>";
        echo "</tr>";
    }
    echo "</table>";
    
} catch (PDOException $e) {
    echo "<p style='color:red;'>❌ Error: " . $e->getMessage() . "</p>";
}

echo "<hr>";
echo "<h2>Now test via CURL (API call):</h2>";

// Make actual API call
$apiUrl = 'http://localhost/scada-api/auth.php';
$postData = json_encode(['email' => $testEmail, 'password' => $testPassword]);

$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "<p>API URL: $apiUrl</p>";
echo "<p>HTTP Code: <strong>$httpCode</strong></p>";
echo "<p>Response:</p>";
echo "<pre>" . htmlspecialchars($response) . "</pre>";

if ($httpCode == 200) {
    echo "<h2 style='color:green;'>✅ API LOGIN WORKS!</h2>";
} else {
    echo "<h2 style='color:red;'>❌ API LOGIN FAILED!</h2>";
}
?>
