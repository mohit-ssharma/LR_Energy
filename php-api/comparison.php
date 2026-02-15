<?php
require_once 'cors.php';  // CORS headers - MUST BE FIRST!

/**
 * Performance Comparison API Endpoint
 * URL: /api/comparison.php
 * Method: GET
 * 
 * Compares performance between two time periods
 * 
 * Query Parameters:
 * - period: today_vs_yesterday (default), this_week_vs_last, this_month_vs_last
 * 
 * Response includes:
 * - Today's averages vs Yesterday's averages
 * - Percentage change
 * - Status (Improved, Stable, Warning, Declined)
 */

require_once 'config.php';

$startTime = microtime(true);

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Method not allowed. Use GET.', 405);
}

// Get comparison period
$period = isset($_GET['period']) ? $_GET['period'] : 'today_vs_yesterday';

$pdo = getDBConnection();
if (!$pdo) {
    sendError('Database connection failed', 500);
}

try {
    // Define date ranges based on period
    switch ($period) {
        case 'this_week_vs_last':
            $currentStart = "DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)";
            $currentEnd = "NOW()";
            $previousStart = "DATE_SUB(DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), INTERVAL 7 DAY)";
            $previousEnd = "DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)";
            $periodLabel = "This Week vs Last Week";
            break;
            
        case 'this_month_vs_last':
            $currentStart = "DATE_FORMAT(NOW(), '%Y-%m-01')";
            $currentEnd = "NOW()";
            $previousStart = "DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')";
            $previousEnd = "LAST_DAY(DATE_SUB(NOW(), INTERVAL 1 MONTH))";
            $periodLabel = "This Month vs Last Month";
            break;
            
        case 'today_vs_yesterday':
        default:
            $currentStart = "CURDATE()";
            $currentEnd = "NOW()";
            $previousStart = "DATE_SUB(CURDATE(), INTERVAL 1 DAY)";
            $previousEnd = "CURDATE()";
            $periodLabel = "Today (Current) vs Yesterday (Avg)";
            break;
    }
    
    // =====================================================
    // Query 1: Get TODAY's LATEST/CURRENT reading
    // =====================================================
    $sqlLatest = "
        SELECT * FROM scada_readings 
        WHERE plant_id = '" . PLANT_ID . "' 
        ORDER BY timestamp DESC 
        LIMIT 1
    ";
    $stmtLatest = $pdo->query($sqlLatest);
    $latest = $stmtLatest->fetch();
    
    // =====================================================
    // Query 2: Get TODAY's sample count
    // =====================================================
    $sqlTodayCount = "
        SELECT COUNT(*) as sample_count
        FROM scada_readings 
        WHERE plant_id = '" . PLANT_ID . "' 
        AND timestamp >= $currentStart 
        AND timestamp < $currentEnd
    ";
    $stmtTodayCount = $pdo->query($sqlTodayCount);
    $todayCount = $stmtTodayCount->fetch();
    
    // =====================================================
    // Query 3: Get YESTERDAY's AVERAGES
    // =====================================================
    $sqlYesterdayAvg = "
        SELECT 
            COUNT(*) as sample_count,
            
            -- Gas Production (Averages)
            COALESCE(AVG(raw_biogas_flow), 0) as avg_raw_biogas_flow,
            COALESCE(AVG(purified_gas_flow), 0) as avg_purified_gas_flow,
            COALESCE(AVG(product_gas_flow), 0) as avg_product_gas_flow,
            
            -- Gas Composition
            COALESCE(AVG(ch4_concentration), 0) as avg_ch4,
            COALESCE(AVG(co2_level), 0) as avg_co2,
            COALESCE(AVG(o2_concentration), 0) as avg_o2,
            COALESCE(AVG(h2s_content), 0) as avg_h2s,
            COALESCE(AVG(dew_point), 0) as avg_dew_point,
            
            -- Equipment & Storage
            COALESCE(AVG(buffer_tank_level), 0) as avg_buffer_tank,
            COALESCE(AVG(lagoon_tank_level), 0) as avg_lagoon_tank,
            COALESCE(AVG(psa_efficiency), 0) as avg_psa_efficiency,
            COALESCE(AVG(lt_panel_power), 0) as avg_lt_power
            
        FROM scada_readings 
        WHERE plant_id = '" . PLANT_ID . "' 
        AND timestamp >= $previousStart 
        AND timestamp < $previousEnd
    ";
    $stmtYesterdayAvg = $pdo->query($sqlYesterdayAvg);
    $yesterdayAvg = $stmtYesterdayAvg->fetch();
    
    // =====================================================
    // Helper function to calculate change and status
    // For CO2, O2, H2S: lower is better (higherIsBetter = false)
    // If (today - yesterday) < 0, it's IMPROVED
    // =====================================================
    function calculateChange($currentValue, $previousAvg, $higherIsBetter = true) {
        $current = floatval($currentValue);
        $previous = floatval($previousAvg);
        
        if ($previous == 0) {
            return [
                'change' => $current,
                'change_percent' => $current > 0 ? 100 : 0,
                'status' => 'stable'
            ];
        }
        
        $change = $current - $previous;
        $changePercent = round(($change / $previous) * 100, 1);
        
        // Determine status based on change direction
        $absPercent = abs($changePercent);
        
        if ($absPercent <= 2) {
            $status = 'stable';
        } elseif ($higherIsBetter) {
            // Higher is better (e.g., CH4, gas flow)
            // Positive change = improved, Negative change = declined
            if ($change > 0) {
                $status = 'improved';
            } else {
                $status = $absPercent > 10 ? 'declined' : 'warning';
            }
        } else {
            // Lower is better (CO2, O2, H2S)
            // Negative change (today < yesterday) = improved
            // Positive change (today > yesterday) = declined
            if ($change < 0) {
                $status = 'improved';
            } else {
                $status = $absPercent > 10 ? 'declined' : 'warning';
            }
        }
        
        return [
            'change' => round($change, 2),
            'change_percent' => $changePercent,
            'status' => $status
        ];
    }
    
    // Build comparison metrics: TODAY's CURRENT vs YESTERDAY's AVERAGE
    $metrics = [];
    
    // Gas Production - Compare current reading vs yesterday average (Higher is better)
    $metrics['raw_biogas_flow'] = [
        'label' => 'Raw Biogas Flow',
        'unit' => 'Nm³/hr',
        'category' => 'gas_production',
        'current' => round(floatval($latest['raw_biogas_flow']), 1),
        'previous' => round(floatval($yesterdayAvg['avg_raw_biogas_flow']), 1),
        ...calculateChange($latest['raw_biogas_flow'], $yesterdayAvg['avg_raw_biogas_flow'], true)
    ];
    
    $metrics['purified_gas_flow'] = [
        'label' => 'Purified Gas Flow',
        'unit' => 'Nm³/hr',
        'category' => 'gas_production',
        'current' => round(floatval($latest['purified_gas_flow']), 1),
        'previous' => round(floatval($yesterdayAvg['avg_purified_gas_flow']), 1),
        ...calculateChange($latest['purified_gas_flow'], $yesterdayAvg['avg_purified_gas_flow'], true)
    ];
    
    $metrics['product_gas_flow'] = [
        'label' => 'Product Gas Flow',
        'unit' => 'Nm³/hr',
        'category' => 'gas_production',
        'current' => round(floatval($latest['product_gas_flow']), 1),
        'previous' => round(floatval($yesterdayAvg['avg_product_gas_flow']), 1),
        ...calculateChange($latest['product_gas_flow'], $yesterdayAvg['avg_product_gas_flow'], true)
    ];
    
    // Gas Composition
    // CH4: Higher is better
    $metrics['ch4'] = [
        'label' => 'CH₄',
        'unit' => '%',
        'category' => 'gas_composition',
        'current' => round(floatval($latest['ch4_concentration']), 1),
        'previous' => round(floatval($yesterdayAvg['avg_ch4']), 1),
        ...calculateChange($latest['ch4_concentration'], $yesterdayAvg['avg_ch4'], true)
    ];
    
    // CO2: Lower is better - if (today - yesterday) < 0, improved
    $metrics['co2'] = [
        'label' => 'CO₂',
        'unit' => '%',
        'category' => 'gas_composition',
        'current' => round(floatval($latest['co2_level']), 1),
        'previous' => round(floatval($yesterdayAvg['avg_co2']), 1),
        ...calculateChange($latest['co2_level'], $yesterdayAvg['avg_co2'], false)
    ];
    
    // O2: Lower is better - if (today - yesterday) < 0, improved
    $metrics['o2'] = [
        'label' => 'O₂',
        'unit' => '%',
        'category' => 'gas_composition',
        'current' => round(floatval($latest['o2_concentration']), 2),
        'previous' => round(floatval($yesterdayAvg['avg_o2']), 2),
        ...calculateChange($latest['o2_concentration'], $yesterdayAvg['avg_o2'], false)
    ];
    
    // H2S: Lower is better - if (today - yesterday) < 0, improved
    $metrics['h2s'] = [
        'label' => 'H₂S',
        'unit' => 'ppm',
        'category' => 'gas_composition',
        'current' => round(floatval($latest['h2s_content']), 0),
        'previous' => round(floatval($yesterdayAvg['avg_h2s']), 0),
        ...calculateChange($latest['h2s_content'], $yesterdayAvg['avg_h2s'], false)
    ];
    
    // Equipment & Storage
    $metrics['buffer_tank'] = [
        'label' => 'Buffer Tank',
        'unit' => '%',
        'category' => 'equipment',
        'current' => round(floatval($latest['buffer_tank_level']), 0),
        'previous' => round(floatval($yesterdayAvg['avg_buffer_tank']), 0),
        ...calculateChange($latest['buffer_tank_level'], $yesterdayAvg['avg_buffer_tank'], true)
    ];
    
    $metrics['lagoon_tank'] = [
        'label' => 'Lagoon Tank',
        'unit' => '%',
        'category' => 'equipment',
        'current' => round(floatval($latest['lagoon_tank_level']), 0),
        'previous' => round(floatval($yesterdayAvg['avg_lagoon_tank']), 0),
        ...calculateChange($latest['lagoon_tank_level'], $yesterdayAvg['avg_lagoon_tank'], true)
    ];
    
    $metrics['psa_efficiency'] = [
        'label' => 'PSA Efficiency',
        'unit' => '%',
        'category' => 'equipment',
        'current' => round(floatval($latest['psa_efficiency']), 1),
        'previous' => round(floatval($yesterdayAvg['avg_psa_efficiency']), 1),
        ...calculateChange($latest['psa_efficiency'], $yesterdayAvg['avg_psa_efficiency'], true)
    ];
    
    $metrics['lt_power'] = [
        'label' => 'LT Panel Power',
        'unit' => 'kW',
        'category' => 'equipment',
        'current' => round(floatval($latest['lt_panel_power']), 0),
        'previous' => round(floatval($yesterdayAvg['avg_lt_power']), 0),
        ...calculateChange($latest['lt_panel_power'], $yesterdayAvg['avg_lt_power'], true)
    ];
    
    // Count statuses
    $statusCounts = [
        'improved' => 0,
        'stable' => 0,
        'warning' => 0,
        'declined' => 0
    ];
    
    foreach ($metrics as $metric) {
        $statusCounts[$metric['status']]++;
    }
    
    $executionTime = round((microtime(true) - $startTime) * 1000);
    
    // Build response
    $response = [
        'status' => 'success',
        'period' => $period,
        'period_label' => $periodLabel,
        'generated_at' => date('Y-m-d H:i:s'),
        'comparison_note' => 'Today = Current/Latest reading, Yesterday = Average of all readings',
        
        'summary' => $statusCounts,
        
        'data_quality' => [
            'current_samples' => intval($todayCount['sample_count']),
            'previous_samples' => intval($yesterdayAvg['sample_count']),
            'current_expected' => $period === 'today_vs_yesterday' ? 1440 : null,
            'previous_expected' => $period === 'today_vs_yesterday' ? 1440 : null
        ],
        
        'metrics' => $metrics,
        
        'execution_time_ms' => $executionTime
    ];
    
    sendResponse($response);
            COALESCE(AVG(ch4_concentration), 0) as avg_ch4,
            COALESCE(AVG(co2_level), 0) as avg_co2,
            COALESCE(AVG(o2_concentration), 0) as avg_o2,
            COALESCE(AVG(h2s_content), 0) as avg_h2s,
            COALESCE(AVG(dew_point), 0) as avg_dew_point,
            
            -- Digester 1
            COALESCE(AVG(d1_temp_bottom), 0) as avg_d1_temp_bottom,
            COALESCE(AVG(d1_temp_top), 0) as avg_d1_temp_top,
            COALESCE(AVG(d1_gas_pressure), 0) as avg_d1_gas_pressure,
            COALESCE(AVG(d1_slurry_height), 0) as avg_d1_slurry_height,
            COALESCE(AVG(d1_gas_level), 0) as avg_d1_gas_level,
            
            -- Digester 2
            COALESCE(AVG(d2_temp_bottom), 0) as avg_d2_temp_bottom,
            COALESCE(AVG(d2_temp_top), 0) as avg_d2_temp_top,
            COALESCE(AVG(d2_gas_pressure), 0) as avg_d2_gas_pressure,
            COALESCE(AVG(d2_slurry_height), 0) as avg_d2_slurry_height,
            COALESCE(AVG(d2_gas_level), 0) as avg_d2_gas_level,
            
            -- Equipment & Storage
            COALESCE(AVG(buffer_tank_level), 0) as avg_buffer_tank,
            COALESCE(AVG(lagoon_tank_level), 0) as avg_lagoon_tank,
            COALESCE(AVG(psa_efficiency), 0) as avg_psa_efficiency,
            COALESCE(AVG(lt_panel_power), 0) as avg_lt_power,
            
            -- PSA Running (count minutes where compressor is ON)
            SUM(CASE WHEN compressor_status = 1 THEN 1 ELSE 0 END) as psa_running_minutes,
            
            -- Water Flow
            COALESCE(AVG(feed_fm1_flow), 0) as avg_feed_fm1,
            COALESCE(AVG(feed_fm2_flow), 0) as avg_feed_fm2,
            COALESCE(AVG(fresh_water_flow), 0) as avg_fresh_water,
            COALESCE(AVG(recycle_water_flow), 0) as avg_recycle_water
            
        FROM scada_readings 
        WHERE plant_id = '" . PLANT_ID . "' 
        AND timestamp >= $currentStart 
        AND timestamp < $currentEnd
    ";
    
    // Query for previous period (Yesterday)
    $sqlPrevious = "
        SELECT 
            COUNT(*) as sample_count,
            
            -- Gas Production (Averages)
            COALESCE(AVG(raw_biogas_flow), 0) as avg_raw_biogas_flow,
            COALESCE(AVG(purified_gas_flow), 0) as avg_purified_gas_flow,
            COALESCE(AVG(product_gas_flow), 0) as avg_product_gas_flow,
            
            -- Gas Production (Totals)
            COALESCE(MAX(raw_biogas_totalizer) - MIN(raw_biogas_totalizer), 0) as total_raw_biogas,
            COALESCE(MAX(purified_gas_totalizer) - MIN(purified_gas_totalizer), 0) as total_purified_gas,
            COALESCE(MAX(product_gas_totalizer) - MIN(product_gas_totalizer), 0) as total_product_gas,
            
            -- Gas Composition
            COALESCE(AVG(ch4_concentration), 0) as avg_ch4,
            COALESCE(AVG(co2_level), 0) as avg_co2,
            COALESCE(AVG(o2_concentration), 0) as avg_o2,
            COALESCE(AVG(h2s_content), 0) as avg_h2s,
            COALESCE(AVG(dew_point), 0) as avg_dew_point,
            
            -- Digester 1
            COALESCE(AVG(d1_temp_bottom), 0) as avg_d1_temp_bottom,
            COALESCE(AVG(d1_temp_top), 0) as avg_d1_temp_top,
            COALESCE(AVG(d1_gas_pressure), 0) as avg_d1_gas_pressure,
            COALESCE(AVG(d1_slurry_height), 0) as avg_d1_slurry_height,
            COALESCE(AVG(d1_gas_level), 0) as avg_d1_gas_level,
            
            -- Digester 2
            COALESCE(AVG(d2_temp_bottom), 0) as avg_d2_temp_bottom,
            COALESCE(AVG(d2_temp_top), 0) as avg_d2_temp_top,
            COALESCE(AVG(d2_gas_pressure), 0) as avg_d2_gas_pressure,
            COALESCE(AVG(d2_slurry_height), 0) as avg_d2_slurry_height,
            COALESCE(AVG(d2_gas_level), 0) as avg_d2_gas_level,
            
            -- Equipment & Storage
            COALESCE(AVG(buffer_tank_level), 0) as avg_buffer_tank,
            COALESCE(AVG(lagoon_tank_level), 0) as avg_lagoon_tank,
            COALESCE(AVG(psa_efficiency), 0) as avg_psa_efficiency,
            COALESCE(AVG(lt_panel_power), 0) as avg_lt_power,
            
            -- PSA Running
            SUM(CASE WHEN compressor_status = 1 THEN 1 ELSE 0 END) as psa_running_minutes,
            
            -- Water Flow
            COALESCE(AVG(feed_fm1_flow), 0) as avg_feed_fm1,
            COALESCE(AVG(feed_fm2_flow), 0) as avg_feed_fm2,
            COALESCE(AVG(fresh_water_flow), 0) as avg_fresh_water,
            COALESCE(AVG(recycle_water_flow), 0) as avg_recycle_water
            
        FROM scada_readings 
        WHERE plant_id = '" . PLANT_ID . "' 
        AND timestamp >= $previousStart 
        AND timestamp < $previousEnd
    ";
    
    $stmtCurrent = $pdo->query($sqlCurrent);
    $current = $stmtCurrent->fetch();
    
    $stmtPrevious = $pdo->query($sqlPrevious);
    $previous = $stmtPrevious->fetch();
    
    // Helper function to calculate change and status
    function calculateChange($current, $previous, $higherIsBetter = true) {
        $current = floatval($current);
        $previous = floatval($previous);
        
        if ($previous == 0) {
            return [
                'change' => $current,
                'change_percent' => $current > 0 ? 100 : 0,
                'status' => $current > 0 ? 'improved' : 'stable'
            ];
        }
        
        $change = $current - $previous;
        $changePercent = round(($change / $previous) * 100, 1);
        
        // Determine status
        $absPercent = abs($changePercent);
        
        if ($absPercent <= 2) {
            $status = 'stable';
        } elseif ($higherIsBetter) {
            $status = $change > 0 ? 'improved' : ($absPercent > 10 ? 'declined' : 'warning');
        } else {
            // Lower is better (e.g., H2S, CO2)
            $status = $change < 0 ? 'improved' : ($absPercent > 10 ? 'declined' : 'warning');
        }
        
        return [
            'change' => round($change, 2),
            'change_percent' => $changePercent,
            'status' => $status
        ];
    }
    
    // Build comparison metrics
    $metrics = [];
    
    // Gas Production (Higher is better)
    $metrics['raw_biogas_flow'] = [
        'label' => 'Raw Biogas Flow',
        'unit' => 'Nm³/hr',
        'category' => 'gas_production',
        'current' => round(floatval($current['avg_raw_biogas_flow']), 1),
        'previous' => round(floatval($previous['avg_raw_biogas_flow']), 1),
        ...calculateChange($current['avg_raw_biogas_flow'], $previous['avg_raw_biogas_flow'], true)
    ];
    
    $metrics['purified_gas_flow'] = [
        'label' => 'Purified Gas Flow',
        'unit' => 'Nm³/hr',
        'category' => 'gas_production',
        'current' => round(floatval($current['avg_purified_gas_flow']), 1),
        'previous' => round(floatval($previous['avg_purified_gas_flow']), 1),
        ...calculateChange($current['avg_purified_gas_flow'], $previous['avg_purified_gas_flow'], true)
    ];
    
    $metrics['product_gas_flow'] = [
        'label' => 'Product Gas Flow',
        'unit' => 'Nm³/hr',
        'category' => 'gas_production',
        'current' => round(floatval($current['avg_product_gas_flow']), 1),
        'previous' => round(floatval($previous['avg_product_gas_flow']), 1),
        ...calculateChange($current['avg_product_gas_flow'], $previous['avg_product_gas_flow'], true)
    ];
    
    // Gas Composition
    $metrics['ch4'] = [
        'label' => 'CH₄',
        'unit' => '%',
        'category' => 'gas_composition',
        'current' => round(floatval($current['avg_ch4']), 1),
        'previous' => round(floatval($previous['avg_ch4']), 1),
        ...calculateChange($current['avg_ch4'], $previous['avg_ch4'], true)  // Higher CH4 is better
    ];
    
    $metrics['co2'] = [
        'label' => 'CO₂',
        'unit' => '%',
        'category' => 'gas_composition',
        'current' => round(floatval($current['avg_co2']), 1),
        'previous' => round(floatval($previous['avg_co2']), 1),
        ...calculateChange($current['avg_co2'], $previous['avg_co2'], false)  // Lower CO2 is better
    ];
    
    $metrics['o2'] = [
        'label' => 'O₂',
        'unit' => '%',
        'category' => 'gas_composition',
        'current' => round(floatval($current['avg_o2']), 2),
        'previous' => round(floatval($previous['avg_o2']), 2),
        ...calculateChange($current['avg_o2'], $previous['avg_o2'], false)  // Lower O2 is better
    ];
    
    $metrics['h2s'] = [
        'label' => 'H₂S',
        'unit' => 'ppm',
        'category' => 'gas_composition',
        'current' => round(floatval($current['avg_h2s']), 0),
        'previous' => round(floatval($previous['avg_h2s']), 0),
        ...calculateChange($current['avg_h2s'], $previous['avg_h2s'], false)  // Lower H2S is better
    ];
    
    // Equipment & Storage
    $metrics['buffer_tank'] = [
        'label' => 'Buffer Tank',
        'unit' => '%',
        'category' => 'equipment',
        'current' => round(floatval($current['avg_buffer_tank']), 0),
        'previous' => round(floatval($previous['avg_buffer_tank']), 0),
        ...calculateChange($current['avg_buffer_tank'], $previous['avg_buffer_tank'], true)
    ];
    
    $metrics['lagoon_tank'] = [
        'label' => 'Lagoon Tank',
        'unit' => '%',
        'category' => 'equipment',
        'current' => round(floatval($current['avg_lagoon_tank']), 0),
        'previous' => round(floatval($previous['avg_lagoon_tank']), 0),
        ...calculateChange($current['avg_lagoon_tank'], $previous['avg_lagoon_tank'], true)
    ];
    
    $metrics['psa_efficiency'] = [
        'label' => 'PSA Efficiency',
        'unit' => '%',
        'category' => 'equipment',
        'current' => round(floatval($current['avg_psa_efficiency']), 1),
        'previous' => round(floatval($previous['avg_psa_efficiency']), 1),
        ...calculateChange($current['avg_psa_efficiency'], $previous['avg_psa_efficiency'], true)
    ];
    
    $metrics['lt_power'] = [
        'label' => 'LT Panel Power',
        'unit' => 'kW',
        'category' => 'equipment',
        'current' => round(floatval($current['avg_lt_power']), 0),
        'previous' => round(floatval($previous['avg_lt_power']), 0),
        ...calculateChange($current['avg_lt_power'], $previous['avg_lt_power'], true)
    ];
    
    // Count statuses
    $statusCounts = [
        'improved' => 0,
        'stable' => 0,
        'warning' => 0,
        'declined' => 0
    ];
    
    foreach ($metrics as $metric) {
        $statusCounts[$metric['status']]++;
    }
    
    $executionTime = round((microtime(true) - $startTime) * 1000);
    
    // Build response
    $response = [
        'status' => 'success',
        'period' => $period,
        'period_label' => $periodLabel,
        'generated_at' => date('Y-m-d H:i:s'),
        
        'summary' => $statusCounts,
        
        'data_quality' => [
            'current_samples' => intval($current['sample_count']),
            'previous_samples' => intval($previous['sample_count']),
            'current_expected' => $period === 'today_vs_yesterday' ? 1440 : null,
            'previous_expected' => $period === 'today_vs_yesterday' ? 1440 : null
        ],
        
        'metrics' => $metrics,
        
        'execution_time_ms' => $executionTime
    ];
    
    sendResponse($response);
    
} catch (PDOException $e) {
    error_log("Comparison query error: " . $e->getMessage());
    sendError('Failed to fetch comparison data: ' . $e->getMessage(), 500);
}
?>
