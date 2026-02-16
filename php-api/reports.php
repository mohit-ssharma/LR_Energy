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
    
    // Calculate totals from the daily data (sum of latest totalizer values)
    $totalRawBiogas = 0;
    $totalPurifiedGas = 0;
    $totalProductGas = 0;
    $totalRecords = 0;
    
    foreach ($dailyData as $row) {
        $totalRawBiogas += floatval($row['daily_raw_biogas']);
        $totalPurifiedGas += floatval($row['daily_purified_gas']);
        $totalProductGas += floatval($row['daily_product_gas']);
        $totalRecords += intval($row['sample_count']);
    }
    
    // Get basic statistics from all records in date range
    $sqlSummary = "
        SELECT 
            COUNT(*) as total_records,
            COUNT(DISTINCT DATE(timestamp)) as operating_days
        FROM scada_readings 
        WHERE plant_id = '" . PLANT_ID . "' 
        AND $dateCondition
    ";
    
    $stmtSummary = $pdo->query($sqlSummary);
    $summaryStats = $stmtSummary->fetch();
    
    // Build summary object with calculated totals
    $summary = [
        'total_records' => intval($summaryStats['total_records']),
        'operating_days' => intval($summaryStats['operating_days']),
        'total_raw_biogas' => round($totalRawBiogas, 2),
        'total_purified_gas' => round($totalPurifiedGas, 2),
        'total_product_gas' => round($totalProductGas, 2)
    ];
    
    // Calculate efficiency
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
        
        'summary' => [
            // Production Totals (Sum of daily latest totalizer values)
            'total_records' => $summary['total_records'],
            'operating_days' => $summary['operating_days'],
            'total_raw_biogas' => $summary['total_raw_biogas'],
            'total_purified_gas' => $summary['total_purified_gas'],
            'total_product_gas' => $summary['total_product_gas'],
            'overall_efficiency' => $efficiency
        ],
        
        // Daily breakdown data (using latest totalizer values per day)
        'daily_data' => array_map(function($day) {
            return [
                'date' => $day['date'],
                'sample_count' => intval($day['sample_count']),
                // Gas Production - Latest timestamp totalizer values
                'daily_raw_biogas' => round(floatval($day['daily_raw_biogas']), 2),
                'daily_purified_gas' => round(floatval($day['daily_purified_gas']), 2),
                'daily_product_gas' => round(floatval($day['daily_product_gas']), 2),
                // Flow values at latest timestamp
                'avg_raw_biogas_flow' => round(floatval($day['avg_raw_biogas_flow']), 2),
                'avg_purified_gas_flow' => round(floatval($day['avg_purified_gas_flow']), 2),
                'avg_product_gas_flow' => round(floatval($day['avg_product_gas_flow']), 2),
                // Gas composition at latest timestamp
                'avg_ch4' => round(floatval($day['avg_ch4']), 2),
                'avg_co2' => round(floatval($day['avg_co2']), 2),
                'avg_o2' => round(floatval($day['avg_o2']), 2),
                'avg_h2s' => round(floatval($day['avg_h2s']), 0),
                'avg_dew_point' => round(floatval($day['avg_dew_point']), 2),
                // Digester values at latest timestamp
                'avg_d1_temp' => round(floatval($day['avg_d1_temp']), 2),
                'avg_d2_temp' => round(floatval($day['avg_d2_temp']), 2),
                // Tank levels at latest timestamp
                'avg_buffer_tank' => round(floatval($day['avg_buffer_tank']), 1),
                'avg_lagoon_tank' => round(floatval($day['avg_lagoon_tank']), 1)
            ];
        }, $dailyData),
        
        'execution_time_ms' => $executionTime,
        'generated_at' => date('Y-m-d H:i:s')
    ];
    
    sendResponse($response);
    
} catch (PDOException $e) {
    error_log("Reports query error: " . $e->getMessage());
    sendError('Failed to generate report: ' . $e->getMessage(), 500);
}
?>
