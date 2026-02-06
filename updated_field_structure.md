# SCADA Monitoring System - Updated Field Structure
## LR Energy Biogas Plant - Karnal

**Document Version:** 2.0  
**Last Updated:** February 2026  
**Purpose:** Complete field mapping for SCADA → MySQL → UI data flow

---

## 1. DATA ARCHITECTURE OVERVIEW

```
┌─────────────────────┐     ┌──────────────────┐     ┌─────────────────┐     ┌──────────────┐
│   SCADA/PLC         │────►│  Sync Script     │────►│  MySQL DB       │────►│  PHP API     │────► UI
│   (Karnal Plant)    │     │  (Every 1 min)   │     │  (GoDaddy)      │     │  (REST)      │
└─────────────────────┘     └──────────────────┘     └─────────────────┘     └──────────────┘
```

**Data Flow:**
1. SCADA collects real-time sensor data
2. Sync script pushes data to MySQL every 1 minute
3. PHP API serves data to React frontend
4. Frontend auto-refreshes every 60 seconds

---

## 2. FIELD STRUCTURE - RAW DATA FROM SCADA

### 2.1 Gas Flow Parameters (3 Fields - SCADA Input)

| # | Field Name | DB Column | Data Type | Unit | Current Value | Min Limit | Max Limit | Status Logic |
|---|------------|-----------|-----------|------|---------------|-----------|-----------|--------------|
| 1 | Raw Biogas Flow | `raw_biogas_flow` | DECIMAL(10,2) | Nm³/hr | 1250 | 0 | 2000 | Normal |
| 2 | Purified Gas Flow | `purified_gas_flow` | DECIMAL(10,2) | Nm³/hr | 1180 | 0 | 1800 | Normal |
| 3 | Product Gas Flow | `product_gas_flow` | DECIMAL(10,2) | Nm³/hr | 1150 | 0 | 1500 | Normal |

### 2.2 Gas Composition Parameters (5 Fields - SCADA Input)

| # | Field Name | DB Column | Data Type | Unit | Current Value | Min Limit | Max Limit | Status Logic |
|---|------------|-----------|-----------|------|---------------|-----------|-----------|--------------|
| 4 | CH₄ Concentration | `ch4_concentration` | DECIMAL(5,2) | % | 96.8 | 90 | 100 | ≥96% = Accepted, <96% = Warning |
| 5 | CO₂ Level | `co2_level` | DECIMAL(5,2) | % | 2.9 | 0 | 10 | <5% = Normal, ≥5% = Warning |
| 6 | O₂ Concentration | `o2_concentration` | DECIMAL(5,3) | % | 0.3 | 0 | 1 | <0.5% = Normal, ≥0.5% = Warning |
| 7 | H₂S Content | `h2s_content` | DECIMAL(8,2) | ppm | 180 | 0 | 500 | <200 = Normal, 200-300 = Warning, >300 = Critical |
| 8 | Dew Point | `dew_point` | DECIMAL(6,2) | mg/m³ | -68 | -80 | 25 | <-65 = Within Limits, -65 to -50 = Warning, >-50 = Critical |

### 2.3 Digester 1 Parameters (4 Fields - SCADA Input)

| # | Field Name | DB Column | Data Type | Unit | Current Value | Min Limit | Max Limit | Status Logic |
|---|------------|-----------|-----------|------|---------------|-----------|-----------|--------------|
| 9 | D1 Temperature | `d1_temperature` | DECIMAL(5,2) | °C | 37 | 30 | 40 | 35-40 = Normal, else Warning |
| 10 | D1 Balloon Gas Pressure | `d1_balloon_gas_pressure` | DECIMAL(6,2) | - | 32 | 0 | 40 | <40 = Normal |
| 11 | D1 Balloon Air Pressure | `d1_balloon_air_pressure` | DECIMAL(6,2) | - | 18 | 0 | 25 | <25 = Normal |
| 12 | D1 Slurry Height | `d1_slurry_height` | DECIMAL(5,2) | m | 7.6 | 0 | 10 | Operational |

### 2.4 Digester 2 Parameters (4 Fields - SCADA Input)

