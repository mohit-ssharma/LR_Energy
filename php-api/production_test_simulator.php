<?php
/**
 * Production Calculation Test Simulator
 * 
 * PURPOSE: Generate test data for multiple days (past + today) to test the
 *          "Total Production" calculation feature.
 * 
 * CALCULATION LOGIC:
 * - Primary: Production = Current Day Last Totalizer - Previous Day Last Totalizer
 * - Fallback: Production = Current Day Last Totalizer - Current Day First Totalizer (when no prev day)
 * 
 * USAGE:
 * 1. Browser: http://localhost/scada-api/production_test_simulator.php
 * 2. Add ?days=5 to generate more days (default: 3 past days + today)
 * 3. Add ?clear=1 to clear existing data first
 * 
 * IMPORTANT: Number of days with data = Number of production rows (NO MISMATCH)
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
        .text-orange { color: #ea580c; }
        .btn { display: inline-block; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 5px; }
        .btn-primary { background: #10b981; color: white; }
        .btn-danger { background: #ef4444; color: white; }
        .btn-secondary { background: #6b7280; color: white; }
        pre { background: #1e293b; color: #e2e8f0; padding: 15px; border-radius: 6px; overflow-x: auto; font-size: 12px; }
        h1 { color: #1e293b; }
        h2 { color: #334155; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
        .highlight { background: #fef3c7; padding: 2px 6px; border-radius: 4px; }
        .highlight-green { background: #d1fae5; padding: 2px 6px; border-radius: 4px; }
        .formula { background: #dbeafe; padding: 10px 15px; border-radius: 6px; font-family: monospace; margin: 10px 0; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; }
        .badge-primary { background: #dbeafe; color: #1e40af; }
        .badge-fallback { background: #fef3c7; color: #92400e; }
    </style>
</head>
<body>
<h1>🧪 Production Calculation Test Simulator</h1>";

// Configuration
$days = isset($_GET['days']) ? max(2, min(10, intval($_GET['days']))) : 3;
$clearFirst = isset($_GET['clear']) && $_GET['clear'] == '1';

// Formula explanation
echo "<div class='card info'>
    <h2>📋 Calculation Logic</h2>
    <div class='formula'>
        <strong>Primary:</strong> Production = Current Day Last Totalizer - Previous Day Last Totalizer<br>
        <strong>Fallback:</strong> Production = Current Day Last Totalizer - Current Day First Totalizer <span class='badge badge-fallback'>No Previous Day</span>
    </div>
    <p><strong>Key Point:</strong> <span class='highlight-green'>Number of days with data = Number of production rows (NO MISMATCH)</span></p>
    <p><strong>Test Data:</strong> {$days} past days + Today (total " . ($days + 1) . " days) = <strong>" . ($days + 1) . " production records</strong></p>
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
    
    $totalInsertedRecords = 0;
    
    // Generate data for each day
    for ($dayOffset = -$days; $dayOffset <= 0; $dayOffset++) {
        $date = date('Y-m-d', strtotime("{$dayOffset} days"));
        $dayIndex = $dayOffset + $days; // 0, 1, 2, 3...
        
        // Number of readings varies per day (more realistic)
        $readingsCount = ($dayOffset == 0) ? 2 : rand(3, 5);
        $totalInsertedRecords += $readingsCount;
        
        // Calculate start totalizer for this day based on cumulative production
        $dayStartRaw = $baseRawTotalizer + ($dayIndex * $dailyRawProduction);
        $dayStartProduct = $baseProductTotalizer + ($dayIndex * $dailyProductProduction);
        $dayStartPurified = $basePurifiedTotalizer + ($dayIndex * $dailyPurifiedProduction);
        
        // Distribute production across readings
        $rawIncrement = $dailyRawProduction / $readingsCount;
        $productIncrement = $dailyProductProduction / $readingsCount;
        $purifiedIncrement = $dailyPurifiedProduction / $readingsCount;
        
        $dayReadings = [];
        $firstReading = null;
        $lastReading = null;
        
        for ($r = 0; $r < $readingsCount; $r++) {
            $hour = 8 + intval(($r / $readingsCount) * 12); // 08:00 to 20:00
            $minute = ($r % 2) * 30; // 00 or 30
            $timestamp = "{$date} " . sprintf("%02d:%02d:00", $hour, $minute);
            
            // Calculate cumulative totalizer values for this reading
            // First reading starts at day start, last reading ends at day start + daily production
            $rawTotalizer = round($dayStartRaw + ($r + 1) * $rawIncrement, 2);
            $productTotalizer = round($dayStartProduct + ($r + 1) * $productIncrement, 2);
            $purifiedTotalizer = round($dayStartPurified + ($r + 1) * $purifiedIncrement, 2);
            
            $reading = [
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
            
            $dayReadings[] = $reading;
            
            if ($r == 0) {
                $firstReading = $reading;
            }
            $lastReading = $reading;
        }
        
        $testData[$date] = [
            'readings' => $dayReadings,
            'readings_count' => $readingsCount,
            'first_raw' => $firstReading['raw_biogas_totalizer'],
            'first_product' => $firstReading['product_gas_totalizer'],
            'last_raw' => $lastReading['raw_biogas_totalizer'],
            'last_product' => $lastReading['product_gas_totalizer']
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
    
    $daysCount = count($testData);
    
    echo "<div class='card success'>
        <h2>✅ Test Data Generated</h2>
        <table>
            <tr><td><strong>Total Records Inserted:</strong></td><td class='mono'><strong>{$insertCount}</strong></td></tr>
            <tr><td><strong>Days with Data:</strong></td><td class='mono'><strong>{$daysCount}</strong></td></tr>
            <tr><td><strong>Expected Production Rows:</strong></td><td class='mono'><strong>{$daysCount}</strong> <span class='highlight-green'>MATCHING!</span></td></tr>
        </table>
    </div>";
    
    // Display the generated data with First/Last values
    echo "<div class='card'>
        <h2>📊 Generated Test Data (First & Last Totalizer per Day)</h2>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th class='text-right'>Records</th>
                    <th class='text-right'>First Raw (Nm³)</th>
                    <th class='text-right'>Last Raw (Nm³)</th>
                    <th class='text-right'>First Product (Kg)</th>
                    <th class='text-right'>Last Product (Kg)</th>
                </tr>
            </thead>
            <tbody>";
    
    foreach ($testData as $date => $data) {
        $isToday = ($date == date('Y-m-d')) ? " <span class='highlight'>TODAY</span>" : "";
        echo "<tr>
            <td class='mono'>{$date}{$isToday}</td>
            <td class='mono text-right'>{$data['readings_count']}</td>
            <td class='mono text-right text-orange'>" . number_format($data['first_raw'], 2) . "</td>
            <td class='mono text-right text-emerald'>" . number_format($data['last_raw'], 2) . "</td>
            <td class='mono text-right text-orange'>" . number_format($data['first_product'], 2) . "</td>
            <td class='mono text-right text-cyan'>" . number_format($data['last_product'], 2) . "</td>
        </tr>";
    }
    echo "</tbody></table></div>";
    
    // Expected production calculations
    echo "<div class='card info'>
        <h2>🧮 Expected Production Values ({$daysCount} rows)</h2>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Method</th>
                    <th>Formula</th>
                    <th class='text-right'>Raw Production</th>
                    <th class='text-right'>Product Production</th>
                </tr>
            </thead>
            <tbody>";
    
    $dates = array_keys($testData);
    $prevData = null;
    
    foreach ($dates as $i => $currentDate) {
        $currentData = $testData[$currentDate];
        $isToday = ($currentDate == date('Y-m-d')) ? " <span class='highlight'>TODAY</span>" : "";
        
        if ($prevData === null) {
            // First day - FALLBACK: Same Day (Last - First)
            $expectedRaw = $currentData['last_raw'] - $currentData['first_raw'];
            $expectedProduct = $currentData['last_product'] - $currentData['first_product'];
            $method = "<span class='badge badge-fallback'>Same Day</span>";
            $formula = number_format($currentData['last_raw'], 2) . " - " . number_format($currentData['first_raw'], 2);
        } else {
            // Has previous day - PRIMARY: Previous Day's Last
            $expectedRaw = $currentData['last_raw'] - $prevData['last_raw'];
            $expectedProduct = $currentData['last_product'] - $prevData['last_product'];
            $method = "<span class='badge badge-primary'>Prev Day</span>";
            $formula = number_format($currentData['last_raw'], 2) . " - " . number_format($prevData['last_raw'], 2);
        }
        
        echo "<tr>
            <td class='mono'>{$currentDate}{$isToday}</td>
            <td>{$method}</td>
            <td class='mono' style='font-size: 11px;'>{$formula}</td>
            <td class='mono text-right text-emerald'><strong>" . number_format($expectedRaw, 2) . " Nm³</strong></td>
            <td class='mono text-right text-cyan'><strong>" . number_format($expectedProduct, 2) . " Kg</strong></td>
        </tr>";
        
        $prevData = $currentData;
    }
    
    echo "</tbody></table>
        <p style='margin-top: 15px; color: #64748b;'>
            <strong>✅ Total Production Rows: {$daysCount}</strong> (matches days with data)
        </p>
    </div>";
    
    // Verification steps
    echo "<div class='card warning'>
        <h2>🔍 How to Verify</h2>
        <ol style='line-height: 2;'>
            <li>Open the <strong>Trends Page</strong> in the application</li>
            <li>Scroll to <strong>\"Daily Production (Based on Totalizer)\"</strong> section</li>
            <li>Verify: <strong>{$daysCount} rows</strong> in the Daily Production Summary Table</li>
            <li>First day should show <span class='badge badge-fallback'>Same Day</span> calculation (~400-500 based on readings)</li>
            <li>Other days should show <span class='badge badge-primary'>Prev Day</span> calculation (~500 Nm³/~400 Kg)</li>
        </ol>
    </div>";
    
    // Test credentials
    echo "<div class='card'>
        <h2>👤 Test Both User Roles</h2>
        <table>
            <tr>
                <th>Role</th>
                <th>Email</th>
                <th>Password</th>
            </tr>
            <tr>
                <td><strong>HEAD_OFFICE</strong></td>
                <td class='mono'>ho@lrenergy.in</td>
                <td class='mono'>qwerty@1234</td>
            </tr>
            <tr>
                <td><strong>MNRE</strong></td>
                <td class='mono'>mnre@lrenergy.in</td>
                <td class='mono'>mnre@mnre</td>
            </tr>
        </table>
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
