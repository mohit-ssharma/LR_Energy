<?php
require_once 'cors.php';  // CORS headers - MUST BE FIRST!

/**
 * Password Hash Generator
 * 
 * Usage: Open http://localhost/scada-api/hash.php in browser
 * Copy the generated hash and use it in the users table
 */

$password = 'qwerty@1234';
$hash = password_hash($password, PASSWORD_DEFAULT);

echo "<h2>Password Hash Generator</h2>";
echo "<p><strong>Password:</strong> " . $password . "</p>";
echo "<p><strong>Hash:</strong></p>";
echo "<textarea style='width:100%; height:100px; font-family:monospace;'>" . $hash . "</textarea>";
echo "<br><br>";
echo "<p><strong>SQL to insert users:</strong></p>";
echo "<textarea style='width:100%; height:150px; font-family:monospace;'>";
echo "INSERT INTO users (email, password, role, name) VALUES \n";
echo "('ho@lrenergy.in', '" . $hash . "', 'HEAD_OFFICE', 'Head Office Admin'),\n";
echo "('mnre@lrenergy.in', '" . $hash . "', 'MNRE', 'MNRE User');";
echo "</textarea>";
?>
