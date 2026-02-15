# SCADA Dashboard Fix Checklist - February 2026

This document contains all the fixes applied to resolve the data display and calculation issues reported by the user.

---

## ✅ FIXES APPLIED

### 1. H₂S Value Display (Integer instead of Float)
- **Issue:** H₂S value was displaying as "5.0" instead of "5"
- **Fix Location:** `/app/frontend/src/components/KPISummary.js`
- **Fix Applied:** Changed from `formatNumber(current?.h2s_content, 0)` to `Math.round(current?.h2s_content || 0)` for all H₂S values
- **How to Test:** Check the H₂S KPI card on the dashboard - value should be a whole number (e.g., "3 ppm" not "3.0 ppm")

### 2. Totalizer Values Display
- **Issue:** Totalizer values showing incorrect numbers (e.g., "93 km³" instead of proper values)
- **Fix Location:** `/app/frontend/src/components/KPISummary.js`
- **Fix Applied:** 
  - Added `Math.round()` to totalizer values to ensure whole numbers
  - Unit is "Nm³" (not km³) - verify this displays correctly
- **How to Test:** 
  - Submit multiple readings throughout the day via `simulate.php`
  - The Totalizer (24 Hr) value = MAX totalizer reading - MIN totalizer reading for today
  - If you have only 1 record today, the value will be 0 (this is correct behavior)

### 3. Backend Totalizer Debug Info
- **Issue:** Needed visibility into how totalizer is calculated
- **Fix Location:** `/app/php-api/dashboard.php`
- **Fix Applied:** Added debug fields to `totalizer_24hr` response:
  - `_debug_raw_biogas_min`
  - `_debug_raw_biogas_max`
  - `_debug_purified_gas_min`
  - `_debug_purified_gas_max`
  - `_debug_product_gas_min`
  - `_debug_product_gas_max`
- **How to Test:** Check the API response in browser dev tools or via `curl`:
  ```bash
  curl http://localhost/scada-api/dashboard.php | jq '.totalizer_24hr'
  ```

### 4. Statistics Calculation on Trends Page (12-Hr and 24-Hr Averages)
- **Issue:** 12-Hr Avg and 24-Hr Avg showing identical values
- **Fix Location:** 
  - `/app/php-api/trends.php` (Backend)
  - `/app/frontend/src/components/TrendsPage.js` (Frontend)
- **Fix Applied:** 
  - Backend now calculates separate 12hr and 24hr averages from the database
  - Frontend uses API statistics (more accurate) instead of calculating from local data
  - Each parameter now returns: `avg_12hr`, `avg_24hr`, `min`, `max`
- **How to Test:** 
  - Ensure you have data spanning more than 12 hours
  - The 12-Hr Avg should reflect data from the last 12 hours only
  - The 24-Hr Avg should reflect data from the last 24 hours
  - If you only have a few records, the values might be similar

### 5. H₂S Default Value Correction
- **Issue:** Mock data used 180 ppm for H₂S (exceeds max limit of 105 ppm)
- **Fix Location:** 
  - `/app/frontend/src/components/KPISummary.js`
  - `/app/frontend/src/components/TrendsPage.js`
  - `/app/docs/STATUS_DISPLAY_RULES.md`
- **Fix Applied:** Changed default H₂S from 180 ppm to 3 ppm (within Accepted range)
- **How to Test:** In demo mode, H₂S should show ~3 ppm (green/Accepted status)

### 6. Comparison Section (Previous Average Values)
- **Issue:** Need to verify comparison section calculates yesterday's averages correctly
- **Fix Location:** `/app/php-api/comparison.php`
- **Status:** Already implemented correctly - calculates averages for:
  - Today (00:00 AM to NOW)
  - Yesterday (00:00 AM to 11:59 PM of previous day)
- **How to Test:**
  - Insert data via simulate.php for today
  - Ensure there is data from yesterday in the database
  - The comparison should show different values for Today vs Yesterday

---

## 📋 TESTING CHECKLIST

Before deployment, verify each item:

| # | Test Item | Status | Notes |
|---|-----------|--------|-------|
| 1 | H₂S value displays as integer (no decimal) | ⬜ | |
| 2 | Totalizer (24 Hr) shows correct daily production | ⬜ | Need multiple records per day |
| 3 | Totalizer unit shows "Nm³" (not "km³") | ⬜ | |
| 4 | 12-Hr Avg and 24-Hr Avg are different (with sufficient data) | ⬜ | |
| 5 | Min/Max values in Statistics are within expected limits | ⬜ | H₂S Max should be ≤ 105 ppm |
| 6 | Comparison shows different Today vs Yesterday values | ⬜ | |
| 7 | All KPI cards load without errors | ⬜ | |
| 8 | Trends page statistics are accurate | ⬜ | |
| 9 | Data refreshes every 30 seconds | ⬜ | |

---

## 🔧 HOW TO TEST WITH simulate.php

1. **Open in browser:** `http://localhost/scada-api/simulate.php`

2. **Submit multiple readings** with varying totalizer values:
   - Reading 1: `raw_biogas_totalizer = 150000`
   - Reading 2: `raw_biogas_totalizer = 150100`
   - Reading 3: `raw_biogas_totalizer = 150200`
   
3. **Expected result:**
   - Totalizer (24 Hr) = 150200 - 150000 = 200 Nm³
   - This represents the daily production

4. **Check API response:**
   ```bash
   curl http://localhost/scada-api/dashboard.php | jq
   ```

---

## 📁 FILES MODIFIED IN THIS FIX

| File | Changes |
|------|---------|
| `/app/frontend/src/components/KPISummary.js` | H₂S integer display, totalizer formatting |
| `/app/frontend/src/components/TrendsPage.js` | Statistics from API, H₂S mock value |
| `/app/php-api/dashboard.php` | Added debug info for totalizers |
| `/app/php-api/trends.php` | Separate 12hr/24hr statistics queries |
| `/app/docs/STATUS_DISPLAY_RULES.md` | H₂S default value corrected |

---

## ⚠️ IMPORTANT NOTES

1. **Totalizer Logic:** The Totalizer (24 Hr) calculates daily production as `MAX - MIN` of the totalizer readings for today. If you only have 1 reading, the value will be 0.

2. **Statistics Accuracy:** For accurate 12-Hr and 24-Hr averages, ensure you have at least 12-24 hours of historical data in the database.

3. **H₂S Limits:** According to your rules:
   - < 5 ppm = Accepted (Green)
   - ≥ 5 ppm = Critical (Red)
   - Max limit: 105 ppm

4. **Data Simulation:** For thorough testing, use `auto_simulate.php` to generate multiple data points automatically.

---

*Last Updated: February 2026*
