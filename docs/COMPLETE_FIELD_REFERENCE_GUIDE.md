# SCADA System - Complete Field Reference Guide

## Document Overview
This document explains **EVERY field** in the SCADA system:
- Where the data comes from (Source)
- How it's calculated (Formula)
- What determines its status (Status Logic)

---

# PART 1: DATA SOURCES

## 1.1 Raw Data Input (From SCADA → Database)

Every **60 seconds**, the Python sync script reads 36 values from Siemens SCADA and sends them via POST to `receive_data.php`:

```
SCADA System (Siemens WinCC)
        ↓
    Python Sync Script
        ↓
    POST /api/receive_data.php
        ↓
    MySQL Table: scada_readings
```

### Database Table Structure:

| Column Name | Data Type | Unit | Source |
|-------------|-----------|------|--------|
| `id` | INT | - | Auto-generated |
| `timestamp` | DATETIME | - | Sync script sends current time |
| `raw_biogas_flow` | DECIMAL(10,2) | Nm³/hr | SCADA Tag |
| `raw_biogas_totalizer` | DECIMAL(15,2) | Nm³ | SCADA Tag |
| `purified_gas_flow` | DECIMAL(10,2) | Nm³/hr | SCADA Tag |
| `purified_gas_totalizer` | DECIMAL(15,2) | Nm³ | SCADA Tag |
| `product_gas_flow` | DECIMAL(10,2) | Nm³/hr | SCADA Tag |
| `product_gas_totalizer` | DECIMAL(15,2) | Nm³ | SCADA Tag |
| `ch4_concentration` | DECIMAL(5,2) | % | SCADA Tag |
| `co2_level` | DECIMAL(5,2) | % | SCADA Tag |
| `o2_concentration` | DECIMAL(5,2) | % | SCADA Tag |
| `h2s_content` | DECIMAL(10,2) | ppm | SCADA Tag |
| `dew_point` | DECIMAL(10,2) | mg/m³ | SCADA Tag |
| `d1_temp_bottom` | DECIMAL(5,2) | °C | SCADA Tag |
| `d1_temp_top` | DECIMAL(5,2) | °C | SCADA Tag |
| `d1_gas_pressure` | DECIMAL(10,2) | mbar | SCADA Tag |
| `d1_air_pressure` | DECIMAL(10,2) | mbar | SCADA Tag |
| `d1_slurry_height` | DECIMAL(5,2) | m | SCADA Tag |
| `d1_gas_level` | DECIMAL(5,2) | % | SCADA Tag |
| `d2_temp_bottom` | DECIMAL(5,2) | °C | SCADA Tag |
| `d2_temp_top` | DECIMAL(5,2) | °C | SCADA Tag |
| `d2_gas_pressure` | DECIMAL(10,2) | mbar | SCADA Tag |
| `d2_air_pressure` | DECIMAL(10,2) | mbar | SCADA Tag |
| `d2_slurry_height` | DECIMAL(5,2) | m | SCADA Tag |
| `d2_gas_level` | DECIMAL(5,2) | % | SCADA Tag |
| `buffer_tank_level` | DECIMAL(5,2) | % | SCADA Tag |
| `lagoon_tank_level` | DECIMAL(5,2) | % | SCADA Tag |
| `feed_fm1_flow` | DECIMAL(10,2) | m³/hr | SCADA Tag |
| `feed_fm1_totalizer` | DECIMAL(15,2) | m³ | SCADA Tag |
| `feed_fm2_flow` | DECIMAL(10,2) | m³/hr | SCADA Tag |
| `feed_fm2_totalizer` | DECIMAL(15,2) | m³ | SCADA Tag |
| `fresh_water_flow` | DECIMAL(10,2) | m³/hr | SCADA Tag |
| `fresh_water_totalizer` | DECIMAL(15,2) | m³ | SCADA Tag |
| `recycle_water_flow` | DECIMAL(10,2) | m³/hr | SCADA Tag |
| `recycle_water_totalizer` | DECIMAL(15,2) | m³ | SCADA Tag |
| `psa_efficiency` | DECIMAL(5,2) | % | SCADA Tag OR Calculated |
| `lt_panel_power` | DECIMAL(10,2) | kW | SCADA Tag |
| `compressor_status` | TINYINT(1) | 0/1 | SCADA Tag (0=Off, 1=On) |
| `plant_id` | VARCHAR(50) | - | Config constant |
| `created_at` | TIMESTAMP | - | Auto-generated |