| # | Field Name | DB Column | Data Type | Unit | Current Value | Min Limit | Max Limit | Status Logic |
|---|------------|-----------|-----------|------|---------------|-----------|-----------|--------------|
| 13 | D2 Temperature | `d2_temperature` | DECIMAL(5,2) | °C | 36.5 | 30 | 40 | 35-40 = Normal, else Warning |
| 14 | D2 Balloon Gas Pressure | `d2_balloon_gas_pressure` | DECIMAL(6,2) | - | 30 | 0 | 40 | <40 = Normal |
| 15 | D2 Balloon Air Pressure | `d2_balloon_air_pressure` | DECIMAL(6,2) | - | 17 | 0 | 25 | <25 = Normal |
| 16 | D2 Slurry Height | `d2_slurry_height` | DECIMAL(5,2) | m | 7.3 | 0 | 10 | Operational |

### 2.5 Tank Level Parameters (2 Fields - SCADA Input)

| # | Field Name | DB Column | Data Type | Unit | Current Value | Min Limit | Max Limit | Capacity | Status Logic |
|---|------------|-----------|-----------|------|---------------|-----------|-----------|----------|--------------|
| 17 | Buffer Tank Level | `buffer_tank_level` | DECIMAL(5,2) | % | 82 | 0 | 100 | 1078 m³ | 70-90% = Warning, >90% = Critical |
| 18 | Lagoon Tank Level | `lagoon_tank_level` | DECIMAL(5,2) | % | 76 | 0 | 100 | - | <85% = Normal, ≥85% = Warning |

### 2.6 Water Flow Meter Parameters (4 Fields - SCADA Input)

| # | Field Name | DB Column | Data Type | Unit | Current Value | Min Limit | Max Limit | Status Logic |
|---|------------|-----------|-----------|------|---------------|-----------|-----------|--------------|
| 19 | Feed FM-I | `feed_fm1` | DECIMAL(6,2) | m³/hr | 42 | 0 | 100 | Online |
| 20 | Feed FM-II | `feed_fm2` | DECIMAL(6,2) | m³/hr | 38 | 0 | 100 | Online |
| 21 | Fresh Water FM | `fresh_water_fm` | DECIMAL(6,2) | m³/hr | 12 | 0 | 50 | Online |
| 22 | Recycle Water FM | `recycle_water_fm` | DECIMAL(6,2) | m³/hr | 26 | 0 | 80 | Online |

---

## 3. CALCULATED FIELDS (Backend PHP Calculations)

### 3.1 KPI Averages (Calculated from Historical Data)

| # | Field Name | Calculation Method | Time Window | Example Value |
|---|------------|-------------------|-------------|---------------|
| C1 | Raw Biogas Flow (Avg 1Hr) | AVG(raw_biogas_flow) | Last 60 records | 1250 Nm³/hr |
| C2 | Raw Biogas Flow (Avg 12Hr) | AVG(raw_biogas_flow) | Last 720 records | 1245 Nm³/hr |
| C3 | Purified Gas Flow (Avg 1Hr) | AVG(purified_gas_flow) | Last 60 records | 1180 Nm³/hr |
| C4 | Purified Gas Flow (Avg 12Hr) | AVG(purified_gas_flow) | Last 720 records | 1175 Nm³/hr |
| C5 | CH₄ (Avg 1Hr) | AVG(ch4_concentration) | Last 60 records | 96.8% |
| C6 | CH₄ (Avg 12Hr) | AVG(ch4_concentration) | Last 720 records | 96.5% |
| C7 | CO₂ (Avg 1Hr) | AVG(co2_level) | Last 60 records | 2.9% |
| C8 | CO₂ (Avg 12Hr) | AVG(co2_level) | Last 720 records | 3.1% |
| C9 | H₂S (Avg 1Hr) | AVG(h2s_content) | Last 60 records | 180 ppm |
| C10 | H₂S (Avg 12Hr) | AVG(h2s_content) | Last 720 records | 190 ppm |

### 3.2 Totalizers (Cumulative Calculations)

| # | Field Name | Calculation Method | Time Window | Example Value |
|---|------------|-------------------|-------------|---------------|
| C11 | Product Gas Totalizer (24Hr) | SUM(product_gas_flow) | Last 1440 records | 27,600 Nm³ |
| C12 | Total Feed Flow | feed_fm1 + feed_fm2 | Current | 80 m³/hr |
| C13 | Total Water Flow | feed_fm1 + feed_fm2 + fresh_water_fm + recycle_water_fm | Current | 118 m³/hr |

