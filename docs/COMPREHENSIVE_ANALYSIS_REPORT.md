# SCADA System - Comprehensive Analysis Report

## Executive Summary

This report analyzes the entire SCADA monitoring system including Dashboard, Trends, Reports, and Comparison features for both HO (Head Office) and MNRE dashboards.

---

# 1. WHAT IS DONE CORRECTLY ✅

## 1.1 Data Storage (Backend)

| Feature | Status | Implementation |
|---------|--------|----------------|
| Raw data storage | ✅ | Every minute, all 36 fields stored in `scada_readings` |
| Timestamp tracking | ✅ | `timestamp` field for each reading |
| Totalizers | ✅ | Separate columns for flow and totalizer values |
| NULL handling | ✅ | `COALESCE()` used to handle NULLs in calculations |
| Indexes | ✅ | Proper indexes on `timestamp`, `plant_id` |

## 1.2 Dashboard API (dashboard.php)

| Feature | Status | Implementation |
|---------|--------|----------------|
| Current values | ✅ | Latest reading from database |
| 1-Hour averages | ✅ | `AVG()` with `DATE_SUB(NOW(), INTERVAL 1 HOUR)` |
| 12-Hour averages | ✅ | `AVG()` with `DATE_SUB(NOW(), INTERVAL 12 HOUR)` |
| 24-Hour totalizers | ✅ | `MAX(totalizer) - MIN(totalizer)` |
| Sample counts | ✅ | `COUNT(*)` and `COUNT(column)` for data quality |
| Data freshness | ✅ | Calculates age in seconds, status: FRESH/DELAYED/STALE |
| NULL handling | ✅ | `COALESCE(value, 0)` returns 0 if NULL |

## 1.3 Trends API (trends.php)

| Feature | Status | Implementation |
|---------|--------|----------------|
| Time range support | ✅ | 1h, 12h, 24h, 7d (168 hours max) |
| Auto interval | ✅ | Auto-calculates aggregation interval based on hours |
| Data aggregation | ✅ | Groups by time intervals using `FLOOR(UNIX_TIMESTAMP)` |
| Statistics | ✅ | MIN, MAX, AVG for each parameter |
| Coverage % | ✅ | `total_records / expected_records * 100` |

## 1.4 Comparison API (comparison.php)

| Feature | Status | Implementation |
|---------|--------|----------------|
| Today vs Yesterday | ✅ | Compares current day with previous day |
| Week vs Week | ✅ | This week vs last week |
| Month vs Month | ✅ | This month vs last month |
| Change calculation | ✅ | `(current - previous) / previous * 100` |
| Status logic | ✅ | Improved/Stable/Warning/Declined based on % change |
| Direction awareness | ✅ | Knows higher is better (CH4) vs lower is better (H2S) |

## 1.5 Authentication (auth.php)

| Feature | Status | Implementation |
|---------|--------|----------------|
| Login endpoint | ✅ | POST with email/password |
| Role-based access | ✅ | HEAD_OFFICE and MNRE roles |
| Token generation | ✅ | Base64 encoded JSON token |
| Password hashing | ✅ | `password_verify()` for secure comparison |

---

# 2. WHAT IS MISSING / NEEDS TO BE ADDED ❌

## 2.1 PSA Running Hours - CRITICAL MISSING

### Current State:
```
Database: compressor_status (0 or 1)
Frontend: Shows hardcoded "22.5 hrs" in EquipmentStatus.js
Backend: No calculation endpoint
```

### What Needs to be Added:

**Option A: Calculate from Database (Recommended for now)**
```sql
-- Add to dashboard.php
SELECT 
    SUM(CASE WHEN compressor_status = 1 THEN 1 ELSE 0 END) / 60.0 as psa_running_hours_today,
    SUM(CASE WHEN compressor_status = 1 THEN 1 ELSE 0 END) as psa_running_minutes
FROM scada_readings 
WHERE DATE(timestamp) = CURDATE()
AND plant_id = 'KARNAL'
```

**Option B: Add SCADA Tag (More Accurate)**
```sql
-- Add column to schema
ALTER TABLE scada_readings ADD COLUMN psa_running_hours DECIMAL(10,2);
```

## 2.2 LT Panel Consumption - MISSING

### Current State:
```
Database: lt_panel_power (current kW)
Frontend: Shows hardcoded "5880 kWh" for today
Backend: No consumption calculation
```

