<?php
/**
 * MNRE Password Update Script
 * 
 * Run this script once to update MNRE user password to: mnre@mnre
 * After running, you can delete this file for security.
 * 
 * Usage: Visit https://your-domain.com/scada-api/update_mnre_password.php
 */

require_once 'config.php';

echo "<h1>MNRE Password Update</h1>";

try {
    $pdo = getDBConnection();
    
    if (!$pdo) {
        echo "<p style='color:red;'>❌ Database connection failed</p>";
        exit;
    }
    
    echo "<p style='color:green;'>✅ Database connected</p>";
    
    // New password for MNRE user
    $newPassword = 'mnre@mnre';
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    
    // Update MNRE user password
    $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE email = 'mnre@lrenergy.in'");
    $result = $stmt->execute([$hashedPassword]);
    
    if ($result && $stmt->rowCount() > 0) {
        echo "<p style='color:green;'>✅ MNRE password updated successfully!</p>";
        echo "<p><strong>New credentials:</strong></p>";
        echo "<ul>";
        echo "<li>Email: mnre@lrenergy.in</li>";
        echo "<li>Password: mnre@mnre</li>";
        echo "</ul>";
        echo "<p style='color:orange;'><strong>⚠️ IMPORTANT:</strong> Delete this file after running for security!</p>";
    } else {
        echo "<p style='color:orange;'>⚠️ No rows updated. MNRE user might not exist or password is already set.</p>";
        
        // Check if user exists
        $checkStmt = $pdo->prepare("SELECT email FROM users WHERE email = 'mnre@lrenergy.in'");
        $checkStmt->execute();
        $user = $checkStmt->fetch();
        
        if (!$user) {
            echo "<p style='color:red;'>❌ User mnre@lrenergy.in does not exist in database.</p>";
            echo "<p>Run db_setup.php first to create the user.</p>";
        } else {
            echo "<p style='color:green;'>✅ User exists. Password may have already been updated.</p>";
        }
    }
    
} catch (PDOException $e) {
    echo "<p style='color:red;'>❌ Error: " . $e->getMessage() . "</p>";
}
?>
