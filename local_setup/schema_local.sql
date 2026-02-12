-- ============================================
-- LR ENERGY SCADA DATABASE SCHEMA (LOCAL)
-- For XAMPP MySQL Testing
-- ============================================

-- Create database (run this first if not created via phpMyAdmin)
-- CREATE DATABASE IF NOT EXISTS scada_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE scada_db;


-- ============================================
-- TABLE 1: SCADA READINGS
-- ============================================

CREATE TABLE IF NOT EXISTS `scada_readings` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `timestamp` DATETIME NOT NULL,
    
    -- Gas Flow
    `raw_biogas_flow` DECIMAL(10,2) DEFAULT NULL,
    `raw_biogas_totalizer` DECIMAL(15,2) DEFAULT NULL,
    `purified_gas_flow` DECIMAL(10,2) DEFAULT NULL,
    `purified_gas_totalizer` DECIMAL(15,2) DEFAULT NULL,
    `product_gas_flow` DECIMAL(10,2) DEFAULT NULL,
    `product_gas_totalizer` DECIMAL(15,2) DEFAULT NULL,
    
    -- Gas Composition
    `ch4_concentration` DECIMAL(5,2) DEFAULT NULL,
    `co2_level` DECIMAL(5,2) DEFAULT NULL,
    `o2_concentration` DECIMAL(5,2) DEFAULT NULL,
    `h2s_content` DECIMAL(10,2) DEFAULT NULL,
    `dew_point` DECIMAL(10,2) DEFAULT NULL,
    
    -- Digester 1
    `d1_temp_bottom` DECIMAL(5,2) DEFAULT NULL,
    `d1_temp_top` DECIMAL(5,2) DEFAULT NULL,
    `d1_gas_pressure` DECIMAL(10,2) DEFAULT NULL,
    `d1_air_pressure` DECIMAL(10,2) DEFAULT NULL,
    `d1_slurry_height` DECIMAL(5,2) DEFAULT NULL,
    `d1_gas_level` DECIMAL(5,2) DEFAULT NULL,
    
    -- Digester 2
    `d2_temp_bottom` DECIMAL(5,2) DEFAULT NULL,
    `d2_temp_top` DECIMAL(5,2) DEFAULT NULL,
    `d2_gas_pressure` DECIMAL(10,2) DEFAULT NULL,
    `d2_air_pressure` DECIMAL(10,2) DEFAULT NULL,
    `d2_slurry_height` DECIMAL(5,2) DEFAULT NULL,
    `d2_gas_level` DECIMAL(5,2) DEFAULT NULL,
    
    -- Tank Levels
    `buffer_tank_level` DECIMAL(5,2) DEFAULT NULL,
    `lagoon_tank_level` DECIMAL(5,2) DEFAULT NULL,
    
    -- Water Flow
    `feed_fm1_flow` DECIMAL(10,2) DEFAULT NULL,
    `feed_fm1_totalizer` DECIMAL(15,2) DEFAULT NULL,
    `feed_fm2_flow` DECIMAL(10,2) DEFAULT NULL,
    `feed_fm2_totalizer` DECIMAL(15,2) DEFAULT NULL,
    `fresh_water_flow` DECIMAL(10,2) DEFAULT NULL,
    `fresh_water_totalizer` DECIMAL(15,2) DEFAULT NULL,
    `recycle_water_flow` DECIMAL(10,2) DEFAULT NULL,
    `recycle_water_totalizer` DECIMAL(15,2) DEFAULT NULL,
    
    -- Equipment
    `psa_efficiency` DECIMAL(5,2) DEFAULT NULL,
    `lt_panel_power` DECIMAL(10,2) DEFAULT NULL,
    `compressor_status` TINYINT(1) DEFAULT 0,
    
    -- Metadata
    `plant_id` VARCHAR(50) DEFAULT 'KARNAL',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX `idx_timestamp` (`timestamp`),
    INDEX `idx_plant_timestamp` (`plant_id`, `timestamp`)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- TABLE 2: USERS
-- ============================================

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
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- TABLE 3: API LOGS
-- ============================================

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
    
    INDEX `idx_created_at` (`created_at`)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- TABLE 4: SYNC STATUS
-- ============================================

CREATE TABLE IF NOT EXISTS `sync_status` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `plant_id` VARCHAR(50) NOT NULL,
    `last_sync_time` DATETIME NOT NULL,
    `last_sync_status` ENUM('SUCCESS', 'FAILED') NOT NULL,
    `records_synced` INT DEFAULT 0,
    `error_message` TEXT DEFAULT NULL,
    `script_version` VARCHAR(20) DEFAULT NULL,
    `ip_address` VARCHAR(45) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX `idx_plant` (`plant_id`)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- TABLE 5: ALERTS
-- ============================================

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
    
    INDEX `idx_plant_status` (`plant_id`, `status`)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- INSERT DEFAULT USERS
