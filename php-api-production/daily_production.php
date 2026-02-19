<?php
require_once 'cors.php';
require_once 'config.php';

/**
 * Daily Production API
 * 
 * Calculates ACTUAL PRODUCTION based on totalizer differences:
 * - Primary: Current Day Last Totalizer - Previous Day Last Totalizer
 * - Fallback (no previous day): Current Day Last Totalizer - Current Day First Totalizer
 * 
 * This ensures ALL days with data show production values (record count matches).
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
    
    // Calculate date range
    $endDate = date('Y-m-d');
    $startDate = date('Y-m-d', strtotime("-{$days} days"));
    
    // Query to get BOTH first AND last totalizer values for each day
    $sql = "SELECT 
                daily.date,
                daily.sample_count,
                daily.first_reading,
                daily.last_reading,
                first_rec.raw_biogas_totalizer as first_raw_totalizer,
                first_rec.product_gas_totalizer as first_product_totalizer,
                first_rec.purified_gas_totalizer as first_purified_totalizer,
                last_rec.raw_biogas_totalizer as last_raw_totalizer,
                last_rec.product_gas_totalizer as last_product_totalizer,
                last_rec.purified_gas_totalizer as last_purified_totalizer
            FROM (
                SELECT 
                    DATE(timestamp) as date,
                    COUNT(*) as sample_count,
                    MIN(timestamp) as first_reading,
                    MAX(timestamp) as last_reading
                FROM scada_readings
                WHERE plant_id = 'KARNAL'
                AND DATE(timestamp) >= :start_date
                AND DATE(timestamp) <= :end_date
                GROUP BY DATE(timestamp)
            ) daily
            LEFT JOIN scada_readings first_rec 
                ON first_rec.timestamp = daily.first_reading AND first_rec.plant_id = 'KARNAL'
            LEFT JOIN scada_readings last_rec 
                ON last_rec.timestamp = daily.last_reading AND last_rec.plant_id = 'KARNAL'
            ORDER BY daily.date ASC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':start_date' => $startDate,
        ':end_date' => $endDate
    ]);
    
    $rawData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Calculate production for each day
    $dailyData = [];
    $prevDayData = null;
    
    foreach ($rawData as $row) {
        $currentDate = $row['date'];
        
        // Get current day's FIRST totalizer values
        $firstRaw = isset($row['first_raw_totalizer']) && $row['first_raw_totalizer'] !== '' 
            ? floatval($row['first_raw_totalizer']) : null;
        $firstProduct = isset($row['first_product_totalizer']) && $row['first_product_totalizer'] !== '' 
            ? floatval($row['first_product_totalizer']) : null;
        $firstPurified = isset($row['first_purified_totalizer']) && $row['first_purified_totalizer'] !== '' 
            ? floatval($row['first_purified_totalizer']) : null;
        
        // Get current day's LAST totalizer values
        $lastRaw = isset($row['last_raw_totalizer']) && $row['last_raw_totalizer'] !== '' 
            ? floatval($row['last_raw_totalizer']) : null;
        $lastProduct = isset($row['last_product_totalizer']) && $row['last_product_totalizer'] !== '' 
            ? floatval($row['last_product_totalizer']) : null;
        $lastPurified = isset($row['last_purified_totalizer']) && $row['last_purified_totalizer'] !== '' 
            ? floatval($row['last_purified_totalizer']) : null;
        
        // Calculate production
        $rawProduction = null;
        $productProduction = null;
        $purifiedProduction = null;
        $calculationMethod = null;
        $referenceDate = null;
        $referenceRaw = null;
        $referenceProduct = null;
        
        if ($prevDayData !== null) {
            // PRIMARY: Previous day exists - use Previous Day's Last Totalizer
            $referenceDate = $prevDayData['date'];
            $referenceRaw = $prevDayData['raw'];
            $referenceProduct = $prevDayData['product'];
            $calculationMethod = 'previous_day';
            
            if ($lastRaw !== null && $prevDayData['raw'] !== null) {
                $rawProduction = round($lastRaw - $prevDayData['raw'], 2);
                if ($rawProduction < 0) $rawProduction = null; // Handle totalizer reset
            }
            
            if ($lastProduct !== null && $prevDayData['product'] !== null) {
                $productProduction = round($lastProduct - $prevDayData['product'], 2);
                if ($productProduction < 0) $productProduction = null;
            }
            
            if ($lastPurified !== null && $prevDayData['purified'] !== null) {
                $purifiedProduction = round($lastPurified - $prevDayData['purified'], 2);
                if ($purifiedProduction < 0) $purifiedProduction = null;
            }
        } else {
            // FALLBACK: No previous day - use Same Day's (Last - First)
            $referenceDate = $currentDate; // Same day reference
            $referenceRaw = $firstRaw;
            $referenceProduct = $firstProduct;
            $calculationMethod = 'same_day';
            
            if ($lastRaw !== null && $firstRaw !== null) {
                $rawProduction = round($lastRaw - $firstRaw, 2);
                if ($rawProduction < 0) $rawProduction = 0; // Same day shouldn't be negative
            }
            
            if ($lastProduct !== null && $firstProduct !== null) {
                $productProduction = round($lastProduct - $firstProduct, 2);
                if ($productProduction < 0) $productProduction = 0;
            }
            
            if ($lastPurified !== null && $firstPurified !== null) {
                $purifiedProduction = round($lastPurified - $firstPurified, 2);
                if ($purifiedProduction < 0) $purifiedProduction = 0;
            }
        }
        
        // Add to daily data - ALL days with data are included
        $dailyData[] = [
            'date' => $currentDate,
            'prev_date' => $referenceDate,
            'calculation_method' => $calculationMethod,
            'first_raw_totalizer' => $firstRaw,
            'first_product_totalizer' => $firstProduct,
            'prev_raw_totalizer' => $referenceRaw,
            'prev_product_totalizer' => $referenceProduct,
            'current_raw_totalizer' => $lastRaw,
            'current_product_totalizer' => $lastProduct,
            'raw_biogas_production' => $rawProduction,
            'product_gas_production' => $productProduction,
            'purified_gas_production' => $purifiedProduction,
            'sample_count' => intval($row['sample_count']),
            'first_reading' => $row['first_reading'],
            'last_reading' => $row['last_reading']
        ];
        
        // Store current day as previous for next iteration
        $prevDayData = [
            'date' => $currentDate,
            'raw' => $lastRaw,
            'product' => $lastProduct,
            'purified' => $lastPurified
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
            'calculation_method' => $dailyData[0]['calculation_method'],
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
    
    // Calculate totals
    $totalRawProduction = 0;
    $totalProductProduction = 0;
    $totalSampleCount = 0;
    $daysWithData = count($dailyData);
    
    foreach ($dailyData as $day) {
        if ($day['raw_biogas_production'] !== null) {
            $totalRawProduction += $day['raw_biogas_production'];
        }
        if ($day['product_gas_production'] !== null) {
            $totalProductProduction += $day['product_gas_production'];
        }
        $totalSampleCount += $day['sample_count'];
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
            'total_records' => $totalSampleCount,
            'date_range' => [
                'start' => $startDate,
                'end' => $endDate
            ],
            'total_raw_biogas_production' => round($totalRawProduction, 2),
            'total_product_gas_production' => round($totalProductProduction, 2),
            'avg_daily_raw_biogas' => $avgRawProduction,
            'avg_daily_product_gas' => $avgProductProduction
        ],
        'calculation_method' => [
            'primary' => 'Current Day Last Totalizer - Previous Day Last Totalizer',
            'fallback' => 'Current Day Last Totalizer - Current Day First Totalizer (when no previous day)'
        ],
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
