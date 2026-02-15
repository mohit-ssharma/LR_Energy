<?php
echo "<h1>🔧 Fix H2S Column</h1>";

$host = "localhost";
$user = "illionss_karnal_lre";
$pass = '@xABi]j4hOBd';
$db   = "illionss_karnal_lre";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("<p style='color:red;'>Connection failed</p>");
}

echo "<p>✅ Connected</p>";

// Change H2S from DECIMAL to INT
$sql = "ALTER TABLE scada_readings MODIFY COLUMN h2s_content INT DEFAULT NULL";

if ($conn->query($sql)) {
    echo "<p style='color:green;'>✅ h2s_content changed to INT (integer)</p>";
} else {
    echo "<p style='color:red;'>❌ Error: " . $conn->error . "</p>";
}

// Verify
$result = $conn->query("DESCRIBE scada_readings h2s_content");
$row = $result->fetch_assoc();
echo "<p>Column type now: <strong>" . $row['Type'] . "</strong></p>";

echo "<h2 style='color:green;'>✅ Done!</h2>";
echo "<p style='color:red;'><strong>⚠️ DELETE this file now!</strong></p>";

$conn->close();
?>
