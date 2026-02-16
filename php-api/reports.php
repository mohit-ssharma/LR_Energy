<?php
require_once 'cors.php';  // CORS headers - MUST BE FIRST!

/**
 * Reports API Endpoint
 * URL: /api/reports.php
 * Method: GET
 * 
 * Returns aggregated data for report generation based on user-selected date range
 * 
 * Query Parameters:
 * - start_date: Start date (YYYY-MM-DD format, required)
 * - end_date: End date (YYYY-MM-DD format, required)
 * - report_type: production, quality, performance, compliance, custom (default: production)
 * - parameters: comma-separated list of parameters for custom reports
 * 
 * Example: /api/reports.php?start_date=2026-01-01&end_date=2026-01-31&report_type=production
 */

require_once 'config.php';

$startTime = microtime(true);

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Method not allowed. Use GET.', 405);
}

// Get and validate query parameters
$startDate = isset($_GET['start_date']) ? $_GET['start_date'] : null;
$endDate = isset($_GET['end_date']) ? $_GET['end_date'] : null;
$reportType = isset($_GET['report_type']) ? $_GET['report_type'] : 'production';

// Validate required parameters
if (!$startDate || !$endDate) {
    sendError('start_date and end_date are required (YYYY-MM-DD format)', 400);
}

// Validate date format
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $startDate) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $endDate)) {
    sendError('Invalid date format. Use YYYY-MM-DD', 400);
}

// Connect to database
$pdo = getDBConnection();
if (!$pdo) {
    sendError('Database connection failed', 500);
}