---

# PART 2: DASHBOARD FIELDS (dashboard.php)

## 2.1 Data Freshness Status

### Source:
```php
$lastTimestamp = strtotime($latest['timestamp']);
$now = time();
$ageSeconds = $now - $lastTimestamp;
```

### Status Logic:
| Condition | Status | Meaning |
|-----------|--------|---------|
| `ageSeconds <= 120` | `FRESH` | Data received within 2 minutes |
| `ageSeconds > 120 AND <= 300` | `DELAYED` | Data is 2-5 minutes old |
| `ageSeconds > 300` | `STALE` | Data is older than 5 minutes |

### JSON Response:
```json
{
    "data_status": "FRESH",
    "data_age_seconds": 45,
    "last_update": "2025-02-12 10:30:00"
}
```

---

## 2.2 Current Values Section

### Source:
```sql
SELECT * FROM scada_readings 
WHERE plant_id = 'KARNAL' 
ORDER BY timestamp DESC 
LIMIT 1
```

### Fields:
| JSON Field | Database Column | Type | Example |
|------------|-----------------|------|---------|
| `current.raw_biogas_flow` | `raw_biogas_flow` | Direct | 1250.5 |
| `current.raw_biogas_totalizer` | `raw_biogas_totalizer` | Direct | 150000.0 |
| `current.purified_gas_flow` | `purified_gas_flow` | Direct | 1180.2 |
| `current.ch4_concentration` | `ch4_concentration` | Direct | 96.8 |
| `current.compressor_status` | `compressor_status` | Direct | 1 |
| ... | ... | ... | ... |

### Formula:
```
current.field = floatval($latest['database_column'])
```
**No calculation** - Direct value from latest database row.

---

## 2.3 One-Hour Averages (avg_1hr)

### Source:
```sql
SELECT 
    COUNT(*) as sample_count,
    COUNT(raw_biogas_flow) as raw_biogas_samples,
    COALESCE(AVG(raw_biogas_flow), 0) as avg_raw_biogas_flow,
    COALESCE(AVG(ch4_concentration), 0) as avg_ch4
FROM scada_readings 
WHERE plant_id = 'KARNAL' 
AND timestamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
```

### Fields & Calculations:

| JSON Field | Calculation | Example |
|------------|-------------|---------|
| `avg_1hr.raw_biogas_flow` | `AVG(raw_biogas_flow)` for last 60 min | 1248.5 |
| `avg_1hr.purified_gas_flow` | `AVG(purified_gas_flow)` for last 60 min | 1178.2 |
| `avg_1hr.ch4_concentration` | `AVG(ch4_concentration)` for last 60 min | 96.75 |
| `avg_1hr.sample_count` | `COUNT(*)` - Total rows in 1 hour | 58 |
| `avg_1hr.valid_samples` | `COUNT(raw_biogas_flow)` - Non-NULL rows | 55 |
| `avg_1hr.expected_samples` | Constant: 60 (1 per minute) | 60 |
| `avg_1hr.data_quality` | `(valid_samples / sample_count) × 100` | 94.8% |

### Formula Details:
```
AVG(column) = SUM(all non-NULL values) / COUNT(non-NULL values)

Example for 5 readings: [1250, 1248, NULL, 1252, 1249]
AVG = (1250 + 1248 + 1252 + 1249) / 4 = 1249.75
```

### NULL Handling:
```sql
COALESCE(AVG(raw_biogas_flow), 0)
-- If ALL values are NULL, returns 0 instead of NULL
```

---

## 2.4 Twelve-Hour Averages (avg_12hr)

