# LR Energy SCADA - Test Cases Document

## Test Environment Setup
- **Backend URL:** `http://localhost/scada-api`
- **Frontend URL:** `http://localhost:3000`
- **Database:** `scada_db` (MySQL via XAMPP)

---

## Quick Test Commands

### Start Local Testing:
```cmd
# Terminal 1: Start XAMPP (Apache + MySQL)

# Terminal 2: Start React Frontend
cd frontend
yarn install
yarn start
```

### Test API Endpoints (PowerShell/CMD):
```powershell
# Test API Health
curl http://localhost/scada-api/test.php

# Test with API Key
curl -X POST http://localhost/scada-api/receive_data.php -H "X-API-Key: sk_prod_LREnergy_283669e54e512351a5bde265e20da2149fd4b54569a7e12b1ee8226746a6a2a7" -H "Content-Type: application/json" -d "{\"timestamp\":\"2026-02-14 10:30:00\",\"plant_id\":\"KARNAL\",\"raw_biogas_flow\":1250.5}"
```

---

## TEST CASE CATEGORIES

| Category | Total Tests |
|----------|-------------|
| 1. Database Setup | 5 |
| 2. API Health | 3 |
| 3. Authentication | 8 |
| 4. Data Ingestion (receive_data.php) | 15 |
| 5. Dashboard API | 6 |
| 6. Trends API | 4 |
| 7. Comparison API | 4 |
| 8. Frontend UI | 10 |
| **TOTAL** | **55** |

---

## 1. DATABASE SETUP TESTS

| TC# | Test Case | Steps | Test Data | Expected Result | Actual Result | Status |
|-----|-----------|-------|-----------|-----------------|---------------|--------|
| DB-001 | Database exists | Open phpMyAdmin, check databases | - | `scada_db` visible in list | | ⬜ |
| DB-002 | Tables created | SELECT * FROM information_schema.tables WHERE table_schema='scada_db' | - | 4 tables: scada_readings, users, sync_status, api_logs | | ⬜ |
| DB-003 | Users table has data | SELECT * FROM users | - | 2 users (ho@lrenergy.in, mnre@lrenergy.in) | | ⬜ |
| DB-004 | Indexes exist | SHOW INDEX FROM scada_readings | - | idx_unique_plant_timestamp, idx_timestamp visible | | ⬜ |
| DB-005 | Empty readings table | SELECT COUNT(*) FROM scada_readings | - | Count = 0 (fresh install) | | ⬜ |

---

## 2. API HEALTH TESTS

| TC# | Test Case | URL/Command | Expected Result | Actual Result | Status |
|-----|-----------|-------------|-----------------|---------------|--------|
| API-001 | Test endpoint works | `GET http://localhost/scada-api/test.php` | `{"status":"success","database":"connected"}` | | ⬜ |
| API-002 | Invalid endpoint | `GET http://localhost/scada-api/invalid.php` | 404 Not Found | | ⬜ |
| API-003 | CORS headers present | Check response headers | `Access-Control-Allow-Origin: *` present | | ⬜ |

---

## 3. AUTHENTICATION TESTS

| TC# | Test Case | Test Data | Expected Result | Actual Result | Status |
|-----|-----------|-----------|-----------------|---------------|--------|
| AUTH-001 | Valid HO login | email: `ho@lrenergy.in`, password: `qwerty@1234` | Login success, redirect to dashboard list | | ⬜ |
| AUTH-002 | Valid MNRE login | email: `mnre@lrenergy.in`, password: `qwerty@1234` | Login success, redirect to MNRE dashboard | | ⬜ |
| AUTH-003 | Invalid email | email: `wrong@email.com`, password: `qwerty@1234` | Error: "Invalid credentials" | | ⬜ |
| AUTH-004 | Invalid password | email: `ho@lrenergy.in`, password: `wrongpass` | Error: "Invalid credentials" | | ⬜ |
| AUTH-005 | Empty email | email: ``, password: `qwerty@1234` | Error: "Email required" | | ⬜ |
| AUTH-006 | Empty password | email: `ho@lrenergy.in`, password: `` | Error: "Password required" | | ⬜ |
| AUTH-007 | SQL injection attempt | email: `' OR '1'='1`, password: `test` | Error: "Invalid credentials" (not logged in) | | ⬜ |
| AUTH-008 | Logout functionality | Click logout button | Redirect to login page, session cleared | | ⬜ |

---

## 4. DATA INGESTION TESTS (receive_data.php)

### 4.1 Positive Tests

