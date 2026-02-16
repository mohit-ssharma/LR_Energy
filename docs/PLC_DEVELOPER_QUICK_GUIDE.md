# 📡 PLC Developer Guide - LR Energy SCADA Integration
## Karnal Biogas Plant - Data Upload Specification

**Document Version:** 3.0  
**Last Updated:** February 2026

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
| 3 | raw_biogas_flow | Nm³/hr | Decimal | 0-2000 | 1250.50 | Optional |
| 4 | raw_biogas_totalizer | Nm³ | Decimal | 0-99999999 | 150000.00 | Optional |
| 5 | purified_gas_flow | Nm³/hr | Decimal | 0-2000 | 1180.20 | Optional |
| 6 | purified_gas_totalizer | Nm³ | Decimal | 0-99999999 | 142000.00 | Optional |
| 7 | product_gas_flow | **Kg/hr** | Decimal | 0-2000 | 1150.80 | Optional |
| 8 | product_gas_totalizer | **Kg** | Decimal | 0-99999999 | 138000.00 | Optional |
| **GAS COMPOSITION** |||||
| 9 | ch4_concentration | % | Decimal | 0-100 | 96.80 | Optional |
| 10 | co2_level | % | Decimal | 0-100 | 2.90 | Optional |
| 11 | o2_concentration | % | Decimal | 0-21 | 0.30 | Optional |
| 12 | h2s_content | ppm | Integer | 0-1000 | 3 | Optional |
| 13 | dew_point | mg/m³ | Decimal | -100 to 100 | -68.00 | Optional |
| **DIGESTER 1** |||||
| 14 | d1_temp_bottom | °C | Decimal | 0-60 | 37.00 | Optional |
| 15 | d1_temp_top | °C | Decimal | 0-60 | 36.50 | Optional |
| 16 | d1_gas_pressure | mbar | Decimal | 0-100 | 32.00 | Optional |
| 17 | d1_air_pressure | mbar | Decimal | 0-100 | 18.00 | Optional |
| 18 | d1_slurry_height | m | Decimal | 0-15 | 7.60 | Optional |
| 19 | d1_gas_level | % | Decimal | 0-100 | 75.00 | Optional |
| **DIGESTER 2** |||||
| 20 | d2_temp_bottom | °C | Decimal | 0-60 | 36.50 | Optional |
| 21 | d2_temp_top | °C | Decimal | 0-60 | 36.00 | Optional |
| 22 | d2_gas_pressure | mbar | Decimal | 0-100 | 30.00 | Optional |
| 23 | d2_air_pressure | mbar | Decimal | 0-100 | 17.00 | Optional |
| 24 | d2_slurry_height | m | Decimal | 0-15 | 7.30 | Optional |
| 25 | d2_gas_level | % | Decimal | 0-100 | 72.00 | Optional |
| **TANK LEVELS** |||||
| 26 | buffer_tank_level | % | Decimal | 0-100 | 65.00 | Optional |
| 27 | lagoon_tank_level | % | Decimal | 0-100 | 60.00 | Optional |
| **WATER FLOW** |||||
| 28 | feed_fm1_flow | m³/hr | Decimal | 0-100 | 42.00 | Optional |
| 29 | feed_fm1_totalizer | m³ | Decimal | 0-99999999 | 5000.00 | Optional |
| 30 | feed_fm2_flow | m³/hr | Decimal | 0-100 | 38.00 | Optional |
| 31 | feed_fm2_totalizer | m³ | Decimal | 0-99999999 | 4500.00 | Optional |
| 32 | fresh_water_flow | m³/hr | Decimal | 0-50 | 12.00 | Optional |
| 33 | fresh_water_totalizer | m³ | Decimal | 0-99999999 | 1500.00 | Optional |
| 34 | recycle_water_flow | m³/hr | Decimal | 0-100 | 26.00 | Optional |
| 35 | recycle_water_totalizer | m³ | Decimal | 0-99999999 | 3000.00 | Optional |
| **EQUIPMENT** |||||
| 36 | psa_status | 0/1 | Integer | 0 or 1 | 1 | Optional |
| 37 | psa_efficiency | % | Decimal | 0-100 | 94.40 | Optional |
| 38 | lt_panel_power | kW | Decimal | 0-500 | 245.00 | Optional |
| 39 | compressor_status | 0/1 | Integer | 0 or 1 | 1 | Optional |

