# 📡 PLC Developer Guide - LR Energy SCADA Integration
## Karnal Biogas Plant - Data Upload Specification

---

## 🎯 QUICK START

### API Endpoint
```
POST https://karnal.lrenergy.in/scada-api/receive_data.php?api_key=SCADA_LR_ENERGY_2026_SECURE_KEY
```

### Content Type
```
Content-Type: application/json
```

### Frequency
```
Every 60 seconds
```

---

## 📦 JSON DATA FORMAT (37 Fields)

Send this JSON structure via HTTP POST:

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

## 📋 FIELD SPECIFICATION TABLE

| # | Field Name | Unit | Data Type | Range | Example | Required |
|---|------------|------|-----------|-------|---------|----------|
| 1 | timestamp | DateTime | String | - | "2026-02-16 10:30:00" | ✅ YES |
| 2 | plant_id | - | String | - | "KARNAL" | ✅ YES |
| **GAS FLOW** |||||
| 3 | raw_biogas_flow | Nm³/hr | Decimal | 0-2000 | 1250.50 | ✅ YES |
| 4 | raw_biogas_totalizer | Nm³ | Decimal | 0-99999999 | 150000.00 | ✅ YES |
| 5 | purified_gas_flow | Nm³/hr | Decimal | 0-2000 | 1180.20 | ✅ YES |
| 6 | purified_gas_totalizer | Nm³ | Decimal | 0-99999999 | 142000.00 | ✅ YES |
| 7 | product_gas_flow | Nm³/hr | Decimal | 0-2000 | 1150.80 | ✅ YES |
| 8 | product_gas_totalizer | Nm³ | Decimal | 0-99999999 | 138000.00 | ✅ YES |
| **GAS COMPOSITION** |||||
| 9 | ch4_concentration | % | Decimal | 0-100 | 96.80 | ✅ YES |
| 10 | co2_level | % | Decimal | 0-100 | 2.90 | ✅ YES |
| 11 | o2_concentration | % | Decimal | 0-21 | 0.30 | ✅ YES |
| 12 | h2s_content | ppm | Integer | 0-105 | 3 | ✅ YES |
| 13 | dew_point | mg/m³ | Decimal | -100 to 100 | -68.00 | ✅ YES |
| **DIGESTER 1** |||||
| 14 | d1_temp_bottom | °C | Decimal | 0-60 | 37.00 | ✅ YES |
| 15 | d1_temp_top | °C | Decimal | 0-60 | 36.50 | ✅ YES |
| 16 | d1_gas_pressure | mbar | Decimal | 0-100 | 32.00 | ✅ YES |
| 17 | d1_air_pressure | mbar | Decimal | 0-100 | 18.00 | ✅ YES |
| 18 | d1_slurry_height | m | Decimal | 0-15 | 7.60 | ✅ YES |
| 19 | d1_gas_level | % | Decimal | 0-100 | 75.00 | ✅ YES |
| **DIGESTER 2** |||||
| 20 | d2_temp_bottom | °C | Decimal | 0-60 | 36.50 | ✅ YES |
| 21 | d2_temp_top | °C | Decimal | 0-60 | 36.00 | ✅ YES |
| 22 | d2_gas_pressure | mbar | Decimal | 0-100 | 30.00 | ✅ YES |
| 23 | d2_air_pressure | mbar | Decimal | 0-100 | 17.00 | ✅ YES |
| 24 | d2_slurry_height | m | Decimal | 0-15 | 7.30 | ✅ YES |
| 25 | d2_gas_level | % | Decimal | 0-100 | 72.00 | ✅ YES |
| **TANK LEVELS** |||||
| 26 | buffer_tank_level | % | Decimal | 0-100 | 65.00 | ✅ YES |
| 27 | lagoon_tank_level | % | Decimal | 0-100 | 60.00 | ✅ YES |
| **WATER FLOW** |||||
| 28 | feed_fm1_flow | m³/hr | Decimal | 0-100 | 42.00 | ✅ YES |
| 29 | feed_fm1_totalizer | m³ | Decimal | 0-99999999 | 5000.00 | ✅ YES |
| 30 | feed_fm2_flow | m³/hr | Decimal | 0-100 | 38.00 | ✅ YES |
| 31 | feed_fm2_totalizer | m³ | Decimal | 0-99999999 | 4500.00 | ✅ YES |
| 32 | fresh_water_flow | m³/hr | Decimal | 0-50 | 12.00 | ✅ YES |
| 33 | fresh_water_totalizer | m³ | Decimal | 0-99999999 | 1500.00 | ✅ YES |
| 34 | recycle_water_flow | m³/hr | Decimal | 0-100 | 26.00 | ✅ YES |
| 35 | recycle_water_totalizer | m³ | Decimal | 0-99999999 | 3000.00 | ✅ YES |
| **EQUIPMENT** |||||
| 36 | psa_status | 0/1 | Integer | 0 or 1 | 1 | ✅ YES |
| 37 | psa_efficiency | % | Decimal | 0-100 | 94.40 | Optional |
| 38 | lt_panel_power | kW | Decimal | 0-500 | 245.00 | ✅ YES |
| 39 | compressor_status | 0/1 | Integer | 0 or 1 | 1 | ✅ YES |

