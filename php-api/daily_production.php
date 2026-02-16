<?php
require_once 'cors.php';
require_once 'config.php';

/**
 * Daily Production API
 * Returns LATEST TIMESTAMP TOTALIZER VALUES for each day
 * Shows the totalizer value from the latest reading of each day
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
    // This uses a subquery to find the max timestamp per day, then joins to get values
    // Compatible with MySQL 5.7+ and MySQL 8+
    $sql = "SELECT 
                r.date,
                r.raw_biogas_totalizer as raw_biogas_production,
                r.product_gas_totalizer as product_gas_production,
                r.purified_gas_totalizer as purified_gas_production,
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
                    WHERE DATE(timestamp) >= :start_date1
                    AND DATE(timestamp) <= :end_date1
                    GROUP BY DATE(timestamp)
                ) t ON DATE(s.timestamp) = t.dt AND s.timestamp = t.max_ts
            ) r
            ORDER BY r.date DESC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':start_date1' => $startDate,
        ':end_date1' => $endDate
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
