<?php
/**
 * Database Connection Test
 * Upload this file and access it to test DB connection
 */

header('Content-Type: application/json');

// Test different host options
$hosts_to_try = ['localhost', '127.0.0.1', '119.18.49.27'];
$db_name = 'illionss_karnal_lre';
$db_user = 'illionss_karnal_lre';
$db_pass = 'xkA}Iu$l~Vrw3r.Vp+';

$results = [];

foreach ($hosts_to_try as $host) {
    try {
        $dsn = "mysql:host=$host;dbname=$db_name;charset=utf8mb4";
        $pdo = new PDO($dsn, $db_user, $db_pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_TIMEOUT => 5
        ]);
        
        // Test query
        $stmt = $pdo->query("SELECT 1 as test");
        $result = $stmt->fetch();
        
        $results[$host] = [
            'status' => 'SUCCESS',
            'message' => 'Connected successfully!',
            'test_query' => $result
        ];
        
        // Check if tables exist
        $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
        $results[$host]['tables'] = $tables;
        $results[$host]['table_count'] = count($tables);
        
    } catch (PDOException $e) {
        $results[$host] = [
            'status' => 'FAILED',
            'error' => $e->getMessage()
        ];
    }
}

echo json_encode([
    'test_time' => date('Y-m-d H:i:s'),
    'php_version' => phpversion(),
    'results' => $results
], JSON_PRETTY_PRINT);
?>