### Source:
```sql
SELECT 
    COUNT(*) as sample_count,
    COALESCE(AVG(raw_biogas_flow), 0) as avg_raw_biogas_flow,
    ...
FROM scada_readings 
WHERE plant_id = 'KARNAL' 
AND timestamp >= DATE_SUB(NOW(), INTERVAL 12 HOUR)
```

### Fields & Calculations:
| JSON Field | Calculation | Expected Samples |
|------------|-------------|------------------|
| `avg_12hr.raw_biogas_flow` | `AVG()` for last 720 min | 720 |
| `avg_12hr.ch4_concentration` | `AVG()` for last 720 min | 720 |
| `avg_12hr.sample_count` | `COUNT(*)` | varies |
| `avg_12hr.expected_samples` | Constant: 720 | 720 |
| `avg_12hr.data_quality` | `(valid / total) × 100` | varies |

---

## 2.5 Twenty-Four Hour Totalizers (totalizer_24hr)

### Source:
```sql
SELECT 
    COUNT(*) as sample_count,
    COALESCE(MAX(raw_biogas_totalizer) - MIN(raw_biogas_totalizer), 0) as totalizer_raw_biogas,
    COALESCE(MAX(purified_gas_totalizer) - MIN(purified_gas_totalizer), 0) as totalizer_purified_gas,
    ...
FROM scada_readings 
WHERE plant_id = 'KARNAL' 
AND timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
```

### Formula:
```
24hr_production = MAX(totalizer) - MIN(totalizer)

Example:
- First reading of day (00:00): totalizer = 150,000 Nm³
- Last reading of day (23:59): totalizer = 180,000 Nm³
- 24hr production = 180,000 - 150,000 = 30,000 Nm³
```

### Fields:
| JSON Field | Formula | Unit |
|------------|---------|------|
| `totalizer_24hr.raw_biogas` | `MAX(raw_biogas_totalizer) - MIN(raw_biogas_totalizer)` | Nm³ |
| `totalizer_24hr.purified_gas` | `MAX(purified_gas_totalizer) - MIN(purified_gas_totalizer)` | Nm³ |
| `totalizer_24hr.product_gas` | `MAX(product_gas_totalizer) - MIN(product_gas_totalizer)` | Nm³ |
| `totalizer_24hr.feed_fm1` | `MAX(feed_fm1_totalizer) - MIN(feed_fm1_totalizer)` | m³ |
| `totalizer_24hr.feed_fm2` | `MAX(feed_fm2_totalizer) - MIN(feed_fm2_totalizer)` | m³ |
| `totalizer_24hr.fresh_water` | `MAX(fresh_water_totalizer) - MIN(fresh_water_totalizer)` | m³ |
| `totalizer_24hr.recycle_water` | `MAX(recycle_water_totalizer) - MIN(recycle_water_totalizer)` | m³ |

### NULL Handling:
```sql
COALESCE(MAX(totalizer) - MIN(totalizer), 0)
-- If either MAX or MIN is NULL, result would be NULL
-- COALESCE converts NULL to 0
```

---

## 2.6 Equipment Status Section

### 2.6.1 PSA Running Hours

#### Source:
```sql
SELECT 
    SUM(CASE WHEN compressor_status = 1 THEN 1 ELSE 0 END) as running_minutes,
    COUNT(*) as total_minutes
FROM scada_readings 
WHERE plant_id = 'KARNAL' 
AND DATE(timestamp) = CURDATE()
```

#### Formula:
```
running_hours_today = running_minutes / 60

Example:
- From midnight to now: 1350 readings with compressor_status = 1
- running_hours = 1350 / 60 = 22.5 hours
```

#### Fields:
| JSON Field | Formula |
|------------|---------|
| `equipment.psa.status` | `compressor_status == 1 ? "Running" : "Stopped"` |
| `equipment.psa.running_hours_today` | `SUM(compressor_status=1) / 60` |
| `equipment.psa.running_minutes_today` | `SUM(compressor_status=1)` |
| `equipment.psa.efficiency` | `(purified_gas_flow / raw_biogas_flow) × 100` |

#### PSA Status Logic:
| Condition | Status |
|-----------|--------|
| `compressor_status = 1` | "Running" |
| `compressor_status = 0` | "Stopped" |

