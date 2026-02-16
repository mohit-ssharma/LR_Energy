<?php
require_once 'cors.php';
require_once 'config.php';

/**
 * Daily Production API
 * Returns LATEST TIMESTAMP TOTALIZER VALUES for each day
 * NOT the difference between max and min - just the latest totalizer value
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
    
    // Query to get the LATEST totalizer values for each day
    // Uses a subquery to find the latest timestamp per day, then joins to get the totalizer values
    $sql = "SELECT 
                s.date,
                s.raw_biogas_totalizer as raw_biogas_production,
                s.product_gas_totalizer as product_gas_production,
                s.purified_gas_totalizer as purified_gas_production,
                s.sample_count,
                s.last_reading
            FROM (
                SELECT 
                    DATE(timestamp) as date,
                    raw_biogas_totalizer,
                    product_gas_totalizer,
                    purified_gas_totalizer,
                    timestamp as last_reading,
                    COUNT(*) OVER (PARTITION BY DATE(timestamp)) as sample_count,
                    ROW_NUMBER() OVER (PARTITION BY DATE(timestamp) ORDER BY timestamp DESC) as rn
                FROM scada_readings
                WHERE DATE(timestamp) >= :start_date
                AND DATE(timestamp) <= :end_date
            ) s
            WHERE s.rn = 1
            ORDER BY s.date DESC";
    
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
            'last_reading' => $row['last_reading']
        ];
    }
    
    // Get today's data (latest totalizer values for today)
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
