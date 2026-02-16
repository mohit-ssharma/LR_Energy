<?php
require_once 'cors.php';
require_once 'config.php';

/**
 * Flow Meter Only Simulator
 * Simulates PLC sending only flow meter data (partial data scenario)
 * 
 * Usage:
 * - Manual: /flow_simulator.php?send=1
 * - Auto mode: /flow_simulator.php?auto=1 (sends every 30 seconds)
 * - Stop auto: /flow_simulator.php?stop=1
 */

header('Content-Type: text/html');

$mode = isset($_GET['auto']) ? 'auto' : (isset($_GET['send']) ? 'manual' : 'view');
$stop = isset($_GET['stop']);

// Session to track auto mode
session_start();

if ($stop) {
    $_SESSION['flow_sim_auto'] = false;
    echo "<h2>🛑 Flow Simulator Stopped</h2>";
    echo "<p><a href='flow_simulator.php'>Back to Simulator</a></p>";
    exit;
}

?>
<!DOCTYPE html>
<html>
<head>
    <title>Flow Meter Only Simulator</title>
    <meta http-equiv="refresh" content="<?php echo ($mode == 'auto' && !$stop) ? '30' : '9999'; ?>">
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; max-width: 900px; margin: 0 auto; }
        .card { background: #f8f9fa; border: 1px solid #dee2e6; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .success { background: #d4edda; border-color: #c3e6cb; }
        .warning { background: #fff3cd; border-color: #ffeaa8; }
        .info { background: #d1ecf1; border-color: #bee5eb; }
        pre { background: #2d2d2d; color: #fff; padding: 15px; border-radius: 5px; overflow-x: auto; font-size: 12px; }
        .btn { display: inline-block; padding: 10px 20px; margin: 5px; border-radius: 5px; text-decoration: none; color: white; }
        .btn-primary { background: #0d6efd; }
        .btn-success { background: #198754; }
        .btn-danger { background: #dc3545; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { padding: 10px; border: 1px solid #dee2e6; text-align: left; }
        th { background: #e9ecef; }
        .null-value { color: #999; font-style: italic; }
    </style>
</head>
<body>
    <h1>📊 Flow Meter Only Simulator</h1>
    <p>Tests partial data scenario - Only sends flow meter values, all other fields are NULL</p>
    
    <div class="card info">
        <h3>🎯 Purpose</h3>
        <p>This simulator tests if the dashboard can handle <strong>partial data</strong> where only flow meters are working:</p>
        <ul>
            <li>✅ Raw Biogas Flow & Totalizer</li>
            <li>✅ Purified Gas Flow & Totalizer</li>
            <li>✅ Product Gas Flow & Totalizer</li>
            <li>❌ CH₄, CO₂, O₂, H₂S - NULL</li>
            <li>❌ Digester temps, pressures - NULL</li>
            <li>❌ Tank levels - NULL</li>
            <li>❌ Water flows - NULL</li>
            <li>❌ Equipment status - NULL</li>
        </ul>
    </div>

<?php

function sendFlowMeterOnlyData() {
    $timestamp = date('Y-m-d H:i:s');
    
    // Generate realistic flow meter data with slight variations
    $baseRawFlow = 1250;
    $basePurifiedFlow = 1180;
    $baseProductFlow = 1150;
    
    // Add some random variation
    $rawFlow = $baseRawFlow + (rand(-50, 50) / 10);
    $purifiedFlow = $basePurifiedFlow + (rand(-50, 50) / 10);
    $productFlow = $baseProductFlow + (rand(-50, 50) / 10);
    
    // Totalizers should increment
    static $rawTotalizer = 150000;
    static $purifiedTotalizer = 142000;
    static $productTotalizer = 138000;
    
    $rawTotalizer += $rawFlow / 60; // Increment per minute
    $purifiedTotalizer += $purifiedFlow / 60;
    $productTotalizer += $productFlow / 60;
    
    // ONLY flow meter data - everything else is intentionally missing/null
    $data = [
        'timestamp' => $timestamp,
        'plant_id' => 'KARNAL',
        
        // Flow meters - ONLY these have values
        'raw_biogas_flow' => round($rawFlow, 2),
        'raw_biogas_totalizer' => round($rawTotalizer, 2),
        'purified_gas_flow' => round($purifiedFlow, 2),
        'purified_gas_totalizer' => round($purifiedTotalizer, 2),
        'product_gas_flow' => round($productFlow, 2),
        'product_gas_totalizer' => round($productTotalizer, 2),
        
        // Everything else is NULL (simulating sensors offline/not installed)
        'ch4_concentration' => null,
        'co2_level' => null,
        'o2_concentration' => null,
        'h2s_content' => null,
        'dew_point' => null,
        'd1_temp_bottom' => null,
        'd1_temp_top' => null,
        'd1_gas_pressure' => null,
        'd1_air_pressure' => null,
        'd1_slurry_height' => null,
        'd1_gas_level' => null,
        'd2_temp_bottom' => null,
        'd2_temp_top' => null,
        'd2_gas_pressure' => null,
        'd2_air_pressure' => null,
        'd2_slurry_height' => null,
        'd2_gas_level' => null,
        'buffer_tank_level' => null,
        'lagoon_tank_level' => null,
        'feed_fm1_flow' => null,
        'feed_fm1_totalizer' => null,
        'feed_fm2_flow' => null,
        'feed_fm2_totalizer' => null,
        'fresh_water_flow' => null,
        'fresh_water_totalizer' => null,
        'recycle_water_flow' => null,
        'recycle_water_totalizer' => null,
        'psa_status' => null,
        'psa_efficiency' => null,
        'lt_panel_power' => null,
        'compressor_status' => null
    ];
    
    // Send to receive_data.php - Auto-detect environment
    $serverName = $_SERVER['SERVER_NAME'] ?? $_SERVER['HTTP_HOST'] ?? 'localhost';
    $is_local = ($serverName === 'localhost' || $serverName === '127.0.0.1' || strpos($serverName, 'localhost') !== false);
    
    if ($is_local) {
        $apiUrl = 'http://localhost/scada-api/receive_data.php?api_key=' . API_KEY;
    } else {
        // Production - use HTTPS
        $apiUrl = 'https://' . $serverName . '/scada-api/receive_data.php?api_key=' . API_KEY;
    }
    
    $ch = curl_init($apiUrl);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($data),
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'X-API-Key: ' . API_KEY
        ],
        CURLOPT_TIMEOUT => 30,
        CURLOPT_SSL_VERIFYPEER => false,  // For GoDaddy SSL
        CURLOPT_SSL_VERIFYHOST => 0       // For GoDaddy SSL
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    return [
        'data' => $data,
        'response' => $response,
        'http_code' => $httpCode,
        'error' => $error
    ];
}

if ($mode == 'manual' || $mode == 'auto') {
    $_SESSION['flow_sim_auto'] = ($mode == 'auto');
    
    $result = sendFlowMeterOnlyData();
    
    // Show which URL was used
    $serverName = $_SERVER['SERVER_NAME'] ?? $_SERVER['HTTP_HOST'] ?? 'localhost';
    $is_local = ($serverName === 'localhost' || $serverName === '127.0.0.1' || strpos($serverName, 'localhost') !== false);
    $usedUrl = $is_local ? 'http://localhost/scada-api/receive_data.php' : 'https://' . $serverName . '/scada-api/receive_data.php';
    
    echo '<div class="card ' . ($result['http_code'] == 201 ? 'success' : 'warning') . '">';
    echo '<h3>📤 Data Sent - ' . ($mode == 'auto' ? 'AUTO MODE' : 'Manual') . '</h3>';
    echo '<p><strong>API URL:</strong> ' . htmlspecialchars($usedUrl) . '</p>';
    echo '<p><strong>HTTP Status:</strong> ' . $result['http_code'] . '</p>';
    
    if ($result['error']) {
        echo '<p><strong>Error:</strong> ' . htmlspecialchars($result['error']) . '</p>';
    }
    
    echo '<h4>Data Sent (Flow Meters Only):</h4>';
    echo '<table>';
    echo '<tr><th>Field</th><th>Value</th><th>Status</th></tr>';
    
    foreach ($result['data'] as $key => $value) {
        $status = ($value !== null) ? '✅ Has Value' : '<span class="null-value">❌ NULL</span>';
        $displayValue = ($value !== null) ? htmlspecialchars($value) : '<span class="null-value">null</span>';
        echo "<tr><td>$key</td><td>$displayValue</td><td>$status</td></tr>";
    }
    echo '</table>';
    
    echo '<h4>API Response:</h4>';
    echo '<pre>' . htmlspecialchars($result['response']) . '</pre>';
    echo '</div>';
    
    if ($mode == 'auto') {
        echo '<div class="card warning">';
        echo '<h3>🔄 Auto Mode Active</h3>';
        echo '<p>Page will refresh and send new data in <strong>60 seconds</strong></p>';
        echo '<p><a href="flow_simulator.php?stop=1" class="btn btn-danger">🛑 Stop Auto Mode</a></p>';
        echo '</div>';
    }
}

?>

    <div class="card">
        <h3>🎮 Controls</h3>
        <a href="flow_simulator.php?send=1" class="btn btn-primary">📤 Send Once</a>
        <a href="flow_simulator.php?auto=1" class="btn btn-success">🔄 Start Auto (60s)</a>
        <a href="flow_simulator.php?stop=1" class="btn btn-danger">🛑 Stop</a>
        <a href="auto_simulate.php" class="btn btn-primary">📊 Full Simulator</a>
    </div>
    
    <div class="card">
        <h3>📋 What to Check in Dashboard</h3>
        <ol>
            <li><strong>KPI Summary:</strong> Only Raw Biogas, Purified Gas, Product Gas should show values. CH₄, CO₂, H₂S should show 0 or --</li>
            <li><strong>Gas Composition:</strong> Should handle NULL gracefully (show 0 or N/A)</li>
            <li><strong>Digester Status:</strong> Should show "No Data" or similar</li>
            <li><strong>Equipment Status:</strong> Should handle NULL status</li>
            <li><strong>Trends Page:</strong> Should only show flow meter trends, others should be 0 or empty</li>
            <li><strong>Reports:</strong> Should calculate based on available data only</li>
        </ol>
    </div>

</body>
</html>
