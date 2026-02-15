<?php
/**
 * Database Setup Script
 * Run this ONCE to create all required tables
 * DELETE THIS FILE after setup is complete!
 */

header('Content-Type: text/html; charset=UTF-8');

echo "<h1>🔧 SCADA Database Setup</h1>";
echo "<hr>";

// Database credentials
$hosts_to_try = ['localhost', '127.0.0.1', '119.18.49.27'];
$db_name = 'illionss_karnal_lre';
$db_user = 'illionss_karnal_lre';
$db_pass = 'xkA}Iu$l~Vrw3r.Vp+';

$pdo = null;
$working_host = null;

// Find working host
echo "<h2>Step 1: Testing Database Connection...</h2>";
foreach ($hosts_to_try as $host) {
    try {
        $dsn = "mysql:host=$host;dbname=$db_name;charset=utf8mb4";
        $pdo = new PDO($dsn, $db_user, $db_pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]);
        $working_host = $host;
        echo "<p style='color:green;'>✅ Connected successfully using host: <strong>$host</strong></p>";
        break;
    } catch (PDOException $e) {
        echo "<p style='color:red;'>❌ Host '$host' failed: " . $e->getMessage() . "</p>";
    }
}

if (!$pdo) {
    echo "<h2 style='color:red;'>❌ Could not connect to database with any host!</h2>";
    echo "<p>Please check your database credentials.</p>";
    exit;
}

// Create tables
echo "<h2>Step 2: Creating Tables...</h2>";

$tables_sql = "
-- Users table
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('HEAD_OFFICE', 'MNRE', 'ADMIN') NOT NULL DEFAULT 'MNRE',
    `name` VARCHAR(255) DEFAULT NULL,
    `is_active` TINYINT(1) DEFAULT 1,
    `last_login` DATETIME DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_email` (`email`),
    INDEX `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SCADA Readings table