### 3.3 Tank Volume Calculations

| # | Field Name | Calculation Method | Example Value |
|---|------------|-------------------|---------------|
| C14 | Buffer Tank Volume | buffer_tank_level × 1078 / 100 | 884 m³ |

### 3.4 Trends Statistics (Per Parameter)

| # | Statistic | Calculation Method | Used In |
|---|-----------|-------------------|---------|
| C15 | 12-Hour Average | AVG over 720 records | Trends Page |
| C16 | 24-Hour Average | AVG over 1440 records | Trends Page |
| C17 | Min (Selected Range) | MIN over selected range | Trends Page |
| C18 | Max (Selected Range) | MAX over selected range | Trends Page |

---

## 4. DATABASE SCHEMA

### 4.1 Main Data Table: `scada_readings`

```sql
CREATE TABLE scada_readings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Gas Flow (3 fields)
    raw_biogas_flow DECIMAL(10,2) COMMENT 'Nm³/hr',
    purified_gas_flow DECIMAL(10,2) COMMENT 'Nm³/hr',
    product_gas_flow DECIMAL(10,2) COMMENT 'Nm³/hr',
    
    -- Gas Composition (5 fields)
    ch4_concentration DECIMAL(5,2) COMMENT '%',
    co2_level DECIMAL(5,2) COMMENT '%',
    o2_concentration DECIMAL(5,3) COMMENT '%',
    h2s_content DECIMAL(8,2) COMMENT 'ppm',
    dew_point DECIMAL(6,2) COMMENT 'mg/m³',
    
    -- Digester 1 (4 fields)
    d1_temperature DECIMAL(5,2) COMMENT '°C',
    d1_balloon_gas_pressure DECIMAL(6,2),
    d1_balloon_air_pressure DECIMAL(6,2),
    d1_slurry_height DECIMAL(5,2) COMMENT 'm',
    
    -- Digester 2 (4 fields)
    d2_temperature DECIMAL(5,2) COMMENT '°C',
    d2_balloon_gas_pressure DECIMAL(6,2),
    d2_balloon_air_pressure DECIMAL(6,2),
    d2_slurry_height DECIMAL(5,2) COMMENT 'm',
    
    -- Tank Levels (2 fields)
    buffer_tank_level DECIMAL(5,2) COMMENT '%',
    lagoon_tank_level DECIMAL(5,2) COMMENT '%',
    
    -- Water Flow Meters (4 fields)
    feed_fm1 DECIMAL(6,2) COMMENT 'm³/hr',
    feed_fm2 DECIMAL(6,2) COMMENT 'm³/hr',
    fresh_water_fm DECIMAL(6,2) COMMENT 'm³/hr',
    recycle_water_fm DECIMAL(6,2) COMMENT 'm³/hr',
    
    -- Indexes for performance
    INDEX idx_timestamp (timestamp),
    INDEX idx_date (DATE(timestamp))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 4.2 Users Table: `users`

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('HEAD_OFFICE', 'MNRE') NOT NULL,
    name VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    is_active BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 4.3 Reports History Table: `report_downloads`

```sql
CREATE TABLE report_downloads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    report_type VARCHAR(50),
    report_name VARCHAR(255),
    date_range_start DATE,
    date_range_end DATE,
    format ENUM('PDF', 'CSV', 'Excel'),
    file_size VARCHAR(20),
    downloaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 5. DATABASE STORAGE ANALYSIS (1 Year)

### 5.1 Record Size Calculation

| Component | Size (Bytes) |
|-----------|--------------|
| id (INT) | 4 |
| timestamp (DATETIME) | 8 |
| 22 DECIMAL fields (~8 bytes each) | 176 |
| Row overhead | ~20 |
| **Total per record** | **~208 bytes** |

### 5.2 Records Per Year

| Time Period | Records |
|-------------|---------|
| Per Hour | 60 |
| Per Day | 1,440 |
| Per Month | 43,200 |
| **Per Year** | **525,600** |

### 5.3 Storage Requirements

| Component | Calculation | Size |
|-----------|-------------|------|
| Raw Data | 525,600 × 208 bytes | 109.3 MB |
| Primary Index | ~10% overhead | 10.9 MB |
| Timestamp Index | ~15% of data | 16.4 MB |
| Date Index | ~5% of data | 5.5 MB |
| InnoDB Overhead | ~20% buffer | 28.4 MB |
| **Total Data Storage** | | **~170 MB/year** |

