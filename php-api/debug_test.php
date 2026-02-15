<?php
/**
 * Debug Test Script
 * URL: http://localhost/scada-api/debug_test.php
 */

header('Content-Type: text/html; charset=UTF-8');

echo "<h1>🔧 Debug Test</h1>";

// Test 1: Check PHP version
echo "<h2>1. PHP Version</h2>";
echo "<p>PHP Version: " . phpversion() . "</p>";

// Test 2: Check if config.php loads
echo "<h2>2. Config Load</h2>";
try {
    require_once 'config.php';
    echo "<p style='color:green;'>✅ config.php loaded successfully</p>";
    echo "<p>DB_HOST: " . DB_HOST . "</p>";
    echo "<p>DB_NAME: " . DB_NAME . "</p>";
    echo "<p>DB_USER: " . DB_USER . "</p>";
    echo "<p>API_KEY (first 20 chars): " . substr(API_KEY, 0, 20) . "...</p>";
} catch (Exception $e) {
    echo "<p style='color:red;'>❌ Error: " . $e->getMessage() . "</p>";
}

// Test 3: Database connection
echo "<h2>3. Database Connection</h2>";
try {
    $pdo = getDBConnection();
    if ($pdo) {
        echo "<p style='color:green;'>✅ Database connected successfully</p>";
        
        // Test query
        $result = $pdo->query("SELECT COUNT(*) as count FROM scada_readings");
        $row = $result->fetch(PDO::FETCH_ASSOC);
        echo "<p>Total records in scada_readings: " . $row['count'] . "</p>";
        
        // Check table structure
        $result = $pdo->query("DESCRIBE scada_readings");
        echo "<p>Table columns: ";
        $columns = [];
        while ($col = $result->fetch(PDO::FETCH_ASSOC)) {
            $columns[] = $col['Field'];
        }
        echo implode(", ", array_slice($columns, 0, 10)) . "...</p>";
    } else {
        echo "<p style='color:red;'>❌ Database connection returned null</p>";
    }
} catch (Exception $e) {
    echo "<p style='color:red;'>❌ Database error: " . $e->getMessage() . "</p>";
}

// Test 4: Direct insert test
echo "<h2>4. Direct Insert Test</h2>";
try {
    $pdo = getDBConnection();
    if ($pdo) {
        $testTimestamp = date('Y-m-d H:i:s');
        
        $sql = "INSERT INTO scada_readings (plant_id, timestamp, raw_biogas_flow, ch4_concentration) 
                VALUES (?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $result = $stmt->execute(['TEST_DEBUG', $testTimestamp, 1000.5, 96.5]);
        
        if ($result) {
            $insertId = $pdo->lastInsertId();
            echo "<p style='color:green;'>✅ Test insert successful! ID: " . $insertId . "</p>";
            
            // Delete test record
            $pdo->exec("DELETE FROM scada_readings WHERE plant_id = 'TEST_DEBUG'");
            echo "<p>Test record deleted.</p>";
        } else {
            echo "<p style='color:red;'>❌ Insert failed</p>";
        }
    }
} catch (Exception $e) {
    echo "<p style='color:red;'>❌ Insert error: " . $e->getMessage() . "</p>";
}

// Test 5: Check receive_data.php simulation
echo "<h2>5. API Simulation Test</h2>";

// Auto-detect environment
$is_local = ($_SERVER['SERVER_NAME'] === 'localhost' || $_SERVER['SERVER_NAME'] === '127.0.0.1');
if ($is_local) {
    $api_url = 'http://localhost/scada-api/receive_data.php';
} else {
    $api_url = 'https://' . $_SERVER['SERVER_NAME'] . '/scada-api/receive_data.php';
}

$testData = [
    'plant_id' => 'KARNAL',
    'timestamp' => date('Y-m-d H:i:s'),
    'raw_biogas_flow' => 1250.5,
    'ch4_concentration' => 96.8
];

$ch = curl_init($api_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($testData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'X-API-Key: ' . API_KEY
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "<p>HTTP Code: " . $httpCode . "</p>";
if ($error) {
    echo "<p style='color:red;'>cURL Error: " . $error . "</p>";
}
echo "<p>Response: <pre>" . htmlspecialchars($response) . "</pre></p>";

// Test 6: Check scada_readings after test
echo "<h2>6. Final Record Check</h2>";
try {
    $pdo = getDBConnection();
    $result = $pdo->query("SELECT id, plant_id, timestamp, raw_biogas_flow FROM scada_readings ORDER BY id DESC LIMIT 5");
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><th>ID</th><th>Plant ID</th><th>Timestamp</th><th>Raw Biogas Flow</th></tr>";
    while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
        echo "<tr><td>{$row['id']}</td><td>{$row['plant_id']}</td><td>{$row['timestamp']}</td><td>{$row['raw_biogas_flow']}</td></tr>";
    }
    echo "</table>";
} catch (Exception $e) {
    echo "<p style='color:red;'>❌ Error: " . $e->getMessage() . "</p>";
}

echo "<hr><p><em>Debug complete at " . date('Y-m-d H:i:s') . "</em></p>";
?>
