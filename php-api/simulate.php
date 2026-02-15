<?php
/**
 * PLC Simulator - Test Script
 * 
 * Usage: 
 * 1. Open in browser: http://localhost/scada-api/simulate.php
 * 2. Or with parameters: simulate.php?mode=normal|warning|critical
 * 
 * This simulates PLC sending data to receive_data.php
 */

header('Content-Type: text/html; charset=UTF-8');

// Configuration
$API_URL = 'http://localhost/scada-api/receive_data.php';
$API_KEY = 'sk_prod_LREnergy_283669e54e512351a5bde265e20da2149fd4b54569a7e12b1ee8226746a6a2a7';

// Get simulation mode
$mode = $_GET['mode'] ?? 'normal';

echo "<h1>🔧 PLC Simulator</h1>";
echo "<p><strong>Mode:</strong> " . strtoupper($mode) . "</p>";
echo "<hr>";

// Generate data based on mode
function generateData($mode) {
    $timestamp = date('Y-m-d H:i:s');
    
    // Base values (normal operation)
    $data = [
        'plant_id' => 'KARNAL',
        'timestamp' => $timestamp,
        
        // Gas Flow
        'raw_biogas_flow' => 1250 + rand(-50, 50),
        'raw_biogas_totalizer' => 150000 + rand(0, 100),
        'purified_gas_flow' => 1180 + rand(-40, 40),
        'purified_gas_totalizer' => 142000 + rand(0, 100),
        'product_gas_flow' => 1150 + rand(-35, 35),
        'product_gas_totalizer' => 138000 + rand(0, 100),
        
        // Gas Composition
        'ch4_concentration' => 96.8 + (rand(-10, 10) / 10),
        'co2_level' => 2.9 + (rand(-5, 5) / 10),
        'o2_concentration' => 0.3 + (rand(-2, 2) / 10),
        'h2s_content' => 3 + (rand(0, 2) / 10),  // Normal: < 5 ppm, Max: 105
        'dew_point' => -68 + rand(-5, 5),
        
        // Digester 1
        'd1_temp_bottom' => 37 + (rand(-20, 20) / 10),
        'd1_temp_top' => 36.5 + (rand(-20, 20) / 10),
        'd1_gas_pressure' => 32 + rand(-5, 5),
        'd1_air_pressure' => 18 + rand(-3, 3),
        'd1_slurry_height' => 7.6 + (rand(-5, 5) / 10),
        'd1_gas_level' => 75 + rand(-10, 10),
        
        // Digester 2
        'd2_temp_bottom' => 36.5 + (rand(-20, 20) / 10),
        'd2_temp_top' => 36 + (rand(-20, 20) / 10),
        'd2_gas_pressure' => 30 + rand(-5, 5),
        'd2_air_pressure' => 17 + rand(-3, 3),
        'd2_slurry_height' => 7.3 + (rand(-5, 5) / 10),
        'd2_gas_level' => 72 + rand(-10, 10),
        
        // Tank Levels
        'buffer_tank_level' => 82 + rand(-10, 10),
        'lagoon_tank_level' => 76 + rand(-10, 10),
        
        // Water Flow
        'feed_fm1_flow' => 42 + rand(-5, 5),
        'feed_fm1_totalizer' => 5000 + rand(0, 50),
        'feed_fm2_flow' => 38 + rand(-5, 5),
        'feed_fm2_totalizer' => 4500 + rand(0, 50),
        'fresh_water_flow' => 12 + rand(-3, 3),
        'fresh_water_totalizer' => 1500 + rand(0, 20),
        'recycle_water_flow' => 26 + rand(-4, 4),
        'recycle_water_totalizer' => 3000 + rand(0, 30),
        
        // Equipment
        'psa_status' => 1,
        'psa_efficiency' => 94.4 + (rand(-20, 20) / 10),
        'lt_panel_power' => 245 + rand(-20, 20),
        'compressor_status' => 1
    ];
    
    // Modify values based on mode
    if ($mode === 'warning') {
        $data['ch4_concentration'] = 94.5;  // Below 96% threshold
        $data['buffer_tank_level'] = 92;    // Near high limit
        $data['psa_efficiency'] = 86;       // Near low limit
        $data['d1_temp_bottom'] = 43;       // Near high limit
    } 
    elseif ($mode === 'critical') {
        $data['ch4_concentration'] = 90;    // Well below threshold
        $data['h2s_content'] = 600;         // Above 500 ppm
        $data['o2_concentration'] = 1.5;    // Above 1%
        $data['d1_temp_bottom'] = 48;       // Critical high
        $data['buffer_tank_level'] = 98;    // Overflow risk
    }
    elseif ($mode === 'equipment_off') {
        $data['psa_status'] = 0;
        $data['compressor_status'] = 0;
        $data['psa_efficiency'] = 0;
    }
    
    return $data;
}

// Generate data
$data = generateData($mode);

// Display data being sent
echo "<h2>📤 Data Being Sent:</h2>";
echo "<pre style='background:#f5f5f5; padding:15px; border-radius:5px; overflow-x:auto;'>";
echo json_encode($data, JSON_PRETTY_PRINT);
echo "</pre>";

// Send to API
$ch = curl_init($API_URL);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'X-API-Key: ' . $API_KEY
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

// Display response
echo "<h2>📥 API Response:</h2>";
echo "<p><strong>HTTP Code:</strong> " . $httpCode . "</p>";

if ($error) {
    echo "<p style='color:red;'><strong>Error:</strong> " . $error . "</p>";
} else {
    $responseData = json_decode($response, true);
    echo "<pre style='background:" . ($httpCode == 201 ? '#e6ffe6' : '#ffe6e6') . "; padding:15px; border-radius:5px;'>";
    echo json_encode($responseData, JSON_PRETTY_PRINT);
    echo "</pre>";
}

// Quick links
echo "<hr>";
echo "<h2>🔗 Quick Test Links:</h2>";
echo "<ul>";
echo "<li><a href='simulate.php?mode=normal'>✅ Normal Data</a> - All values within range</li>";
echo "<li><a href='simulate.php?mode=warning'>⚠️ Warning Data</a> - Some values near thresholds</li>";
echo "<li><a href='simulate.php?mode=critical'>🚨 Critical Data</a> - Values exceeding thresholds</li>";
echo "<li><a href='simulate.php?mode=equipment_off'>🔴 Equipment Off</a> - PSA & Compressor off</li>";
echo "</ul>";

echo "<hr>";
echo "<h2>📊 Check Results:</h2>";
echo "<ul>";
echo "<li><a href='http://localhost:3000' target='_blank'>Open Dashboard</a></li>";
echo "<li><a href='dashboard.php' target='_blank'>View Dashboard API</a></li>";
echo "<li>Check <code>scada_readings</code> table in phpMyAdmin</li>";
echo "<li>Check <code>alerts</code> table for any triggered alerts</li>";
echo "<li>Check <code>sync_status</code> table for sync record</li>";
echo "<li>Check <code>api_logs</code> table for API log</li>";
echo "</ul>";

echo "<hr>";
echo "<p><em>Timestamp: " . date('Y-m-d H:i:s') . "</em></p>";
?>
