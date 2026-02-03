# SCADA Database Fields Specification

## Overview
- **Raw Values (from Database):** 35 fields
- **Calculated Values (by Backend):** 27 fields
- **Total Dashboard Fields:** 62 fields

---

## PART 1: RAW VALUES FROM DATABASE (35 Fields)

### 1.1 Gas Flow & Composition (10 fields)

| # | Field Name | Unit | Description |
|---|------------|------|-------------|
| 1 | raw_biogas_flow | Nm³/hr | Raw biogas flow rate |
| 2 | raw_biogas_totalizer | Nm³ | Raw biogas total volume |
| 3 | purified_gas_flow | Nm³/hr | Purified gas flow rate |
| 4 | purified_gas_totalizer | Nm³ | Purified gas total volume |
| 5 | product_gas_flow | Kg/hr | Product gas flow rate |
| 6 | product_gas_totalizer | Kg | Product gas total |
| 7 | ch4_concentration | % | Methane concentration |
| 8 | co2_concentration | % | Carbon dioxide concentration |
| 9 | o2_concentration | % | Oxygen concentration |
| 10 | h2s_concentration | ppm | Hydrogen sulfide |

### 1.2 Dew Point (1 field)

| # | Field Name | Unit | Description |
|---|------------|------|-------------|
| 11 | dew_point_moisture | mg/m³ | Moisture content |

### 1.3 Digester 1 (7 fields)

| # | Field Name | Unit | Description |
|---|------------|------|-------------|
| 12 | d1_temp_bottom | °C | Bottom temperature |
| 13 | d1_temp_top | °C | Top temperature |
| 14 | d1_pressure_gas | mmWC | Balloon gas pressure |
| 15 | d1_pressure_air | mmWC | Balloon air pressure |
| 16 | d1_gas_level | % | Gas level |
| 17 | d1_air_level | mmWC | Balloon air level |
| 18 | d1_slurry_height | Meter | Slurry height |

### 1.4 Digester 2 (7 fields)

| # | Field Name | Unit | Description |
|---|------------|------|-------------|
| 19 | d2_temp_bottom | °C | Bottom temperature |
| 20 | d2_temp_top | °C | Top temperature |
| 21 | d2_pressure_gas | mmWC | Balloon gas pressure |
| 22 | d2_pressure_air | mmWC | Balloon air pressure |
| 23 | d2_gas_level | % | Gas level |
| 24 | d2_air_level | mmWC | Balloon air level |
| 25 | d2_slurry_height | Meter | Slurry height |

### 1.5 Tank Levels (2 fields)

| # | Field Name | Unit | Description |
|---|------------|------|-------------|
| 26 | buffer_tank_level | m³ | Buffer tank slurry level |
| 27 | lagoon_tank_level | m³ | Lagoon tank water level |

### 1.6 Water Flow Meters (8 fields)

| # | Field Name | Unit | Description |
|---|------------|------|-------------|
| 28 | feed_fm1_flow | Nm³/hr | Feed FM-I flow rate |
| 29 | feed_fm1_totalizer | m³ | Feed FM-I total |
| 30 | feed_fm2_flow | Nm³/hr | Feed FM-II flow rate |
| 31 | feed_fm2_totalizer | m³ | Feed FM-II total |
| 32 | fresh_water_flow | Nm³/hr | Fresh water flow rate |
| 33 | fresh_water_totalizer | m³ | Fresh water total |
| 34 | recycle_water_flow | Nm³/hr | Recycle water flow rate |
| 35 | recycle_water_totalizer | m³ | Recycle water total |

---

## PART 2: CALCULATED VALUES BY BACKEND (27 Fields)

### 2.1 KPI Change Percentages (6 fields)

