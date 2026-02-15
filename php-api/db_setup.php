<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>SCADA Database Setup</h1>";
echo "<p>Testing connection...</p>";

$host = "localhost";
$user = "illionss_karnal_lre";
$pass = '@xABi]j4hOBd';  // CORRECT PASSWORD
$db   = "illionss_karnal_lre";

echo "<p>Host: $host</p>";
echo "<p>User: $user</p>";
echo "<p>DB: $db</p>";

try {
    $conn = new mysqli($host, $user, $pass, $db);
    echo "<p style='color:green;'>✅ Connected using localhost!</p>";
} catch (Exception $e) {
    echo "<p style='color:orange;'>localhost failed: " . $e->getMessage() . "</p>";
    
    $host = "119.18.49.27";
    echo "<p>Trying IP: $host...</p>";
    
    try {
        $conn = new mysqli($host, $user, $pass, $db);
        echo "<p style='color:green;'>✅ Connected using IP!</p>";
    } catch (Exception $e2) {
        echo "<p style='color:red;'>IP also failed: " . $e2->getMessage() . "</p>";
        exit;
    }
}

echo "<h2>Creating Tables...</h2>";

// Table 1: scada_readings
$sql = "CREATE TABLE IF NOT EXISTS scada_readings (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME NOT NULL,
    raw_biogas_flow DECIMAL(10,2),
    raw_biogas_totalizer DECIMAL(15,2),
    purified_gas_flow DECIMAL(10,2),
    purified_gas_totalizer DECIMAL(15,2),
    product_gas_flow DECIMAL(10,2),
    product_gas_totalizer DECIMAL(15,2),
    ch4_concentration DECIMAL(5,2),
    co2_level DECIMAL(5,2),
    o2_concentration DECIMAL(5,2),
    h2s_content INT,
    dew_point DECIMAL(10,2),
    d1_temp_bottom DECIMAL(5,2),
    d1_temp_top DECIMAL(5,2),
    d1_gas_pressure DECIMAL(10,2),
    d1_air_pressure DECIMAL(10,2),
    d1_slurry_height DECIMAL(5,2),
    d1_gas_level DECIMAL(5,2),
    d2_temp_bottom DECIMAL(5,2),
    d2_temp_top DECIMAL(5,2),
    d2_gas_pressure DECIMAL(10,2),
    d2_air_pressure DECIMAL(10,2),
    d2_slurry_height DECIMAL(5,2),
    d2_gas_level DECIMAL(5,2),
    buffer_tank_level DECIMAL(5,2),
    lagoon_tank_level DECIMAL(5,2),
    feed_fm1_flow DECIMAL(10,2),
    feed_fm1_totalizer DECIMAL(15,2),
    feed_fm2_flow DECIMAL(10,2),
    feed_fm2_totalizer DECIMAL(15,2),
    fresh_water_flow DECIMAL(10,2),
    fresh_water_totalizer DECIMAL(15,2),
    recycle_water_flow DECIMAL(10,2),
    recycle_water_totalizer DECIMAL(15,2),
    psa_status TINYINT(1) DEFAULT 0,
    psa_efficiency DECIMAL(5,2),
    lt_panel_power DECIMAL(10,2),
    compressor_status TINYINT(1) DEFAULT 0,
    plant_id VARCHAR(50) DEFAULT 'KARNAL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY idx_plant_time (plant_id, timestamp)
) ENGINE=InnoDB";

echo $conn->query($sql) ? "<p>✅ scada_readings</p>" : "<p>❌ " . $conn->error . "</p>";

// Table 2: users
$sql = "CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('HEAD_OFFICE','MNRE') DEFAULT 'MNRE',
    name VARCHAR(255),
    is_active TINYINT(1) DEFAULT 1,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB";

echo $conn->query($sql) ? "<p>✅ users</p>" : "<p>❌ " . $conn->error . "</p>";

// Table 3: api_logs
$sql = "CREATE TABLE IF NOT EXISTS api_logs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    endpoint VARCHAR(255),
    method VARCHAR(10),
    ip_address VARCHAR(45),
    request_body TEXT,
    response_code INT,
    response_message VARCHAR(255),
    execution_time_ms INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB";

echo $conn->query($sql) ? "<p>✅ api_logs</p>" : "<p>❌ " . $conn->error . "</p>";

// Table 4: sync_status
$sql = "CREATE TABLE IF NOT EXISTS sync_status (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    plant_id VARCHAR(50),
    last_sync_time DATETIME,
    last_sync_status VARCHAR(20),
    records_synced INT DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB";

echo $conn->query($sql) ? "<p>✅ sync_status</p>" : "<p>❌ " . $conn->error . "</p>";

// Table 5: alerts
$sql = "CREATE TABLE IF NOT EXISTS alerts (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    plant_id VARCHAR(50),
    parameter VARCHAR(100),
    current_value DECIMAL(15,2),
    threshold_value DECIMAL(15,2),
    severity VARCHAR(20),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB";

echo $conn->query($sql) ? "<p>✅ alerts</p>" : "<p>❌ " . $conn->error . "</p>";

// Insert users
echo "<h2>Creating Users...</h2>";
$hash = password_hash('qwerty@1234', PASSWORD_DEFAULT);
$sql = "INSERT IGNORE INTO users (email, password, role, name) VALUES 
('ho@lrenergy.in', '$hash', 'HEAD_OFFICE', 'Head Office'),
('mnre@lrenergy.in', '$hash', 'MNRE', 'MNRE User')";

echo $conn->query($sql) ? "<p>✅ Users created</p>" : "<p>❌ " . $conn->error . "</p>";

// Verify
echo "<h2>Tables:</h2><ul>";
$result = $conn->query("SHOW TABLES");
while ($row = $result->fetch_array()) echo "<li>✅ " . $row[0] . "</li>";
echo "</ul>";

echo "<h2>Users:</h2><ul>";
$result = $conn->query("SELECT email, role FROM users");
while ($row = $result->fetch_assoc()) echo "<li>" . $row['email'] . " (" . $row['role'] . ")</li>";
echo "</ul>";

echo "<h2 style='color:green;'>✅ SETUP COMPLETE!</h2>";
echo "<p><b>Login:</b> ho@lrenergy.in / qwerty@1234</p>";
echo "<p style='color:red;'><b>⚠️ DELETE this file now!</b></p>";

$conn->close();
?>