### What Needs to be Added:
```sql
-- Today's consumption (kW * hours)
SELECT 
    AVG(lt_panel_power) * (COUNT(*) / 60.0) as today_consumption_kwh
FROM scada_readings
WHERE DATE(timestamp) = CURDATE()
AND plant_id = 'KARNAL'

-- Monthly consumption
SELECT 
    AVG(lt_panel_power) * (COUNT(*) / 60.0) as month_consumption_kwh
FROM scada_readings
WHERE MONTH(timestamp) = MONTH(CURDATE())
AND YEAR(timestamp) = YEAR(CURDATE())
AND plant_id = 'KARNAL'
```

## 2.3 Daily Summary Table - MISSING (Optimization)

### Why Needed:
- Current approach recalculates daily averages every request
- With 1 year of data (525,600 rows), queries will slow down

### What to Add:
```sql
CREATE TABLE daily_summary (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    
    -- Production Totals
    total_raw_biogas DECIMAL(15,2),
    total_purified_gas DECIMAL(15,2),
    total_product_gas DECIMAL(15,2),
    
    -- Averages
    avg_raw_biogas_flow DECIMAL(10,2),
    avg_ch4 DECIMAL(5,2),
    avg_psa_efficiency DECIMAL(5,2),
    
    -- Running Hours
    psa_running_hours DECIMAL(5,2),
    compressor_running_hours DECIMAL(5,2),
    
    -- Power Consumption
    total_power_kwh DECIMAL(15,2),
    avg_power_kw DECIMAL(10,2),
    
    -- Data Quality
    total_samples INT,
    expected_samples INT DEFAULT 1440,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 2.4 Frontend-Backend Integration - NOT DONE

### Current State:
All frontend components use **HARDCODED DATA**:
- `KPISummary.js`: Line 139-224 - hardcoded values
- `EquipmentStatus.js`: Line 17-35 - hardcoded values
- `ComparisonView.js`: Line 181-213 - hardcoded values
- `TrendsPage.js`: Line 13-43 - `generateTrendData()` with random values
- `MNREDashboard.js`: Line 71-112 - hardcoded values

### What Needs to be Done:
1. Create API service module
2. Replace hardcoded data with `fetch()` calls
3. Implement 60-second auto-refresh
4. Handle loading states
5. Handle error states

## 2.5 Real-time Alerts System - NOT IMPLEMENTED

### What's Missing:
- Alert threshold configuration
- Alert generation logic
- Alert notification (bell icon, banner)
- Alert history page
- Email/SMS notifications (optional)

---

# 3. DATA FLOW ANALYSIS

## 3.1 Current Flow (Frontend Hardcoded)

```
┌─────────────────┐
│  SCADA System   │
│  (Not Connected)│
└────────┬────────┘
         │
         ▼ (Future: Python Sync)
┌─────────────────┐
│   PHP Backend   │
│  (MySQL Data)   │
└────────┬────────┘
         │
         ▼ (API Ready, Not Used)
┌─────────────────┐
│ React Frontend  │◄── Currently using HARDCODED data
│ (Displays Data) │
└─────────────────┘
```

## 3.2 Expected Flow (After Integration)

```
┌─────────────────┐
│  SCADA System   │
│  (Siemens WinCC)│
└────────┬────────┘
         │ (Every 60 seconds)
         ▼
┌─────────────────┐
│ Python Sync     │──POST──▶ receive_data.php
│ Script (Plant)  │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   MySQL DB      │
│  (scada_readings)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   PHP APIs      │
│ dashboard.php   │
│ trends.php      │
│ comparison.php  │
└────────┬────────┘
         │ (GET requests)
         ▼