### 2.6.2 PSA Efficiency Calculation

#### Formula:
```
PSA Efficiency (%) = (Purified Gas Flow / Raw Biogas Flow) × 100

Example:
- Raw Biogas Flow = 1250 Nm³/hr
- Purified Gas Flow = 1180 Nm³/hr
- Efficiency = (1180 / 1250) × 100 = 94.4%
```

#### Code:
```php
'efficiency' => floatval($latest['raw_biogas_flow']) > 0 
    ? round((floatval($latest['purified_gas_flow']) / floatval($latest['raw_biogas_flow'])) * 100, 1)
    : 0
```

### 2.6.3 LT Panel Consumption

#### Source:
```sql
SELECT 
    COALESCE(AVG(lt_panel_power), 0) as avg_power_kw,
    COUNT(*) as total_minutes
FROM scada_readings 
WHERE plant_id = 'KARNAL' 
AND DATE(timestamp) = CURDATE()
```

#### Formula:
```
Consumption (kWh) = Average Power (kW) × Time (hours)
                  = AVG(lt_panel_power) × (COUNT(*) / 60)

Example:
- Average power today: 245 kW
- Minutes since midnight: 1440 (full day)
- Hours = 1440 / 60 = 24 hours
- Consumption = 245 × 24 = 5,880 kWh
```

#### Fields:
| JSON Field | Formula |
|------------|---------|
| `equipment.lt_panel.status` | Always "Active" (if data exists) |
| `equipment.lt_panel.current_load_kw` | Direct from `lt_panel_power` |
| `equipment.lt_panel.consumption_today_kwh` | `AVG(lt_panel_power) × hours_today` |
| `equipment.lt_panel.consumption_month_kwh` | `AVG(lt_panel_power) × hours_this_month` |

---

# PART 3: COMPARISON VIEW (comparison.php)

## 3.1 Data Retrieval

### Today's Data:
```sql
SELECT 
    AVG(raw_biogas_flow) as avg_raw_biogas_flow,
    AVG(ch4_concentration) as avg_ch4,
    ...
FROM scada_readings 
WHERE plant_id = 'KARNAL' 
AND timestamp >= CURDATE()  -- Today: 00:00:00 to now
AND timestamp < NOW()
```

### Yesterday's Data:
```sql
SELECT 
    AVG(raw_biogas_flow) as avg_raw_biogas_flow,
    AVG(ch4_concentration) as avg_ch4,
    ...
FROM scada_readings 
WHERE plant_id = 'KARNAL' 
AND timestamp >= DATE_SUB(CURDATE(), INTERVAL 1 DAY)  -- Yesterday 00:00
AND timestamp < CURDATE()  -- Yesterday 23:59:59
```

## 3.2 Change Calculation

### Formula:
```
change = today_value - yesterday_value
change_percent = (change / yesterday_value) × 100

Example:
- Today's Raw Biogas Flow: 1250 Nm³/hr
- Yesterday's Raw Biogas Flow: 1180 Nm³/hr
- Change: 1250 - 1180 = +70 Nm³/hr
- Change %: (70 / 1180) × 100 = +5.9%
```

### JSON Response:
```json
{
    "metrics": {
        "raw_biogas_flow": {
            "label": "Raw Biogas Flow",
            "unit": "Nm³/hr",
            "current": 1250,
            "previous": 1180,
            "change": 70,
            "change_percent": 5.9,
            "status": "improved"
        }
    }
}
```

## 3.3 Status Determination Logic

### Direction Awareness:
Different metrics have different "good" directions:

| Metric | Good Direction | Improved When | Declined When |
|--------|---------------|---------------|---------------|
| Raw Biogas Flow | Higher | Increased | Decreased |
| Purified Gas Flow | Higher | Increased | Decreased |
| Product Gas Flow | Higher | Increased | Decreased |
| CH4 Concentration | Higher | Increased | Decreased |
| PSA Efficiency | Higher | Increased | Decreased |
| CO2 Level | Lower | Decreased | Increased |
| O2 Concentration | Lower | Decreased | Increased |
| H2S Content | Lower | Decreased | Increased |
| Buffer Tank | Stable | Within ±5% | >±5% change |
| Lagoon Tank | Stable | Within ±5% | >±5% change |