### 5.4 Additional Storage

| Table | Estimated Size |
|-------|---------------|
| users | < 1 MB |
| report_downloads | ~5 MB/year (assuming 100 reports/day) |
| **Total Additional** | **~6 MB/year** |

### 5.5 Total Storage Summary

| Duration | Storage Required | Recommended Allocation |
|----------|-----------------|----------------------|
| 1 Year | ~176 MB | **250 MB** |
| 2 Years | ~352 MB | **500 MB** |
| 3 Years | ~528 MB | **750 MB** |
| 5 Years | ~880 MB | **1.2 GB** |

**Recommendation:** Allocate **500 MB** for comfortable 2-year operation with room for growth.

---

## 6. STATUS LOGIC SUMMARY

### 6.1 Gas Composition Status Rules

| Parameter | Accepted/Normal | Warning | Critical |
|-----------|----------------|---------|----------|
| CH₄ | ≥ 96% | 90-96% | < 90% |
| CO₂ | < 5% | 5-7% | > 7% |
| O₂ | < 0.5% | 0.5-1% | > 1% |
| H₂S | < 200 ppm | 200-300 ppm | > 300 ppm |

### 6.2 Dew Point Status Rules

| Range | Status |
|-------|--------|
| < -65 mg/m³ | Within Limits |
| -65 to -50 mg/m³ | Warning |
| > -50 mg/m³ | Critical |

### 6.3 Tank Level Status Rules

| Tank | Normal | Warning | Critical |
|------|--------|---------|----------|
| Buffer Tank | < 70% | 70-90% | > 90% |
| Lagoon Tank | < 85% | ≥ 85% | > 95% |

### 6.4 Digester Status Rules

| Parameter | Normal Range | Warning |
|-----------|-------------|---------|
| Temperature | 35-40°C | Outside range |
| Gas Pressure | < Max (40) | ≥ Max |
| Air Pressure | < Max (25) | ≥ Max |

---

## 7. API ENDPOINTS STRUCTURE

### 7.1 Dashboard API

```
GET /api/dashboard
Response: Latest reading + calculated averages + status
```

### 7.2 Trends API

```
GET /api/trends?range={1h|12h|24h|7d}&params={param1,param2}
Response: Historical data array + statistics (12hr_avg, 24hr_avg, min, max)
```

### 7.3 Reports API

```
GET /api/reports/generate?type={production|quality|performance|compliance}&start={date}&end={date}&format={pdf|csv}
Response: Report data or download link
```

### 7.4 Data Ingestion API

```
POST /api/data/ingest
Body: { all 22 SCADA fields }
Response: { success: true, id: {record_id} }
```

---

## 8. CONSTANTS & CONFIGURATION

### 8.1 Tank Capacities

| Tank | Capacity |
|------|----------|
| Buffer Tank | 1,078 m³ |
| Slurry Tank (D1) | 10 m (height) |
| Slurry Tank (D2) | 10 m (height) |

### 8.2 Refresh Intervals

| Data Type | Interval |
|-----------|----------|
| Dashboard Live Data | 60 seconds |
| Trends Data | 60 seconds |
| Reports | On-demand |

### 8.3 Data Retention

| Retention Period | Recommendation |
|-----------------|----------------|
| Real-time Dashboard | Latest record |
| Trends Data | 7 days detailed, 1 year aggregated |
| Reports | Indefinite |

---

## 9. FIELD COUNT SUMMARY

| Category | SCADA Input Fields | Calculated Fields |
|----------|-------------------|-------------------|
| Gas Flow | 3 | 4 (averages) |
| Gas Composition | 5 | 8 (averages) |
| Digester 1 | 4 | 0 |
| Digester 2 | 4 | 0 |
| Tank Levels | 2 | 1 (volume) |
| Water Flow | 4 | 2 (totals) |
| **TOTAL** | **22** | **15** |

---

## 10. REVISION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 2026 | Initial field structure |
| 2.0 | Feb 2026 | Updated with actual values, limits, status logic, storage analysis |

---

**Document Prepared By:** SCADA Development Team  
**For:** LR Energy Biogas Plant - Karnal  
**Technology Partner:** Elan Energies