┌─────────────────┐
│ React Frontend  │──Auto-refresh every 60s
│ (Live Dashboard)│
└─────────────────┘
```

---

# 4. CALCULATION LOGIC ANALYSIS

## 4.1 KPI Summary Card Calculations

### Gas Flow Cards (Raw Biogas, Purified Gas, Product Gas)

| Element | Source | Calculation |
|---------|--------|-------------|
| Current Value | `dashboard.php` → `current.raw_biogas_flow` | Direct from latest reading |
| Totalizer (24 Hr) | `dashboard.php` → `totalizer_24hr.raw_biogas` | `MAX(totalizer) - MIN(totalizer)` for 24hr |
| Sample Count | `dashboard.php` → `totalizer_24hr.sample_count` | `COUNT(*)` for 24hr period |
| Expected Samples | Hardcoded | 1440 (24 hours × 60 minutes) |
| Coverage % | Frontend calculation | `sample_count / 1440 × 100` |

### Gas Composition Cards (CH4, CO2, H2S)

| Element | Source | Calculation |
|---------|--------|-------------|
| Current Value | `dashboard.php` → `current.ch4_concentration` | Direct from latest reading |
| Avg 1 Hr | `dashboard.php` → `avg_1hr.ch4_concentration` | `AVG()` for last 60 minutes |
| Avg 12 Hr | `dashboard.php` → `avg_12hr.ch4_concentration` | `AVG()` for last 720 minutes |
| Sample Count | `dashboard.php` → `avg_12hr.sample_count` | `COUNT(*)` for 12hr period |

## 4.2 Equipment Status Calculations

### PSA Unit

| Element | Source | Current State | Correct Calculation |
|---------|--------|---------------|---------------------|
| Status | - | Hardcoded "Running" | `current.compressor_status == 1 ? "Running" : "Stopped"` |
| Hours Today | - | Hardcoded "22.5" | ❌ **MISSING** - Should be `SUM(compressor_status) / 60` |
| Efficiency | - | Hardcoded "94.4" | `(purified_gas_flow / raw_biogas_flow) × 100` |

### LT Panel

| Element | Source | Current State | Correct Calculation |
|---------|--------|---------------|---------------------|
| Status | - | Hardcoded "Active" | Always "Active" if data is FRESH |
| Current Load | `dashboard.php` | Hardcoded "245" | `current.lt_panel_power` |
| Today's Consumption | - | Hardcoded "5880" | ❌ **MISSING** - Should be `AVG(lt_panel_power) × hours_today` |
| Monthly Consumption | - | Hardcoded "176400" | ❌ **MISSING** - Should be `AVG(lt_panel_power) × hours_this_month` |

### Compressor

| Element | Source | Current State | Correct Calculation |
|---------|--------|---------------|---------------------|
| Status | - | Hardcoded "Running" | `current.compressor_status == 1 ? "Running" : "Stopped"` |
| Hours Today | - | Hardcoded "21.8" | Same as PSA running hours |
| Efficiency | - | Hardcoded | Same as PSA efficiency |

## 4.3 Comparison View Calculations

| Element | Calculation | Status Logic |
|---------|-------------|--------------|
| Change | `today_value - yesterday_value` | - |
| Change % | `(change / yesterday_value) × 100` | - |
| Improved | `change_percent > 2%` (higher is better) OR `change_percent < -2%` (lower is better) | ✅ |
| Stable | `abs(change_percent) <= 2%` | ✅ |
| Warning | `2% < abs(change_percent) <= 10%` (wrong direction) | ✅ |
| Declined | `abs(change_percent) > 10%` (wrong direction) | ✅ |

### Direction Awareness

| Parameter | Good Direction | Improved When |
|-----------|---------------|---------------|
| Raw Biogas Flow | Higher | Change > +2% |
| CH4 | Higher | Change > +2% |
| PSA Efficiency | Higher | Change > +2% |
| CO2 | Lower | Change < -2% |
| H2S | Lower | Change < -2% |
| O2 | Lower | Change < -2% |
| Buffer Tank | Stable | Change within ±5% |

---

# 5. HO vs MNRE DASHBOARD DIFFERENCES

| Feature | HO Dashboard | MNRE Dashboard |
|---------|--------------|----------------|
| Gas Flow KPIs | ✅ Raw, Purified, Product | ✅ Raw, Purified, Product |
| Gas Composition | ✅ CH4, CO2, H2S | ❌ Not shown |
| Sample Counts | ✅ Shown with quality indicator | ❌ Not shown |
| Digester Data | ✅ Full details | ❌ Not shown |
| Equipment Status | ✅ PSA, LT Panel, Compressor | ❌ Not shown |
| Comparison View | ✅ Full comparison | ❌ Not shown |
| Tank Levels | ✅ Buffer, Lagoon | ❌ Not shown |
| Water Flow | ✅ All 4 meters | ❌ Not shown |
| Trends Page | ✅ All parameters | ✅ Split charts (separate) |
| Reports | ✅ Full access | ❌ Not shown |

---

# 6. PERFORMANCE OPTIMIZATION RECOMMENDATIONS

## 6.1 Space Optimization

### Current Storage:
```
Per reading: ~500 bytes
Per day: 1,440 readings × 500 bytes = 720 KB
Per month: 21 MB
Per year: 250 MB
```

### Optimization 1: Daily Summary Table
```sql
-- Instead of querying 1,440 rows for daily totals
-- Query 1 row from daily_summary table
-- Savings: 99.9% fewer rows to scan for daily reports
```

### Optimization 2: Data Archival (After 6 months)
```sql
-- Option A: Delete old raw data, keep summaries
DELETE FROM scada_readings WHERE timestamp < DATE_SUB(NOW(), INTERVAL 6 MONTH);