---

## ⚠️ IMPORTANT: Partial Data Support

**The API now supports partial data submission.** You can send only the fields that have values.

### Handling Missing/NULL Values:
- **Missing fields**: Omit from JSON or set to `null`
- **Empty strings**: Treated as `null`
- **Whitespace-only**: Treated as `null`
- **Invalid numbers**: Treated as `null` (no error returned)

### Example - Flow Meters Only:
```json
{
  "timestamp": "2026-02-16 10:30:00",
  "plant_id": "KARNAL",
  "raw_biogas_flow": 1250.50,
  "raw_biogas_totalizer": 150000.00,
  "purified_gas_flow": 1180.20,
  "purified_gas_totalizer": 142000.00,
  "product_gas_flow": 1150.80,
  "product_gas_totalizer": 138000.00
}
```

All other fields will be stored as NULL in the database.

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
| **400** | error | Invalid JSON or missing timestamp/plant_id | Check data format |
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

### Partial Data Response Example:
```json
{
  "status": "success",
  "message": "Data received and stored",
  "record_id": 124,
  "timestamp": "2026-02-16 10:31:00",
  "plant_id": "KARNAL",
  "fields_received": 6,
  "total_fields": 37,
  "execution_time_ms": 18
}
```

---

## 🧪 TEST WITH CURL

### Full Data:
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

### Flow Meters Only (Partial Data):
```bash
curl -X POST "https://karnal.lrenergy.in/scada-api/receive_data.php?api_key=SCADA_LR_ENERGY_2026_SECURE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "2026-02-16 10:31:00",
    "plant_id": "KARNAL",
    "raw_biogas_flow": 1250.50,
    "raw_biogas_totalizer": 150000.00,
    "purified_gas_flow": 1180.20,
    "purified_gas_totalizer": 142000.00,
    "product_gas_flow": 1150.80,
    "product_gas_totalizer": 138000.00
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

### 5. Product Gas Units (IMPORTANT)
- **Flow**: Kg/hr (not Nm³/hr)
- **Totalizer**: Kg (not Nm³)

### 6. Decimal Precision
- Flow rates: 2 decimal places
- Percentages: 2 decimal places
- Temperatures: 2 decimal places

### 7. Missing/Faulty Sensors
- If a sensor is unavailable, **omit the field** or send `null`
- Example: `"ch4_concentration": null`
- The dashboard will display "0" or "--" for missing values

---

## 📞 SUPPORT

**Technical Contact:** IT Department - LR Energy

**Test Dashboard:** https://karnal.lrenergy.in
- Login: ho@lrenergy.in
- Password: qwerty@1234

**Test Simulators:**
- Full Simulator: `https://karnal.lrenergy.in/scada-api/auto_simulate.php`
- Flow Meter Only: `https://karnal.lrenergy.in/scada-api/flow_simulator.php`

---

## ✅ PLC DEVELOPER CHECKLIST

- [ ] Understand JSON format and all 37 fields
- [ ] Note: Product Gas is in **Kg/hr** and **Kg**
- [ ] Map PLC tags to JSON field names
- [ ] Configure HTTPS/TLS with Root CA certificate
- [ ] Set up 60-second timer for data transmission
- [ ] Build JSON string from PLC tag values
- [ ] Handle missing sensors by omitting fields or sending null
- [ ] Test single POST request manually
- [ ] Verify data appears on dashboard
- [ ] Enable automatic transmission
- [ ] Implement error handling for failed requests

---

**Document Version:** 3.0  
**Last Updated:** February 2026  
**Plant:** Karnal Biogas - LR Energy