-- Password: qwerty (hashed)
-- ============================================

INSERT INTO `users` (`email`, `password`, `role`, `name`) VALUES
('it@lrenergy.in', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'HEAD_OFFICE', 'Head Office Admin'),
('it1@lrenergy.in', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'MNRE', 'MNRE User');

-- Note: The password hash above is for 'password'. 
-- We'll update to actual 'qwerty' hash via PHP.


-- ============================================
-- INSERT SAMPLE DATA FOR TESTING
-- ============================================

INSERT INTO `scada_readings` (
    `timestamp`,
    `raw_biogas_flow`, `raw_biogas_totalizer`,
    `purified_gas_flow`, `purified_gas_totalizer`,
    `product_gas_flow`, `product_gas_totalizer`,
    `ch4_concentration`, `co2_level`, `o2_concentration`, `h2s_content`, `dew_point`,
    `d1_temp_bottom`, `d1_temp_top`, `d1_gas_pressure`, `d1_air_pressure`, `d1_slurry_height`, `d1_gas_level`,
    `d2_temp_bottom`, `d2_temp_top`, `d2_gas_pressure`, `d2_air_pressure`, `d2_slurry_height`, `d2_gas_level`,
    `buffer_tank_level`, `lagoon_tank_level`,
    `feed_fm1_flow`, `feed_fm1_totalizer`,
    `feed_fm2_flow`, `feed_fm2_totalizer`,
    `fresh_water_flow`, `fresh_water_totalizer`,
    `recycle_water_flow`, `recycle_water_totalizer`,
    `psa_efficiency`, `lt_panel_power`, `compressor_status`,
    `plant_id`
) VALUES 
(DATE_SUB(NOW(), INTERVAL 5 MINUTE), 1248.50, 149500.00, 1178.20, 141500.00, 1148.80, 137500.00, 96.70, 2.95, 0.32, 182.00, -67.50, 36.90, 36.40, 31.80, 17.90, 7.55, 74.50, 36.40, 35.90, 29.80, 16.90, 7.25, 71.50, 81.50, 75.50, 41.50, 4950.00, 37.50, 4450.00, 11.80, 1480.00, 25.80, 2980.00, 94.20, 244.00, 1, 'KARNAL'),
(DATE_SUB(NOW(), INTERVAL 4 MINUTE), 1249.00, 149520.00, 1179.00, 141520.00, 1149.50, 137520.00, 96.75, 2.92, 0.31, 181.00, -67.80, 36.95, 36.45, 31.90, 17.95, 7.58, 74.80, 36.45, 35.95, 29.90, 16.95, 7.28, 71.80, 81.80, 75.80, 41.80, 4960.00, 37.80, 4460.00, 11.90, 1485.00, 25.90, 2985.00, 94.30, 244.50, 1, 'KARNAL'),
(DATE_SUB(NOW(), INTERVAL 3 MINUTE), 1250.00, 149540.00, 1180.00, 141540.00, 1150.00, 137540.00, 96.80, 2.90, 0.30, 180.00, -68.00, 37.00, 36.50, 32.00, 18.00, 7.60, 75.00, 36.50, 36.00, 30.00, 17.00, 7.30, 72.00, 82.00, 76.00, 42.00, 4970.00, 38.00, 4470.00, 12.00, 1490.00, 26.00, 2990.00, 94.40, 245.00, 1, 'KARNAL'),
(DATE_SUB(NOW(), INTERVAL 2 MINUTE), 1251.00, 149560.00, 1181.00, 141560.00, 1151.00, 137560.00, 96.85, 2.88, 0.29, 179.00, -68.20, 37.05, 36.55, 32.10, 18.05, 7.62, 75.20, 36.55, 36.05, 30.10, 17.05, 7.32, 72.20, 82.20, 76.20, 42.20, 4980.00, 38.20, 4480.00, 12.10, 1495.00, 26.10, 2995.00, 94.50, 245.50, 1, 'KARNAL'),
(DATE_SUB(NOW(), INTERVAL 1 MINUTE), 1252.00, 149580.00, 1182.00, 141580.00, 1152.00, 137580.00, 96.90, 2.85, 0.28, 178.00, -68.50, 37.10, 36.60, 32.20, 18.10, 7.65, 75.50, 36.60, 36.10, 30.20, 17.10, 7.35, 72.50, 82.50, 76.50, 42.50, 4990.00, 38.50, 4490.00, 12.20, 1498.00, 26.20, 2998.00, 94.60, 246.00, 1, 'KARNAL');


-- ============================================
-- VERIFY SETUP
-- ============================================

SELECT 'Tables Created:' as Status;
SHOW TABLES;

SELECT 'Sample Data Count:' as Status, COUNT(*) as Records FROM scada_readings;

SELECT 'Users:' as Status;
SELECT id, email, role, name FROM users;