### Status Logic Code:
```php
function calculateChange($current, $previous, $higherIsBetter = true) {
    $change = $current - $previous;
    $changePercent = ($change / $previous) * 100;
    
    $absPercent = abs($changePercent);
    
    // Determine status based on direction
    if ($absPercent <= 2) {
        $status = 'stable';  // Less than 2% change
    } elseif ($higherIsBetter) {
        // For metrics where HIGHER is better (gas flows, CH4, efficiency)
        if ($change > 0) {
            $status = 'improved';  // Increased = good
        } else {
            $status = ($absPercent > 10) ? 'declined' : 'warning';
        }
    } else {
        // For metrics where LOWER is better (CO2, O2, H2S)
        if ($change < 0) {
            $status = 'improved';  // Decreased = good
        } else {
            $status = ($absPercent > 10) ? 'declined' : 'warning';
        }
    }
    
    return $status;
}
```

### Status Thresholds:
| Change % | Good Direction | Status |
|----------|---------------|--------|
| ≤ 2% | Any | `stable` |
| 2-10% | Correct | `improved` |
| 2-10% | Wrong | `warning` |
| > 10% | Correct | `improved` |
| > 10% | Wrong | `declined` |

### Visual Status Representation:
| Status | Color | Icon | Background |
|--------|-------|------|------------|
| `improved` | Green | ↑ or ↓ | `bg-emerald-50` |
| `stable` | Blue | → | `bg-blue-50` |
| `warning` | Amber | ↑ or ↓ | `bg-amber-50` |
| `declined` | Red | ↑ or ↓ | `bg-rose-50` |

---

# PART 4: TRENDS PAGE (trends.php)

## 4.1 Time-Based Aggregation

### Auto-Interval Calculation:
```php
if ($hours <= 1) {
    $interval = 1;      // Raw data (every minute)
} elseif ($hours <= 12) {
    $interval = 5;      // Every 5 minutes
} elseif ($hours <= 24) {
    $interval = 10;     // Every 10 minutes
} elseif ($hours <= 72) {
    $interval = 30;     // Every 30 minutes
} else {
    $interval = 60;     // Every hour
}
```

| Time Range | Interval | Data Points |
|------------|----------|-------------|
| 1 hour | 1 min | 60 points |
| 12 hours | 5 min | 144 points |
| 24 hours | 10 min | 144 points |
| 72 hours | 30 min | 144 points |
| 168 hours (7 days) | 60 min | 168 points |

### Aggregation Query:
```sql
SELECT 
    DATE_FORMAT(MIN(timestamp), '%Y-%m-%d %H:%i') as timestamp,
    ROUND(AVG(raw_biogas_flow), 2) as raw_biogas_flow,
    ROUND(AVG(ch4_concentration), 2) as ch4_concentration,
    ...
FROM scada_readings 
WHERE plant_id = 'KARNAL' 
AND timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
GROUP BY FLOOR(UNIX_TIMESTAMP(timestamp) / (10 * 60))  -- Group by 10-minute intervals
ORDER BY timestamp ASC
```

### Formula:
```
Group Key = FLOOR(UNIX_TIMESTAMP / (interval_minutes × 60))

Example for 10-minute interval:
- 10:00:00 → FLOOR(timestamp / 600) = group 100
- 10:05:00 → FLOOR(timestamp / 600) = group 100 (same group)
- 10:10:00 → FLOOR(timestamp / 600) = group 101 (new group)

All readings in same group → AVG() calculated
```

## 4.2 Statistics Calculation

### Query:
```sql
SELECT 
    MIN(raw_biogas_flow) as min_raw_biogas_flow,
    MAX(raw_biogas_flow) as max_raw_biogas_flow,
    AVG(raw_biogas_flow) as avg_raw_biogas_flow,
    ...
FROM scada_readings 
WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
```

### JSON Response:
```json
{
    "statistics": {
        "raw_biogas_flow": {
            "min": 1180.5,
            "max": 1320.8,
            "avg": 1250.3
        }
    }
}
```