| TC# | Test Case | Request Body | Expected Result | Actual Result | Status |
|-----|-----------|--------------|-----------------|---------------|--------|
| ING-001 | Valid full data | See FULL_DATA_PAYLOAD below | `{"status":"success","fields_received":37}` | | ⬜ |
| ING-002 | Valid partial data (3 fields) | `{"timestamp":"2026-02-14 11:00:00","plant_id":"KARNAL","raw_biogas_flow":1000}` | `{"status":"success","fields_received":1}` | | ⬜ |
| ING-003 | Valid with NULL values | `{"timestamp":"2026-02-14 11:01:00","plant_id":"KARNAL","raw_biogas_flow":null}` | `{"status":"success"}` - NULL stored in DB | | ⬜ |
| ING-004 | Minimum required fields | `{"timestamp":"2026-02-14 11:02:00"}` | `{"status":"success"}` - uses default plant_id | | ⬜ |

### 4.2 Negative Tests

| TC# | Test Case | Request Body | Expected Result | Actual Result | Status |
|-----|-----------|--------------|-----------------|---------------|--------|
| ING-005 | Missing API key | No X-API-Key header | `{"status":"error","message":"Invalid API key"}` 401 | | ⬜ |
| ING-006 | Wrong API key | X-API-Key: `wrong_key` | `{"status":"error","message":"Invalid API key"}` 401 | | ⬜ |
| ING-007 | Empty body | `` (empty) | `{"status":"error","message":"Empty request body"}` 400 | | ⬜ |
| ING-008 | Invalid JSON | `{invalid json}` | `{"status":"error","message":"Invalid JSON:..."}` 400 | | ⬜ |
| ING-009 | Missing timestamp | `{"plant_id":"KARNAL","raw_biogas_flow":1000}` | `{"status":"error","message":"Missing required field: timestamp"}` 400 | | ⬜ |
| ING-010 | Invalid timestamp format | `{"timestamp":"14-02-2026 10:30"}` | `{"status":"error","message":"Invalid timestamp format"}` 400 | | ⬜ |
| ING-011 | Duplicate timestamp | Send same timestamp twice | `{"status":"duplicate","message":"Data for this timestamp already exists"}` | | ⬜ |
| ING-012 | Invalid numeric field | `{"timestamp":"2026-02-14 11:03:00","raw_biogas_flow":"abc"}` | `{"status":"error","message":"Field 'raw_biogas_flow' must be numeric"}` 400 | | ⬜ |
| ING-013 | Invalid boolean field | `{"timestamp":"2026-02-14 11:04:00","psa_status":5}` | `{"status":"error","message":"Field 'psa_status' must be 0 or 1"}` 400 | | ⬜ |
| ING-014 | GET method instead of POST | `GET /receive_data.php` | `{"status":"error","message":"Method not allowed. Use POST."}` 405 | | ⬜ |
| ING-015 | SQL injection in plant_id | `{"timestamp":"2026-02-14 11:05:00","plant_id":"'; DROP TABLE users; --"}` | Data stored safely, no SQL execution | | ⬜ |

---

## 5. DASHBOARD API TESTS

| TC# | Test Case | URL | Expected Result | Actual Result | Status |
|-----|-----------|-----|-----------------|---------------|--------|
| DASH-001 | Get dashboard data | `GET /dashboard.php` | JSON with current, averages, totalizers | | ⬜ |
| DASH-002 | Empty database response | (No data in scada_readings) | Returns zeros/nulls, no error | | ⬜ |
| DASH-003 | With data in database | (After inserting test data) | Returns actual values | | ⬜ |
| DASH-004 | Totalizer calculation | Insert 2 readings with different totalizers | Returns MAX - MIN as daily total | | ⬜ |
| DASH-005 | PSA running hours | Insert readings with psa_status=1 | Running hours = count of status=1 minutes / 60 | | ⬜ |
| DASH-006 | Response time < 5 sec | Time the API call | execution_time_ms < 5000 | | ⬜ |

---

## 6. TRENDS API TESTS

| TC# | Test Case | URL | Expected Result | Actual Result | Status |
|-----|-----------|-----|-----------------|---------------|--------|
| TRD-001 | Get 24hr trends | `GET /trends.php?hours=24` | JSON with data array, coverage stats | | ⬜ |
| TRD-002 | Get 1hr trends | `GET /trends.php?hours=1` | Smaller data array | | ⬜ |
| TRD-003 | Invalid hours param | `GET /trends.php?hours=abc` | Uses default (24 hours) | | ⬜ |
| TRD-004 | Empty database | (No data) | Empty data array, 0% coverage | | ⬜ |

---

## 7. COMPARISON API TESTS

