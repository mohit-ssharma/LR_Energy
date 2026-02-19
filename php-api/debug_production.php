<?php
/**
 * Debug script to check daily production data
 * URL: http://localhost/scada-api/debug_production.php
 */

require_once 'cors.php';
require_once 'config.php';

header('Content-Type: text/html; charset=UTF-8');

echo "<h1>🔍 Debug Daily Production</h1>";
echo "<style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background: #f5f5f5; }
    .mono { font-family: monospace; }
    pre { background: #1e293b; color: #e2e8f0; padding: 15px; border-radius: 6px; overflow-x: auto; }
</style>";

try {
    $pdo = getDbConnection();
    
    // Step 1: Check all dates in database
    echo "<h2>Step 1: All Dates in Database</h2>";
    $stmt = $pdo->query("
        SELECT 
            DATE(timestamp) as date,
            COUNT(*) as records,
            MIN(timestamp) as first_ts,
            MAX(timestamp) as last_ts
        FROM scada_readings 
        WHERE plant_id = 'KARNAL'
        GROUP BY DATE(timestamp)
        ORDER BY date ASC
    ");
    $dates = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<table><tr><th>Date</th><th>Records</th><th>First Timestamp</th><th>Last Timestamp</th></tr>";
    $totalRecords = 0;
    foreach ($dates as $d) {
        $totalRecords += $d['records'];
        echo "<tr>
            <td class='mono'>{$d['date']}</td>
            <td class='mono'>{$d['records']}</td>
            <td class='mono'>{$d['first_ts']}</td>
            <td class='mono'>{$d['last_ts']}</td>
        </tr>";
    }
    echo "</table>";
    echo "<p><strong>Total Days: " . count($dates) . "</strong> | <strong>Total Records: {$totalRecords}</strong></p>";
    
    // Step 2: Check first and last totalizer for each day
    echo "<h2>Step 2: First & Last Totalizer Values</h2>";
    $sql = "SELECT 
                daily.date,
                daily.sample_count,
                daily.first_reading,
                daily.last_reading,
                first_rec.raw_biogas_totalizer as first_raw,
                first_rec.product_gas_totalizer as first_product,
                last_rec.raw_biogas_totalizer as last_raw,
                last_rec.product_gas_totalizer as last_product
            FROM (
                SELECT 
                    DATE(timestamp) as date,
                    COUNT(*) as sample_count,
                    MIN(timestamp) as first_reading,
                    MAX(timestamp) as last_reading
                FROM scada_readings
                WHERE plant_id = 'KARNAL'
                GROUP BY DATE(timestamp)
            ) daily
            LEFT JOIN scada_readings first_rec 
                ON first_rec.timestamp = daily.first_reading AND first_rec.plant_id = 'KARNAL'
            LEFT JOIN scada_readings last_rec 
                ON last_rec.timestamp = daily.last_reading AND last_rec.plant_id = 'KARNAL'
            ORDER BY daily.date ASC";
    
    $stmt = $pdo->query($sql);
    $totalizerData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<table><tr><th>Date</th><th>Records</th><th>First Raw</th><th>Last Raw</th><th>First Product</th><th>Last Product</th></tr>";
    foreach ($totalizerData as $d) {
        echo "<tr>
            <td class='mono'>{$d['date']}</td>
            <td class='mono'>{$d['sample_count']}</td>
            <td class='mono'>{$d['first_raw']}</td>
            <td class='mono'>{$d['last_raw']}</td>
            <td class='mono'>{$d['first_product']}</td>
            <td class='mono'>{$d['last_product']}</td>
        </tr>";
    }
    echo "</table>";
    
    // Step 3: Calculate expected production
    echo "<h2>Step 3: Expected Production (Manual Calculation)</h2>";
    echo "<table><tr><th>Date</th><th>Method</th><th>Reference</th><th>Raw Production</th><th>Product Production</th></tr>";
    
    $prevDay = null;
    foreach ($totalizerData as $d) {
        if ($prevDay === null) {
            // First day - same day calculation
            $rawProd = floatval($d['last_raw']) - floatval($d['first_raw']);
            $prodProd = floatval($d['last_product']) - floatval($d['first_product']);
            $method = "Same Day (Last - First)";
            $reference = "First: {$d['first_raw']}";
        } else {
            // Has previous day
            $rawProd = floatval($d['last_raw']) - floatval($prevDay['last_raw']);
            $prodProd = floatval($d['last_product']) - floatval($prevDay['last_product']);
            $method = "Prev Day";
            $reference = "Prev Last: {$prevDay['last_raw']}";
        }
        
        echo "<tr>
            <td class='mono'>{$d['date']}</td>
            <td>{$method}</td>
            <td class='mono'>{$reference}</td>
            <td class='mono'>" . number_format($rawProd, 2) . "</td>
            <td class='mono'>" . number_format($prodProd, 2) . "</td>
        </tr>";
        
        $prevDay = $d;
    }
    echo "</table>";
    
    // Step 4: Show API response
    echo "<h2>Step 4: Current API Response</h2>";
    echo "<p><a href='daily_production.php?days=30' target='_blank'>Open daily_production.php?days=30</a></p>";
    
    // Call the API internally
    $apiUrl = 'http://' . ($_SERVER['HTTP_HOST'] ?? 'localhost') . '/scada-api/daily_production.php?days=30';
    $response = @file_get_contents($apiUrl);
    if ($response) {
        $data = json_decode($response, true);
        echo "<p><strong>Days in API Response:</strong> " . count($data['data'] ?? []) . "</p>";
        echo "<pre>" . json_encode($data, JSON_PRETTY_PRINT) . "</pre>";
    } else {
        echo "<p style='color:red;'>Could not fetch API response. Check URL: {$apiUrl}</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color:red;'>Error: " . htmlspecialchars($e->getMessage()) . "</p>";
}
?>
