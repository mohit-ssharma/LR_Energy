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

// Configuration
$API_URL = 'http://localhost/scada-api/receive_data.php';
$API_KEY = 'sk_prod_LREnergy_283669e54e512351a5bde265e20da2149fd4b54569a7e12b1ee8226746a6a2a7';

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

// Generate realistic data with slight variations
function generateRealisticData($readingNumber) {
    $timestamp = date('Y-m-d H:i:s');
    
    // Simulate gradual changes over time
    $hourOfDay = (int)date('H');
    $dayFactor = sin(deg2rad($hourOfDay * 15)) * 0.1; // Daily variation
    
    // Randomly decide if this reading has any issues (10% chance)
    $hasIssue = rand(1, 100) <= 10;
    $issueType = $hasIssue ? rand(1, 4) : 0;
    
    $data = [
        'plant_id' => 'KARNAL',
        'timestamp' => $timestamp,
        
        // Gas Flow - slight variations
        'raw_biogas_flow' => round(1250 + (rand(-30, 30)) + ($dayFactor * 50), 2),
        'raw_biogas_totalizer' => round(150000 + ($readingNumber * 20.8), 2),
        'purified_gas_flow' => round(1180 + (rand(-25, 25)) + ($dayFactor * 45), 2),
        'purified_gas_totalizer' => round(142000 + ($readingNumber * 19.7), 2),
        'product_gas_flow' => round(1150 + (rand(-20, 20)) + ($dayFactor * 40), 2),
        'product_gas_totalizer' => round(138000 + ($readingNumber * 19.2), 2),
        
        // Gas Composition
        'ch4_concentration' => round(96.8 + (rand(-5, 5) / 10), 2),
        'co2_level' => round(2.9 + (rand(-3, 3) / 10), 2),
        'o2_concentration' => round(0.3 + (rand(-1, 1) / 10), 2),
        'h2s_content' => round(3 + (rand(0, 10) / 10), 2),  // Normal: < 5 ppm
        'dew_point' => round(-68 + rand(-3, 3), 2),
        
        // Digester 1
        'd1_temp_bottom' => round(37 + (rand(-10, 10) / 10), 2),
        'd1_temp_top' => round(36.5 + (rand(-10, 10) / 10), 2),
        'd1_gas_pressure' => round(32 + rand(-3, 3), 2),
        'd1_air_pressure' => round(18 + rand(-2, 2), 2),
        'd1_slurry_height' => round(7.6 + (rand(-3, 3) / 10), 2),
        'd1_gas_level' => round(75 + rand(-5, 5), 2),
        
        // Digester 2
        'd2_temp_bottom' => round(36.5 + (rand(-10, 10) / 10), 2),
        'd2_temp_top' => round(36 + (rand(-10, 10) / 10), 2),
        'd2_gas_pressure' => round(30 + rand(-3, 3), 2),
        'd2_air_pressure' => round(17 + rand(-2, 2), 2),
        'd2_slurry_height' => round(7.3 + (rand(-3, 3) / 10), 2),
        'd2_gas_level' => round(72 + rand(-5, 5), 2),
        
        // Tank Levels
        'buffer_tank_level' => round(82 + rand(-5, 5), 2),
        'lagoon_tank_level' => round(76 + rand(-5, 5), 2),
        
        // Water Flow
        'feed_fm1_flow' => round(42 + rand(-3, 3), 2),
        'feed_fm1_totalizer' => round(5000 + ($readingNumber * 0.7), 2),
        'feed_fm2_flow' => round(38 + rand(-3, 3), 2),
        'feed_fm2_totalizer' => round(4500 + ($readingNumber * 0.63), 2),
        'fresh_water_flow' => round(12 + rand(-2, 2), 2),
        'fresh_water_totalizer' => round(1500 + ($readingNumber * 0.2), 2),
        'recycle_water_flow' => round(26 + rand(-3, 3), 2),
        'recycle_water_totalizer' => round(3000 + ($readingNumber * 0.43), 2),
        
        // Equipment
        'psa_status' => 1,
        'psa_efficiency' => round(94.4 + (rand(-10, 10) / 10), 2),
        'lt_panel_power' => round(245 + rand(-15, 15), 2),
        'compressor_status' => 1
    ];
    
    // Inject issues for testing alerts
    $issueDescription = 'Normal operation';
    if ($issueType == 1) {
        $data['ch4_concentration'] = 94.5; // Below 96%
        $issueDescription = '⚠️ Low CH₄ concentration';
    } elseif ($issueType == 2) {
        $data['h2s_content'] = 550; // Above 500
        $issueDescription = '⚠️ High H₂S content';
    } elseif ($issueType == 3) {
        $data['d1_temp_bottom'] = 46; // Above 45
        $issueDescription = '⚠️ Digester 1 temperature high';
    } elseif ($issueType == 4) {
        $data['buffer_tank_level'] = 96; // Above 95
        $issueDescription = '⚠️ Buffer tank level high';
    }
    
    return ['data' => $data, 'issue' => $issueDescription];
}

// Generate data
$result = generateRealisticData($readingNumber);
$data = $result['data'];
$issueStatus = $result['issue'];

// Show issue status
$badgeClass = $issueStatus === 'Normal operation' ? 'badge-success' : 'badge-warning';
echo "<div class='card'>";
echo "<h3>📈 Reading Status</h3>";
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
    'ch4_concentration' => '%',
    'h2s_content' => 'ppm',
    'd1_temp_bottom' => '°C',
    'buffer_tank_level' => '%',
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
