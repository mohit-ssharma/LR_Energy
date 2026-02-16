<?php
require_once 'cors.php';  // CORS headers - MUST BE FIRST!

/**
 * Performance Comparison API Endpoint
 * URL: /api/comparison.php
 * Method: GET
 * 
 * Compares TODAY's CURRENT value vs YESTERDAY's AVERAGE
 * 
 * Query Parameters:
 * - period: today_vs_yesterday (default), this_week_vs_last, this_month_vs_last
 * 
 * Response includes:
 * - Today's current/latest reading vs Yesterday's average
 * - Percentage change with difference
 * - Status: Improved, Stable, Warning, Declined
 * 
 * For CO2, O2, H2S: Lower is better
 * - If (today_value - yesterday_avg) < 0 = IMPROVED
 * - If (today_value - yesterday_avg) > 0 = DECLINED/WARNING
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
            $previousStart = "DATE_SUB(DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), INTERVAL 7 DAY)";
            $previousEnd = "DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)";
            $periodLabel = "This Week vs Last Week (Avg)";
            break;
            
        case 'this_month_vs_last':
            $previousStart = "DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')";
            $previousEnd = "LAST_DAY(DATE_SUB(NOW(), INTERVAL 1 MONTH))";
            $periodLabel = "This Month vs Last Month (Avg)";
            break;
            
        case 'today_vs_yesterday':
        default:
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
    
    if (!$latest) {
        sendResponse([
            'status' => 'no_data',
            'message' => 'No current data available',
            'data' => null,
            'has_today_data' => false
        ]);
    }
    
    // Check if the latest reading is from today
    $latestDate = date('Y-m-d', strtotime($latest['timestamp']));
    $todayDate = date('Y-m-d');
    $hasTodayData = ($latestDate === $todayDate);
    
    // =====================================================
    // Query 2: Get TODAY's sample count
    // =====================================================
    $sqlTodayCount = "
        SELECT COUNT(*) as sample_count
        FROM scada_readings 
        WHERE plant_id = '" . PLANT_ID . "' 
        AND DATE(timestamp) = CURDATE()
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
    // For most parameters: (today - yesterday) / yesterday * 100
    // For CO2, O2, H2S: (yesterday - today) / yesterday * 100
    //   - Positive result = improvement (today is lower = good)
    //   - Negative result = decline (today is higher = bad)
    // =====================================================
    function calculateChange($currentValue, $previousAvg, $higherIsBetter = true) {
        $current = floatval($currentValue);
        $previous = floatval($previousAvg);
        
        if ($previous == 0) {
            return [
                'change' => $current,
                'change_percent' => 0,
                'status' => 'stable'
            ];
        }
        
        if ($higherIsBetter) {
            // Higher is better (e.g., CH4, gas flow)
            // Formula: (today - yesterday) / yesterday * 100
            // Positive = improved, Negative = declined
            $change = $current - $previous;
            $changePercent = round(($change / $previous) * 100, 1);
            
            $absPercent = abs($changePercent);
            if ($absPercent <= 2) {
                $status = 'stable';
            } elseif ($change > 0) {
                $status = 'improved';
            } else {
                $status = $absPercent > 10 ? 'declined' : 'warning';
            }
        } else {
            // Lower is better (CO2, O2, H2S)
            // Formula: (yesterday - today) / yesterday * 100
            // Positive = improved (today is lower), Negative = declined (today is higher)
            $change = $previous - $current;  // Reversed for CO2/O2/H2S
            $changePercent = round(($change / $previous) * 100, 1);
            
            $absPercent = abs($changePercent);
            if ($absPercent <= 2) {
                $status = 'stable';
            } elseif ($change > 0) {
                $status = 'improved';  // Positive means yesterday > today (decreased = good)
            } else {
                $status = $absPercent > 10 ? 'declined' : 'warning';  // Negative means today > yesterday (increased = bad)
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
            'current_expected' => 1440,
            'previous_expected' => 1440
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
