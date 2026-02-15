# PLC Developer Integration Guide
## Siemens S7-1500 LHTTP → LR Energy SCADA

---

## ✅ YES, IT IS POSSIBLE!

The Siemens LHTTP library supports **HTTP POST** with **JSON data**, which is exactly what our API expects.

---

## 📋 SUMMARY FOR PLC DEVELOPER

### What PLC Developer Needs to Configure in TIA Portal:

| Parameter | Value |
|-----------|-------|
| **Function Block** | `LHTTP_Post` |
| **URL** | `https://karnal.lrenergy.in/scada-api/receive_data.php` |
| **Method** | POST |
| **Data Format** | JSON String |
| **Frequency** | Every 60 seconds |
| **Authentication** | API Key in URL (see workaround below) |

---

## ⚠️ IMPORTANT LIMITATION

The Siemens LHTTP library **does NOT support custom HTTP headers** like `X-API-Key`.

### Workaround Options:

**Option 1: API Key in URL (Recommended)**
```
https://karnal.lrenergy.in/scada-api/receive_data.php?api_key=SCADA_LR_ENERGY_2026_SECURE_KEY
```

**Option 2: API Key in JSON Body**
```json
{
  "api_key": "SCADA_LR_ENERGY_2026_SECURE_KEY",
  "timestamp": "2026-02-15 10:30:00",
  "plant_id": "KARNAL",
  ...
}
```

> **I will update receive_data.php to support both methods.**

---

## 📦 VALUES TO PROVIDE TO PLC DEVELOPER

### 1. API Endpoint
```
URL: https://karnal.lrenergy.in/scada-api/receive_data.php
Method: POST
Content-Type: application/json
```

### 2. API Key
```
SCADA_LR_ENERGY_2026_SECURE_KEY
```

### 3. JSON Payload Template (37 fields)
```json
{
  "timestamp": "2026-02-15 10:30:00",
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
  "h2s_content": 3.00,
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

### 4. TIA Portal Configuration

```
LHTTP_Post Configuration:
├── execute: TRUE (trigger every 60 seconds)
├── hwID: [Ethernet interface HW ID]
├── connID: 1 (unique connection ID)
├── url: "https://karnal.lrenergy.in/scada-api/receive_data.php?api_key=SCADA_LR_ENERGY_2026_SECURE_KEY"
├── data: [JSON string built from PLC tags]
├── tls: [Certificate for HTTPS - optional if HTTP]
└── responseData: Array[0..1023] of Char
```

---

## 🔧 PLC PROGRAM LOGIC

### Step 1: Build JSON String
In PLC, concatenate all sensor values into a JSON string:

```
data := '{"timestamp":"' + timestamp_string + 
        '","plant_id":"KARNAL"' +
        ',"raw_biogas_flow":' + REAL_TO_STRING(raw_biogas_flow) +
        ',"ch4_concentration":' + REAL_TO_STRING(ch4_concentration) +
        ... (all 37 fields)
        + '}'
```

### Step 2: Execute HTTP POST Every 60 Seconds
```
// Timer triggers every 60 seconds
IF timer_60s.Q THEN
    LHTTP_Post.execute := TRUE;
END_IF;
```

### Step 3: Check Response
```
IF LHTTP_Post.done THEN
    IF LHTTP_Post.responseCode = 201 THEN
        // Success - data saved
    ELSIF LHTTP_Post.responseCode = 200 THEN
        // Duplicate - already exists
    ELSE
        // Error - check responseCode
    END_IF;
END_IF;
```

---

## 📡 EXPECTED API RESPONSES

| HTTP Code | Meaning | Action |
|-----------|---------|--------|
| **201** | Success - Data saved | Continue |
| **200** | Duplicate timestamp | Skip (already saved) |
| **400** | Invalid JSON/Missing fields | Check data format |
| **401** | Invalid API key | Check authentication |
| **500** | Server error | Retry after delay |

---

## 🧪 HOW TO TEST WITHOUT PLC

### Option 1: Use simulate.php (Browser)
```
http://localhost/scada-api/simulate.php
```

### Option 2: Use auto_simulate.php (Auto - 10 scenarios)
```
http://localhost/scada-api/auto_simulate.php?duration=10&interval=60
```

### Option 3: Use curl (Command Line)
```bash
curl -X POST "https://karnal.lrenergy.in/scada-api/receive_data.php" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: SCADA_LR_ENERGY_2026_SECURE_KEY" \
  -d '{"timestamp":"2026-02-15 10:30:00","plant_id":"KARNAL","raw_biogas_flow":1250.50,...}'