## 4.3 Data Coverage Calculation

### Formula:
```
coverage_percent = (total_records / expected_records) × 100

Expected records = hours × 60 (one per minute)

Example:
- 24 hours requested
- Expected: 24 × 60 = 1440 records
- Actual: 1380 records
- Coverage: (1380 / 1440) × 100 = 95.8%
```

---

# PART 5: KPI SUMMARY CARDS (Frontend)

## 5.1 Gas Flow KPI Cards

### Raw Biogas Flow Card

| Element | Source | Value |
|---------|--------|-------|
| **Title** | Static | "Raw Biogas Flow" |
| **Current Value** | `dashboard.current.raw_biogas_flow` | 1250 |
| **Unit** | Static | "Nm³/hr" |
| **Totalizer Label** | Static | "Totalizer (24 Hr)" |
| **Totalizer Value** | `dashboard.totalizer_24hr.raw_biogas` | 30,000 |
| **Sample Count** | `dashboard.totalizer_24hr.sample_count` | 1380 |
| **Expected Samples** | Static | 1440 |
| **Coverage %** | Calculated: `(1380/1440) × 100` | 95.8% |

### Trend Sparkline Data:
Currently **hardcoded** with random values. Should be from `trends.php`:
```javascript
// Current (hardcoded):
const trendData = Array.from({ length: 15 }, () => ({
    value: 1250 + (Math.random() * 100 - 50)
}));

// Should be (from API):
const trendData = await fetch('/api/trends.php?hours=1&parameters=raw_biogas_flow')
    .then(r => r.json())
    .then(d => d.data.map(row => ({ value: row.raw_biogas_flow })));
```

## 5.2 Gas Composition KPI Cards

### CH4 Card

| Element | Source | Value |
|---------|--------|-------|
| **Current Value** | `dashboard.current.ch4_concentration` | 96.8 |
| **Avg 1 Hr** | `dashboard.avg_1hr.ch4_concentration` | 96.8 |
| **Avg 12 Hr** | `dashboard.avg_12hr.ch4_concentration` | 96.5 |
| **Sample Count (12hr)** | `dashboard.avg_12hr.sample_count` | 700 |
| **Expected (12hr)** | Static | 720 |

## 5.3 Data Quality Badge Logic

### Frontend Code:
```javascript
const DataQualityBadge = ({ samples, expected }) => {
    const coverage = (samples / expected) * 100;
    
    let statusColor, statusText;
    if (coverage >= 95) {
        statusColor = 'text-emerald-600';
        statusText = null;  // No warning
    } else if (coverage >= 80) {
        statusColor = 'text-slate-600';
        statusText = null;
    } else if (coverage >= 50) {
        statusColor = 'text-amber-600';
        statusText = 'Partial data';
    } else {
        statusColor = 'text-orange-600';
        statusText = 'Low coverage';
    }
    
    return (
        <span className={statusColor}>
            {samples}/{expected} ({coverage.toFixed(0)}%)
            {statusText && <AlertIcon />}
        </span>
    );
};
```

### Status Thresholds:
| Coverage | Color | Warning Text |
|----------|-------|--------------|
| ≥ 95% | Green | None |
| 80-94% | Gray | None |
| 50-79% | Amber | "Partial data" |
| < 50% | Orange | "Low coverage" |

---

# PART 6: EQUIPMENT STATUS SECTION (Frontend)

## 6.1 PSA Unit Display

### Current (Hardcoded):
```javascript
const psaData = {
    status: 'Running',           // Hardcoded
    hoursToday: 22.5,            // Hardcoded
    efficiency: psaEfficiency    // Calculated
};
```

### Should Be (From API):
```javascript
const psaData = {
    status: dashboard.equipment.psa.status,
    hoursToday: dashboard.equipment.psa.running_hours_today,
    efficiency: dashboard.equipment.psa.efficiency
};
```

### Efficiency Calculation Display:
```
Efficiency = (Purified Gas Flow / Raw Biogas Flow) × 100
           = (1180 / 1250) × 100
           = 94.4%
```

