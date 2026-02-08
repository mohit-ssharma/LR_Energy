# SCADA System - Production Considerations & Edge Cases
## Comprehensive Guide for Backend Implementation

---

## 1. DATA HANDLING - MISSING/INVALID DATA FROM SCADA

### 1.1 Scenarios When Data May Not Come from SCADA

| Scenario | Cause | Impact |
|----------|-------|--------|
| **Network Failure** | Internet/LAN down at plant | No data received |
| **SCADA System Down** | PLC maintenance, power outage | No data received |
| **Sensor Malfunction** | Faulty sensor, calibration issue | NULL or out-of-range values |
| **Partial Data** | Some sensors working, others not | Incomplete row |
| **Delayed Data** | Slow network, queue backlog | Stale data |
| **Duplicate Data** | Retry logic, network glitch | Same timestamp twice |

### 1.2 How to Handle Each Scenario

#### A) Complete Data Loss (No Row Received)

```php
// PHP Backend Logic
function checkDataFreshness($lastTimestamp) {
    $now = time();
    $lastUpdate = strtotime($lastTimestamp);
    $gap = $now - $lastUpdate;
    
    if ($gap > 120) { // More than 2 minutes
        return [
            'status' => 'STALE',
            'message' => 'Data not received for ' . floor($gap/60) . ' minutes',
            'lastUpdate' => $lastTimestamp
        ];
    }
    return ['status' => 'FRESH'];
}
```

**Frontend Display:**
- Show warning banner: "⚠️ Data is X minutes old"
- Keep showing last known values with timestamp
- Gray out or dim affected sections

#### B) NULL Values for Specific Parameters

```php
// PHP Backend Logic
function sanitizeReading($value, $paramName, $default = null) {
    if ($value === null || $value === '' || $value === 'NaN') {
        logMissingData($paramName);
        return [
            'value' => $default,
            'status' => 'NO_DATA',
            'message' => 'Sensor data unavailable'
        ];
    }
    return ['value' => $value, 'status' => 'OK'];
}
```

**Frontend Display:**
- Show "--" or "N/A" instead of value
- Show "Sensor Offline" badge
- Don't include in calculations

#### C) Out-of-Range Values (Sensor Malfunction)

```php
// PHP Backend Logic - Validation Rules
$validationRules = [
    'raw_biogas_flow' => ['min' => 0, 'max' => 5000],
    'ch4_concentration' => ['min' => 0, 'max' => 100],
    'h2s_content' => ['min' => 0, 'max' => 2000],
    'd1_temperature' => ['min' => 0, 'max' => 80],
    'buffer_tank_level' => ['min' => 0, 'max' => 100],
    // ... all parameters
];

function validateReading($value, $paramName) {
    global $validationRules;
    $rules = $validationRules[$paramName];
    
    if ($value < $rules['min'] || $value > $rules['max']) {
        logAnomalousData($paramName, $value);
        return [
            'value' => $value,
            'status' => 'ANOMALY',
            'message' => "Value {$value} outside expected range"
        ];
    }
    return ['value' => $value, 'status' => 'OK'];
}
```

#### D) Duplicate Timestamps

```php
// PHP Backend Logic
function insertReading($data) {
    // Check for duplicate
    $existing = $db->query(
        "SELECT id FROM scada_readings WHERE timestamp = ?", 
        [$data['timestamp']]
    );
    
    if ($existing) {
        // Update instead of insert (latest values win)
        return updateReading($existing['id'], $data);
    }
    
    return insertNewReading($data);
}
```

---

## 2. REPORTING SECTION - LOGIC & EDGE CASES

### 2.1 Report Generation Logic

```php
// PHP Backend - Report Generation
function generateReport($params) {
    $startDate = $params['start_date'];
    $endDate = $params['end_date'];
    $reportType = $params['type'];
    $selectedParams = $params['parameters'];
    
    // 1. Fetch raw data
    $data = fetchDataRange($startDate, $endDate);
    
    // 2. Handle missing data in range
    $dataQuality = assessDataQuality($data, $startDate, $endDate);
    
    // 3. Calculate statistics
    $stats = calculateStatistics($data, $selectedParams);
    
    // 4. Generate report with quality indicator
    return [
        'data' => $data,
        'statistics' => $stats,
        'quality' => $dataQuality,
        'generated_at' => date('Y-m-d H:i:s')
    ];
}
```

### 2.2 Report Edge Cases

| Edge Case | Handling Strategy |
|-----------|-------------------|
| **No data in selected range** | Show "No data available" message, prevent empty report |
| **Partial data** | Generate report with data quality warning (e.g., "75% data coverage") |
| **Very large date range** | Paginate results, aggregate to hourly/daily for ranges > 7 days |
| **Future date selected** | Prevent selection, show error |
| **Parameter not available for full range** | Show available data with footnote |

