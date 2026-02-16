<?php
/**
 * Debug Login Script - Check password verification
 */

require_once 'config.php';

echo "<h1>Debug MNRE Login</h1>";

try {
    $pdo = getDBConnection();
    
    if (!$pdo) {
        echo "<p style='color:red;'>❌ Database connection failed</p>";
        exit;
    }
    
    echo "<p style='color:green;'>✅ Database connected</p>";
    
    // Get MNRE user
    $stmt = $pdo->prepare("SELECT id, email, password, role, name, is_active FROM users WHERE email = 'mnre@lrenergy.in'");
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        echo "<p style='color:red;'>❌ User mnre@lrenergy.in NOT FOUND in database!</p>";
        exit;
    }
    
    echo "<h2>User Found:</h2>";
    echo "<ul>";
    echo "<li>ID: " . $user['id'] . "</li>";
    echo "<li>Email: " . $user['email'] . "</li>";
    echo "<li>Role: " . $user['role'] . "</li>";
    echo "<li>Name: " . $user['name'] . "</li>";
    echo "<li>Is Active: " . ($user['is_active'] ? 'Yes' : 'No') . "</li>";
    echo "<li>Password Hash (first 20 chars): " . substr($user['password'], 0, 20) . "...</li>";
    echo "</ul>";
    
    // Test password verification
    $testPassword = 'mnre@mnre';
    $isValid = password_verify($testPassword, $user['password']);
    
    echo "<h2>Password Test:</h2>";
    echo "<p>Testing password: <strong>" . $testPassword . "</strong></p>";
    
    if ($isValid) {
        echo "<p style='color:green; font-size:20px;'>✅ PASSWORD VERIFICATION SUCCESSFUL!</p>";
        echo "<p>The password 'mnre@mnre' is correct. If login still fails, check:</p>";
        echo "<ul>";
        echo "<li>Browser cache - try clearing cache or incognito mode</li>";
        echo "<li>Frontend API URL - make sure it points to correct backend</li>";
        echo "<li>Check browser console for errors</li>";
        echo "</ul>";
    } else {
        echo "<p style='color:red; font-size:20px;'>❌ PASSWORD VERIFICATION FAILED!</p>";
        echo "<p>Let me re-hash and update the password...</p>";
        
        // Re-hash and update
        $newHash = password_hash($testPassword, PASSWORD_DEFAULT);
        $updateStmt = $pdo->prepare("UPDATE users SET password = ? WHERE email = 'mnre@lrenergy.in'");
        $updateStmt->execute([$newHash]);
        
        echo "<p style='color:green;'>✅ Password re-updated. Try logging in again.</p>";
    }
    
    // Also test old password
    echo "<h2>Testing Old Password:</h2>";
    $oldPassword = 'qwerty@1234';
    $isOldValid = password_verify($oldPassword, $user['password']);
    echo "<p>Testing: " . $oldPassword . " = " . ($isOldValid ? "✅ VALID" : "❌ INVALID") . "</p>";
    
} catch (PDOException $e) {
    echo "<p style='color:red;'>❌ Error: " . $e->getMessage() . "</p>";
}
?>