| # | Calculated Field | Formula | Source Field |
|---|------------------|---------|--------------|
| 1 | raw_biogas_change | ((current - previous) / previous) × 100 | raw_biogas_flow |
| 2 | purified_gas_change | ((current - previous) / previous) × 100 | purified_gas_flow |
| 3 | product_gas_change | ((current - previous) / previous) × 100 | product_gas_flow |
| 4 | ch4_change | ((current - previous) / previous) × 100 | ch4_concentration |
| 5 | o2_change | ((current - previous) / previous) × 100 | o2_concentration |
| 6 | dew_point_change | ((current - previous) / previous) × 100 | dew_point_moisture |

### 2.2 Status Values (6 fields)

| # | Calculated Field | Logic | Source Field |
|---|------------------|-------|--------------|
| 7 | ch4_status | If ≥95% → "Optimal", else "Normal" | ch4_concentration |
| 8 | o2_status | If <1% → "Normal", else "Warning" | o2_concentration |
| 9 | dew_point_status | If <4 → "Within Limits", else "Warning" | dew_point_moisture |
| 10 | h2s_status | If <50ppm → "Normal", 50-80 → "Warning", >80 → "Critical" | h2s_concentration |
| 11 | buffer_tank_status | Based on % full | buffer_tank_level |
| 12 | lagoon_tank_status | Based on % full | lagoon_tank_level |

**Tank Status Logic:**
- 0-50% → "Normal"
- 50-75% → "Moderate"
- 75-90% → "High"
- 90%+ → "Critical"

### 2.3 Tank Calculations (4 fields)

| # | Calculated Field | Formula | Source Fields |
|---|------------------|---------|---------------|
| 13 | buffer_tank_percentage | (buffer_tank_level / 250) × 100 | buffer_tank_level, capacity=250 |
| 14 | buffer_tank_available | 250 - buffer_tank_level | buffer_tank_level |
| 15 | lagoon_tank_percentage | (lagoon_tank_level / 500) × 100 | lagoon_tank_level, capacity=500 |
| 16 | lagoon_tank_available | 500 - lagoon_tank_level | lagoon_tank_level |

### 2.4 Flow Meter Utilization (4 fields)

| # | Calculated Field | Formula | Source Field |
|---|------------------|---------|--------------|
| 17 | feed_fm1_utilization | (feed_fm1_flow / max_capacity) × 100 | feed_fm1_flow |
| 18 | feed_fm2_utilization | (feed_fm2_flow / max_capacity) × 100 | feed_fm2_flow |
| 19 | fresh_water_utilization | (fresh_water_flow / max_capacity) × 100 | fresh_water_flow |
| 20 | recycle_water_utilization | (recycle_water_flow / max_capacity) × 100 | recycle_water_flow |

### 2.5 Dew Point Stats (3 fields - from historical data)

| # | Calculated Field | Formula | Source |
|---|------------------|---------|--------|
| 21 | dew_point_average | Average of last 24 hours | Historical dew_point_moisture |
| 22 | dew_point_min | Minimum of last 24 hours | Historical dew_point_moisture |
| 23 | dew_point_max | Maximum of last 24 hours | Historical dew_point_moisture |

### 2.6 Digester Percentages (4 fields)

| # | Calculated Field | Formula | Source Field |
|---|------------------|---------|--------------|
| 24 | d1_gas_pressure_pct | (d1_pressure_gas / 200) × 100 | d1_pressure_gas (max=200) |
| 25 | d1_air_pressure_pct | (d1_pressure_air / 150) × 100 | d1_pressure_air (max=150) |
| 26 | d2_gas_pressure_pct | (d2_pressure_gas / 200) × 100 | d2_pressure_gas (max=200) |
| 27 | d2_air_pressure_pct | (d2_pressure_air / 150) × 100 | d2_pressure_air (max=150) |

---

## PART 3: SUMMARY

### By Category