### 2.3 Data Quality Indicator

```php
function assessDataQuality($data, $startDate, $endDate) {
    $expectedRecords = calculateExpectedRecords($startDate, $endDate); // 1 per minute
    $actualRecords = count($data);
    $coverage = ($actualRecords / $expectedRecords) * 100;
    
    // Check for gaps
    $gaps = findDataGaps($data);
    
    return [
        'coverage_percent' => round($coverage, 1),
        'expected_records' => $expectedRecords,
        'actual_records' => $actualRecords,
        'missing_records' => $expectedRecords - $actualRecords,
        'gaps' => $gaps,
        'quality_status' => $coverage >= 95 ? 'GOOD' : ($coverage >= 80 ? 'FAIR' : 'POOR')
    ];
}
```

---

## 3. CALCULATION EDGE CASES

### 3.1 Division by Zero

```php
// PSA Efficiency = (Purified Gas / Raw Biogas) * 100
function calculatePSAEfficiency($purified, $raw) {
    if ($raw == 0 || $raw === null) {
        return [
            'value' => null,
            'status' => 'CANNOT_CALCULATE',
            'message' => 'Raw Biogas Flow is zero or unavailable'
        ];
    }
    return [
        'value' => round(($purified / $raw) * 100, 1),
        'status' => 'OK'
    ];
}
```

### 3.2 Average Calculations with Missing Data

```php
// Avg 12 Hr with missing data handling
function calculateAverage($data, $paramName, $hours) {
    $records = $hours * 60; // Expected records
    $values = array_filter($data, function($row) use ($paramName) {
        return $row[$paramName] !== null;
    });
    
    if (count($values) == 0) {
        return ['value' => null, 'status' => 'NO_DATA'];
    }
    
    $sum = array_sum(array_column($values, $paramName));
    $avg = $sum / count($values);
    
    // Include data quality
    $coverage = (count($values) / $records) * 100;
    
    return [
        'value' => round($avg, 2),
        'status' => $coverage >= 80 ? 'OK' : 'PARTIAL',
        'coverage' => round($coverage, 1),
        'samples' => count($values)
    ];
}
```

### 3.3 Totalizer Calculations

```php
// Totalizer 24 Hr with gap handling
function calculateTotalizer($data, $paramName) {
    $values = array_filter($data, function($row) use ($paramName) {
        return $row[$paramName] !== null && $row[$paramName] > 0;
    });
    
    if (count($values) == 0) {
        return ['value' => null, 'status' => 'NO_DATA'];
    }
    
    // Sum flow rates (each record = 1 minute of flow)
    // Total = sum of (flow_rate * 1 minute) = sum of flow_rates / 60 (for hourly)
    $total = array_sum(array_column($values, $paramName));
    
    return [
        'value' => round($total, 0),
        'status' => 'OK',
        'samples' => count($values)
    ];
}
```

---

## 4. NEGATIVE TEST SCENARIOS

### 4.1 Data Ingestion Tests

| Test Case | Input | Expected Behavior |
|-----------|-------|-------------------|
| Empty payload | `{}` | Return 400 error, log attempt |
| Missing required fields | Partial data | Accept with NULL for missing |
| Invalid timestamp | `"2026-13-45 99:99:99"` | Reject, return 400 error |
| Future timestamp | Tomorrow's date | Reject or flag as suspicious |
| Negative values | `raw_biogas_flow: -100` | Flag as anomaly, store with warning |
| Extremely high values | `ch4: 500` | Flag as anomaly, store with warning |
| SQL injection attempt | `"'; DROP TABLE--"` | Sanitize, reject, log security alert |
| Duplicate timestamp | Same as existing | Update existing record |

### 4.2 Dashboard API Tests

| Test Case | Expected Behavior |
|-----------|-------------------|
| No data in database | Return empty state with message |
| Data older than 5 minutes | Return data with STALE warning |
| Calculation returns NaN/Infinity | Return null with error status |
| Database connection failure | Return 500 error with retry suggestion |

### 4.3 Trends API Tests

| Test Case | Expected Behavior |
|-----------|-------------------|
| Invalid date range (end < start) | Return 400 error |
| Range > 30 days | Aggregate to hourly, warn about size |
| No data in range | Return empty array with message |
| Invalid parameter name | Return 400 error, list valid params |

### 4.4 Reports API Tests

| Test Case | Expected Behavior |
|-----------|-------------------|
| Generate report with no data | Return error, prevent empty PDF |
| PDF generation timeout | Return partial data, allow retry |
| CSV with special characters | Properly escape all values |
| Concurrent report requests | Queue requests, prevent server overload |

---