| TC# | Test Case | URL | Expected Result | Actual Result | Status |
|-----|-----------|-----|-----------------|---------------|--------|
| CMP-001 | Today vs Yesterday | `GET /comparison.php?period=today_vs_yesterday` | JSON with current, previous, change values | | ⬜ |
| CMP-002 | This Week vs Last | `GET /comparison.php?period=this_week_vs_last` | Week comparison data | | ⬜ |
| CMP-003 | This Month vs Last | `GET /comparison.php?period=this_month_vs_last` | Month comparison data | | ⬜ |
| CMP-004 | Invalid period | `GET /comparison.php?period=invalid` | Uses default (today_vs_yesterday) | | ⬜ |

---

## 8. FRONTEND UI TESTS

| TC# | Test Case | Steps | Expected Result | Actual Result | Status |
|-----|-----------|-------|-----------------|---------------|--------|
| UI-001 | Login page loads | Open http://localhost:3000 | Login form visible | | ⬜ |
| UI-002 | HO Dashboard access | Login as HO → Click "Open Dashboard" | Full dashboard with all sections | | ⬜ |
| UI-003 | MNRE Dashboard access | Login as MNRE | Only 3 KPIs visible (Gas Flows) | | ⬜ |
| UI-004 | DEMO mode indicator | Dashboard without API data | "DEMO" badge visible | | ⬜ |
| UI-005 | LIVE mode indicator | Dashboard with API connected | "LIVE" badge visible | | ⬜ |
| UI-006 | Auto-refresh (60 sec) | Wait 60 seconds on dashboard | Data refreshes automatically | | ⬜ |
| UI-007 | Trends page charts | Navigate to Trends | Charts render without errors | | ⬜ |
| UI-008 | Reports page | Navigate to Reports | Report templates visible | | ⬜ |
| UI-009 | PDF download | Click download PDF | PDF file downloads | | ⬜ |
| UI-010 | CSV download | Click download CSV | CSV file downloads | | ⬜ |

---

## TEST DATA PAYLOADS

### FULL_DATA_PAYLOAD (for ING-001)
```json
{
  "timestamp": "2026-02-14 10:30:00",
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
  "h2s_content": 180.00,
  "dew_point": -68.00,
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
  "buffer_tank_level": 82.00,
  "lagoon_tank_level": 76.00,
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

### API Key for Testing
```
sk_prod_LREnergy_283669e54e512351a5bde265e20da2149fd4b54569a7e12b1ee8226746a6a2a7
```

---

## CURL COMMANDS FOR TESTING

### Test 1: API Health Check
```powershell
curl http://localhost/scada-api/test.php
```

### Test 2: Valid Data Ingestion
```powershell
curl -X POST http://localhost/scada-api/receive_data.php `
  -H "X-API-Key: sk_prod_LREnergy_283669e54e512351a5bde265e20da2149fd4b54569a7e12b1ee8226746a6a2a7" `
  -H "Content-Type: application/json" `
  -d '{"timestamp":"2026-02-14 10:30:00","plant_id":"KARNAL","raw_biogas_flow":1250.5}'
```

### Test 3: Missing API Key (Should Fail)
```powershell
curl -X POST http://localhost/scada-api/receive_data.php `
  -H "Content-Type: application/json" `
  -d '{"timestamp":"2026-02-14 10:31:00","raw_biogas_flow":1250.5}'
```

### Test 4: Invalid JSON (Should Fail)
```powershell
curl -X POST http://localhost/scada-api/receive_data.php `
  -H "X-API-Key: sk_prod_LREnergy_283669e54e512351a5bde265e20da2149fd4b54569a7e12b1ee8226746a6a2a7" `
  -H "Content-Type: application/json" `
  -d '{invalid json}'
```

### Test 5: Duplicate Timestamp (Should Return Duplicate)
```powershell
# Run Test 2 twice with same timestamp
```

### Test 6: Get Dashboard Data
```powershell
curl http://localhost/scada-api/dashboard.php
```

### Test 7: Get Trends Data
```powershell
curl "http://localhost/scada-api/trends.php?hours=24"
```

### Test 8: Get Comparison Data
```powershell
curl "http://localhost/scada-api/comparison.php?period=today_vs_yesterday"
```

---

## TEST EXECUTION SUMMARY

| Category | Pass | Fail | Not Run | Total |
|----------|------|------|---------|-------|
| Database Setup | | | 5 | 5 |
| API Health | | | 3 | 3 |
| Authentication | | | 8 | 8 |
| Data Ingestion | | | 15 | 15 |
| Dashboard API | | | 6 | 6 |
| Trends API | | | 4 | 4 |
| Comparison API | | | 4 | 4 |
| Frontend UI | | | 10 | 10 |
| **TOTAL** | **0** | **0** | **55** | **55** |

---

## SIGN-OFF

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Tester | | | |
| Developer | | | |
| Reviewer | | | |

---

**Document Version:** 1.0  
**Created:** February 2026  
**Last Updated:** February 2026
