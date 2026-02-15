# Production Simulation Guide
## How to Test SCADA System Without PLC Connection

---

## 🎯 PURPOSE

Test the production environment before PLC is connected to:
- Verify API endpoints work
- Check dashboard displays data correctly
- Test alerts and thresholds
- Validate trends and reports

---

## 📋 SIMULATION OPTIONS

### Option 1: Manual Simulator (Browser)

**URL:**
```
https://karnal.lrenergy.in/scada-api/simulate.php
```

**How to Use:**
1. Open URL in browser
2. Select simulation mode:
   - Normal Operation
   - Warning Scenario
   - Critical Scenario
   - Equipment Off
3. Click "Send Data" button
4. Check dashboard for updates

---

### Option 2: Auto Simulator (10 Scenarios)

**URL:**
```
https://karnal.lrenergy.in/scada-api/auto_simulate.php?duration=10&interval=30
```

**Parameters:**
| Parameter | Default | Description |
|-----------|---------|-------------|
| `duration` | 10 | Total minutes to run |
| `interval` | 60 | Seconds between readings |

**10 Predefined Scenarios:**
| # | Scenario | Key Values |
|---|----------|------------|
| 1 | ✅ Normal Operation | Optimal values |
| 2 | 📈 High Gas Production | Flow +10%, CH₄ 97.2% |
| 3 | 📉 Low Gas Production | Flow -20%, Morning start |
| 4 | ⚠️ Low CH₄ | CH₄ 94.5% (below 96%) |
| 5 | 🚨 High H₂S | H₂S 85 ppm (Critical) |
| 6 | ⚠️ High Temperature | D1 Temp 44.5°C |
| 7 | 🚨 High Tank Level | Buffer 93% (Critical) |
| 8 | ⚠️ Low PSA Efficiency | PSA 88.5% |
| 9 | 🌙 Night Operation | Reduced load -15% |
| 10 | 🏆 Peak Performance | Max values, CH₄ 97.5% |

**How to Use:**
1. Open URL in browser
2. Page auto-refreshes and sends data
3. Watch scenario number change (1 → 2 → 3... → 10 → 1)
4. Check dashboard updates in another tab

---

### Option 3: Postman (API Testing)

**URL:**
```
POST https://karnal.lrenergy.in/scada-api/receive_data.php?api_key=SCADA_LR_ENERGY_2026_SECURE_KEY
```

**Headers:**
```
Content-Type: application/json
```

**Body (Sample Data):**
```json
{
  "timestamp": "2026-02-16 10:30:00",
  "plant_id": "KARNAL",
  "raw_biogas_flow": 1250.50,
  "raw_biogas_totalizer": 150000.00,
  "purified_gas_flow": 1180.20,
  "purified_gas_totalizer": 142000.00,
  "product_gas_flow": 1150.80,
  "product_gas_totalizer": 138000.00,
  "ch4_concentration": 96.80,
  "co2_level": 2.90,
  "o2_concentration": 0.30,
  "h2s_content": 3,
  "dew_point": -68,
  "d1_temp_bottom": 37.00,
  "d1_temp_top": 36.50,
  "d1_gas_pressure": 32.00,
  "d1_air_pressure": 18.00,
  "d1_slurry_height": 7.60,
  "d1_gas_level": 75.00,
  "d2_temp_bottom": 36.50,
  "d2_temp_top": 36.00,
  "d2_gas_pressure": 30.00,
  "d2_air_pressure": 17.00,
  "d2_slurry_height": 7.30,
  "d2_gas_level": 72.00,
  "buffer_tank_level": 65.00,
  "lagoon_tank_level": 60.00,
  "feed_fm1_flow": 42.00,
  "feed_fm1_totalizer": 5000.00,
  "feed_fm2_flow": 38.00,
  "feed_fm2_totalizer": 4500.00,
  "fresh_water_flow": 12.00,
  "fresh_water_totalizer": 1500.00,
  "recycle_water_flow": 26.00,
  "recycle_water_totalizer": 3000.00,
  "psa_status": 1,
  "psa_efficiency": 94.40,
  "lt_panel_power": 245.00,
  "compressor_status": 1
}
```

---

## 🧪 TESTING CHECKLIST

### Dashboard Testing:
| Test | Expected Result | Status |
|------|-----------------|--------|
| Login as HEAD_OFFICE | See full dashboard | ⬜ |
| Login as MNRE | See restricted view | ⬜ |
| Current values display | Shows latest reading | ⬜ |
| 1hr/12hr averages | Shows calculated averages | ⬜ |
| Equipment status | Shows Running/Stopped | ⬜ |
| Auto-refresh (30s) | Data updates automatically | ⬜ |

### Trends Testing:
| Test | Expected Result | Status |
|------|-----------------|--------|
| 1 Hour view | Shows 10 data points | ⬜ |
| 12 Hour view | Shows 10 data points | ⬜ |
| 24 Hour view | Shows 10 data points | ⬜ |
| 7 Day view | Shows 7 data points | ⬜ |
| Graph displays | Lines render correctly | ⬜ |

### Reports Testing:
| Test | Expected Result | Status |
|------|-----------------|--------|
| Daily report | Shows day's summary | ⬜ |
| Weekly report | Shows week's summary | ⬜ |
| PDF export | Downloads PDF file | ⬜ |

---

## 🗑️ CLEANUP AFTER TESTING

After testing, delete all simulation data:

**URL:**
```
https://karnal.lrenergy.in/scada-api/cleanup.php
```

1. Open URL
2. Click "DELETE ALL TEST DATA" button
3. Delete `cleanup.php` file from server

---

## ⚠️ IMPORTANT NOTES

1. **Use Past/Current Timestamps:** Don't use future timestamps or `data_age_seconds` will be negative

2. **Totalizer Values:** Should always increase (cumulative counters)

3. **H₂S Values:** Must be integers (whole numbers)

4. **Status Fields:** Use 1 (Running) or 0 (Stopped)

5. **Delete Test Data:** Before PLC goes live, clear all simulation data

---

**Document Version:** 1.0
**Last Updated:** February 2026