## 6.2 LT Panel Display

### Current (Hardcoded):
```javascript
const ltPanelData = {
    status: 'Active',
    currentLoad: 245,
    todayConsumption: 5880,
    monthlyConsumption: 176400
};
```

### Should Be (From API):
```javascript
const ltPanelData = {
    status: dashboard.equipment.lt_panel.status,
    currentLoad: dashboard.equipment.lt_panel.current_load_kw,
    todayConsumption: dashboard.equipment.lt_panel.consumption_today_kwh,
    monthlyConsumption: dashboard.equipment.lt_panel.consumption_month_kwh
};
```

## 6.3 Circular Progress Gauge

### Calculation:
```javascript
const CircularProgress = ({ value, max }) => {
    const percentage = (value / max) * 100;
    const circumference = 2 * Math.PI * 40;  // radius = 40
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    // SVG circle with stroke-dashoffset creates partial circle
};
```

---

# PART 7: COMPARISON VIEW SECTION (Frontend)

## 7.1 Comparison Card

### Data Flow:
```
comparison.php API
        ↓
    JSON Response
        ↓
    ComparisonCard Component
        ↓
    Visual Display
```

### Calculation in Frontend:
```javascript
const ComparisonCard = ({ todayValue, yesterdayValue, goodDirection }) => {
    const change = todayValue - yesterdayValue;
    const changePercent = yesterdayValue !== 0 
        ? ((change / yesterdayValue) * 100) 
        : 0;
    
    let status;
    if (goodDirection === 'higher') {
        if (changePercent > 2) status = 'Improved';
        else if (changePercent < -2) status = 'Declined';
        else status = 'Stable';
    } else if (goodDirection === 'lower') {
        if (changePercent < -2) status = 'Improved';
        else if (changePercent > 2) status = 'Declined';
        else status = 'Stable';
    } else {
        // Stable is good
        if (Math.abs(changePercent) <= 5) status = 'Stable';
        else status = 'Changed';
    }
};
```

## 7.2 Summary Count

### Calculation:
```javascript
const calculateSummary = () => {
    let improved = 0, stable = 0, warning = 0, declined = 0;
    
    comparisons.forEach(c => {
        const changePercent = ((c.today - c.yesterday) / c.yesterday) * 100;
        
        if (c.goodDirection === 'higher') {
            if (changePercent > 2) improved++;
            else if (changePercent < -2 && Math.abs(changePercent) > 10) declined++;
            else if (changePercent < -2) warning++;
            else stable++;
        }
        // ... similar for 'lower' and 'stable'
    });
    
    return { improved, stable, warning, declined };
};
```