## 5. SYNC SCRIPT EDGE CASES (Plant PC → GoDaddy)

### 5.1 Network Failure Handling

```python
# Python Sync Script with Retry Logic
import requests
import time
import logging

MAX_RETRIES = 3
RETRY_DELAY = 30  # seconds

def sync_data(data):
    for attempt in range(MAX_RETRIES):
        try:
            response = requests.post(
                'https://karnal.lrenergy.in/api/receive_data.php',
                json=data,
                timeout=30
            )
            if response.status_code == 200:
                logging.info(f"Sync successful: {data['timestamp']}")
                return True
            else:
                logging.error(f"Sync failed: {response.status_code}")
        except requests.exceptions.RequestException as e:
            logging.error(f"Network error: {e}")
        
        if attempt < MAX_RETRIES - 1:
            logging.info(f"Retrying in {RETRY_DELAY} seconds...")
            time.sleep(RETRY_DELAY)
    
    # Store locally for later sync
    store_locally(data)
    return False

def store_locally(data):
    # Save to local file for manual sync later
    with open('pending_sync.json', 'a') as f:
        f.write(json.dumps(data) + '\n')
```

### 5.2 Local SCADA Connection Failure

```python
def read_from_scada():
    try:
        # Connect to local SQL Server
        conn = pyodbc.connect(CONNECTION_STRING, timeout=10)
        cursor = conn.cursor()
        cursor.execute("SELECT TOP 1 * FROM scada_data ORDER BY timestamp DESC")
        row = cursor.fetchone()
        conn.close()
        return row
    except Exception as e:
        logging.error(f"SCADA connection failed: {e}")
        return None
```

---

## 6. FRONTEND EDGE CASES

### 6.1 Display States

| State | UI Behavior |
|-------|-------------|
| **Loading** | Show skeleton/spinner |
| **Data Fresh** | Normal display |
| **Data Stale (2-5 min)** | Yellow warning banner |
| **Data Very Stale (>5 min)** | Red warning, suggest refresh |
| **No Data** | Show "No data available" card |
| **Partial Data** | Show available data, gray out missing |
| **Error** | Show error message, retry button |

### 6.2 Auto-Refresh Edge Cases

```javascript
// Handle refresh when tab is inactive
useEffect(() => {
  let interval;
  
  const handleVisibilityChange = () => {
    if (document.hidden) {
      clearInterval(interval);
    } else {
      fetchData(); // Refresh immediately when tab becomes visible
      interval = setInterval(fetchData, 60000);
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  interval = setInterval(fetchData, 60000);
  
  return () => {
    clearInterval(interval);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, []);
```

---

## 7. SECURITY CONSIDERATIONS

| Risk | Mitigation |
|------|------------|
| **Unauthorized data injection** | API key authentication for sync script |
| **SQL Injection** | Parameterized queries, input sanitization |
| **XSS in reports** | Escape all user-generated content |
| **Brute force login** | Rate limiting, account lockout |
| **Data tampering** | Checksum validation, audit logs |

---

## 8. MONITORING & ALERTS

### 8.1 System Health Checks

```php
// Health check endpoint
function getSystemHealth() {
    return [
        'database' => checkDatabaseConnection(),
        'last_data_received' => getLastDataTimestamp(),
        'data_freshness' => checkDataFreshness(),
        'disk_space' => checkDiskSpace(),
        'error_rate_24h' => getErrorRate()
    ];
}
```

### 8.2 Alert Conditions

| Condition | Alert Level | Action |
|-----------|-------------|--------|
| No data for 5 minutes | Warning | Email notification |
| No data for 15 minutes | Critical | SMS notification |
| Disk space < 20% | Warning | Email notification |
| Database error rate > 5% | Critical | Immediate investigation |
| Anomalous values detected | Info | Log for review |

---

## 9. SUMMARY - IMPLEMENTATION CHECKLIST

### Backend (PHP)
- [ ] Input validation for all 22 parameters
- [ ] NULL handling for missing values
- [ ] Division by zero protection
- [ ] Data freshness tracking
- [ ] Duplicate timestamp handling
- [ ] Error logging
- [ ] API authentication

### Database (MySQL)
- [ ] Proper indexes on timestamp
- [ ] Data retention policy (auto-archive old data)
- [ ] Backup strategy

### Sync Script
- [ ] Retry logic with exponential backoff
- [ ] Local caching for offline scenarios
- [ ] Connection timeout handling
- [ ] Logging for troubleshooting

### Frontend
- [ ] Loading states
- [ ] Error states
- [ ] Stale data warnings
- [ ] Graceful degradation for missing values
- [ ] Tab visibility handling for refresh

---

**Document Version:** 1.0  
**Created:** February 2026  
**Purpose:** Guide for production-ready SCADA backend implementation