CREATE TABLE IF NOT EXISTS `scada_readings` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `timestamp` DATETIME NOT NULL,
    `plant_id` VARCHAR(50) DEFAULT 'KARNAL',
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
    `psa_status` TINYINT(1) DEFAULT NULL,
    `psa_efficiency` DECIMAL(5,2) DEFAULT NULL,
    `lt_panel_power` DECIMAL(10,2) DEFAULT NULL,
    `compressor_status` TINYINT(1) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `unique_plant_timestamp` (`plant_id`, `timestamp`),
    INDEX `idx_timestamp` (`timestamp`),
    INDEX `idx_plant_id` (`plant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- API Logs table
CREATE TABLE IF NOT EXISTS `api_logs` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `endpoint` VARCHAR(100) NOT NULL,
    `method` VARCHAR(10) NOT NULL,
    `ip_address` VARCHAR(45) DEFAULT NULL,
    `request_body` TEXT DEFAULT NULL,
    `response_code` INT DEFAULT NULL,
    `response_message` VARCHAR(255) DEFAULT NULL,
    `execution_time_ms` INT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_endpoint` (`endpoint`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sync Status table
CREATE TABLE IF NOT EXISTS `sync_status` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `plant_id` VARCHAR(50) NOT NULL,
    `last_sync_time` DATETIME DEFAULT NULL,
    `records_synced` INT DEFAULT 0,
    `sync_status` ENUM('SUCCESS', 'FAILED', 'PARTIAL') DEFAULT 'SUCCESS',
    `error_message` TEXT DEFAULT NULL,
    `script_version` VARCHAR(20) DEFAULT NULL,
    `ip_address` VARCHAR(45) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_plant` (`plant_id`),
    INDEX `idx_sync_time` (`last_sync_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Alerts table
CREATE TABLE IF NOT EXISTS `alerts` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `plant_id` VARCHAR(50) NOT NULL,
    `parameter` VARCHAR(100) NOT NULL,
    `current_value` DECIMAL(15,2) NOT NULL,
    `threshold_value` DECIMAL(15,2) NOT NULL,
    `severity` ENUM('INFO', 'WARNING', 'CRITICAL') NOT NULL,
    `status` ENUM('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED') DEFAULT 'ACTIVE',
    `message` TEXT DEFAULT NULL,
    `acknowledged_by` INT UNSIGNED DEFAULT NULL,
    `acknowledged_at` DATETIME DEFAULT NULL,
    `resolved_at` DATETIME DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_plant_status` (`plant_id`, `status`),
    INDEX `idx_severity` (`severity`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
";

// Execute table creation
$statements = array_filter(array_map('trim', explode(';', $tables_sql)));
$success_count = 0;
$error_count = 0;

foreach ($statements as $sql) {
    if (empty($sql) || strpos($sql, '--') === 0) continue;
    
    try {
        $pdo->exec($sql);
        $success_count++;
    } catch (PDOException $e) {
        echo "<p style='color:orange;'>⚠️ " . $e->getMessage() . "</p>";
        $error_count++;
    }
}

echo "<p style='color:green;'>✅ Tables created/verified: $success_count</p>";

// Show existing tables
echo "<h2>Step 3: Verifying Tables...</h2>";
$tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
echo "<p>Tables in database:</p><ul>";
foreach ($tables as $table) {
    echo "<li>✅ $table</li>";
}
echo "</ul>";

// Insert default users
echo "<h2>Step 4: Creating Default Users...</h2>";

$password_hash = password_hash('qwerty@1234', PASSWORD_DEFAULT);

try {
    // Check if users exist
    $stmt = $pdo->query("SELECT COUNT(*) FROM users");
    $user_count = $stmt->fetchColumn();
    
    if ($user_count == 0) {
        $pdo->exec("INSERT INTO users (email, password, role, name) VALUES 
            ('ho@lrenergy.in', '$password_hash', 'HEAD_OFFICE', 'Head Office Admin'),
            ('mnre@lrenergy.in', '$password_hash', 'MNRE', 'MNRE User')
        ");
        echo "<p style='color:green;'>✅ Default users created!</p>";
    } else {
        echo "<p style='color:blue;'>ℹ️ Users already exist ($user_count users found)</p>";
    }
} catch (PDOException $e) {
    echo "<p style='color:red;'>❌ Error creating users: " . $e->getMessage() . "</p>";
}

// Show login credentials
echo "<h2>✅ Setup Complete!</h2>";
echo "<div style='background:#e8f5e9; padding:15px; border-radius:5px; margin:10px 0;'>";
echo "<h3>🔐 Login Credentials:</h3>";
echo "<table border='1' cellpadding='10' style='border-collapse:collapse;'>";
echo "<tr><th>Role</th><th>Email</th><th>Password</th></tr>";
echo "<tr><td>Head Office</td><td><strong>ho@lrenergy.in</strong></td><td><strong>qwerty@1234</strong></td></tr>";
echo "<tr><td>MNRE</td><td><strong>mnre@lrenergy.in</strong></td><td><strong>qwerty@1234</strong></td></tr>";
echo "</table>";
echo "</div>";

echo "<div style='background:#fff3e0; padding:15px; border-radius:5px; margin:10px 0;'>";
echo "<h3>⚠️ Important: Update config.php</h3>";
echo "<p>The working database host is: <strong>$working_host</strong></p>";
echo "<p>Make sure your <code>config.php</code> uses this host!</p>";
echo "</div>";

echo "<h2>🧪 Test Links:</h2>";
echo "<ul>";
echo "<li><a href='dashboard.php' target='_blank'>Test Dashboard API</a></li>";
echo "<li><a href='simulate.php' target='_blank'>Test Simulator</a></li>";
echo "<li><a href='auth.php' target='_blank'>Test Auth API</a></li>";
echo "</ul>";

echo "<hr>";
echo "<p style='color:red;'><strong>🗑️ DELETE THIS FILE (setup.php) after setup is complete for security!</strong></p>";
?>
