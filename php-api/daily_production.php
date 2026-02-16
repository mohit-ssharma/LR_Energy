<?php
require_once 'cors.php';
require_once 'config.php';

/**
 * Daily Production API
 * Returns daily production values based on totalizer differences
 * Daily Production = Last Totalizer Value of Day - First Totalizer Value of Day
 * 
 * Query Parameters:
 * - days: Number of days to fetch (default: 30, max: 365)
 * - type: 'raw_biogas' or 'product_gas' (default: both)
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
    $type = isset($_GET['type']) ? $_GET['type'] : 'all';
    
    // Calculate date range
    $endDate = date('Y-m-d');
    $startDate = date('Y-m-d', strtotime("-{$days} days"));
    
    // Query to get daily production based on totalizer min/max per day
    $sql = "SELECT 
                DATE(timestamp) as date,
                MIN(raw_biogas_totalizer) as min_raw_totalizer,
                MAX(raw_biogas_totalizer) as max_raw_totalizer,
                (MAX(raw_biogas_totalizer) - MIN(raw_biogas_totalizer)) as raw_biogas_production,
                MIN(product_gas_totalizer) as min_product_totalizer,
                MAX(product_gas_totalizer) as max_product_totalizer,
                (MAX(product_gas_totalizer) - MIN(product_gas_totalizer)) as product_gas_production,
                MIN(purified_gas_totalizer) as min_purified_totalizer,
                MAX(purified_gas_totalizer) as max_purified_totalizer,
                (MAX(purified_gas_totalizer) - MIN(purified_gas_totalizer)) as purified_gas_production,
                COUNT(*) as sample_count,
                MIN(timestamp) as first_reading,
                MAX(timestamp) as last_reading
            FROM scada_readings
            WHERE DATE(timestamp) >= :start_date
            AND DATE(timestamp) <= :end_date
            GROUP BY DATE(timestamp)
            ORDER BY DATE(timestamp) DESC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':start_date' => $startDate,
        ':end_date' => $endDate
    ]);
    
    $dailyData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format the response
    $formattedData = [];
    $totalRawProduction = 0;
    $totalProductProduction = 0;
    $totalPurifiedProduction = 0;
    
    foreach ($dailyData as $row) {
        $rawProd = round(floatval($row['raw_biogas_production']), 2);
        $productProd = round(floatval($row['product_gas_production']), 2);
        $purifiedProd = round(floatval($row['purified_gas_production']), 2);
        
        $totalRawProduction += $rawProd;
        $totalProductProduction += $productProd;
        $totalPurifiedProduction += $purifiedProd;
        
        $formattedData[] = [
            'date' => $row['date'],
            'raw_biogas_production' => $rawProd,
            'product_gas_production' => $productProd,
            'purified_gas_production' => $purifiedProd,
            'sample_count' => intval($row['sample_count']),
            'first_reading' => $row['first_reading'],
            'last_reading' => $row['last_reading'],
            'min_raw_totalizer' => round(floatval($row['min_raw_totalizer']), 2),
            'max_raw_totalizer' => round(floatval($row['max_raw_totalizer']), 2),
            'min_product_totalizer' => round(floatval($row['min_product_totalizer']), 2),
            'max_product_totalizer' => round(floatval($row['max_product_totalizer']), 2)
        ];
    }
    
    // Get today's current production (might be partial day)
    $todayData = null;
    if (count($formattedData) > 0 && $formattedData[0]['date'] === $endDate) {
        $todayData = $formattedData[0];
    }
    
    // Calculate averages
    $daysWithData = count($formattedData);
    $avgRawProduction = $daysWithData > 0 ? round($totalRawProduction / $daysWithData, 2) : 0;
    $avgProductProduction = $daysWithData > 0 ? round($totalProductProduction / $daysWithData, 2) : 0;
    $avgPurifiedProduction = $daysWithData > 0 ? round($totalPurifiedProduction / $daysWithData, 2) : 0;
    
    echo json_encode([
        'status' => 'success',
        'data' => $formattedData,
        'today' => $todayData,
        'summary' => [
            'days_requested' => $days,
            'days_with_data' => $daysWithData,
            'date_range' => [
                'start' => $startDate,
                'end' => $endDate
            ],
            'total_raw_biogas_production' => round($totalRawProduction, 2),
            'total_product_gas_production' => round($totalProductProduction, 2),
            'total_purified_gas_production' => round($totalPurifiedProduction, 2),
            'avg_daily_raw_biogas' => $avgRawProduction,
            'avg_daily_product_gas' => $avgProductProduction,
            'avg_daily_purified_gas' => $avgPurifiedProduction
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
