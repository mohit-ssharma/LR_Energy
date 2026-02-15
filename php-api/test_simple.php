<?php
// Simple DB Test - No fancy stuff
header('Content-Type: text/plain');

echo "=== DATABASE CONNECTION TEST ===\n\n";

$db_name = 'illionss_karnal_lre';
$db_user = 'illionss_karnal_lre';
$db_pass = 'xkA}Iu$l~Vrw3r.Vp+';

// Test 1: localhost
echo "Testing localhost... ";
try {
    $pdo = new PDO("mysql:host=localhost;dbname=$db_name", $db_user, $db_pass);
    echo "SUCCESS!\n";
} catch (Exception $e) {
    echo "FAILED: " . $e->getMessage() . "\n";
}

// Test 2: 127.0.0.1
echo "Testing 127.0.0.1... ";
try {
    $pdo = new PDO("mysql:host=127.0.0.1;dbname=$db_name", $db_user, $db_pass);
    echo "SUCCESS!\n";
} catch (Exception $e) {
    echo "FAILED: " . $e->getMessage() . "\n";
}

// Test 3: IP Address
echo "Testing 119.18.49.27... ";
try {
    $pdo = new PDO("mysql:host=119.18.49.27;dbname=$db_name", $db_user, $db_pass);
    echo "SUCCESS!\n";
} catch (Exception $e) {
    echo "FAILED: " . $e->getMessage() . "\n";
}

echo "\n=== PHP INFO ===\n";
echo "PHP Version: " . phpversion() . "\n";
echo "PDO Drivers: " . implode(", ", PDO::getAvailableDrivers()) . "\n";
?>