```

### Option 4: Use Postman
- URL: `https://karnal.lrenergy.in/scada-api/receive_data.php`
- Method: POST
- Headers: `X-API-Key: SCADA_LR_ENERGY_2026_SECURE_KEY`
- Body: JSON payload

---

## 🔍 HOW TO VERIFY PLC CONNECTION AFTER DEPLOYMENT

### 1. Check Database Records
```sql
SELECT * FROM scada_readings 
ORDER BY timestamp DESC 
LIMIT 10;
```

### 2. Check sync_status Table
```sql
SELECT * FROM sync_status 
ORDER BY last_sync_time DESC 
LIMIT 5;
```

### 3. Check api_logs Table
```sql
SELECT * FROM api_logs 
WHERE endpoint = 'receive_data' 
ORDER BY created_at DESC 
LIMIT 10;
```

### 4. Dashboard Check
- Login to dashboard
- Check "Today's Records" count
- Check if data is updating every 60 seconds
- Verify timestamp matches expected time

---

## 📋 DEPLOYMENT CHECKLIST

### Before PLC Connection:
- [ ] Deploy PHP API to GoDaddy
- [ ] Create MySQL database and tables
- [ ] Test API with simulate.php
- [ ] Verify dashboard shows test data
- [ ] Share API endpoint + Key with PLC developer

### During PLC Integration:
- [ ] PLC developer configures LHTTP_Post
- [ ] Test with single POST request
- [ ] Verify data appears in database
- [ ] Verify dashboard updates
- [ ] Enable 60-second interval

### After PLC Connection:
- [ ] Monitor api_logs for errors
- [ ] Check data quality indicators on dashboard
- [ ] Verify all 37 fields are populated
- [ ] Confirm totalizer values are incrementing

---

## 📞 COMMUNICATION FLOW

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  Siemens PLC    │  HTTP   │   GoDaddy       │  Query  │   Dashboard     │
│  S7-1500        │  POST   │   PHP API       │         │   (React)       │
│                 │ ──────► │                 │ ◄────── │                 │
│  LHTTP_Post     │  JSON   │  receive_data   │  JSON   │  Auto-refresh   │
│  Every 60s      │         │  .php           │         │  Every 30s      │
└─────────────────┘         └─────────────────┘         └─────────────────┘
                                    │
                                    ▼
                            ┌─────────────────┐
                            │   MySQL DB      │
                            │   scada_readings│
                            └─────────────────┘
```

---

## 📁 FILES TO SHARE WITH PLC DEVELOPER

1. **This document** (`PLC_INTEGRATION_GUIDE.md`)
2. **JSON Specification** (`PLC_DATA_INTERFACE_SPECIFICATION.json`)
3. **API Key** (share securely)
4. **Test URL** after deployment

---

## ❓ FAQ

**Q: Can PLC send HTTP (not HTTPS)?**
A: Yes, but HTTPS is recommended for security. If HTTP only, we can configure the server to accept HTTP.

**Q: What if PLC cannot set custom headers?**
A: Use API key in URL: `?api_key=YOUR_KEY` - I will update the API to support this.

**Q: What happens if PLC misses a reading?**
A: Dashboard will show gaps. Data quality indicator will reflect missing readings.

**Q: Can PLC send partial data?**
A: Yes, only `timestamp` is mandatory. Other fields can be null/missing but dashboard accuracy will be affected.

**Q: What timezone for timestamp?**
A: IST (Indian Standard Time). Format: `YYYY-MM-DD HH:MM:SS`

---

**Document Version:** 1.0  
**Last Updated:** February 2026  
**Contact:** IT Department - LR Energy
