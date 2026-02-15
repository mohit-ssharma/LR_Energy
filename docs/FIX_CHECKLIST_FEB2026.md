# SCADA Dashboard Fix Checklist - February 2026

This document contains all the fixes applied to resolve the data display and calculation issues reported by the user.

---

## ✅ FIXES APPLIED

### 1. Totalizer Value Display (Show Actual Value from DB)
- **Issue:** Totalizer was showing calculated value (MAX-MIN) instead of actual meter reading
- **Fix Location:** `/app/frontend/src/components/KPISummary.js`
- **Fix Applied:** Changed from `totalizer_24hr?.raw_biogas` to `current?.raw_biogas_totalizer`
- **How to Test:** 
  - If you input totalizer value 150061, the dashboard should show "150,061 Nm³"
  - The label is now "Totalizer" (not "Totalizer 24 Hr")

### 2. H₂S Value Display (Integer instead of Float)
- **Issue:** H₂S value was displaying as "5.0" instead of "5"
- **Fix Location:** `/app/frontend/src/components/KPISummary.js`
- **Fix Applied:** Changed to `Math.round(current?.h2s_content || 0)` for all H₂S values
- **How to Test:** Check the H₂S KPI card - value should be a whole number (e.g., "3 ppm" not "3.0 ppm")

### 3. Backend Separate 12hr/24hr Statistics
- **Issue:** Statistics 12-Hr and 24-Hr Avg showing identical values
- **Fix Location:** `/app/php-api/trends.php`
- **Fix Applied:** Backend now runs separate SQL queries:
  - 12-hour average: `WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 12 HOUR)`
  - 24-hour average: `WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`
- **How to Test:** With sufficient historical data, 12-Hr and 24-Hr Avg should show different values

### 4. Comparison Section - Major Rewrite
- **Issue:** Comparison was showing Today's Average vs Yesterday's Average
- **Fix Location:** `/app/php-api/comparison.php`, `/app/frontend/src/components/ComparisonView.js`
- **Fix Applied:** 
  - **Today** = Current/Latest reading (most recent value)
  - **Yesterday** = Average of all readings from yesterday
  - Labels updated to "Today (Current)" and "Yesterday (Avg)"

### 5. CO2, O2, H2S Improvement Logic
- **Issue:** Improvement status was calculated incorrectly for gases where lower is better
- **Fix Location:** `/app/php-api/comparison.php`
- **Fix Applied:** 
  - For CO2, O2, H2S: `higherIsBetter = false`
  - If `(today_value - yesterday_avg) < 0` = **IMPROVED** (today is lower = good)
  - If `(today_value - yesterday_avg) > 0` = **DECLINED/WARNING** (today is higher = bad)
- **Example:**
  - H2S Today: 3 ppm, Yesterday Avg: 5 ppm
  - Change: 3 - 5 = -2 ppm (-40%)
  - Status: **IMPROVED** (lower H2S is better)

### 6. H₂S Default Value Correction
- **Issue:** Mock data used 180 ppm for H₂S (exceeds max limit of 105 ppm)
- **Fix Applied:** Changed default H₂S from 180 ppm to 3 ppm (within Accepted range)

---

## 📋 TESTING CHECKLIST

Before deployment, verify each item:

| # | Test Item | Status | Notes |
|---|-----------|--------|-------|
| 1 | Totalizer shows actual value from DB (e.g., 150061) | ⬜ | |
| 2 | Totalizer label says "Totalizer" (not "24 Hr") | ⬜ | |
| 3 | H₂S value displays as integer (no decimal) | ⬜ | |
| 4 | 12-Hr Avg and 24-Hr Avg are different (with sufficient data) | ⬜ | |
| 5 | Comparison shows "Today (Current)" vs "Yesterday (Avg)" | ⬜ | |
| 6 | CO2 decrease = IMPROVED (green) | ⬜ | |
| 7 | O2 decrease = IMPROVED (green) | ⬜ | |
| 8 | H2S decrease = IMPROVED (green) | ⬜ | |
| 9 | All KPI cards load without errors | ⬜ | |
| 10 | Data refreshes every 30 seconds | ⬜ | |

---

## 🔧 HOW TO TEST COMPARISON LOGIC

### Test Case 1: H2S Improvement
1. Insert yesterday data with H2S = 5 ppm (multiple records)
2. Insert today data with H2S = 3 ppm
3. **Expected:** Status = "Improved", Change = -40%

### Test Case 2: CO2 Decline
1. Insert yesterday data with CO2 = 2.5% (multiple records)
2. Insert today data with CO2 = 3.0%
3. **Expected:** Status = "Warning" or "Declined", Change = +20%

### Test Case 3: Gas Flow Improvement
1. Insert yesterday data with Raw Biogas Flow = 1200 Nm³/hr
2. Insert today data with Raw Biogas Flow = 1300 Nm³/hr
3. **Expected:** Status = "Improved", Change = +8.3%

---

## 📁 FILES MODIFIED IN THIS FIX

| File | Changes |
|------|---------|
| `/app/frontend/src/components/KPISummary.js` | Totalizer shows actual value, H₂S integer display |
| `/app/frontend/src/components/ComparisonView.js` | Labels updated, mock data fixed |
| `/app/frontend/src/components/TrendsPage.js` | Uses API statistics, H₂S mock value |
| `/app/php-api/comparison.php` | Complete rewrite - Today Current vs Yesterday Avg |
| `/app/php-api/trends.php` | Separate 12hr/24hr statistics queries |
| `/app/docs/STATUS_DISPLAY_RULES.md` | H₂S default value corrected |

---

## ⚠️ IMPORTANT NOTES

1. **Totalizer Logic:** Now shows the actual meter reading from the database as-is. If the PLC sends 150061, you see 150061.

2. **Comparison Logic:** 
   - Today = CURRENT value (latest reading)
   - Yesterday = AVERAGE of all yesterday's readings
   - This is updated every minute as new data comes in

3. **CO2/O2/H2S Rule:** Lower is better
   - Negative change = Improved
   - Positive change = Warning/Declined

4. **Data Refresh:** Dashboard refreshes every 30 seconds, Comparison/Trends every 60 seconds

---

*Last Updated: February 2026*
