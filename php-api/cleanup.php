<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>🗑️ Delete Test Data</h1>";

$host = "localhost";
$user = "illionss_karnal_lre";
$pass = '@xABi]j4hOBd';
$db   = "illionss_karnal_lre";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("<p style='color:red;'>Connection failed: " . $conn->connect_error . "</p>");
}

echo "<p style='color:green;'>✅ Connected</p>";

// Check if confirmed
if (isset($_GET['confirm']) && $_GET['confirm'] === 'yes') {
    
    echo "<h2>Deleting...</h2>";
    
    // Delete SCADA readings
    $result = $conn->query("DELETE FROM scada_readings");
    $deleted1 = $conn->affected_rows;
    echo "<p>✅ scada_readings: Deleted $deleted1 rows</p>";
    
    // Delete API logs
    $result = $conn->query("DELETE FROM api_logs");
    $deleted2 = $conn->affected_rows;
    echo "<p>✅ api_logs: Deleted $deleted2 rows</p>";
    
    // Delete sync status
    $result = $conn->query("DELETE FROM sync_status");
    $deleted3 = $conn->affected_rows;
    echo "<p>✅ sync_status: Deleted $deleted3 rows</p>";
    
    // Delete alerts
    $result = $conn->query("DELETE FROM alerts");
    $deleted4 = $conn->affected_rows;
    echo "<p>✅ alerts: Deleted $deleted4 rows</p>";
    
    // Reset auto-increment
    $conn->query("ALTER TABLE scada_readings AUTO_INCREMENT = 1");
    $conn->query("ALTER TABLE api_logs AUTO_INCREMENT = 1");
    $conn->query("ALTER TABLE sync_status AUTO_INCREMENT = 1");
    $conn->query("ALTER TABLE alerts AUTO_INCREMENT = 1");
    
    echo "<h2 style='color:green;'>✅ All Test Data Deleted!</h2>";
    echo "<p>Total deleted: " . ($deleted1 + $deleted2 + $deleted3 + $deleted4) . " rows</p>";
    echo "<p><strong>Note:</strong> Users table NOT touched (logins preserved)</p>";
    echo "<p style='color:red;'><strong>⚠️ DELETE this file now!</strong></p>";
    
} else {
    
    // Show current counts
    echo "<h2>📊 Current Data:</h2>";
    
    $tables = ['scada_readings', 'api_logs', 'sync_status', 'alerts', 'users'];
    
    echo "<table border='1' cellpadding='10'>";
    echo "<tr><th>Table</th><th>Rows</th><th>Will Delete?</th></tr>";
    
    foreach ($tables as $table) {
        $result = $conn->query("SELECT COUNT(*) as cnt FROM $table");
        $row = $result->fetch_assoc();
        $willDelete = ($table === 'users') ? '❌ No (keep logins)' : '✅ Yes';
        echo "<tr><td>$table</td><td>{$row['cnt']}</td><td>$willDelete</td></tr>";
    }
    echo "</table>";
    
    echo "<h2>⚠️ Confirm Delete</h2>";
    echo "<p>This will delete ALL test data from:</p>";
    echo "<ul>";
    echo "<li>scada_readings (sensor data)</li>";
    echo "<li>api_logs (API call logs)</li>";
    echo "<li>sync_status (sync records)</li>";
    echo "<li>alerts (alert history)</li>";
    echo "</ul>";
    echo "<p><strong>Users will NOT be deleted.</strong></p>";
    
    echo "<br><a href='?confirm=yes' style='background:red; color:white; padding:15px 30px; text-decoration:none; font-size:18px; border-radius:5px;'>🗑️ DELETE ALL TEST DATA</a>";
    echo "<br><br><a href='dashboard.php'>Cancel - Go to Dashboard</a>";
}

$conn->close();
?>