### Display:
```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│    5     │  │    3     │  │    1     │  │    0     │
│ Improved │  │  Stable  │  │ Warning  │  │ Declined │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

---

# PART 8: COMPLETE FIELD REFERENCE TABLE

| Field | Source | Calculation | Status Logic |
|-------|--------|-------------|--------------|
| raw_biogas_flow | SCADA | Direct | Higher = Better |
| raw_biogas_totalizer | SCADA | Direct | N/A |
| 24hr_raw_biogas | Calculated | MAX - MIN | N/A |
| avg_1hr_raw_biogas | Calculated | AVG(60 min) | N/A |
| avg_12hr_raw_biogas | Calculated | AVG(720 min) | N/A |
| purified_gas_flow | SCADA | Direct | Higher = Better |
| product_gas_flow | SCADA | Direct | Higher = Better |
| ch4_concentration | SCADA | Direct | Higher = Better |
| co2_level | SCADA | Direct | Lower = Better |
| o2_concentration | SCADA | Direct | Lower = Better |
| h2s_content | SCADA | Direct | Lower = Better |
| dew_point | SCADA | Direct | Stable = Better |
| d1_temp_bottom | SCADA | Direct | 35-40°C = Good |
| d1_temp_top | SCADA | Direct | 35-40°C = Good |
| d1_gas_pressure | SCADA | Direct | Stable = Good |
| d1_air_pressure | SCADA | Direct | Stable = Good |
| d1_slurry_height | SCADA | Direct | Stable = Good |
| d1_gas_level | SCADA | Direct | 50-80% = Good |
| buffer_tank_level | SCADA | Direct | Stable = Better |
| lagoon_tank_level | SCADA | Direct | Stable = Better |
| psa_status | Calculated | compressor_status == 1 | Running/Stopped |
| psa_running_hours | Calculated | SUM(status=1) / 60 | N/A |
| psa_efficiency | Calculated | (purified / raw) × 100 | Higher = Better |
| lt_panel_power | SCADA | Direct | N/A |
| lt_consumption_today | Calculated | AVG(kW) × hours | N/A |
| lt_consumption_month | Calculated | AVG(kW) × hours | N/A |
| compressor_status | SCADA | Direct (0/1) | 1 = Running |
| data_status | Calculated | age_seconds check | FRESH/DELAYED/STALE |
| sample_count | Calculated | COUNT(*) | N/A |
| data_quality | Calculated | valid/total × 100 | ≥95% = Good |

---

# PART 9: VISUAL SUMMARY

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DATA FLOW DIAGRAM                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   SCADA System                                                      │
│       │                                                             │
│       ▼ (36 raw values every 60 seconds)                           │
│                                                                     │
│   ┌─────────────────────────────────────────────────────────┐      │
│   │             MySQL: scada_readings                        │      │
│   │  ┌─────────────────────────────────────────────────────┐│      │
│   │  │ id | timestamp | raw_biogas_flow | ch4 | ... | status││      │
│   │  │ 1  | 10:00:00  | 1250.5          | 96.8| ... | 1     ││      │
│   │  │ 2  | 10:01:00  | 1248.2          | 96.7| ... | 1     ││      │
│   │  │ 3  | 10:02:00  | 1252.1          | 96.9| ... | 1     ││      │
│   │  └─────────────────────────────────────────────────────┘│      │
│   └─────────────────────────────────────────────────────────┘      │
│       │                                                             │
│       ▼                                                             │
│   ┌─────────────────────────────────────────────────────────┐      │
│   │                   PHP APIs                               │      │
│   ├─────────────────────────────────────────────────────────┤      │
│   │ dashboard.php:                                           │      │
│   │   - Latest reading (SELECT ... LIMIT 1)                 │      │
│   │   - 1hr average (AVG ... 60 min)                        │      │
│   │   - 12hr average (AVG ... 720 min)                      │      │
│   │   - 24hr totalizer (MAX - MIN)                          │      │
│   │   - PSA hours (SUM compressor_status / 60)              │      │
│   │   - LT consumption (AVG power × hours)                  │      │
│   ├─────────────────────────────────────────────────────────┤      │
│   │ comparison.php:                                          │      │
│   │   - Today average (AVG ... today)                       │      │
│   │   - Yesterday average (AVG ... yesterday)               │      │
│   │   - Change % ((today - yesterday) / yesterday × 100)    │      │
│   │   - Status (Improved/Stable/Warning/Declined)           │      │
│   ├─────────────────────────────────────────────────────────┤      │
│   │ trends.php:                                              │      │
│   │   - Aggregated data (AVG grouped by interval)           │      │
│   │   - Statistics (MIN, MAX, AVG per parameter)            │      │
│   │   - Coverage % (actual / expected × 100)                │      │
│   └─────────────────────────────────────────────────────────┘      │
│       │                                                             │
│       ▼                                                             │
│   ┌─────────────────────────────────────────────────────────┐      │
│   │                   React Frontend                         │      │
│   ├─────────────────────────────────────────────────────────┤      │
│   │ KPISummary.js:      Display current + averages          │      │
│   │ EquipmentStatus.js: Display PSA, LT Panel, Compressor   │      │
│   │ ComparisonView.js:  Display Today vs Yesterday          │      │
│   │ TrendsPage.js:      Display historical charts           │      │
│   │ ReportsPage.js:     Generate PDF/CSV reports            │      │
│   └─────────────────────────────────────────────────────────┘      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

*Document Version: 1.0*
*Last Updated: February 2026*
*Author: SCADA Development Team*
