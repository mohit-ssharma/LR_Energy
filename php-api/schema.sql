-- ============================================
-- LR ENERGY SCADA DATABASE SCHEMA
-- Version: 1.0
-- Created: February 2026
-- ============================================

-- ============================================
-- HOW TO USE THIS FILE:
-- ============================================
-- 1. Login to GoDaddy cPanel
-- 2. Go to: Databases → phpMyAdmin
-- 3. Select your database from left panel
-- 4. Click "SQL" tab at top
-- 5. Copy-paste this entire file
-- 6. Click "Go" to execute
-- ============================================


-- ============================================
-- TABLE 1: SCADA READINGS (Main Data Table)
-- ============================================
-- Stores all sensor readings from plant
-- One row added every minute
-- ~525,600 rows per year

CREATE TABLE IF NOT EXISTS `scada_readings` (
    -- Primary Key
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    
    -- Timestamp of reading
    `timestamp` DATETIME NOT NULL,
    
    -- ==========================================
    -- GAS FLOW (6 fields)
    -- ==========================================
    
    -- Raw Biogas Flow
    `raw_biogas_flow` DECIMAL(10,2) DEFAULT NULL COMMENT 'Current flow rate in Nm³/hr',
    `raw_biogas_totalizer` DECIMAL(15,2) DEFAULT NULL COMMENT 'Cumulative total in Nm³',
    
    -- Purified Gas Flow
    `purified_gas_flow` DECIMAL(10,2) DEFAULT NULL COMMENT 'Current flow rate in Nm³/hr',
    `purified_gas_totalizer` DECIMAL(15,2) DEFAULT NULL COMMENT 'Cumulative total in Nm³',
    
    -- Product Gas Flow
    `product_gas_flow` DECIMAL(10,2) DEFAULT NULL COMMENT 'Current flow rate in Nm³/hr',
    `product_gas_totalizer` DECIMAL(15,2) DEFAULT NULL COMMENT 'Cumulative total in Nm³',
    
    -- ==========================================
    -- GAS COMPOSITION (5 fields)
    -- ==========================================
    
    `ch4_concentration` DECIMAL(5,2) DEFAULT NULL COMMENT 'Methane concentration in %',
    `co2_level` DECIMAL(5,2) DEFAULT NULL COMMENT 'Carbon dioxide level in %',
    `o2_concentration` DECIMAL(5,2) DEFAULT NULL COMMENT 'Oxygen concentration in %',
    `h2s_content` DECIMAL(10,2) DEFAULT NULL COMMENT 'Hydrogen sulfide in ppm',
    `dew_point` DECIMAL(10,2) DEFAULT NULL COMMENT 'Dew point in mg/m³',
    
    -- ==========================================
    -- DIGESTER 1 (6 fields)
    -- ==========================================
    
    `d1_temp_bottom` DECIMAL(5,2) DEFAULT NULL COMMENT 'Bottom temperature in °C',
    `d1_temp_top` DECIMAL(5,2) DEFAULT NULL COMMENT 'Top temperature in °C',
    `d1_gas_pressure` DECIMAL(10,2) DEFAULT NULL COMMENT 'Gas pressure in mbar',
    `d1_air_pressure` DECIMAL(10,2) DEFAULT NULL COMMENT 'Air pressure in mbar',
    `d1_slurry_height` DECIMAL(5,2) DEFAULT NULL COMMENT 'Slurry height in meters',
    `d1_gas_level` DECIMAL(5,2) DEFAULT NULL COMMENT 'Gas level in %',
    
    -- ==========================================
    -- DIGESTER 2 (6 fields)
    -- ==========================================
    
    `d2_temp_bottom` DECIMAL(5,2) DEFAULT NULL COMMENT 'Bottom temperature in °C',
    `d2_temp_top` DECIMAL(5,2) DEFAULT NULL COMMENT 'Top temperature in °C',
    `d2_gas_pressure` DECIMAL(10,2) DEFAULT NULL COMMENT 'Gas pressure in mbar',
    `d2_air_pressure` DECIMAL(10,2) DEFAULT NULL COMMENT 'Air pressure in mbar',
    `d2_slurry_height` DECIMAL(5,2) DEFAULT NULL COMMENT 'Slurry height in meters',
    `d2_gas_level` DECIMAL(5,2) DEFAULT NULL COMMENT 'Gas level in %',
    
    -- ==========================================
    -- TANK LEVELS (2 fields)
    -- ==========================================
    
    `buffer_tank_level` DECIMAL(5,2) DEFAULT NULL COMMENT 'Buffer tank level in %',
    `lagoon_tank_level` DECIMAL(5,2) DEFAULT NULL COMMENT 'Lagoon tank level in %',
    
    -- ==========================================
    -- WATER FLOW METERS (8 fields)
    -- ==========================================
    
    -- Feed Flow Meter 1
    `feed_fm1_flow` DECIMAL(10,2) DEFAULT NULL COMMENT 'Current flow rate in m³/hr',
    `feed_fm1_totalizer` DECIMAL(15,2) DEFAULT NULL COMMENT 'Cumulative total in m³',
    
    -- Feed Flow Meter 2
    `feed_fm2_flow` DECIMAL(10,2) DEFAULT NULL COMMENT 'Current flow rate in m³/hr',
    `feed_fm2_totalizer` DECIMAL(15,2) DEFAULT NULL COMMENT 'Cumulative total in m³',
    
    -- Fresh Water Flow Meter
    `fresh_water_flow` DECIMAL(10,2) DEFAULT NULL COMMENT 'Current flow rate in m³/hr',
    `fresh_water_totalizer` DECIMAL(15,2) DEFAULT NULL COMMENT 'Cumulative total in m³',
    
    -- Recycle Water Flow Meter
    `recycle_water_flow` DECIMAL(10,2) DEFAULT NULL COMMENT 'Current flow rate in m³/hr',
    `recycle_water_totalizer` DECIMAL(15,2) DEFAULT NULL COMMENT 'Cumulative total in m³',
    
    -- ==========================================
    -- EQUIPMENT STATUS (4 fields)
    -- ==========================================
    
    `psa_status` TINYINT(1) DEFAULT 0 COMMENT '0=Off, 1=Running - PSA Unit Status from SCADA',
    `psa_efficiency` DECIMAL(5,2) DEFAULT NULL COMMENT 'PSA efficiency in %',
    `lt_panel_power` DECIMAL(10,2) DEFAULT NULL COMMENT 'LT Panel current load in kW',
    `compressor_status` TINYINT(1) DEFAULT 0 COMMENT '0=Off, 1=Running - Compressor Status',
    
    -- ==========================================
    -- METADATA
    -- ==========================================
    
    `plant_id` VARCHAR(50) DEFAULT 'KARNAL' COMMENT 'Plant identifier for multi-plant support',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation time',
    
    -- ==========================================
    -- INDEXES for faster queries
    -- ==========================================
    
    INDEX `idx_timestamp` (`timestamp`),
    INDEX `idx_plant_timestamp` (`plant_id`, `timestamp`),
    INDEX `idx_created_at` (`created_at`)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- TABLE 2: USERS (Authentication)
-- ============================================
-- Stores user login credentials
-- Two roles: HEAD_OFFICE and MNRE

CREATE TABLE IF NOT EXISTS `users` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL COMMENT 'Hashed password',
    `role` ENUM('HEAD_OFFICE', 'MNRE') NOT NULL DEFAULT 'MNRE',
    `name` VARCHAR(255) DEFAULT NULL,
    `is_active` TINYINT(1) DEFAULT 1,
    `last_login` DATETIME DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_email` (`email`),
    INDEX `idx_role` (`role`)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- TABLE 3: API LOGS (Security & Debugging)
-- ============================================
-- Logs all API requests for security and debugging

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
    
    INDEX `idx_endpoint` (`endpoint`),
    INDEX `idx_created_at` (`created_at`),
    INDEX `idx_ip` (`ip_address`)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- TABLE 4: SYNC STATUS (Monitoring)
-- ============================================
-- Tracks sync script status for monitoring

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
    
    INDEX `idx_plant` (`plant_id`),
    INDEX `idx_sync_time` (`last_sync_time`)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- TABLE 5: ALERTS (Future Use)
-- ============================================
-- Stores system alerts and notifications

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
    INDEX `idx_created_at` (`created_at`),
    
    FOREIGN KEY (`acknowledged_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- INSERT DEFAULT USERS
-- ============================================
-- Default passwords: 'qwerty' (hashed with password_hash)
-- IMPORTANT: Change these passwords after first login!

INSERT INTO `users` (`email`, `password`, `role`, `name`) VALUES
('it@lrenergy.in', '$2y$10$YourHashedPasswordHere1234567890', 'HEAD_OFFICE', 'Head Office Admin'),
('it1@lrenergy.in', '$2y$10$YourHashedPasswordHere1234567890', 'MNRE', 'MNRE User');

-- Note: Replace the password hashes above with actual hashed passwords
-- You can generate password hashes using PHP:
-- echo password_hash('qwerty', PASSWORD_DEFAULT);


-- ============================================
-- INSERT SAMPLE DATA (For Testing)
-- ============================================
-- Remove this section in production

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
    `psa_status`, `psa_efficiency`, `lt_panel_power`, `compressor_status`,
    `plant_id`
) VALUES (
    NOW(),
    1250.50, 150000.00,
    1180.20, 142000.00,
    1150.80, 138000.00,
    96.80, 2.90, 0.30, 180.00, -68.00,
    37.00, 36.50, 32.00, 18.00, 7.60, 75.00,
    36.50, 36.00, 30.00, 17.00, 7.30, 72.00,
    82.00, 76.00,
    42.00, 5000.00,
    38.00, 4500.00,
    12.00, 1500.00,
    26.00, 3000.00,
    1, 94.40, 245.00, 1,
    'KARNAL'
);