| Section | Raw Fields | Calculated Fields | Total |
|---------|------------|-------------------|-------|
| Gas Flow & Composition | 10 | 6 | 16 |
| Dew Point | 1 | 4 | 5 |
| Digester 1 | 7 | 2 | 9 |
| Digester 2 | 7 | 2 | 9 |
| Tank Levels | 2 | 6 | 8 |
| Water Flow Meters | 8 | 4 | 12 |
| Status Fields | 0 | 6 | 6 |
| **TOTAL** | **35** | **27** | **62** |

---

## PART 4: SUGGESTED DATABASE TABLE STRUCTURE

### Option A: Single Table (Simple)

```sql
CREATE TABLE scada_readings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME NOT NULL,
    
    -- Gas Flow & Composition
    raw_biogas_flow DECIMAL(10,2),
    raw_biogas_totalizer DECIMAL(15,2),
    purified_gas_flow DECIMAL(10,2),
    purified_gas_totalizer DECIMAL(15,2),
    product_gas_flow DECIMAL(10,2),
    product_gas_totalizer DECIMAL(15,2),
    ch4_concentration DECIMAL(5,2),
    co2_concentration DECIMAL(5,2),
    o2_concentration DECIMAL(5,2),
    h2s_concentration DECIMAL(8,2),
    
    -- Dew Point
    dew_point_moisture DECIMAL(8,2),
    
    -- Digester 1
    d1_temp_bottom DECIMAL(5,2),
    d1_temp_top DECIMAL(5,2),
    d1_pressure_gas DECIMAL(8,2),
    d1_pressure_air DECIMAL(8,2),
    d1_gas_level DECIMAL(5,2),
    d1_air_level DECIMAL(8,2),
    d1_slurry_height DECIMAL(5,2),
    
    -- Digester 2
    d2_temp_bottom DECIMAL(5,2),
    d2_temp_top DECIMAL(5,2),
    d2_pressure_gas DECIMAL(8,2),
    d2_pressure_air DECIMAL(8,2),
    d2_gas_level DECIMAL(5,2),
    d2_air_level DECIMAL(8,2),
    d2_slurry_height DECIMAL(5,2),
    
    -- Tank Levels
    buffer_tank_level DECIMAL(10,2),
    lagoon_tank_level DECIMAL(10,2),
    
    -- Water Flow Meters
    feed_fm1_flow DECIMAL(10,2),
    feed_fm1_totalizer DECIMAL(15,2),
    feed_fm2_flow DECIMAL(10,2),
    feed_fm2_totalizer DECIMAL(15,2),
    fresh_water_flow DECIMAL(10,2),
    fresh_water_totalizer DECIMAL(15,2),
    recycle_water_flow DECIMAL(10,2),
    recycle_water_totalizer DECIMAL(15,2),
    
    INDEX idx_timestamp (timestamp)
);
```

---

## PART 5: DATA FLOW ARCHITECTURE

```
┌─────────────────────────────────────────────────────────┐
│                   SCADA SENSORS                          │
│              (PLC / RTU / Field Devices)                 │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                  MySQL DATABASE                          │
│                 (35 Raw Fields)                          │
│           Data logged every 1 minute                     │
└─────────────────────┬───────────────────────────────────┘
                      │ Query every 1 minute
                      ▼
┌─────────────────────────────────────────────────────────┐
│                 BACKEND (FastAPI)                        │
│  • Fetch latest raw data                                │
│  • Calculate 27 derived values                          │
│  • Apply status logic & thresholds                      │
│  • Cache results                                        │
│  • Serve via REST API                                   │
└─────────────────────┬───────────────────────────────────┘
                      │ JSON Response
                      ▼
┌─────────────────────────────────────────────────────────┐
│                 FRONTEND (React)                         │
│  • Display 62 total values                              │
│  • Auto-refresh every 1 minute                          │
│  • Dashboard: Real-time view                            │
│  • Trends: Historical charts                            │
│  • Reports: Data export & analysis                      │
└─────────────────────────────────────────────────────────┘
```

---

## Document Info
- **Generated:** February 2026
- **Project:** LR Energy SCADA Monitoring System
- **Version:** 1.0