-- Option B: Move to archive table
INSERT INTO scada_readings_archive SELECT * FROM scada_readings 
WHERE timestamp < DATE_SUB(NOW(), INTERVAL 6 MONTH);
```

### Optimization 3: Compression (GoDaddy)
```sql
-- Use InnoDB compression for older partitions
ALTER TABLE scada_readings ROW_FORMAT=COMPRESSED;
```

## 6.2 Time Optimization (Query Performance)

### Current Query Times (Estimated):
| Query | Rows Scanned | Time (1 month data) | Time (1 year data) |
|-------|--------------|---------------------|---------------------|
| Latest reading | 1 | <1ms | <1ms |
| 1-hour average | 60 | <5ms | <5ms |
| 24-hour average | 1,440 | <20ms | <50ms |
| 7-day trends | 10,080 | <100ms | <500ms |
| Monthly comparison | 43,200 | <200ms | **>1s** ⚠️ |

### Optimization 1: Proper Indexes (Already Done)
```sql
INDEX idx_timestamp (timestamp)  -- ✅
INDEX idx_plant_timestamp (plant_id, timestamp)  -- ✅
```

### Optimization 2: Covering Indexes for Common Queries
```sql
-- Add compound index for dashboard queries
CREATE INDEX idx_dashboard ON scada_readings 
(plant_id, timestamp, raw_biogas_flow, purified_gas_flow, product_gas_flow, ch4_concentration);
```

### Optimization 3: Query Caching
```php
// Add Redis or file-based caching for dashboard data
// Cache for 30 seconds (since data updates every 60s)
$cacheKey = "dashboard_" . PLANT_ID;
$cached = getCache($cacheKey);
if ($cached && (time() - $cached['time']) < 30) {
    return $cached['data'];
}
```

### Optimization 4: Pre-computed Daily Summary
```php
// Run at midnight via cron job
// Calculates all daily metrics once
// Dashboard queries daily_summary instead of scada_readings
```

---

# 7. ACTION ITEMS (Priority Order)

## P0: Critical (Before Go-Live)

| # | Task | Effort |
|---|------|--------|
| 1 | Add PSA Running Hours calculation to dashboard.php | 1 hour |
| 2 | Add LT Panel consumption calculation to dashboard.php | 1 hour |
| 3 | Create API service module in frontend | 2 hours |
| 4 | Integrate dashboard.php with KPISummary.js | 2 hours |
| 5 | Integrate dashboard.php with EquipmentStatus.js | 2 hours |
| 6 | Integrate comparison.php with ComparisonView.js | 2 hours |
| 7 | Implement 60-second auto-refresh | 1 hour |

## P1: Important (First Week)

| # | Task | Effort |
|---|------|--------|
| 1 | Integrate trends.php with TrendsPage.js | 3 hours |
| 2 | Update MNREDashboard.js to use API | 2 hours |
| 3 | Update MNRETrendsPage.js to use API | 2 hours |
| 4 | Add loading states to all components | 2 hours |
| 5 | Add error handling to all components | 2 hours |

## P2: Optimization (First Month)

| # | Task | Effort |
|---|------|--------|
| 1 | Create daily_summary table | 2 hours |
| 2 | Create daily summary cron job/script | 3 hours |
| 3 | Add query caching (Redis/file) | 4 hours |
| 4 | Implement alert system | 8 hours |

---

# 8. SUMMARY

## What Works ✅
- Database schema is complete (36 fields)
- PHP APIs are functional (dashboard, trends, comparison, auth)
- NULL handling is implemented
- Sample count tracking is implemented
- Comparison logic is correct

## What's Missing ❌
- **PSA Running Hours** calculation
- **LT Panel Consumption** calculation
- **Frontend-Backend integration** (all data is hardcoded)
- **Daily Summary Table** for performance
- **Auto-refresh** mechanism
- **Alert System**

## Recommended Next Steps
1. **Immediately**: Add PSA hours and LT consumption to dashboard.php
2. **This Week**: Connect frontend to backend APIs
3. **This Month**: Add daily summary table and caching
4. **Future**: Implement alert system

---

*Report Generated: February 2026*
*Version: 1.0*
