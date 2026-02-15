<?php
require_once 'cors.php';  // CORS headers - MUST BE FIRST!

/**
 * Dashboard API Endpoint
 * URL: /api/dashboard.php
 * Method: GET
 * 
 * Returns latest SCADA data with calculated averages for dashboard display
 * 
 * Response includes:
 * - Latest readings
 * - 1-hour averages
 * - 12-hour averages
 * - 24-hour averages/totalizers
 * - Sample counts for data quality
 * - Data freshness status
 */

require_once 'config.php';

$startTime = microtime(true);

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Method not allowed. Use GET.', 405);
}

// Connect to database
$pdo = getDBConnection();
if (!$pdo) {
    sendError('Database connection failed', 500);
}

try {
    // Get latest reading with complete data (exclude records with NULL key fields)
    $stmt = $pdo->query("
        SELECT * FROM scada_readings 
        WHERE plant_id = '" . PLANT_ID . "' 
        AND purified_gas_flow IS NOT NULL
        AND co2_level IS NOT NULL
        ORDER BY timestamp DESC 
        LIMIT 1
    ");
    $latest = $stmt->fetch();
    
    // If no complete records, try to get any record
    if (!$latest) {
        $stmt = $pdo->query("
            SELECT * FROM scada_readings 
            WHERE plant_id = '" . PLANT_ID . "' 
            ORDER BY timestamp DESC 
            LIMIT 1
        ");
        $latest = $stmt->fetch();
    }
    
    if (!$latest) {
        sendResponse([
            'status' => 'no_data',
            'message' => 'No data available',
            'data' => null
        ]);
    }
    
    // Calculate data freshness
    $lastTimestamp = strtotime($latest['timestamp']);
    $now = time();
    $ageSeconds = $now - $lastTimestamp;
    
    $dataStatus = 'FRESH';
    if ($ageSeconds > 300) {  // > 5 minutes
        $dataStatus = 'STALE';
    } elseif ($ageSeconds > 120) {  // > 2 minutes
        $dataStatus = 'DELAYED';
    }
    
    // Get 1-hour statistics (COALESCE returns 0 if all values are NULL)
    $stmt1hr = $pdo->query("
        SELECT 
            COUNT(*) as sample_count,
            COUNT(raw_biogas_flow) as raw_biogas_samples,
            COUNT(ch4_concentration) as ch4_samples,
            COALESCE(AVG(raw_biogas_flow), 0) as avg_raw_biogas_flow,
            COALESCE(AVG(purified_gas_flow), 0) as avg_purified_gas_flow,
            COALESCE(AVG(product_gas_flow), 0) as avg_product_gas_flow,
            COALESCE(AVG(ch4_concentration), 0) as avg_ch4,
            COALESCE(AVG(co2_level), 0) as avg_co2,
            COALESCE(AVG(o2_concentration), 0) as avg_o2,
            COALESCE(AVG(h2s_content), 0) as avg_h2s,
            COALESCE(AVG(dew_point), 0) as avg_dew_point
        FROM scada_readings 
        WHERE plant_id = '" . PLANT_ID . "' 
        AND timestamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
    ");
    $stats1hr = $stmt1hr->fetch();
    
    // Get 12-hour statistics
    $stmt12hr = $pdo->query("
        SELECT 
            COUNT(*) as sample_count,
            COUNT(raw_biogas_flow) as raw_biogas_samples,
            COUNT(ch4_concentration) as ch4_samples,
            COALESCE(AVG(raw_biogas_flow), 0) as avg_raw_biogas_flow,
            COALESCE(AVG(purified_gas_flow), 0) as avg_purified_gas_flow,
            COALESCE(AVG(product_gas_flow), 0) as avg_product_gas_flow,
            COALESCE(AVG(ch4_concentration), 0) as avg_ch4,
            COALESCE(AVG(co2_level), 0) as avg_co2,
            COALESCE(AVG(o2_concentration), 0) as avg_o2,
            COALESCE(AVG(h2s_content), 0) as avg_h2s,
            COALESCE(AVG(dew_point), 0) as avg_dew_point
        FROM scada_readings 
        WHERE plant_id = '" . PLANT_ID . "' 
        AND timestamp >= DATE_SUB(NOW(), INTERVAL 12 HOUR)
    ");
    $stats12hr = $stmt12hr->fetch();
    
    // Get TODAY's totalizer differences (Midnight-to-Midnight: 00:00 AM to 11:59 PM)
    // Resets at midnight for daily production tracking
    $stmt24hr = $pdo->query("
        SELECT 
            COUNT(*) as sample_count,
            COUNT(raw_biogas_totalizer) as raw_biogas_samples,
            COUNT(purified_gas_totalizer) as purified_gas_samples,
            COUNT(product_gas_totalizer) as product_gas_samples,
            COALESCE(MAX(raw_biogas_totalizer) - MIN(raw_biogas_totalizer), 0) as totalizer_raw_biogas,
            COALESCE(MAX(purified_gas_totalizer) - MIN(purified_gas_totalizer), 0) as totalizer_purified_gas,
            COALESCE(MAX(product_gas_totalizer) - MIN(product_gas_totalizer), 0) as totalizer_product_gas,
            COALESCE(MAX(feed_fm1_totalizer) - MIN(feed_fm1_totalizer), 0) as totalizer_feed_fm1,
            COALESCE(MAX(feed_fm2_totalizer) - MIN(feed_fm2_totalizer), 0) as totalizer_feed_fm2,
            COALESCE(MAX(fresh_water_totalizer) - MIN(fresh_water_totalizer), 0) as totalizer_fresh_water,
            COALESCE(MAX(recycle_water_totalizer) - MIN(recycle_water_totalizer), 0) as totalizer_recycle_water
        FROM scada_readings 
        WHERE plant_id = '" . PLANT_ID . "' 
        AND DATE(timestamp) = CURDATE()
    ");
    $stats24hr = $stmt24hr->fetch();
    
    // =====================================================
    // PSA/Compressor Running Hours Calculation
    // =====================================================
    // PSA Running Hours Calculation (Based on psa_status from SCADA)
    // =====================================================
    // Count minutes where psa_status = 1, divide by 60 to get hours
    
    // Today's PSA running hours
    $stmtPsaToday = $pdo->query("
        SELECT 
            SUM(CASE WHEN psa_status = 1 THEN 1 ELSE 0 END) as psa_running_minutes,
            SUM(CASE WHEN compressor_status = 1 THEN 1 ELSE 0 END) as compressor_running_minutes,
            COUNT(*) as total_minutes
        FROM scada_readings 
        WHERE plant_id = '" . PLANT_ID . "' 
        AND DATE(timestamp) = CURDATE()
    ");
    $psaToday = $stmtPsaToday->fetch();
    
    // This month's PSA running hours
    $stmtPsaMonth = $pdo->query("
        SELECT 
            SUM(CASE WHEN psa_status = 1 THEN 1 ELSE 0 END) as psa_running_minutes,
            SUM(CASE WHEN compressor_status = 1 THEN 1 ELSE 0 END) as compressor_running_minutes,
            COUNT(*) as total_minutes
        FROM scada_readings 
        WHERE plant_id = '" . PLANT_ID . "' 
        AND MONTH(timestamp) = MONTH(CURDATE())
        AND YEAR(timestamp) = YEAR(CURDATE())
    ");
    $psaMonth = $stmtPsaMonth->fetch();
    
    // =====================================================
    // LT Panel Power Consumption Calculation
    // =====================================================
    // Consumption (kWh) = Average Power (kW) × Hours
    // Current Load comes from lt_panel_power field
    
    // Today's consumption
    $stmtPowerToday = $pdo->query("
        SELECT 
            COALESCE(AVG(lt_panel_power), 0) as avg_power_kw,
            COALESCE(MAX(lt_panel_power), 0) as max_power_kw,
            COALESCE(MIN(lt_panel_power), 0) as min_power_kw,
            COUNT(*) as total_minutes
        FROM scada_readings 
        WHERE plant_id = '" . PLANT_ID . "' 
        AND DATE(timestamp) = CURDATE()
    ");
    $powerToday = $stmtPowerToday->fetch();
    
    // This month's consumption
    $stmtPowerMonth = $pdo->query("
        SELECT 
            COALESCE(AVG(lt_panel_power), 0) as avg_power_kw,
            COUNT(*) as total_minutes
        FROM scada_readings 
        WHERE plant_id = '" . PLANT_ID . "' 
        AND MONTH(timestamp) = MONTH(CURDATE())
        AND YEAR(timestamp) = YEAR(CURDATE())
    ");
    $powerMonth = $stmtPowerMonth->fetch();
    
    $executionTime = round((microtime(true) - $startTime) * 1000);
    
    // Build response
    $response = [
        'status' => 'success',
        'data_status' => $dataStatus,
        'data_age_seconds' => $ageSeconds,
        'last_update' => $latest['timestamp'],
        'server_time' => date('Y-m-d H:i:s'),
        
        // Current values
        'current' => [
            'raw_biogas_flow' => floatval($latest['raw_biogas_flow']),
            'raw_biogas_totalizer' => floatval($latest['raw_biogas_totalizer']),
            'purified_gas_flow' => floatval($latest['purified_gas_flow']),
            'purified_gas_totalizer' => floatval($latest['purified_gas_totalizer']),
            'product_gas_flow' => floatval($latest['product_gas_flow']),
            'product_gas_totalizer' => floatval($latest['product_gas_totalizer']),
            
            'ch4_concentration' => floatval($latest['ch4_concentration']),
            'co2_level' => floatval($latest['co2_level']),
            'o2_concentration' => floatval($latest['o2_concentration']),
            'h2s_content' => floatval($latest['h2s_content']),
            'dew_point' => floatval($latest['dew_point']),
            
            'd1_temp_bottom' => floatval($latest['d1_temp_bottom']),
            'd1_temp_top' => floatval($latest['d1_temp_top']),
            'd1_gas_pressure' => floatval($latest['d1_gas_pressure']),
            'd1_air_pressure' => floatval($latest['d1_air_pressure']),
            'd1_slurry_height' => floatval($latest['d1_slurry_height']),
            'd1_gas_level' => floatval($latest['d1_gas_level']),
            
            'd2_temp_bottom' => floatval($latest['d2_temp_bottom']),
            'd2_temp_top' => floatval($latest['d2_temp_top']),
            'd2_gas_pressure' => floatval($latest['d2_gas_pressure']),
            'd2_air_pressure' => floatval($latest['d2_air_pressure']),
            'd2_slurry_height' => floatval($latest['d2_slurry_height']),
            'd2_gas_level' => floatval($latest['d2_gas_level']),
            
            'buffer_tank_level' => floatval($latest['buffer_tank_level']),
            'lagoon_tank_level' => floatval($latest['lagoon_tank_level']),
            
            'feed_fm1_flow' => floatval($latest['feed_fm1_flow']),
            'feed_fm1_totalizer' => floatval($latest['feed_fm1_totalizer']),
            'feed_fm2_flow' => floatval($latest['feed_fm2_flow']),
            'feed_fm2_totalizer' => floatval($latest['feed_fm2_totalizer']),
            'fresh_water_flow' => floatval($latest['fresh_water_flow']),
            'fresh_water_totalizer' => floatval($latest['fresh_water_totalizer']),
            'recycle_water_flow' => floatval($latest['recycle_water_flow']),
            'recycle_water_totalizer' => floatval($latest['recycle_water_totalizer']),
            
            'psa_status' => intval($latest['psa_status']),
            'psa_efficiency' => floatval($latest['psa_efficiency']),
            'lt_panel_power' => floatval($latest['lt_panel_power']),
            'compressor_status' => intval($latest['compressor_status'])
        ],
        
        // 1-hour averages
        'avg_1hr' => [
            'raw_biogas_flow' => round(floatval($stats1hr['avg_raw_biogas_flow']), 2),
            'purified_gas_flow' => round(floatval($stats1hr['avg_purified_gas_flow']), 2),
            'product_gas_flow' => round(floatval($stats1hr['avg_product_gas_flow']), 2),
            'ch4_concentration' => round(floatval($stats1hr['avg_ch4']), 2),
            'co2_level' => round(floatval($stats1hr['avg_co2']), 2),
            'o2_concentration' => round(floatval($stats1hr['avg_o2']), 2),
            'h2s_content' => round(floatval($stats1hr['avg_h2s']), 2),
            'dew_point' => round(floatval($stats1hr['avg_dew_point']), 2),
            'sample_count' => intval($stats1hr['sample_count']),
            'valid_samples' => intval($stats1hr['raw_biogas_samples']),
            'expected_samples' => 60,
            'data_quality' => intval($stats1hr['sample_count']) > 0 
                ? round((intval($stats1hr['raw_biogas_samples']) / intval($stats1hr['sample_count'])) * 100, 1) 
                : 0
        ],
        
        // 12-hour averages
        'avg_12hr' => [
            'raw_biogas_flow' => round(floatval($stats12hr['avg_raw_biogas_flow']), 2),
            'purified_gas_flow' => round(floatval($stats12hr['avg_purified_gas_flow']), 2),
            'product_gas_flow' => round(floatval($stats12hr['avg_product_gas_flow']), 2),
            'ch4_concentration' => round(floatval($stats12hr['avg_ch4']), 2),
            'co2_level' => round(floatval($stats12hr['avg_co2']), 2),
            'o2_concentration' => round(floatval($stats12hr['avg_o2']), 2),
            'h2s_content' => round(floatval($stats12hr['avg_h2s']), 2),
            'dew_point' => round(floatval($stats12hr['avg_dew_point']), 2),
            'sample_count' => intval($stats12hr['sample_count']),
            'valid_samples' => intval($stats12hr['raw_biogas_samples']),
            'expected_samples' => 720,
            'data_quality' => intval($stats12hr['sample_count']) > 0 
                ? round((intval($stats12hr['raw_biogas_samples']) / intval($stats12hr['sample_count'])) * 100, 1) 
                : 0
        ],
        
        // 24-hour totalizers
        'totalizer_24hr' => [
            'raw_biogas' => round(floatval($stats24hr['totalizer_raw_biogas']), 2),
            'purified_gas' => round(floatval($stats24hr['totalizer_purified_gas']), 2),
            'product_gas' => round(floatval($stats24hr['totalizer_product_gas']), 2),
            'feed_fm1' => round(floatval($stats24hr['totalizer_feed_fm1']), 2),
            'feed_fm2' => round(floatval($stats24hr['totalizer_feed_fm2']), 2),
            'fresh_water' => round(floatval($stats24hr['totalizer_fresh_water']), 2),
            'recycle_water' => round(floatval($stats24hr['totalizer_recycle_water']), 2),
            'sample_count' => intval($stats24hr['sample_count']),
            'valid_samples' => intval($stats24hr['raw_biogas_samples']),
            'expected_samples' => 1440,
            'data_quality' => intval($stats24hr['sample_count']) > 0 
                ? round((intval($stats24hr['raw_biogas_samples']) / intval($stats24hr['sample_count'])) * 100, 1) 
                : 0
        ],
        
        // Equipment Status - PSA, Compressor & LT Panel
        'equipment' => [
            // PSA Unit - Status from psa_status field (from SCADA)
            'psa' => [
                'status' => intval($latest['psa_status']) === 1 ? 'Running' : 'Stopped',
                'status_code' => intval($latest['psa_status']),
                'running_hours_today' => round(intval($psaToday['psa_running_minutes']) / 60, 2),
                'running_minutes_today' => intval($psaToday['psa_running_minutes']),
                'total_minutes_today' => intval($psaToday['total_minutes']),
                'running_hours_month' => round(intval($psaMonth['psa_running_minutes']) / 60, 2),
                'running_minutes_month' => intval($psaMonth['psa_running_minutes']),
                'efficiency' => floatval($latest['psa_efficiency']),
                'calculated_efficiency' => floatval($latest['raw_biogas_flow']) > 0 
                    ? round((floatval($latest['purified_gas_flow']) / floatval($latest['raw_biogas_flow'])) * 100, 2)
                    : 0
            ],
            // Compressor - Status from compressor_status field (from SCADA)
            'compressor' => [
                'status' => intval($latest['compressor_status']) === 1 ? 'Running' : 'Stopped',
                'status_code' => intval($latest['compressor_status']),
                'running_hours_today' => round(intval($psaToday['compressor_running_minutes']) / 60, 2),
                'running_minutes_today' => intval($psaToday['compressor_running_minutes']),
                'running_hours_month' => round(intval($psaMonth['compressor_running_minutes']) / 60, 2)
            ],
            // LT Panel - Consumption calculated from current load (lt_panel_power)
            'lt_panel' => [
                'status' => floatval($latest['lt_panel_power']) > 0 ? 'Active' : 'Inactive',
                'current_load_kw' => floatval($latest['lt_panel_power']),
                'avg_power_today_kw' => round(floatval($powerToday['avg_power_kw']), 2),
                'max_power_today_kw' => round(floatval($powerToday['max_power_kw']), 2),
                'min_power_today_kw' => round(floatval($powerToday['min_power_kw']), 2),
                'consumption_today_kwh' => round(floatval($powerToday['avg_power_kw']) * (intval($powerToday['total_minutes']) / 60), 2),
                'consumption_month_kwh' => round(floatval($powerMonth['avg_power_kw']) * (intval($powerMonth['total_minutes']) / 60), 2),
                'hours_recorded_today' => round(intval($powerToday['total_minutes']) / 60, 2),
                'hours_recorded_month' => round(intval($powerMonth['total_minutes']) / 60, 2)
            ]
        ],
        
        'execution_time_ms' => $executionTime
    ];
    
    sendResponse($response);
    
} catch (PDOException $e) {
    error_log("Dashboard query error: " . $e->getMessage());
    sendError('Failed to fetch data: ' . $e->getMessage(), 500);
}
?>
