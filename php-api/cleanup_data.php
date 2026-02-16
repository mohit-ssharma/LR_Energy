<?php
/**
 * Database Cleanup Script for Production
 * 
 * Safely removes test/dummy data from the database
 * 
 * Usage: 
 * - Visit: https://karnal.lrenergy.in/scada-api/cleanup_data.php?confirm=yes
 * - Delete this file after use!
 * 
 * Safety: Only deletes scada_readings data, preserves users and settings
 */

require_once 'cors.php';
require_once 'config.php';

header('Content-Type: text/html; charset=UTF-8');

$confirm = isset($_GET['confirm']) && $_GET['confirm'] === 'yes';
$deleteBeforeDate = isset($_GET['before']) ? $_GET['before'] : null;
$deleteAll = isset($_GET['all']) && $_GET['all'] === 'yes';

?>
<!DOCTYPE html>
<html>
<head>
    <title>Database Cleanup - Production</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; background: #f5f5f5; }
        .card { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin: 20px 0; }
        .danger { background: #fee2e2; border: 2px solid #ef4444; }
        .success { background: #d1fae5; border: 2px solid #10b981; }
        .warning { background: #fef3c7; border: 2px solid #f59e0b; }
        .info { background: #dbeafe; border: 2px solid #3b82f6; }
        h1 { color: #1e293b; }
        .btn { display: inline-block; padding: 12px 24px; margin: 10px 5px; border-radius: 6px; text-decoration: none; color: white; font-weight: bold; }
        .btn-danger { background: #ef4444; }
        .btn-warning { background: #f59e0b; }
        .btn-primary { background: #3b82f6; }
        .btn-success { background: #10b981; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { padding: 12px; border: 1px solid #e2e8f0; text-align: left; }
        th { background: #f1f5f9; }
        code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 14px; }
        .count { font-size: 32px; font-weight: bold; color: #3b82f6; }
    </style>
</head>
<body>
    <h1>🗑️ Database Cleanup - Production</h1>
    
<?php

try {
    $pdo = getDBConnection();
    
    if (!$pdo) {
        echo "<div class='card danger'><h2>❌ Database Connection Failed</h2></div>";
        exit;
    }
    
    // Get current data statistics
    $stats = $pdo->query("SELECT 
        COUNT(*) as total_records,
        MIN(timestamp) as oldest_record,
        MAX(timestamp) as newest_record,
        COUNT(DISTINCT DATE(timestamp)) as total_days
    FROM scada_readings")->fetch(PDO::FETCH_ASSOC);
    
    $totalRecords = intval($stats['total_records']);
    
    echo "<div class='card info'>";
    echo "<h2>📊 Current Database Status</h2>";
    echo "<table>";
    echo "<tr><th>Total Records</th><td class='count'>{$totalRecords}</td></tr>";
    echo "<tr><th>Oldest Record</th><td>" . ($stats['oldest_record'] ?: 'N/A') . "</td></tr>";
    echo "<tr><th>Newest Record</th><td>" . ($stats['newest_record'] ?: 'N/A') . "</td></tr>";
    echo "<tr><th>Days with Data</th><td>" . $stats['total_days'] . " days</td></tr>";
    echo "</table>";
    echo "</div>";
    
    // Get data breakdown by date
    $byDate = $pdo->query("SELECT 
        DATE(timestamp) as date, 
        COUNT(*) as count 
    FROM scada_readings 
    GROUP BY DATE(timestamp) 
    ORDER BY date DESC 
    LIMIT 10")->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($byDate) > 0) {
        echo "<div class='card'>";
        echo "<h2>📅 Records by Date (Last 10 Days)</h2>";
        echo "<table>";
        echo "<tr><th>Date</th><th>Records</th><th>Action</th></tr>";
        foreach ($byDate as $row) {
            $date = $row['date'];
            $count = $row['count'];
            echo "<tr>";
            echo "<td><strong>{$date}</strong></td>";
            echo "<td>{$count}</td>";
            echo "<td><a href='?confirm=yes&before={$date}' class='btn btn-warning' onclick=\"return confirm('Delete all records BEFORE {$date}?')\">Delete Before This</a></td>";
            echo "</tr>";
        }
        echo "</table>";
        echo "</div>";
    }
    
    // Process deletion if confirmed
    if ($confirm) {
        echo "<div class='card warning'>";
        echo "<h2>⚠️ Processing Deletion...</h2>";
        
        $deleted = 0;
        
        if ($deleteAll) {
            // Delete ALL records
            $stmt = $pdo->prepare("DELETE FROM scada_readings");
            $stmt->execute();
            $deleted = $stmt->rowCount();
            echo "<p>✅ Deleted ALL {$deleted} records from scada_readings</p>";
            
        } elseif ($deleteBeforeDate) {
            // Delete records BEFORE specified date
            $stmt = $pdo->prepare("DELETE FROM scada_readings WHERE DATE(timestamp) < ?");
            $stmt->execute([$deleteBeforeDate]);
            $deleted = $stmt->rowCount();
            echo "<p>✅ Deleted {$deleted} records before {$deleteBeforeDate}</p>";
            
        } else {
            // Delete only today's test data (safe default)
            $today = date('Y-m-d');
            $stmt = $pdo->prepare("DELETE FROM scada_readings WHERE DATE(timestamp) = ?");
            $stmt->execute([$today]);
            $deleted = $stmt->rowCount();
            echo "<p>✅ Deleted {$deleted} records from today ({$today})</p>";
        }
        
        // Show remaining count
        $remaining = $pdo->query("SELECT COUNT(*) FROM scada_readings")->fetchColumn();
        echo "<p><strong>Remaining records:</strong> {$remaining}</p>";
        echo "</div>";
        
        echo "<div class='card success'>";
        echo "<h2>✅ Cleanup Complete!</h2>";
        echo "<p><a href='cleanup_data.php' class='btn btn-primary'>Refresh Status</a></p>";
        echo "</div>";
    }
    
    // Show cleanup options
    if (!$confirm) {
        echo "<div class='card danger'>";
        echo "<h2>🗑️ Cleanup Options</h2>";
        echo "<p><strong>Choose what to delete:</strong></p>";
        
        echo "<p>";
        echo "<a href='?confirm=yes' class='btn btn-warning' onclick=\"return confirm('Delete TODAY\\'s data only?')\">Delete Today's Data</a> ";
        echo "<a href='?confirm=yes&all=yes' class='btn btn-danger' onclick=\"return confirm('⚠️ DELETE ALL DATA? This cannot be undone!')\">Delete ALL Data</a>";
        echo "</p>";
        
        echo "<h3>Or delete by date:</h3>";
        echo "<p>Click 'Delete Before This' in the table above to remove old data.</p>";
        echo "</div>";
        
        echo "<div class='card warning'>";
        echo "<h2>⚠️ Important</h2>";
        echo "<ul>";
        echo "<li><strong>DELETE this file after cleanup!</strong></li>";
        echo "<li>User accounts are NOT affected</li>";
        echo "<li>Only SCADA readings data is deleted</li>";
        echo "<li>This action cannot be undone</li>";
        echo "</ul>";
        echo "</div>";
    }
    
} catch (PDOException $e) {
    echo "<div class='card danger'><h2>❌ Error</h2><p>" . $e->getMessage() . "</p></div>";
}

?>

    <div class="card info">
        <h2>🔒 Security Reminder</h2>
        <p><strong>Delete this file after use:</strong></p>
        <code>rm /public_html/scada-api/cleanup_data.php</code>
    </div>
    
</body>
</html>
