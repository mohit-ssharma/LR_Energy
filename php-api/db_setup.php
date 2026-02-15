<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>SCADA Database Setup</h1>";
echo "<p>Testing connection...</p>";

$host = "localhost";
$user = "illionss_karnal_lre";
$pass = "xkA}Iu\$l~Vrw3r.Vp+";
$db   = "illionss_karnal_lre";

echo "<p>Host: $host</p>";
echo "<p>User: $user</p>";
echo "<p>DB: $db</p>";

$conn = @new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    echo "<p style='color:red;'>localhost FAILED: " . $conn->connect_error . "</p>";
    
    // Try IP
    $host = "119.18.49.27";
    echo "<p>Trying IP: $host</p>";
    $conn = @new mysqli($host, $user, $pass, $db);
    
    if ($conn->connect_error) {
        echo "<p style='color:red;'>IP FAILED: " . $conn->connect_error . "</p>";
        echo "<p>Cannot connect to database!</p>";
        exit;
    }
}

echo "<p style='color:green;'>✅ Connected using: $host</p>";

// Create tables one by one
echo "<h2>Creating Tables...</h2>";

// Table 1
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
    h2s_content DECIMAL(10,2),
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

if ($conn->query($sql)) {
    echo "<p>✅ scada_readings - OK</p>";
} else {
    echo "<p>❌ scada_readings - " . $conn->error . "</p>";
}

// Table 2
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

if ($conn->query($sql)) {
    echo "<p>✅ users - OK</p>";
} else {
    echo "<p>❌ users - " . $conn->error . "</p>";
}

// Table 3
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

if ($conn->query($sql)) {
    echo "<p>✅ api_logs - OK</p>";
} else {
    echo "<p>❌ api_logs - " . $conn->error . "</p>";
}

// Table 4
$sql = "CREATE TABLE IF NOT EXISTS sync_status (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    plant_id VARCHAR(50),
    last_sync_time DATETIME,
    last_sync_status VARCHAR(20),
    records_synced INT DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB";

if ($conn->query($sql)) {
    echo "<p>✅ sync_status - OK</p>";
} else {
    echo "<p>❌ sync_status - " . $conn->error . "</p>";
}

// Table 5
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

if ($conn->query($sql)) {
    echo "<p>✅ alerts - OK</p>";
} else {
    echo "<p>❌ alerts - " . $conn->error . "</p>";
}

// Insert users
echo "<h2>Creating Users...</h2>";

$hash = password_hash('qwerty@1234', PASSWORD_DEFAULT);

$sql = "INSERT IGNORE INTO users (email, password, role, name) VALUES 
('ho@lrenergy.in', '$hash', 'HEAD_OFFICE', 'Head Office'),
('mnre@lrenergy.in', '$hash', 'MNRE', 'MNRE User')";

if ($conn->query($sql)) {
    echo "<p>✅ Users created</p>";
} else {
    echo "<p>❌ Users - " . $conn->error . "</p>";
}

// Verify
echo "<h2>Verification:</h2>";

$result = $conn->query("SHOW TABLES");
echo "<p>Tables:</p><ul>";
while ($row = $result->fetch_array()) {
    echo "<li>" . $row[0] . "</li>";
}
echo "</ul>";

$result = $conn->query("SELECT email, role FROM users");
if ($result && $result->num_rows > 0) {
    echo "<p>Users:</p><ul>";
    while ($row = $result->fetch_assoc()) {
        echo "<li>" . $row['email'] . " (" . $row['role'] . ")</li>";
    }
    echo "</ul>";
}

echo "<h2 style='color:green;'>✅ SETUP COMPLETE!</h2>";
echo "<p><strong>Login:</strong> ho@lrenergy.in / qwerty@1234</p>";
echo "<p><strong>⚠️ DELETE this file now!</strong></p>";

$conn->close();
?>
