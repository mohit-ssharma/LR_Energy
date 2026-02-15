-- ============================================
-- LR ENERGY SCADA DATABASE SCHEMA (PRODUCTION)
-- Version: 2.0 - NO DUMMY DATA
-- Created: February 2026
-- ============================================

-- ============================================
-- TABLE 1: SCADA READINGS (Main Data Table)
-- ============================================

CREATE TABLE IF NOT EXISTS `scada_readings` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `timestamp` DATETIME NOT NULL,
    
    -- GAS FLOW (6 fields)
    `raw_biogas_flow` DECIMAL(10,2) DEFAULT NULL,
    `raw_biogas_totalizer` DECIMAL(15,2) DEFAULT NULL,
    `purified_gas_flow` DECIMAL(10,2) DEFAULT NULL,
    `purified_gas_totalizer` DECIMAL(15,2) DEFAULT NULL,
    `product_gas_flow` DECIMAL(10,2) DEFAULT NULL,
    `product_gas_totalizer` DECIMAL(15,2) DEFAULT NULL,
    
    -- GAS COMPOSITION (5 fields)
    `ch4_concentration` DECIMAL(5,2) DEFAULT NULL,
    `co2_level` DECIMAL(5,2) DEFAULT NULL,
    `o2_concentration` DECIMAL(5,2) DEFAULT NULL,
    `h2s_content` DECIMAL(10,2) DEFAULT NULL,
    `dew_point` DECIMAL(10,2) DEFAULT NULL,
    
    -- DIGESTER 1 (6 fields)
    `d1_temp_bottom` DECIMAL(5,2) DEFAULT NULL,
    `d1_temp_top` DECIMAL(5,2) DEFAULT NULL,
    `d1_gas_pressure` DECIMAL(10,2) DEFAULT NULL,
    `d1_air_pressure` DECIMAL(10,2) DEFAULT NULL,
    `d1_slurry_height` DECIMAL(5,2) DEFAULT NULL,
    `d1_gas_level` DECIMAL(5,2) DEFAULT NULL,
    
    -- DIGESTER 2 (6 fields)
    `d2_temp_bottom` DECIMAL(5,2) DEFAULT NULL,
    `d2_temp_top` DECIMAL(5,2) DEFAULT NULL,
    `d2_gas_pressure` DECIMAL(10,2) DEFAULT NULL,
    `d2_air_pressure` DECIMAL(10,2) DEFAULT NULL,
    `d2_slurry_height` DECIMAL(5,2) DEFAULT NULL,
    `d2_gas_level` DECIMAL(5,2) DEFAULT NULL,
    
    -- TANK LEVELS (2 fields)
    `buffer_tank_level` DECIMAL(5,2) DEFAULT NULL,
    `lagoon_tank_level` DECIMAL(5,2) DEFAULT NULL,
    
    -- WATER FLOW METERS (8 fields)
    `feed_fm1_flow` DECIMAL(10,2) DEFAULT NULL,
    `feed_fm1_totalizer` DECIMAL(15,2) DEFAULT NULL,
    `feed_fm2_flow` DECIMAL(10,2) DEFAULT NULL,
    `feed_fm2_totalizer` DECIMAL(15,2) DEFAULT NULL,
    `fresh_water_flow` DECIMAL(10,2) DEFAULT NULL,
    `fresh_water_totalizer` DECIMAL(15,2) DEFAULT NULL,
    `recycle_water_flow` DECIMAL(10,2) DEFAULT NULL,
    `recycle_water_totalizer` DECIMAL(15,2) DEFAULT NULL,
    
    -- EQUIPMENT STATUS (4 fields)
    `psa_status` TINYINT(1) DEFAULT 0,
    `psa_efficiency` DECIMAL(5,2) DEFAULT NULL,
    `lt_panel_power` DECIMAL(10,2) DEFAULT NULL,
    `compressor_status` TINYINT(1) DEFAULT 0,
    
    -- METADATA
    `plant_id` VARCHAR(50) DEFAULT 'KARNAL',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- INDEXES
    UNIQUE KEY `idx_unique_plant_timestamp` (`plant_id`, `timestamp`),
    INDEX `idx_timestamp` (`timestamp`),
    INDEX `idx_plant_timestamp` (`plant_id`, `timestamp`),
    INDEX `idx_created_at` (`created_at`)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- TABLE 2: USERS (Authentication)
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
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX `idx_email` (`email`),
    INDEX `idx_role` (`role`)
    
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
    
    INDEX `idx_endpoint` (`endpoint`),
    INDEX `idx_created_at` (`created_at`),
    INDEX `idx_ip` (`ip_address`)
    
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
    
    INDEX `idx_plant` (`plant_id`),
    INDEX `idx_sync_time` (`last_sync_time`)
    
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
    
    INDEX `idx_plant_status` (`plant_id`, `status`),
    INDEX `idx_severity` (`severity`),
    INDEX `idx_created_at` (`created_at`)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- INSERT DEFAULT USERS ONLY
-- Password: qwerty@1234 (bcrypt hash)
-- ============================================

INSERT INTO `users` (`email`, `password`, `role`, `name`) VALUES
('ho@lrenergy.in', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'HEAD_OFFICE', 'Head Office Admin'),
('mnre@lrenergy.in', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'MNRE', 'MNRE User');


-- ============================================
-- VERIFY SETUP
-- ============================================

SHOW TABLES;
SELECT id, email, role, name FROM users;