try {
    // Calculate expected records (1 per minute)
    $start = new DateTime($startDate);
    $end = new DateTime($endDate);
    $end->modify('+1 day'); // Include end date fully
    $daysDiff = $start->diff($end)->days;
    $expectedRecords = $daysDiff * 1440; // 1440 minutes per day
    
    // Base query for the date range (midnight-to-midnight for each day)
    $dateCondition = "DATE(timestamp) >= '$startDate' AND DATE(timestamp) <= '$endDate'";
    
    // Get daily data with LATEST totalizer values (not differences)
    // First get the latest timestamp per day
    $sqlDaily = "
        SELECT 
            r.date,
            r.sample_count,
            r.raw_biogas_totalizer as daily_raw_biogas,
            r.purified_gas_totalizer as daily_purified_gas,
            r.product_gas_totalizer as daily_product_gas,
            r.raw_biogas_flow as avg_raw_biogas_flow,
            r.purified_gas_flow as avg_purified_gas_flow,
            r.product_gas_flow as avg_product_gas_flow,
            r.ch4_concentration as avg_ch4,
            r.co2_level as avg_co2,
            r.o2_concentration as avg_o2,
            r.h2s_content as avg_h2s,
            r.dew_point as avg_dew_point,
            r.d1_temp_bottom as avg_d1_temp,
            r.d1_gas_pressure as avg_d1_pressure,
            r.d1_slurry_height as avg_d1_slurry,
            r.d1_gas_level as avg_d1_gas_level,
            r.d2_temp_bottom as avg_d2_temp,
            r.d2_gas_pressure as avg_d2_pressure,
            r.d2_slurry_height as avg_d2_slurry,
            r.d2_gas_level as avg_d2_gas_level,
            r.buffer_tank_level as avg_buffer_tank,
            r.lagoon_tank_level as avg_lagoon_tank,
            r.psa_efficiency as avg_psa_efficiency,
            r.lt_panel_power as avg_lt_power,
            0 as psa_running_minutes,
            0 as compressor_running_minutes,
            0 as daily_feed_fm1,
            0 as daily_feed_fm2,
            0 as daily_fresh_water,
            0 as daily_recycle_water
        FROM (
            SELECT 
                DATE(s.timestamp) as date,
                s.raw_biogas_totalizer,
                s.purified_gas_totalizer,
                s.product_gas_totalizer,
                s.raw_biogas_flow,
                s.purified_gas_flow,
                s.product_gas_flow,
                s.ch4_concentration,
                s.co2_level,
                s.o2_concentration,
                s.h2s_content,
                s.dew_point,
                s.d1_temp_bottom,
                s.d1_gas_pressure,
                s.d1_slurry_height,
                s.d1_gas_level,
                s.d2_temp_bottom,
                s.d2_gas_pressure,
                s.d2_slurry_height,
                s.d2_gas_level,
                s.buffer_tank_level,
                s.lagoon_tank_level,
                s.psa_efficiency,
                s.lt_panel_power,
                t.sample_count
            FROM scada_readings s
            INNER JOIN (
                SELECT DATE(timestamp) as dt, MAX(timestamp) as max_ts, COUNT(*) as sample_count
                FROM scada_readings
                WHERE plant_id = '" . PLANT_ID . "' AND $dateCondition
                GROUP BY DATE(timestamp)
            ) t ON DATE(s.timestamp) = t.dt AND s.timestamp = t.max_ts
        ) r
        ORDER BY r.date ASC
    ";
    
    $stmtDaily = $pdo->query($sqlDaily);
    $dailyData = $stmtDaily->fetchAll();
    
    // Get period totals and averages
    $sqlSummary = "
        SELECT 
            COUNT(*) as total_records,
            COUNT(DISTINCT DATE(timestamp)) as operating_days,
            
            -- Total Production (Period)
            COALESCE(MAX(raw_biogas_totalizer) - MIN(raw_biogas_totalizer), 0) as total_raw_biogas,
            COALESCE(MAX(purified_gas_totalizer) - MIN(purified_gas_totalizer), 0) as total_purified_gas,
            COALESCE(MAX(product_gas_totalizer) - MIN(product_gas_totalizer), 0) as total_product_gas,
            
            -- Average Flows
            COALESCE(AVG(raw_biogas_flow), 0) as avg_raw_biogas_flow,
            COALESCE(AVG(purified_gas_flow), 0) as avg_purified_gas_flow,
            COALESCE(AVG(product_gas_flow), 0) as avg_product_gas_flow,
            
            -- Gas Composition Statistics
            COALESCE(AVG(ch4_concentration), 0) as avg_ch4,
            COALESCE(MIN(ch4_concentration), 0) as min_ch4,
            COALESCE(MAX(ch4_concentration), 0) as max_ch4,
            
            COALESCE(AVG(co2_level), 0) as avg_co2,
            COALESCE(MIN(co2_level), 0) as min_co2,
            COALESCE(MAX(co2_level), 0) as max_co2,
            
            COALESCE(AVG(o2_concentration), 0) as avg_o2,
            COALESCE(MIN(o2_concentration), 0) as min_o2,
            COALESCE(MAX(o2_concentration), 0) as max_o2,
            
            COALESCE(AVG(h2s_content), 0) as avg_h2s,
            COALESCE(MIN(h2s_content), 0) as min_h2s,
            COALESCE(MAX(h2s_content), 0) as max_h2s,
            
            COALESCE(AVG(dew_point), 0) as avg_dew_point,
            COALESCE(MIN(dew_point), 0) as min_dew_point,
            COALESCE(MAX(dew_point), 0) as max_dew_point,
            
            -- Equipment Running Hours
            SUM(CASE WHEN psa_status = 1 THEN 1 ELSE 0 END) as total_psa_minutes,
            SUM(CASE WHEN compressor_status = 1 THEN 1 ELSE 0 END) as total_compressor_minutes,
            
            -- Average Equipment Values
            COALESCE(AVG(psa_efficiency), 0) as avg_psa_efficiency,
            COALESCE(AVG(lt_panel_power), 0) as avg_lt_power,
            
            -- Total Water Flow
            COALESCE(MAX(feed_fm1_totalizer) - MIN(feed_fm1_totalizer), 0) as total_feed_fm1,
            COALESCE(MAX(feed_fm2_totalizer) - MIN(feed_fm2_totalizer), 0) as total_feed_fm2,
            COALESCE(MAX(fresh_water_totalizer) - MIN(fresh_water_totalizer), 0) as total_fresh_water,
            COALESCE(MAX(recycle_water_totalizer) - MIN(recycle_water_totalizer), 0) as total_recycle_water
            
        FROM scada_readings 
        WHERE plant_id = '" . PLANT_ID . "' 
        AND $dateCondition
    ";
    
    $stmtSummary = $pdo->query($sqlSummary);
    $summary = $stmtSummary->fetch();
    
    // Calculate efficiency
    $totalRawBiogas = floatval($summary['total_raw_biogas']);
    $totalPurifiedGas = floatval($summary['total_purified_gas']);
    $efficiency = $totalRawBiogas > 0 ? round(($totalPurifiedGas / $totalRawBiogas) * 100, 2) : 0;
    
    $executionTime = round((microtime(true) - $startTime) * 1000);
    
    // Build response
    $response = [
        'status' => 'success',
        'report_type' => $reportType,
        'period' => [
            'start_date' => $startDate,
            'end_date' => $endDate,
            'days' => $daysDiff,
            'label' => date('M d, Y', strtotime($startDate)) . ' - ' . date('M d, Y', strtotime($endDate))
        ],
        
        'data_quality' => [
            'total_records' => intval($summary['total_records']),
            'expected_records' => $expectedRecords,
            'coverage_percent' => $expectedRecords > 0 ? round((intval($summary['total_records']) / $expectedRecords) * 100, 1) : 0,
            'operating_days' => intval($summary['operating_days']),
            'missing_records' => $expectedRecords - intval($summary['total_records'])
        ],
        
        'summary' => [
            // Production Totals
            'total_raw_biogas' => round(floatval($summary['total_raw_biogas']), 2),
            'total_purified_gas' => round(floatval($summary['total_purified_gas']), 2),
            'total_product_gas' => round(floatval($summary['total_product_gas']), 2),
            
            // Average Flows
            'avg_raw_biogas_flow' => round(floatval($summary['avg_raw_biogas_flow']), 2),
            'avg_purified_gas_flow' => round(floatval($summary['avg_purified_gas_flow']), 2),
            'avg_product_gas_flow' => round(floatval($summary['avg_product_gas_flow']), 2),
            
            // Efficiency
            'overall_efficiency' => $efficiency,
            'avg_psa_efficiency' => round(floatval($summary['avg_psa_efficiency']), 2),
            
            // Gas Composition
            'ch4' => [
                'avg' => round(floatval($summary['avg_ch4']), 2),
                'min' => round(floatval($summary['min_ch4']), 2),
                'max' => round(floatval($summary['max_ch4']), 2)
            ],
            'co2' => [
                'avg' => round(floatval($summary['avg_co2']), 2),
                'min' => round(floatval($summary['min_co2']), 2),
                'max' => round(floatval($summary['max_co2']), 2)
            ],
            'h2s' => [
                'avg' => round(floatval($summary['avg_h2s']), 0),
                'min' => round(floatval($summary['min_h2s']), 0),
                'max' => round(floatval($summary['max_h2s']), 0)
            ],
            'dew_point' => [
                'avg' => round(floatval($summary['avg_dew_point']), 2),
                'min' => round(floatval($summary['min_dew_point']), 2),
                'max' => round(floatval($summary['max_dew_point']), 2)
            ],
            
            // Equipment Running Hours
            'psa_running_hours' => round(intval($summary['total_psa_minutes']) / 60, 2),
            'compressor_running_hours' => round(intval($summary['total_compressor_minutes']) / 60, 2),
            'avg_lt_power_kw' => round(floatval($summary['avg_lt_power']), 2),
            
            // Water Consumption
            'total_feed_water' => round(floatval($summary['total_feed_fm1']) + floatval($summary['total_feed_fm2']), 2),
            'total_fresh_water' => round(floatval($summary['total_fresh_water']), 2),
            'total_recycle_water' => round(floatval($summary['total_recycle_water']), 2)
        ],
        
        // Daily breakdown data
        'daily_data' => array_map(function($day) {
            return [
                'date' => $day['date'],
                'sample_count' => intval($day['sample_count']),
                'expected_samples' => 1440,
                'coverage_percent' => round((intval($day['sample_count']) / 1440) * 100, 1),
                
                // Daily Production (from totalizer difference)
                'raw_biogas' => round(floatval($day['daily_raw_biogas']), 2),
                'purified_gas' => round(floatval($day['daily_purified_gas']), 2),
                'product_gas' => round(floatval($day['daily_product_gas']), 2),
                
                // Daily Averages (flow rates)
                'avg_raw_biogas_flow' => round(floatval($day['avg_raw_biogas_flow']), 2),
                'avg_purified_gas_flow' => round(floatval($day['avg_purified_gas_flow']), 2),
                'avg_product_gas_flow' => round(floatval($day['avg_product_gas_flow']), 2),
                
                // Gas Composition
                'avg_ch4' => round(floatval($day['avg_ch4']), 2),
                'avg_co2' => round(floatval($day['avg_co2']), 2),
                'avg_o2' => round(floatval($day['avg_o2']), 2),
                'avg_h2s' => round(floatval($day['avg_h2s']), 0),
                'avg_dew_point' => round(floatval($day['avg_dew_point']), 2),
                'min_ch4' => round(floatval($day['min_ch4']), 2),
                'max_ch4' => round(floatval($day['max_ch4']), 2),
                'min_h2s' => round(floatval($day['min_h2s']), 0),
                'max_h2s' => round(floatval($day['max_h2s']), 0),
                
                // Digester 1
                'avg_d1_temp' => round(floatval($day['avg_d1_temp']), 1),
                'avg_d1_pressure' => round(floatval($day['avg_d1_pressure']), 2),
                'avg_d1_slurry' => round(floatval($day['avg_d1_slurry']), 2),
                'avg_d1_gas_level' => round(floatval($day['avg_d1_gas_level']), 1),
                
                // Digester 2
                'avg_d2_temp' => round(floatval($day['avg_d2_temp']), 1),
                'avg_d2_pressure' => round(floatval($day['avg_d2_pressure']), 2),
                'avg_d2_slurry' => round(floatval($day['avg_d2_slurry']), 2),
                'avg_d2_gas_level' => round(floatval($day['avg_d2_gas_level']), 1),
                
                // Tank Levels
                'avg_buffer_tank' => round(floatval($day['avg_buffer_tank']), 1),
                'avg_lagoon_tank' => round(floatval($day['avg_lagoon_tank']), 1),
                
                // Equipment
                'psa_hours' => round(intval($day['psa_running_minutes']) / 60, 2),
                'compressor_hours' => round(intval($day['compressor_running_minutes']) / 60, 2),
                'avg_psa_efficiency' => round(floatval($day['avg_psa_efficiency']), 2),
                'avg_lt_power' => round(floatval($day['avg_lt_power']), 2),
                
                // Water
                'feed_water' => round(floatval($day['daily_feed_fm1']) + floatval($day['daily_feed_fm2']), 2),
                'fresh_water' => round(floatval($day['daily_fresh_water']), 2),
                'recycle_water' => round(floatval($day['daily_recycle_water']), 2)
            ];
        }, $dailyData),
        
        'generated_at' => date('Y-m-d H:i:s'),
        'execution_time_ms' => $executionTime
    ];
    
    sendResponse($response);
    
} catch (PDOException $e) {
    error_log("Reports query error: " . $e->getMessage());
    sendError('Failed to generate report: ' . $e->getMessage(), 500);
}
?>
