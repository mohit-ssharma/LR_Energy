<?php
require_once 'cors.php';
require_once 'config.php';

/**
 * Daily Production API
 * 
 * Calculates ACTUAL PRODUCTION based on totalizer differences:
 * - Today's Production = Current Totalizer - Yesterday's Last Totalizer
 * - Past Day Production = That Day's Last Totalizer - Previous Day's Last Totalizer
 * 
 * Query Parameters:
 * - days: Number of days to fetch (default: 30, max: 365)
 */

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

try {
    $pdo = getDbConnection();
    
    // Get parameters
    $days = isset($_GET['days']) ? min(365, max(1, intval($_GET['days']))) : 30;
    
    // Calculate date range (add 1 extra day for previous day reference)
    $endDate = date('Y-m-d');
    $startDate = date('Y-m-d', strtotime("-" . ($days + 1) . " days"));
    
    // Query to get the LATEST totalizer values for each day
    $sql = "SELECT 
                r.date,
                r.raw_biogas_totalizer,
                r.product_gas_totalizer,
                r.purified_gas_totalizer,
                r.sample_count,
                r.last_reading
            FROM (
                SELECT 
                    DATE(s.timestamp) as date,
                    s.raw_biogas_totalizer,
                    s.product_gas_totalizer,
                    s.purified_gas_totalizer,
                    s.timestamp as last_reading,
                    t.sample_count
                FROM scada_readings s
                INNER JOIN (
                    SELECT DATE(timestamp) as dt, MAX(timestamp) as max_ts, COUNT(*) as sample_count
                    FROM scada_readings
                    WHERE plant_id = 'KARNAL'
                    AND DATE(timestamp) >= :start_date
                    AND DATE(timestamp) <= :end_date
                    GROUP BY DATE(timestamp)
                ) t ON DATE(s.timestamp) = t.dt AND s.timestamp = t.max_ts
                WHERE s.plant_id = 'KARNAL'
            ) r
            ORDER BY r.date ASC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':start_date' => $startDate,
        ':end_date' => $endDate
    ]);
    
    $rawData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Calculate production for each day
    $dailyData = [];
    $prevDayData = null;
    
    foreach ($rawData as $index => $row) {
        $currentDate = $row['date'];
        
        // Get current day's last totalizer values (handle null/empty)
        $currentRaw = isset($row['raw_biogas_totalizer']) && $row['raw_biogas_totalizer'] !== '' 
            ? floatval($row['raw_biogas_totalizer']) : null;
        $currentProduct = isset($row['product_gas_totalizer']) && $row['product_gas_totalizer'] !== '' 
            ? floatval($row['product_gas_totalizer']) : null;
        $currentPurified = isset($row['purified_gas_totalizer']) && $row['purified_gas_totalizer'] !== '' 
            ? floatval($row['purified_gas_totalizer']) : null;
        
        // Calculate production (Current - Previous Day's Last)
        $rawProduction = null;
        $productProduction = null;
        $purifiedProduction = null;
        
        if ($prevDayData !== null) {
            // Previous day exists - calculate production
            if ($currentRaw !== null && $prevDayData['raw'] !== null) {
                $rawProduction = round($currentRaw - $prevDayData['raw'], 2);
                // Handle negative (totalizer reset) - set to null or 0
                if ($rawProduction < 0) $rawProduction = null;
            }
            
            if ($currentProduct !== null && $prevDayData['product'] !== null) {
                $productProduction = round($currentProduct - $prevDayData['product'], 2);
                if ($productProduction < 0) $productProduction = null;
            }
            
            if ($currentPurified !== null && $prevDayData['purified'] !== null) {
                $purifiedProduction = round($currentPurified - $prevDayData['purified'], 2);
                if ($purifiedProduction < 0) $purifiedProduction = null;
            }
            
            // Add to daily data (skip the first extra day we fetched for reference)
            $dailyData[] = [
                'date' => $currentDate,
                'prev_date' => $prevDayData['date'],
                'prev_raw_totalizer' => $prevDayData['raw'],
                'prev_product_totalizer' => $prevDayData['product'],
                'current_raw_totalizer' => $currentRaw,
                'current_product_totalizer' => $currentProduct,
                'raw_biogas_production' => $rawProduction,
                'product_gas_production' => $productProduction,
                'purified_gas_production' => $purifiedProduction,
                'sample_count' => intval($row['sample_count']),
                'last_reading' => $row['last_reading']
            ];
        }
        
        // Store current day as previous for next iteration
        $prevDayData = [
            'date' => $currentDate,
            'raw' => $currentRaw,
            'product' => $currentProduct,
            'purified' => $currentPurified
        ];
    }
    
    // Reverse to get newest first
    $dailyData = array_reverse($dailyData);
    
    // Get today's data
    $todayData = null;
    $today = date('Y-m-d');
    
    if (count($dailyData) > 0 && $dailyData[0]['date'] === $today) {
        $todayData = [
            'date' => $dailyData[0]['date'],
            'reference_date' => $dailyData[0]['prev_date'],
            'reference_raw_biogas' => $dailyData[0]['prev_raw_totalizer'],
            'reference_product_gas' => $dailyData[0]['prev_product_totalizer'],
            'current_raw_biogas' => $dailyData[0]['current_raw_totalizer'],
            'current_product_gas' => $dailyData[0]['current_product_totalizer'],
            'raw_biogas_production' => $dailyData[0]['raw_biogas_production'],
            'product_gas_production' => $dailyData[0]['product_gas_production'],
            'sample_count' => $dailyData[0]['sample_count'],
            'last_reading' => $dailyData[0]['last_reading'],
            'is_live' => true
        ];
    }
    
    // Calculate totals (only for days with valid production data)
    $totalRawProduction = 0;
    $totalProductProduction = 0;
    $daysWithData = 0;
    
    foreach ($dailyData as $day) {
        if ($day['raw_biogas_production'] !== null) {
            $totalRawProduction += $day['raw_biogas_production'];
        }
        if ($day['product_gas_production'] !== null) {
            $totalProductProduction += $day['product_gas_production'];
        }
        if ($day['raw_biogas_production'] !== null || $day['product_gas_production'] !== null) {
            $daysWithData++;
        }
    }
    
    // Calculate averages
    $avgRawProduction = $daysWithData > 0 ? round($totalRawProduction / $daysWithData, 2) : 0;
    $avgProductProduction = $daysWithData > 0 ? round($totalProductProduction / $daysWithData, 2) : 0;
    
    echo json_encode([
        'status' => 'success',
        'data' => $dailyData,
        'today' => $todayData,
        'summary' => [
            'days_requested' => $days,
            'days_with_data' => $daysWithData,
            'date_range' => [
                'start' => date('Y-m-d', strtotime("-{$days} days")),
                'end' => $endDate
            ],
            'total_raw_biogas_production' => round($totalRawProduction, 2),
            'total_product_gas_production' => round($totalProductProduction, 2),
            'avg_daily_raw_biogas' => $avgRawProduction,
            'avg_daily_product_gas' => $avgProductProduction
        ],
        'calculation_method' => 'Current Day Last Totalizer - Previous Day Last Totalizer',
        'generated_at' => date('Y-m-d H:i:s')
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>
