<?php
/**
 * Auto PLC Simulator - Continuous Data Generation
 * 
 * Usage:
 * 1. Browser: http://localhost/scada-api/auto_simulate.php?duration=10&interval=60
 *    - duration: minutes to run (default: 10)
 *    - interval: seconds between readings (default: 60)
 * 
 * 2. Command Line: php auto_simulate.php
 */

set_time_limit(0); // Allow long execution
header('Content-Type: text/html; charset=UTF-8');

// Configuration - Auto-detect environment
require_once 'config.php';

$is_local = ($_SERVER['SERVER_NAME'] === 'localhost' || $_SERVER['SERVER_NAME'] === '127.0.0.1');

if ($is_local) {
    $API_URL = 'http://localhost/scada-api/receive_data.php';
} else {
    // Production URL - Update this after GoDaddy deployment
    $API_URL = 'https://' . $_SERVER['SERVER_NAME'] . '/scada-api/receive_data.php';
}

$API_KEY = API_KEY;

$duration = isset($_GET['duration']) ? intval($_GET['duration']) : 10; // minutes
$interval = isset($_GET['interval']) ? intval($_GET['interval']) : 60; // seconds

$totalReadings = floor(($duration * 60) / $interval);

echo "<!DOCTYPE html><html><head><title>Auto PLC Simulator</title>";
echo "<meta http-equiv='refresh' content='{$interval}'>";
echo "<style>
    body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
    .card { background: white; padding: 20px; border-radius: 8px; margin: 10px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .success { border-left: 4px solid #10b981; }
    .error { border-left: 4px solid #ef4444; }
    .info { border-left: 4px solid #3b82f6; }
    pre { background: #1e293b; color: #e2e8f0; padding: 15px; border-radius: 5px; overflow-x: auto; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
    .badge-success { background: #d1fae5; color: #065f46; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .badge-critical { background: #fee2e2; color: #991b1b; }
</style></head><body>";

echo "<h1>🤖 Auto PLC Simulator</h1>";

// Scenario Reference
echo "<div class='card info'>";
echo "<h3>📋 10 Distinct Scenarios (Cycles Through)</h3>";
echo "<table style='width:100%; border-collapse: collapse; font-size:12px;'>";
echo "<tr style='background:#f1f5f9;'><th style='padding:6px;'>#</th><th style='padding:6px; text-align:left;'>Scenario</th><th style='padding:6px;'>Key Change</th></tr>";
echo "<tr><td style='padding:4px; text-align:center;'>1</td><td>✅ Normal Operation</td><td>Optimal values</td></tr>";
echo "<tr style='background:#f8fafc;'><td style='padding:4px; text-align:center;'>2</td><td>📈 High Gas Production</td><td>Flow +10%, CH₄ 97.2%</td></tr>";
echo "<tr><td style='padding:4px; text-align:center;'>3</td><td>📉 Low Gas Production</td><td>Flow -20%, Morning start</td></tr>";
echo "<tr style='background:#f8fafc;'><td style='padding:4px; text-align:center;'>4</td><td>⚠️ Low CH₄</td><td>CH₄ 94.5% (below 96%)</td></tr>";
echo "<tr><td style='padding:4px; text-align:center;'>5</td><td>🚨 High H₂S</td><td>H₂S 85 ppm (Critical)</td></tr>";
echo "<tr style='background:#f8fafc;'><td style='padding:4px; text-align:center;'>6</td><td>⚠️ High Temp</td><td>D1 Temp 44.5°C</td></tr>";
echo "<tr><td style='padding:4px; text-align:center;'>7</td><td>🚨 High Tank</td><td>Buffer 93% (Critical)</td></tr>";
echo "<tr style='background:#f8fafc;'><td style='padding:4px; text-align:center;'>8</td><td>⚠️ Low PSA</td><td>PSA Efficiency 88.5%</td></tr>";
echo "<tr><td style='padding:4px; text-align:center;'>9</td><td>🌙 Night Operation</td><td>Reduced load -15%</td></tr>";
echo "<tr style='background:#f8fafc;'><td style='padding:4px; text-align:center;'>10</td><td>🏆 Peak Performance</td><td>Max values, CH₄ 97.5%</td></tr>";
echo "</table>";
echo "</div>";

// Session tracking
session_start();
if (!isset($_SESSION['reading_count'])) {
    $_SESSION['reading_count'] = 0;
    $_SESSION['start_time'] = time();
}
$_SESSION['reading_count']++;
$readingNumber = $_SESSION['reading_count'];

// Status
echo "<div class='card info'>";
echo "<h3>📊 Status</h3>";
echo "<p><strong>Reading:</strong> #{$readingNumber} of {$totalReadings}</p>";
echo "<p><strong>Interval:</strong> Every {$interval} seconds</p>";
echo "<p><strong>Duration:</strong> {$duration} minutes total</p>";
echo "<p><strong>Current Time:</strong> " . date('Y-m-d H:i:s') . "</p>";
echo "</div>";

// Generate realistic data with 10 distinct predefined scenarios
function generateRealisticData($readingNumber) {
    $timestamp = date('Y-m-d H:i:s');
    
    // 10 Distinct Scenarios - cycles through them
    $scenarioIndex = ($readingNumber - 1) % 10;
    
    // Define 10 distinct data combinations
    $scenarios = [
        // Scenario 1: Normal Operation - Optimal Conditions
        [
            'name' => '✅ Normal Operation - Optimal',
            'raw_biogas_flow' => 1250, 'purified_gas_flow' => 1180, 'product_gas_flow' => 1150,
            'ch4_concentration' => 96.8, 'co2_level' => 2.9, 'o2_concentration' => 0.30, 'h2s_content' => 3,
            'dew_point' => -68,
            'd1_temp_bottom' => 37.0, 'd1_temp_top' => 36.5, 'd1_gas_pressure' => 32, 'd1_air_pressure' => 18, 'd1_slurry_height' => 7.6, 'd1_gas_level' => 75,
            'd2_temp_bottom' => 36.5, 'd2_temp_top' => 36.0, 'd2_gas_pressure' => 30, 'd2_air_pressure' => 17, 'd2_slurry_height' => 7.3, 'd2_gas_level' => 72,
            'buffer_tank_level' => 65, 'lagoon_tank_level' => 60,
            'feed_fm1_flow' => 42, 'feed_fm2_flow' => 38, 'fresh_water_flow' => 12, 'recycle_water_flow' => 26,
            'psa_status' => 1, 'psa_efficiency' => 94.4, 'lt_panel_power' => 245, 'compressor_status' => 1
        ],
        
        // Scenario 2: High Gas Production
        [
            'name' => '📈 High Gas Production',
            'raw_biogas_flow' => 1380, 'purified_gas_flow' => 1290, 'product_gas_flow' => 1260,
            'ch4_concentration' => 97.2, 'co2_level' => 2.5, 'o2_concentration' => 0.25, 'h2s_content' => 2,
            'dew_point' => -70,
            'd1_temp_bottom' => 38.0, 'd1_temp_top' => 37.5, 'd1_gas_pressure' => 35, 'd1_air_pressure' => 20, 'd1_slurry_height' => 8.0, 'd1_gas_level' => 82,
            'd2_temp_bottom' => 37.5, 'd2_temp_top' => 37.0, 'd2_gas_pressure' => 33, 'd2_air_pressure' => 19, 'd2_slurry_height' => 7.8, 'd2_gas_level' => 80,
            'buffer_tank_level' => 75, 'lagoon_tank_level' => 70,
            'feed_fm1_flow' => 48, 'feed_fm2_flow' => 45, 'fresh_water_flow' => 15, 'recycle_water_flow' => 30,
            'psa_status' => 1, 'psa_efficiency' => 96.2, 'lt_panel_power' => 260, 'compressor_status' => 1
        ],
        
        // Scenario 3: Low Gas Production (Morning Start)
        [
            'name' => '📉 Low Gas Production (Morning)',
            'raw_biogas_flow' => 980, 'purified_gas_flow' => 920, 'product_gas_flow' => 900,
            'ch4_concentration' => 95.5, 'co2_level' => 3.8, 'o2_concentration' => 0.45, 'h2s_content' => 4,
            'dew_point' => -65,
            'd1_temp_bottom' => 35.5, 'd1_temp_top' => 35.0, 'd1_gas_pressure' => 28, 'd1_air_pressure' => 15, 'd1_slurry_height' => 7.0, 'd1_gas_level' => 65,
            'd2_temp_bottom' => 35.0, 'd2_temp_top' => 34.5, 'd2_gas_pressure' => 26, 'd2_air_pressure' => 14, 'd2_slurry_height' => 6.8, 'd2_gas_level' => 62,
            'buffer_tank_level' => 55, 'lagoon_tank_level' => 50,
            'feed_fm1_flow' => 35, 'feed_fm2_flow' => 32, 'fresh_water_flow' => 10, 'recycle_water_flow' => 20,
            'psa_status' => 1, 'psa_efficiency' => 92.0, 'lt_panel_power' => 220, 'compressor_status' => 1
        ],
        
        // Scenario 4: Warning - Low CH4
        [
            'name' => '⚠️ Warning - Low CH₄ Concentration',
            'raw_biogas_flow' => 1200, 'purified_gas_flow' => 1100, 'product_gas_flow' => 1080,
            'ch4_concentration' => 94.5, 'co2_level' => 4.5, 'o2_concentration' => 0.55, 'h2s_content' => 4,
            'dew_point' => -64,
            'd1_temp_bottom' => 36.0, 'd1_temp_top' => 35.5, 'd1_gas_pressure' => 30, 'd1_air_pressure' => 16, 'd1_slurry_height' => 7.2, 'd1_gas_level' => 70,
            'd2_temp_bottom' => 35.5, 'd2_temp_top' => 35.0, 'd2_gas_pressure' => 28, 'd2_air_pressure' => 15, 'd2_slurry_height' => 7.0, 'd2_gas_level' => 68,
            'buffer_tank_level' => 72, 'lagoon_tank_level' => 68,
            'feed_fm1_flow' => 40, 'feed_fm2_flow' => 36, 'fresh_water_flow' => 11, 'recycle_water_flow' => 24,
            'psa_status' => 1, 'psa_efficiency' => 91.5, 'lt_panel_power' => 238, 'compressor_status' => 1
        ],
        
        // Scenario 5: Critical - High H2S
        [
            'name' => '🚨 Critical - High H₂S Content',
            'raw_biogas_flow' => 1150, 'purified_gas_flow' => 1050, 'product_gas_flow' => 1020,
            'ch4_concentration' => 96.0, 'co2_level' => 3.2, 'o2_concentration' => 0.35, 'h2s_content' => 85,
            'dew_point' => -66,
            'd1_temp_bottom' => 37.5, 'd1_temp_top' => 37.0, 'd1_gas_pressure' => 31, 'd1_air_pressure' => 17, 'd1_slurry_height' => 7.4, 'd1_gas_level' => 73,
            'd2_temp_bottom' => 37.0, 'd2_temp_top' => 36.5, 'd2_gas_pressure' => 29, 'd2_air_pressure' => 16, 'd2_slurry_height' => 7.1, 'd2_gas_level' => 70,
            'buffer_tank_level' => 78, 'lagoon_tank_level' => 74,
            'feed_fm1_flow' => 44, 'feed_fm2_flow' => 40, 'fresh_water_flow' => 13, 'recycle_water_flow' => 28,
            'psa_status' => 1, 'psa_efficiency' => 93.0, 'lt_panel_power' => 250, 'compressor_status' => 1
        ],
        
        // Scenario 6: Warning - High Digester Temperature
        [
            'name' => '⚠️ Warning - High Digester Temperature',
            'raw_biogas_flow' => 1300, 'purified_gas_flow' => 1220, 'product_gas_flow' => 1190,
            'ch4_concentration' => 97.0, 'co2_level' => 2.6, 'o2_concentration' => 0.28, 'h2s_content' => 3,
            'dew_point' => -69,
            'd1_temp_bottom' => 44.5, 'd1_temp_top' => 43.5, 'd1_gas_pressure' => 36, 'd1_air_pressure' => 21, 'd1_slurry_height' => 7.9, 'd1_gas_level' => 78,
            'd2_temp_bottom' => 43.0, 'd2_temp_top' => 42.5, 'd2_gas_pressure' => 34, 'd2_air_pressure' => 20, 'd2_slurry_height' => 7.7, 'd2_gas_level' => 76,
            'buffer_tank_level' => 80, 'lagoon_tank_level' => 75,
            'feed_fm1_flow' => 46, 'feed_fm2_flow' => 42, 'fresh_water_flow' => 14, 'recycle_water_flow' => 29,
            'psa_status' => 1, 'psa_efficiency' => 95.5, 'lt_panel_power' => 255, 'compressor_status' => 1
        ],
        
        // Scenario 7: Critical - High Tank Level
        [
            'name' => '🚨 Critical - High Buffer Tank Level',
            'raw_biogas_flow' => 1280, 'purified_gas_flow' => 1200, 'product_gas_flow' => 1170,
            'ch4_concentration' => 96.5, 'co2_level' => 3.0, 'o2_concentration' => 0.32, 'h2s_content' => 4,
            'dew_point' => -67,
            'd1_temp_bottom' => 37.2, 'd1_temp_top' => 36.7, 'd1_gas_pressure' => 33, 'd1_air_pressure' => 18, 'd1_slurry_height' => 7.7, 'd1_gas_level' => 76,
            'd2_temp_bottom' => 36.8, 'd2_temp_top' => 36.3, 'd2_gas_pressure' => 31, 'd2_air_pressure' => 17, 'd2_slurry_height' => 7.5, 'd2_gas_level' => 74,
            'buffer_tank_level' => 93, 'lagoon_tank_level' => 88,
            'feed_fm1_flow' => 45, 'feed_fm2_flow' => 41, 'fresh_water_flow' => 13, 'recycle_water_flow' => 27,
            'psa_status' => 1, 'psa_efficiency' => 94.0, 'lt_panel_power' => 248, 'compressor_status' => 1
        ],
        
        // Scenario 8: Low PSA Efficiency
        [
            'name' => '⚠️ Warning - Low PSA Efficiency',
            'raw_biogas_flow' => 1220, 'purified_gas_flow' => 1100, 'product_gas_flow' => 1050,
            'ch4_concentration' => 95.8, 'co2_level' => 3.5, 'o2_concentration' => 0.40, 'h2s_content' => 5,
            'dew_point' => -65,
            'd1_temp_bottom' => 36.5, 'd1_temp_top' => 36.0, 'd1_gas_pressure' => 30, 'd1_air_pressure' => 17, 'd1_slurry_height' => 7.3, 'd1_gas_level' => 71,
            'd2_temp_bottom' => 36.0, 'd2_temp_top' => 35.5, 'd2_gas_pressure' => 28, 'd2_air_pressure' => 16, 'd2_slurry_height' => 7.1, 'd2_gas_level' => 69,
            'buffer_tank_level' => 70, 'lagoon_tank_level' => 65,
            'feed_fm1_flow' => 40, 'feed_fm2_flow' => 37, 'fresh_water_flow' => 11, 'recycle_water_flow' => 24,
            'psa_status' => 1, 'psa_efficiency' => 88.5, 'lt_panel_power' => 235, 'compressor_status' => 1
        ],
        
        // Scenario 9: Night Operation (Reduced Load)
        [
            'name' => '🌙 Night Operation - Reduced Load',
            'raw_biogas_flow' => 1050, 'purified_gas_flow' => 990, 'product_gas_flow' => 970,
            'ch4_concentration' => 96.2, 'co2_level' => 3.1, 'o2_concentration' => 0.33, 'h2s_content' => 3,
            'dew_point' => -68,
            'd1_temp_bottom' => 36.2, 'd1_temp_top' => 35.7, 'd1_gas_pressure' => 29, 'd1_air_pressure' => 16, 'd1_slurry_height' => 7.2, 'd1_gas_level' => 68,
            'd2_temp_bottom' => 35.8, 'd2_temp_top' => 35.3, 'd2_gas_pressure' => 27, 'd2_air_pressure' => 15, 'd2_slurry_height' => 7.0, 'd2_gas_level' => 66,
            'buffer_tank_level' => 58, 'lagoon_tank_level' => 54,
            'feed_fm1_flow' => 36, 'feed_fm2_flow' => 33, 'fresh_water_flow' => 9, 'recycle_water_flow' => 21,
            'psa_status' => 1, 'psa_efficiency' => 93.5, 'lt_panel_power' => 210, 'compressor_status' => 1
        ],
        
        // Scenario 10: Peak Performance
        [
            'name' => '🏆 Peak Performance',
            'raw_biogas_flow' => 1420, 'purified_gas_flow' => 1350, 'product_gas_flow' => 1320,
            'ch4_concentration' => 97.5, 'co2_level' => 2.2, 'o2_concentration' => 0.20, 'h2s_content' => 2,
            'dew_point' => -72,
            'd1_temp_bottom' => 38.5, 'd1_temp_top' => 38.0, 'd1_gas_pressure' => 38, 'd1_air_pressure' => 22, 'd1_slurry_height' => 8.2, 'd1_gas_level' => 85,
            'd2_temp_bottom' => 38.0, 'd2_temp_top' => 37.5, 'd2_gas_pressure' => 36, 'd2_air_pressure' => 21, 'd2_slurry_height' => 8.0, 'd2_gas_level' => 83,
            'buffer_tank_level' => 68, 'lagoon_tank_level' => 62,
            'feed_fm1_flow' => 50, 'feed_fm2_flow' => 47, 'fresh_water_flow' => 16, 'recycle_water_flow' => 32,
            'psa_status' => 1, 'psa_efficiency' => 97.0, 'lt_panel_power' => 275, 'compressor_status' => 1
        ]
    ];
    
    $scenario = $scenarios[$scenarioIndex];
    $scenarioName = $scenario['name'];
    
    // Build the data payload
    $data = [
        'plant_id' => 'KARNAL',
        'timestamp' => $timestamp,
        
        // Gas Flow
        'raw_biogas_flow' => $scenario['raw_biogas_flow'],
        'raw_biogas_totalizer' => round(150000 + ($readingNumber * 20.8), 2),
        'purified_gas_flow' => $scenario['purified_gas_flow'],
        'purified_gas_totalizer' => round(142000 + ($readingNumber * 19.7), 2),
        'product_gas_flow' => $scenario['product_gas_flow'],
        'product_gas_totalizer' => round(138000 + ($readingNumber * 19.2), 2),
        
        // Gas Composition
        'ch4_concentration' => $scenario['ch4_concentration'],
        'co2_level' => $scenario['co2_level'],
        'o2_concentration' => $scenario['o2_concentration'],
        'h2s_content' => $scenario['h2s_content'],
        'dew_point' => $scenario['dew_point'],
        
        // Digester 1
        'd1_temp_bottom' => $scenario['d1_temp_bottom'],
        'd1_temp_top' => $scenario['d1_temp_top'],
        'd1_gas_pressure' => $scenario['d1_gas_pressure'],
        'd1_air_pressure' => $scenario['d1_air_pressure'],
        'd1_slurry_height' => $scenario['d1_slurry_height'],
        'd1_gas_level' => $scenario['d1_gas_level'],
        
        // Digester 2
        'd2_temp_bottom' => $scenario['d2_temp_bottom'],
        'd2_temp_top' => $scenario['d2_temp_top'],
        'd2_gas_pressure' => $scenario['d2_gas_pressure'],
        'd2_air_pressure' => $scenario['d2_air_pressure'],
        'd2_slurry_height' => $scenario['d2_slurry_height'],
        'd2_gas_level' => $scenario['d2_gas_level'],
        
        // Tank Levels
        'buffer_tank_level' => $scenario['buffer_tank_level'],
        'lagoon_tank_level' => $scenario['lagoon_tank_level'],
        
        // Water Flow
        'feed_fm1_flow' => $scenario['feed_fm1_flow'],
        'feed_fm1_totalizer' => round(5000 + ($readingNumber * 0.7), 2),
        'feed_fm2_flow' => $scenario['feed_fm2_flow'],
        'feed_fm2_totalizer' => round(4500 + ($readingNumber * 0.63), 2),
        'fresh_water_flow' => $scenario['fresh_water_flow'],
        'fresh_water_totalizer' => round(1500 + ($readingNumber * 0.2), 2),
        'recycle_water_flow' => $scenario['recycle_water_flow'],
        'recycle_water_totalizer' => round(3000 + ($readingNumber * 0.43), 2),
        
        // Equipment
        'psa_status' => $scenario['psa_status'],
        'psa_efficiency' => $scenario['psa_efficiency'],
        'lt_panel_power' => $scenario['lt_panel_power'],
        'compressor_status' => $scenario['compressor_status']
    ];
    
    return ['data' => $data, 'issue' => $scenarioName, 'scenario_num' => $scenarioIndex + 1];
}

// Generate data
$result = generateRealisticData($readingNumber);
$data = $result['data'];
$issueStatus = $result['issue'];
$scenarioNum = $result['scenario_num'];

// Show scenario status
$badgeClass = 'badge-success';
if (strpos($issueStatus, '🚨') !== false) {
    $badgeClass = 'badge-critical';
} elseif (strpos($issueStatus, '⚠️') !== false) {
    $badgeClass = 'badge-warning';
}

echo "<div class='card'>";
echo "<h3>📈 Scenario #{$scenarioNum} of 10</h3>";
echo "<p><span class='badge {$badgeClass}'>{$issueStatus}</span></p>";
echo "</div>";

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

// Display result
$cardClass = ($httpCode == 201) ? 'success' : 'error';
echo "<div class='card {$cardClass}'>";
echo "<h3>📤 API Response (HTTP {$httpCode})</h3>";

if ($error) {
    echo "<p style='color:red;'>Error: {$error}</p>";
} else {
    echo "<pre>" . json_encode(json_decode($response), JSON_PRETTY_PRINT) . "</pre>";
}
echo "</div>";

// Key values sent
echo "<div class='card'>";
echo "<h3>🔑 Key Values Sent</h3>";
echo "<table style='width:100%; border-collapse: collapse;'>";
echo "<tr style='background:#f1f5f9;'><th style='padding:8px; text-align:left;'>Parameter</th><th style='padding:8px; text-align:right;'>Value</th></tr>";

$keyParams = [
    'raw_biogas_flow' => 'Nm³/hr',
    'purified_gas_flow' => 'Nm³/hr',
    'product_gas_flow' => 'Nm³/hr',
    'ch4_concentration' => '%',
    'co2_level' => '%',
    'h2s_content' => 'ppm',
    'd1_temp_bottom' => '°C',
    'd2_temp_bottom' => '°C',
    'buffer_tank_level' => '%',
    'lagoon_tank_level' => '%',
    'psa_efficiency' => '%'
];

foreach ($keyParams as $param => $unit) {
    echo "<tr><td style='padding:8px;'>{$param}</td><td style='padding:8px; text-align:right; font-family:monospace;'>{$data[$param]} {$unit}</td></tr>";
}
echo "</table>";
echo "</div>";

// Stop condition
if ($readingNumber >= $totalReadings) {
    $_SESSION['reading_count'] = 0;
    echo "<div class='card info'>";
    echo "<h3>✅ Simulation Complete!</h3>";
    echo "<p>Generated {$totalReadings} readings over {$duration} minutes.</p>";
    echo "<p><a href='auto_simulate.php?duration={$duration}&interval={$interval}'>🔄 Start New Simulation</a></p>";
    echo "</div>";
    echo "<script>// Stop auto-refresh</script>";
} else {
    echo "<div class='card info'>";
    echo "<p>⏳ Next reading in {$interval} seconds... (Page will auto-refresh)</p>";
    echo "<p><a href='auto_simulate.php?stop=1'>🛑 Stop Simulation</a></p>";
    echo "</div>";
}

// Handle stop
if (isset($_GET['stop'])) {
    $_SESSION['reading_count'] = 0;
    echo "<script>window.location.href='simulate.php';</script>";
}

echo "</body></html>";
?>