---

## 🔐 AUTHENTICATION

**API Key:** `SCADA_LR_ENERGY_2026_SECURE_KEY`

**How to send:** Add to URL as query parameter:
```
?api_key=SCADA_LR_ENERGY_2026_SECURE_KEY
```

**Full URL Example:**
```
https://karnal.lrenergy.in/scada-api/receive_data.php?api_key=SCADA_LR_ENERGY_2026_SECURE_KEY
```

---

## 📡 API RESPONSE CODES

| HTTP Code | Status | Meaning | Action |
|-----------|--------|---------|--------|
| **201** | success | Data saved successfully | Continue |
| **200** | duplicate | Data already exists for this timestamp | Skip (OK) |
| **400** | error | Invalid JSON or missing fields | Check data format |
| **401** | error | Invalid API key | Check authentication |
| **500** | error | Server error | Retry after delay |

### Success Response Example:
```json
{
  "status": "success",
  "message": "Data received and stored",
  "record_id": 123,
  "timestamp": "2026-02-16 10:30:00",
  "plant_id": "KARNAL",
  "fields_received": 37,
  "total_fields": 37,
  "execution_time_ms": 25
}
```

---

## 🧪 TEST WITH CURL (Command Line)

```bash
curl -X POST "https://karnal.lrenergy.in/scada-api/receive_data.php?api_key=SCADA_LR_ENERGY_2026_SECURE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

---

## 🧪 TEST WITH POSTMAN

1. **Method:** POST
2. **URL:** `https://karnal.lrenergy.in/scada-api/receive_data.php?api_key=SCADA_LR_ENERGY_2026_SECURE_KEY`
3. **Headers:** 
   - `Content-Type: application/json`
4. **Body:** Select "raw" → "JSON" → Paste the JSON from above

---

## ⚠️ IMPORTANT NOTES

### 1. Timestamp Format
```
Format: YYYY-MM-DD HH:MM:SS
Example: 2026-02-16 10:30:00
Timezone: IST (Indian Standard Time)
```

### 2. Totalizer Values
- **NEVER reset** totalizer values
- They are cumulative counters
- Used to calculate daily production (MAX - MIN)

### 3. Status Fields
```
psa_status:        0 = Off/Stopped, 1 = On/Running
compressor_status: 0 = Off/Stopped, 1 = On/Running
```

### 4. H₂S Content
- Unit is **ppm** (parts per million)
- Send as **integer** (not decimal)
- Example: `3` not `3.00`

### 5. Decimal Precision
- Flow rates: 2 decimal places
- Percentages: 2 decimal places
- Temperatures: 2 decimal places

### 6. Missing/Faulty Sensors
- If a sensor is unavailable, **omit the field** or send `null`
- Example: `"ch4_concentration": null`

---

## 🔧 SIEMENS PLC CONFIGURATION (S7-1500 with LHTTP)

### TIA Portal Setup:

1. **Function Block:** `LHTTP_Post`
2. **URL:** `https://karnal.lrenergy.in/scada-api/receive_data.php?api_key=SCADA_LR_ENERGY_2026_SECURE_KEY`
3. **TLS:** Import Root CA certificate for HTTPS
4. **Timer:** Trigger every 60 seconds

### LHTTP_Post Parameters:
```
execute:      BOOL      - Set TRUE to trigger (use 60s timer)
hwID:         HW_ANY    - Ethernet interface hardware ID
connID:       CONN_OUC  - Unique connection ID (e.g., 1)
url:          STRING    - Full URL with API key
data:         STRING    - JSON payload string
tls:          LHTTP_typeTLS - TLS config (for HTTPS)
responseData: ARRAY[0..1023] OF CHAR - Response buffer
```

### Check Response:
```
IF LHTTP_Post.done THEN
    IF LHTTP_Post.responseCode = 201 THEN
        // Success - data saved
    ELSIF LHTTP_Post.responseCode = 200 THEN
        // Duplicate - already exists (OK)
    ELSE
        // Error - check responseCode
    END_IF;
END_IF;
```

---

## 📞 SUPPORT

**Technical Contact:** IT Department - LR Energy

**Test Dashboard:** https://karnal.lrenergy.in
- Login: ho@lrenergy.in
- Password: qwerty@1234

**Test Simulator:** https://karnal.lrenergy.in/scada-api/auto_simulate.php

---

## ✅ PLC DEVELOPER CHECKLIST

- [ ] Understand JSON format and all 37 fields
- [ ] Map PLC tags to JSON field names
- [ ] Configure HTTPS/TLS with Root CA certificate
- [ ] Set up 60-second timer for data transmission
- [ ] Build JSON string from PLC tag values
- [ ] Test single POST request manually
- [ ] Verify data appears on dashboard
- [ ] Enable automatic transmission
- [ ] Implement error handling for failed requests

---

**Document Version:** 2.0  
**Last Updated:** February 2026  
**Plant:** Karnal Biogas - LR Energy
