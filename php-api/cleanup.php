<?php
/**
 * Database Cleanup Script
 * Removes records with incomplete/NULL data
 * 
 * URL: http://localhost/scada-api/cleanup.php
 */

require_once 'config.php';

header('Content-Type: text/html; charset=UTF-8');

echo "<h1>🧹 Database Cleanup</h1>";

$pdo = getDBConnection();
if (!$pdo) {
    echo "<p style='color:red;'>❌ Database connection failed</p>";
    exit;
}

// Count records before cleanup
$countBefore = $pdo->query("SELECT COUNT(*) as cnt FROM scada_readings")->fetch()['cnt'];
echo "<p><strong>Records before cleanup:</strong> {$countBefore}</p>";

// Delete records where key fields are NULL (incomplete records)
$sql = "DELETE FROM scada_readings WHERE 
        purified_gas_flow IS NULL 
        OR product_gas_flow IS NULL 
        OR co2_level IS NULL 
        OR h2s_content IS NULL
        OR plant_id = 'TEST_DEBUG'";

$deleted = $pdo->exec($sql);
echo "<p style='color:green;'>✅ Deleted {$deleted} incomplete records</p>";

// Count records after cleanup
$countAfter = $pdo->query("SELECT COUNT(*) as cnt FROM scada_readings")->fetch()['cnt'];
echo "<p><strong>Records after cleanup:</strong> {$countAfter}</p>";

// Show remaining records
echo "<h2>Remaining Records</h2>";
$records = $pdo->query("SELECT id, plant_id, timestamp, raw_biogas_flow, purified_gas_flow, ch4_concentration, h2s_content FROM scada_readings ORDER BY timestamp DESC LIMIT 10");
echo "<table border='1' cellpadding='5'>";
echo "<tr><th>ID</th><th>Plant</th><th>Timestamp</th><th>Raw Flow</th><th>Purified Flow</th><th>CH4</th><th>H2S</th></tr>";
while ($row = $records->fetch(PDO::FETCH_ASSOC)) {
    echo "<tr>";
    echo "<td>{$row['id']}</td>";
    echo "<td>{$row['plant_id']}</td>";
    echo "<td>{$row['timestamp']}</td>";
    echo "<td>{$row['raw_biogas_flow']}</td>";
    echo "<td>{$row['purified_gas_flow']}</td>";
    echo "<td>{$row['ch4_concentration']}</td>";
    echo "<td>{$row['h2s_content']}</td>";
    echo "</tr>";
}
echo "</table>";

echo "<hr>";
echo "<p><a href='simulate.php'>➡️ Go to Simulator</a> to add fresh complete data</p>";
?>