-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these after setup to verify tables are created

-- Check all tables exist
SHOW TABLES;

-- Check scada_readings structure
DESCRIBE scada_readings;

-- Check users exist
SELECT id, email, role, name FROM users;

-- Check sample data
SELECT * FROM scada_readings ORDER BY id DESC LIMIT 1;


-- ============================================
-- STORAGE ESTIMATION
-- ============================================
-- 
-- Per reading: ~500 bytes
-- Per minute: 1 reading = 500 bytes
-- Per hour: 60 readings = 30 KB
-- Per day: 1,440 readings = 720 KB
-- Per month: 43,200 readings = 21 MB
-- Per year: 525,600 readings = 250 MB
--
-- Recommended: Allocate 500 MB for 2 years of data
-- ============================================


-- ============================================
-- MAINTENANCE QUERIES (Run Monthly)
-- ============================================

-- Delete data older than 2 years (optional)
-- DELETE FROM scada_readings WHERE timestamp < DATE_SUB(NOW(), INTERVAL 2 YEAR);

-- Optimize table after large deletes
-- OPTIMIZE TABLE scada_readings;

-- Check table size
-- SELECT 
--     table_name AS 'Table',
--     ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
-- FROM information_schema.tables
-- WHERE table_schema = DATABASE()
-- ORDER BY (data_length + index_length) DESC;
