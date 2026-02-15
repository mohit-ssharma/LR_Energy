<?php
/**
 * Database Setup Script
 * Run ONCE to create tables and users
 * DELETE after setup!
 */

header('Content-Type: text/html; charset=UTF-8');

echo "<h1>🔧 SCADA Database Setup</h1>";

$host = "localhost";
$user = "illionss_karnal_lre";
$pass = 'xkA}Iu$l~Vrw3r.Vp+';
$db   = "illionss_karnal_lre";

// Connect
$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    // Try IP if localhost fails
    $host = "119.18.49.27";
    $conn = new mysqli($host, $user, $pass, $db);
    
    if ($conn->connect_error) {
        die("<p style='color:red;'>❌ Connection failed: " . $conn->connect_error . "</p>");
    }
}

echo "<p style='color:green;'>✅ Connected to database using host: <strong>$host</strong></p>";

// SQL to create tables
$sql = "
-- Table 1: SCADA Readings
CREATE TABLE IF NOT EXISTS `scada_readings` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `timestamp` DATETIME NOT NULL,
    `raw_biogas_flow` DECIMAL(10,2) DEFAULT NULL,
    `raw_biogas_totalizer` DECIMAL(15,2) DEFAULT NULL,
    `purified_gas_flow` DECIMAL(10,2) DEFAULT NULL,
    `purified_gas_totalizer` DECIMAL(15,2) DEFAULT NULL,
    `product_gas_flow` DECIMAL(10,2) DEFAULT NULL,
    `product_gas_totalizer` DECIMAL(15,2) DEFAULT NULL,
    `ch4_concentration` DECIMAL(5,2) DEFAULT NULL,
    `co2_level` DECIMAL(5,2) DEFAULT NULL,
    `o2_concentration` DECIMAL(5,2) DEFAULT NULL,
    `h2s_content` DECIMAL(10,2) DEFAULT NULL,
    `dew_point` DECIMAL(10,2) DEFAULT NULL,
    `d1_temp_bottom` DECIMAL(5,2) DEFAULT NULL,
    `d1_temp_top` DECIMAL(5,2) DEFAULT NULL,
    `d1_gas_pressure` DECIMAL(10,2) DEFAULT NULL,
    `d1_air_pressure` DECIMAL(10,2) DEFAULT NULL,
    `d1_slurry_height` DECIMAL(5,2) DEFAULT NULL,
    `d1_gas_level` DECIMAL(5,2) DEFAULT NULL,
    `d2_temp_bottom` DECIMAL(5,2) DEFAULT NULL,
    `d2_temp_top` DECIMAL(5,2) DEFAULT NULL,
    `d2_gas_pressure` DECIMAL(10,2) DEFAULT NULL,
    `d2_air_pressure` DECIMAL(10,2) DEFAULT NULL,
    `d2_slurry_height` DECIMAL(5,2) DEFAULT NULL,
    `d2_gas_level` DECIMAL(5,2) DEFAULT NULL,
    `buffer_tank_level` DECIMAL(5,2) DEFAULT NULL,
    `lagoon_tank_level` DECIMAL(5,2) DEFAULT NULL,
    `feed_fm1_flow` DECIMAL(10,2) DEFAULT NULL,
    `feed_fm1_totalizer` DECIMAL(15,2) DEFAULT NULL,
    `feed_fm2_flow` DECIMAL(10,2) DEFAULT NULL,
    `feed_fm2_totalizer` DECIMAL(15,2) DEFAULT NULL,
    `fresh_water_flow` DECIMAL(10,2) DEFAULT NULL,
    `fresh_water_totalizer` DECIMAL(15,2) DEFAULT NULL,
    `recycle_water_flow` DECIMAL(10,2) DEFAULT NULL,
    `recycle_water_totalizer` DECIMAL(15,2) DEFAULT NULL,
    `psa_status` TINYINT(1) DEFAULT 0,
    `psa_efficiency` DECIMAL(5,2) DEFAULT NULL,
    `lt_panel_power` DECIMAL(10,2) DEFAULT NULL,
    `compressor_status` TINYINT(1) DEFAULT 0,
    `plant_id` VARCHAR(50) DEFAULT 'KARNAL',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `idx_unique_plant_timestamp` (`plant_id`, `timestamp`),
    INDEX `idx_timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
";

if ($conn->query($sql)) {
    echo "<p style='color:green;'>✅ Table 'scada_readings' created</p>";
} else {
    echo "<p style='color:orange;'>⚠️ scada_readings: " . $conn->error . "</p>";
}

// Table 2: Users
$sql = "
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('HEAD_OFFICE', 'MNRE') NOT NULL DEFAULT 'MNRE',
    `name` VARCHAR(255) DEFAULT NULL,
    `is_active` TINYINT(1) DEFAULT 1,
    `last_login` DATETIME DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
";

if ($conn->query($sql)) {
    echo "<p style='color:green;'>✅ Table 'users' created</p>";
} else {
    echo "<p style='color:orange;'>⚠️ users: " . $conn->error . "</p>";
}

// Table 3: API Logs
$sql = "
CREATE TABLE IF NOT EXISTS `api_logs` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `endpoint` VARCHAR(255) NOT NULL,
    `method` VARCHAR(10) NOT NULL,
    `ip_address` VARCHAR(45) DEFAULT NULL,
    `request_body` TEXT DEFAULT NULL,
    `response_code` INT DEFAULT NULL,
    `response_message` VARCHAR(255) DEFAULT NULL,
    `execution_time_ms` INT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_endpoint` (`endpoint`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
";

if ($conn->query($sql)) {
    echo "<p style='color:green;'>✅ Table 'api_logs' created</p>";
} else {
    echo "<p style='color:orange;'>⚠️ api_logs: " . $conn->error . "</p>";
}

// Table 4: Sync Status
$sql = "
CREATE TABLE IF NOT EXISTS `sync_status` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `plant_id` VARCHAR(50) NOT NULL,
    `last_sync_time` DATETIME NOT NULL,
    `last_sync_status` ENUM('SUCCESS', 'FAILED') NOT NULL,
    `records_synced` INT DEFAULT 0,
    `error_message` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_plant` (`plant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
";

if ($conn->query($sql)) {
    echo "<p style='color:green;'>✅ Table 'sync_status' created</p>";
} else {
    echo "<p style='color:orange;'>⚠️ sync_status: " . $conn->error . "</p>";
}

// Table 5: Alerts
$sql = "
CREATE TABLE IF NOT EXISTS `alerts` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `plant_id` VARCHAR(50) NOT NULL,
    `parameter` VARCHAR(100) NOT NULL,
    `current_value` DECIMAL(15,2) NOT NULL,
    `threshold_value` DECIMAL(15,2) NOT NULL,
    `severity` ENUM('INFO', 'WARNING', 'CRITICAL') NOT NULL,
    `status` ENUM('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED') DEFAULT 'ACTIVE',
    `message` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_plant_status` (`plant_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
";

if ($conn->query($sql)) {
    echo "<p style='color:green;'>✅ Table 'alerts' created</p>";
} else {
    echo "<p style='color:orange;'>⚠️ alerts: " . $conn->error . "</p>";
}

// Insert Users
echo "<h2>Creating Users...</h2>";

$password_hash = password_hash('qwerty@1234', PASSWORD_DEFAULT);

$sql = "INSERT IGNORE INTO `users` (`email`, `password`, `role`, `name`) VALUES
('ho@lrenergy.in', '$password_hash', 'HEAD_OFFICE', 'Head Office Admin'),
('mnre@lrenergy.in', '$password_hash', 'MNRE', 'MNRE User')";

if ($conn->query($sql)) {
    echo "<p style='color:green;'>✅ Users created</p>";
} else {
    echo "<p style='color:orange;'>⚠️ Users: " . $conn->error . "</p>";
}

// Show tables
echo "<h2>📋 Tables Created:</h2>";
$result = $conn->query("SHOW TABLES");
echo "<ul>";
while ($row = $result->fetch_array()) {
    echo "<li>✅ " . $row[0] . "</li>";
}
echo "</ul>";

// Show users
echo "<h2>👤 Users:</h2>";
$result = $conn->query("SELECT email, role, name FROM users");
echo "<table border='1' cellpadding='10'><tr><th>Email</th><th>Role</th><th>Name</th></tr>";
while ($row = $result->fetch_assoc()) {
    echo "<tr><td>{$row['email']}</td><td>{$row['role']}</td><td>{$row['name']}</td></tr>";
}
echo "</table>";

echo "<h2 style='color:green;'>✅ Setup Complete!</h2>";

echo "<div style='background:#e8f5e9; padding:15px; margin:10px 0; border-radius:5px;'>";
echo "<h3>🔐 Login Credentials:</h3>";
echo "<p><strong>Head Office:</strong> ho@lrenergy.in / qwerty@1234</p>";
echo "<p><strong>MNRE:</strong> mnre@lrenergy.in / qwerty@1234</p>";
echo "</div>";

echo "<div style='background:#fff3e0; padding:15px; margin:10px 0; border-radius:5px;'>";
echo "<p><strong>⚠️ IMPORTANT:</strong> Delete this file (db_setup.php) after setup!</p>";
echo "<p><strong>Working Host:</strong> $host (update config.php if needed)</p>";
echo "</div>";

echo "<h3>🧪 Test Links:</h3>";
echo "<ul>";
echo "<li><a href='dashboard.php'>Test Dashboard API</a></li>";
echo "<li><a href='simulate.php'>Test Simulator</a></li>";
echo "</ul>";

$conn->close();
?>
