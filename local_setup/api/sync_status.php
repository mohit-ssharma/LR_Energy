<?php
/**
 * Last Sync Status API Endpoint
 * URL: /api/sync_status.php
 * Method: GET
 * 
 * Returns the last sync timestamp and status
 * Used by sync script to check for data gaps on startup
 */

require_once 'config.php';

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Method not allowed. Use GET.', 405);
}

// Connect to database
$pdo = getDBConnection();
if (!$pdo) {
    sendError('Database connection failed', 500);
}

try {
    // Get last successful reading timestamp
    $stmt = $pdo->query("
        SELECT timestamp 
        FROM scada_readings 
        WHERE plant_id = '" . PLANT_ID . "' 
        ORDER BY timestamp DESC 
        LIMIT 1
    ");
    $lastReading = $stmt->fetch();
    
    // Get last sync status
    $stmtSync = $pdo->query("
        SELECT * 
        FROM sync_status 
        WHERE plant_id = '" . PLANT_ID . "' 
        ORDER BY last_sync_time DESC 
        LIMIT 1
    ");
    $lastSync = $stmtSync->fetch();
    
    // Get sync statistics for last 24 hours
    $stmtStats = $pdo->query("
        SELECT 
            COUNT(*) as total_syncs,
            SUM(CASE WHEN last_sync_status = 'SUCCESS' THEN 1 ELSE 0 END) as successful_syncs,
            SUM(CASE WHEN last_sync_status = 'FAILED' THEN 1 ELSE 0 END) as failed_syncs
        FROM sync_status 
        WHERE plant_id = '" . PLANT_ID . "' 
        AND last_sync_time >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    ");
    $syncStats = $stmtStats->fetch();
    
    $response = [
        'status' => 'success',
        'plant_id' => PLANT_ID,
        'last_reading_timestamp' => $lastReading ? $lastReading['timestamp'] : null,
        'last_sync' => $lastSync ? [
            'time' => $lastSync['last_sync_time'],
            'status' => $lastSync['last_sync_status'],
            'records_synced' => intval($lastSync['records_synced']),
            'error_message' => $lastSync['error_message'],
            'ip_address' => $lastSync['ip_address']
        ] : null,
        'stats_24hr' => [
            'total_syncs' => intval($syncStats['total_syncs']),
            'successful' => intval($syncStats['successful_syncs']),
            'failed' => intval($syncStats['failed_syncs']),
            'success_rate' => $syncStats['total_syncs'] > 0 
                ? round((intval($syncStats['successful_syncs']) / intval($syncStats['total_syncs'])) * 100, 1) 
                : 0
        ],
        'server_time' => date('Y-m-d H:i:s')
    ];
    
    sendResponse($response);
    
} catch (PDOException $e) {
    error_log("Sync status error: " . $e->getMessage());
    sendError('Failed to fetch sync status', 500);
}
?>
