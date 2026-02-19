<?php
/**
 * Production Calculation Test Simulator
 * 
 * PURPOSE: Generate test data for multiple days (past + today) to test the
 *          "Total Production" calculation feature:
 *          Production = Current Day's Last Totalizer - Previous Day's Last Totalizer
 * 
 * USAGE:
 * 1. Browser: http://localhost/scada-api/production_test_simulator.php
 * 2. Add ?days=5 to generate more days (default: 3 past days + today)
 * 3. Add ?clear=1 to clear existing data first
 * 
 * TEST DATA GENERATED:
 * - Day -3: 3 readings, totalizer starts at 100,000
 * - Day -2: 4 readings, totalizer increases by ~500/day
 * - Day -1 (Yesterday): 5 readings
 * - Day 0 (Today): 2 readings (live)
 * 
 * EXPECTED OUTPUT:
 * - Yesterday's Production = Yesterday's Last Totalizer - Day -2's Last Totalizer
 * - Today's Production = Today's Current Totalizer - Yesterday's Last Totalizer
 */

require_once 'cors.php';
require_once 'config.php';

header('Content-Type: text/html; charset=UTF-8');

echo "<!DOCTYPE html>
<html>
<head>
    <title>Production Test Simulator</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; max-width: 1200px; margin: 0 auto; }
        .card { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .success { border-left: 4px solid #10b981; }
        .error { border-left: 4px solid #ef4444; }
        .info { border-left: 4px solid #3b82f6; }
        .warning { border-left: 4px solid #f59e0b; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        th { background: #f1f5f9; font-weight: 600; }
        tr:hover { background: #f8fafc; }
        .mono { font-family: monospace; }
        .text-right { text-align: right; }
        .text-emerald { color: #059669; }
        .text-cyan { color: #0891b2; }
        .btn { display: inline-block; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 5px; }
        .btn-primary { background: #10b981; color: white; }
        .btn-danger { background: #ef4444; color: white; }
        .btn-secondary { background: #6b7280; color: white; }
        pre { background: #1e293b; color: #e2e8f0; padding: 15px; border-radius: 6px; overflow-x: auto; font-size: 12px; }
        h1 { color: #1e293b; }
        h2 { color: #334155; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
        .highlight { background: #fef3c7; padding: 2px 6px; border-radius: 4px; }
        .formula { background: #dbeafe; padding: 10px 15px; border-radius: 6px; font-family: monospace; margin: 10px 0; }
    </style>
</head>
<body>
<h1>🧪 Production Calculation Test Simulator</h1>";

// Configuration
$days = isset($_GET['days']) ? max(2, min(10, intval($_GET['days']))) : 3;
$clearFirst = isset($_GET['clear']) && $_GET['clear'] == '1';

// Formula explanation
echo "<div class='card info'>
    <h2>📋 Test Purpose</h2>
    <p>This simulator generates test data to verify the <strong>Daily Production</strong> calculation:</p>
    <div class='formula'>
        <strong>Production = Current Day's Last Totalizer - Previous Day's Last Totalizer</strong>
    </div>
    <p><strong>Test Data:</strong> {$days} past days + Today (total " . ($days + 1) . " days)</p>
</div>";

// Action buttons
echo "<div class='card'>
    <h2>🎮 Actions</h2>
    <a href='?days={$days}' class='btn btn-primary'>🚀 Generate Test Data</a>
    <a href='?days={$days}&clear=1' class='btn btn-danger'>🗑️ Clear & Regenerate</a>
    <a href='daily_production.php?days=10' class='btn btn-secondary' target='_blank'>📊 View API Response</a>
</div>";

try {
    $pdo = getDbConnection();
    
    // Clear existing data if requested
    if ($clearFirst) {
        $stmt = $pdo->prepare("DELETE FROM scada_readings WHERE plant_id = 'KARNAL'");
        $stmt->execute();
        echo "<div class='card warning'>
            <h2>🗑️ Data Cleared</h2>
            <p>All existing KARNAL plant data has been deleted.</p>
        </div>";
    }
    
    // Define test data with predictable values
    $testData = [];
    $baseRawTotalizer = 100000.00;
    $baseProductTotalizer = 50000.00;
    $basePurifiedTotalizer = 75000.00;
    
    // Daily production amounts (for verification)
    $dailyRawProduction = 500.00;      // 500 Nm³ per day
    $dailyProductProduction = 400.00;  // 400 Kg per day
    $dailyPurifiedProduction = 450.00; // 450 Nm³ per day
    
    // Generate data for each day
    for ($dayOffset = -$days; $dayOffset <= 0; $dayOffset++) {
        $date = date('Y-m-d', strtotime("{$dayOffset} days"));
        $dayIndex = $dayOffset + $days; // 0, 1, 2, 3...
        
        // Number of readings varies per day (more realistic)
        $readingsCount = ($dayOffset == 0) ? 2 : rand(3, 5);
        
        // Calculate start totalizer for this day based on cumulative production
        $dayStartRaw = $baseRawTotalizer + ($dayIndex * $dailyRawProduction);
        $dayStartProduct = $baseProductTotalizer + ($dayIndex * $dailyProductProduction);
        $dayStartPurified = $basePurifiedTotalizer + ($dayIndex * $dailyPurifiedProduction);
        
        // Distribute production across readings
        $rawIncrement = $dailyRawProduction / $readingsCount;
        $productIncrement = $dailyProductProduction / $readingsCount;
        $purifiedIncrement = $dailyPurifiedProduction / $readingsCount;
        
        $dayReadings = [];
        for ($r = 0; $r < $readingsCount; $r++) {
            $hour = 8 + intval(($r / $readingsCount) * 12); // 08:00 to 20:00
            $minute = ($r % 2) * 30; // 00 or 30
            $timestamp = "{$date} " . sprintf("%02d:%02d:00", $hour, $minute);
            
            // Calculate cumulative totalizer values for this reading
            $rawTotalizer = round($dayStartRaw + ($r + 1) * $rawIncrement, 2);
            $productTotalizer = round($dayStartProduct + ($r + 1) * $productIncrement, 2);
            $purifiedTotalizer = round($dayStartPurified + ($r + 1) * $purifiedIncrement, 2);
            
            $dayReadings[] = [
                'timestamp' => $timestamp,
                'raw_biogas_totalizer' => $rawTotalizer,
                'product_gas_totalizer' => $productTotalizer,
                'purified_gas_totalizer' => $purifiedTotalizer,
                'raw_biogas_flow' => round(1200 + rand(-50, 50), 1),
                'purified_gas_flow' => round(1100 + rand(-50, 50), 1),
                'product_gas_flow' => round(1050 + rand(-50, 50), 1),
                'ch4_concentration' => round(96.5 + (rand(-10, 10) / 10), 2),
                'co2_level' => round(3.0 + (rand(-5, 5) / 10), 2),
                'o2_concentration' => round(0.3 + (rand(-1, 1) / 10), 2),
                'h2s_content' => rand(2, 5),
                'd1_temp_bottom' => round(37 + (rand(-10, 10) / 10), 1),
                'd2_temp_bottom' => round(36.5 + (rand(-10, 10) / 10), 1),
                'buffer_tank_level' => rand(60, 75),
                'lagoon_tank_level' => rand(55, 70)
            ];
        }
        
        $testData[$date] = [
            'readings' => $dayReadings,
            'expected_last_raw' => $rawTotalizer,
            'expected_last_product' => $productTotalizer
        ];
    }
    
    // Insert data into database
    $insertCount = 0;
    $insertSql = "INSERT INTO scada_readings (
        plant_id, timestamp,
        raw_biogas_flow, raw_biogas_totalizer,
        purified_gas_flow, purified_gas_totalizer,
        product_gas_flow, product_gas_totalizer,
        ch4_concentration, co2_level, o2_concentration, h2s_content,
        d1_temp_bottom, d2_temp_bottom,
        buffer_tank_level, lagoon_tank_level
    ) VALUES (
        'KARNAL', :timestamp,
        :raw_biogas_flow, :raw_biogas_totalizer,
        :purified_gas_flow, :purified_gas_totalizer,
        :product_gas_flow, :product_gas_totalizer,
        :ch4_concentration, :co2_level, :o2_concentration, :h2s_content,
        :d1_temp_bottom, :d2_temp_bottom,
        :buffer_tank_level, :lagoon_tank_level
    )";
    
    $stmt = $pdo->prepare($insertSql);
    
    foreach ($testData as $date => $data) {
        foreach ($data['readings'] as $reading) {
            $stmt->execute([
                ':timestamp' => $reading['timestamp'],
                ':raw_biogas_flow' => $reading['raw_biogas_flow'],
                ':raw_biogas_totalizer' => $reading['raw_biogas_totalizer'],
                ':purified_gas_flow' => $reading['purified_gas_flow'],
                ':purified_gas_totalizer' => $reading['purified_gas_totalizer'],
                ':product_gas_flow' => $reading['product_gas_flow'],
                ':product_gas_totalizer' => $reading['product_gas_totalizer'],
                ':ch4_concentration' => $reading['ch4_concentration'],
                ':co2_level' => $reading['co2_level'],
                ':o2_concentration' => $reading['o2_concentration'],
                ':h2s_content' => $reading['h2s_content'],
                ':d1_temp_bottom' => $reading['d1_temp_bottom'],
                ':d2_temp_bottom' => $reading['d2_temp_bottom'],
                ':buffer_tank_level' => $reading['buffer_tank_level'],
                ':lagoon_tank_level' => $reading['lagoon_tank_level']
            ]);
            $insertCount++;
        }
    }
    
    echo "<div class='card success'>
        <h2>✅ Test Data Generated</h2>
        <p><strong>Inserted:</strong> {$insertCount} records across " . count($testData) . " days</p>
    </div>";
    
    // Display the generated data
    echo "<div class='card'>
        <h2>📊 Generated Test Data (Last Totalizer per Day)</h2>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Readings</th>
                    <th class='text-right'>Last Raw Totalizer (Nm³)</th>
                    <th class='text-right'>Last Product Totalizer (Kg)</th>
                </tr>
            </thead>
            <tbody>";
    
    foreach ($testData as $date => $data) {
        $isToday = ($date == date('Y-m-d')) ? " <span class='highlight'>TODAY</span>" : "";
        echo "<tr>
            <td class='mono'>{$date}{$isToday}</td>
            <td>" . count($data['readings']) . "</td>
            <td class='mono text-right text-emerald'>" . number_format($data['expected_last_raw'], 2) . "</td>
            <td class='mono text-right text-cyan'>" . number_format($data['expected_last_product'], 2) . "</td>
        </tr>";
    }
    echo "</tbody></table></div>";
    
    // Expected production calculations
    echo "<div class='card info'>
        <h2>🧮 Expected Production Values</h2>
        <p>Based on the test data, here are the <strong>expected</strong> production values:</p>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Formula</th>
                    <th class='text-right'>Expected Raw Production</th>
                    <th class='text-right'>Expected Product Production</th>
                </tr>
            </thead>
            <tbody>";
    
    $dates = array_keys($testData);
    for ($i = 1; $i < count($dates); $i++) {
        $currentDate = $dates[$i];
        $prevDate = $dates[$i - 1];
        $currentData = $testData[$currentDate];
        $prevData = $testData[$prevDate];
        
        $expectedRaw = $currentData['expected_last_raw'] - $prevData['expected_last_raw'];
        $expectedProduct = $currentData['expected_last_product'] - $prevData['expected_last_product'];
        
        $isToday = ($currentDate == date('Y-m-d')) ? " <span class='highlight'>TODAY</span>" : "";
        
        echo "<tr>
            <td class='mono'>{$currentDate}{$isToday}</td>
            <td class='mono' style='font-size: 11px;'>" . number_format($currentData['expected_last_raw'], 2) . " - " . number_format($prevData['expected_last_raw'], 2) . "</td>
            <td class='mono text-right text-emerald'><strong>" . number_format($expectedRaw, 2) . " Nm³</strong></td>
            <td class='mono text-right text-cyan'><strong>" . number_format($expectedProduct, 2) . " Kg</strong></td>
        </tr>";
    }
    echo "</tbody></table>
        <p style='margin-top: 15px; color: #64748b;'>
            <strong>Note:</strong> Each day should show approximately <strong>500 Nm³</strong> Raw Biogas and <strong>400 Kg</strong> Product Gas production.
        </p>
    </div>";
    
    // Verification steps
    echo "<div class='card warning'>
        <h2>🔍 How to Verify</h2>
        <ol style='line-height: 2;'>
            <li>Open the <strong>Trends Page</strong> in the application</li>
            <li>Scroll down to the <strong>\"Daily Production (Based on Totalizer)\"</strong> section</li>
            <li>Check <strong>Today's Production</strong> cards - should show calculated values</li>
            <li>Check the <strong>Daily Production Summary Table</strong> - each row should show ~500 Nm³ / ~400 Kg</li>
            <li>The <strong>Reference Date</strong> info should show yesterday's date and totalizer value</li>
        </ol>
    </div>";
    
    // Test both user roles
    echo "<div class='card'>
        <h2>👤 Test Both User Roles</h2>
        <table>
            <tr>
                <th>Role</th>
                <th>Email</th>
                <th>Password</th>
                <th>What to Check</th>
            </tr>
            <tr>
                <td><strong>HEAD_OFFICE</strong></td>
                <td class='mono'>ho@lrenergy.in</td>
                <td class='mono'>qwerty@1234</td>
                <td>Full Trends page with all categories + Parameter Statistics</td>
            </tr>
            <tr>
                <td><strong>MNRE</strong></td>
                <td class='mono'>mnre@lrenergy.in</td>
                <td class='mono'>mnre@mnre</td>
                <td>Simplified Trends page (Gas Flow only, no Parameter Statistics)</td>
            </tr>
        </table>
    </div>";
    
    // Quick API test
    echo "<div class='card'>
        <h2>🔗 Quick API Test</h2>
        <p>Click to view raw API response:</p>
        <a href='daily_production.php?days=10' class='btn btn-primary' target='_blank'>📊 daily_production.php</a>
        <p style='margin-top: 15px; color: #64748b;'>
            The API response should include:
            <ul>
                <li><code>today</code> object with <code>raw_biogas_production</code> and <code>product_gas_production</code></li>
                <li><code>data</code> array with daily production for each day</li>
                <li><code>calculation_method</code>: \"Current Day Last Totalizer - Previous Day Last Totalizer\"</li>
            </ul>
        </p>
    </div>";
    
} catch (PDOException $e) {
    echo "<div class='card error'>
        <h2>❌ Database Error</h2>
        <pre>" . htmlspecialchars($e->getMessage()) . "</pre>
    </div>";
} catch (Exception $e) {
    echo "<div class='card error'>
        <h2>❌ Error</h2>
        <pre>" . htmlspecialchars($e->getMessage()) . "</pre>
    </div>";
}

echo "</body></html>";
?>
