# PLC Developer Integration Guide
## LR Energy Biogas Plant - SCADA System (Karnal)

---

## QUICK START

### API Endpoint
```
https://karnal.lrenergy.in/scada-api/receive_data.php
```

### Method
```
POST
```

### API Key (Provide to PLC Developer)
```
LRE_KARNAL_2024_SCADA_KEY
```
*(Replace with your actual API key from config.php)*

---

## AUTHENTICATION OPTIONS

The API supports 4 methods for authentication (for PLC compatibility):

| Method | How to Use | Recommended |
|--------|------------|-------------|
| **1. X-API-Key Header** | `X-API-Key: YOUR_API_KEY` | ✅ Best |
| **2. Bearer Token** | `Authorization: Bearer YOUR_API_KEY` | ✅ Good |
| **3. URL Parameter** | `?api_key=YOUR_API_KEY` | ⚠️ For PLCs only |
| **4. JSON Body** | `"api_key": "YOUR_API_KEY"` | ⚠️ For PLCs only |

---

## DATA FORMAT (JSON)

### Complete JSON Structure

```json
{
    "plant_id": "KARNAL",
    "timestamp": "2024-02-16 14:30:00",
    
    "raw_biogas_flow": 1250.5,
    "raw_biogas_totalizer": 150234.56,
    "purified_gas_flow": 1180.3,
    "purified_gas_totalizer": 142567.89,
    "product_gas_flow": 1150.2,
    "product_gas_totalizer": 138901.23,
    
    "ch4_concentration": 96.8,
    "co2_level": 2.9,
    "o2_concentration": 0.3,
    "h2s_content": 3.2,
    "dew_point": -68.5,
    
    "d1_temp_bottom": 37.2,
    "d1_temp_top": 36.5,
    "d1_gas_pressure": 32,
    "d1_air_pressure": 18,
    "d1_slurry_height": 7.6,
    "d1_gas_level": 75,
    
    "d2_temp_bottom": 36.5,
    "d2_temp_top": 36.0,
    "d2_gas_pressure": 30,
    "d2_air_pressure": 17,
    "d2_slurry_height": 7.3,
    "d2_gas_level": 72,
    
    "buffer_tank_level": 82,
    "lagoon_tank_level": 76,
    
    "feed_fm1_flow": 42.5,
    "feed_fm1_totalizer": 5234.12,
    "feed_fm2_flow": 38.3,
    "feed_fm2_totalizer": 4567.89,
    "fresh_water_flow": 12.1,
    "fresh_water_totalizer": 1534.56,
    "recycle_water_flow": 26.4,
    "recycle_water_totalizer": 3012.78,
    
    "psa_status": 1,
    "psa_efficiency": 94.4,
    "lt_panel_power": 245,
    "compressor_status": 1
}
```

---

## FIELD SPECIFICATIONS

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `plant_id` | String | Always `"KARNAL"` |
| `timestamp` | String | Format: `YYYY-MM-DD HH:MM:SS` |

### Gas Flow Parameters

| Field | Type | Unit | Range | Description |
|-------|------|------|-------|-------------|
| `raw_biogas_flow` | Float | Nm³/hr | 0-2000 | Raw biogas flow rate |
| `raw_biogas_totalizer` | Float | Nm³ | 0-999999.99 | Cumulative raw biogas (2 decimals) |
| `purified_gas_flow` | Float | Nm³/hr | 0-2000 | Purified gas flow rate |
| `purified_gas_totalizer` | Float | Nm³ | 0-999999.99 | Cumulative purified gas (2 decimals) |
| `product_gas_flow` | Float | Kg/hr | 0-2000 | Product gas flow rate |
| `product_gas_totalizer` | Float | Kg | 0-999999.99 | Cumulative product gas (2 decimals) |

### Gas Composition Parameters

| Field | Type | Unit | Range | Description |
|-------|------|------|-------|-------------|
| `ch4_concentration` | Float | % | 0-100 | Methane concentration |
| `co2_level` | Float | % | 0-100 | Carbon dioxide level |
| `o2_concentration` | Float | % | 0-21 | Oxygen concentration |
| `h2s_content` | Float | ppm | 0-1000 | Hydrogen sulfide content |
| `dew_point` | Float | °C | -100 to 50 | Dew point temperature |

### Digester 1 Parameters

| Field | Type | Unit | Range | Description |
|-------|------|------|-------|-------------|
| `d1_temp_bottom` | Float | °C | 0-100 | D1 bottom temperature |
| `d1_temp_top` | Float | °C | 0-100 | D1 top temperature |
| `d1_gas_pressure` | Float | mbar | 0-100 | D1 gas pressure |
| `d1_air_pressure` | Float | mbar | 0-100 | D1 air pressure |
| `d1_slurry_height` | Float | m | 0-10 | D1 slurry height |
| `d1_gas_level` | Float | % | 0-100 | D1 gas level |

### Digester 2 Parameters

| Field | Type | Unit | Range | Description |
|-------|------|------|-------|-------------|
| `d2_temp_bottom` | Float | °C | 0-100 | D2 bottom temperature |
| `d2_temp_top` | Float | °C | 0-100 | D2 top temperature |
| `d2_gas_pressure` | Float | mbar | 0-100 | D2 gas pressure |
| `d2_air_pressure` | Float | mbar | 0-100 | D2 air pressure |
| `d2_slurry_height` | Float | m | 0-10 | D2 slurry height |
| `d2_gas_level` | Float | % | 0-100 | D2 gas level |

### Tank Levels

| Field | Type | Unit | Range | Description |
|-------|------|------|-------|-------------|
| `buffer_tank_level` | Float | % | 0-100 | Buffer tank level |
| `lagoon_tank_level` | Float | % | 0-100 | Lagoon tank level |

### Water Flow Parameters

| Field | Type | Unit | Range | Description |
|-------|------|------|-------|-------------|
| `feed_fm1_flow` | Float | m³/hr | 0-100 | Feed flow meter 1 |
| `feed_fm1_totalizer` | Float | m³ | 0-999999.99 | Cumulative FM1 (2 decimals) |
| `feed_fm2_flow` | Float | m³/hr | 0-100 | Feed flow meter 2 |
| `feed_fm2_totalizer` | Float | m³ | 0-999999.99 | Cumulative FM2 (2 decimals) |
| `fresh_water_flow` | Float | m³/hr | 0-50 | Fresh water flow |
| `fresh_water_totalizer` | Float | m³ | 0-999999.99 | Cumulative fresh water (2 decimals) |
| `recycle_water_flow` | Float | m³/hr | 0-50 | Recycle water flow |
| `recycle_water_totalizer` | Float | m³ | 0-999999.99 | Cumulative recycle water (2 decimals) |

### Equipment Status

| Field | Type | Unit | Values | Description |
|-------|------|------|--------|-------------|
| `psa_status` | Integer | - | 0 or 1 | PSA running status (0=OFF, 1=ON) |
| `psa_efficiency` | Float | % | 0-100 | PSA efficiency |
| `lt_panel_power` | Float | kW | 0-500 | LT panel power consumption |
| `compressor_status` | Integer | - | 0 or 1 | Compressor status (0=OFF, 1=ON) |

---

## SAMPLE REQUESTS

### Using cURL (Linux/Mac)

```bash
curl -X POST https://karnal.lrenergy.in/scada-api/receive_data.php \
  -H "Content-Type: application/json" \
  -H "X-API-Key: LRE_KARNAL_2024_SCADA_KEY" \
  -d '{
    "plant_id": "KARNAL",
    "timestamp": "2024-02-16 14:30:00",
    "raw_biogas_flow": 1250.5,
    "raw_biogas_totalizer": 150234.56,
    "purified_gas_flow": 1180.3,
    "purified_gas_totalizer": 142567.89,
    "product_gas_flow": 1150.2,
    "product_gas_totalizer": 138901.23,
    "ch4_concentration": 96.8,
    "co2_level": 2.9,
    "o2_concentration": 0.3,
    "h2s_content": 3.2,
    "psa_status": 1,
    "compressor_status": 1
  }'
```

### Using URL Parameter (For PLCs that can't set headers)

```
POST https://karnal.lrenergy.in/scada-api/receive_data.php?api_key=LRE_KARNAL_2024_SCADA_KEY

Body (JSON):
{
    "plant_id": "KARNAL",
    "timestamp": "2024-02-16 14:30:00",
    "raw_biogas_flow": 1250.5,
    ...
}
```

### Using API Key in JSON Body (For Siemens PLC LHTTP)

```json
{
    "api_key": "LRE_KARNAL_2024_SCADA_KEY",
    "plant_id": "KARNAL",
    "timestamp": "2024-02-16 14:30:00",
    "raw_biogas_flow": 1250.5,
    ...
}
```

---

## RESPONSE CODES

### Success Response (HTTP 201)

```json
{
    "status": "success",
    "message": "Data recorded successfully",
    "record_id": 12345,
    "timestamp": "2024-02-16 14:30:00",
    "alerts_triggered": 0,
    "execution_time_ms": 45.2
}
```

### Error Responses

| HTTP Code | Meaning | Example Response |
|-----------|---------|------------------|
| 400 | Bad Request | `{"status": "error", "message": "Invalid JSON"}` |
| 401 | Unauthorized | `{"status": "error", "message": "Invalid API key"}` |
| 405 | Method Not Allowed | `{"status": "error", "message": "Use POST"}` |
| 409 | Duplicate | `{"status": "error", "message": "Duplicate timestamp"}` |
| 500 | Server Error | `{"status": "error", "message": "Database error"}` |

---

## TRANSMISSION SCHEDULE

| Setting | Value |
|---------|-------|
| Frequency | Every **30 seconds** |
| Protocol | HTTPS (TLS 1.2+) |
| Timeout | 30 seconds |
| Retry on failure | 3 attempts |

---

## PARTIAL DATA SUPPORT

The API accepts partial data. Only `plant_id` and `timestamp` are required. Missing fields will be stored as `NULL`.

### Minimum Required Payload

```json
{
    "plant_id": "KARNAL",
    "timestamp": "2024-02-16 14:30:00"
}
```

### Example: Flow Meters Only

```json
{
    "plant_id": "KARNAL",
    "timestamp": "2024-02-16 14:30:00",
    "raw_biogas_flow": 1250.5,
    "raw_biogas_totalizer": 150234.56,
    "purified_gas_flow": 1180.3,
    "purified_gas_totalizer": 142567.89,
    "product_gas_flow": 1150.2,
    "product_gas_totalizer": 138901.23
}
```

---

## INFORMATION TO PROVIDE TO PLC DEVELOPER

### 1. Endpoint Details
```
URL: https://karnal.lrenergy.in/scada-api/receive_data.php
Method: POST
Content-Type: application/json
```

### 2. Authentication
```
API Key: [Your actual API key from config.php]
Header: X-API-Key: [API_KEY]
OR
URL: ?api_key=[API_KEY]
```

### 3. Plant ID
```
plant_id: "KARNAL"
```

### 4. Timestamp Format
```
Format: YYYY-MM-DD HH:MM:SS
Example: 2024-02-16 14:30:00
Timezone: IST (Indian Standard Time)
```

### 5. Transmission Frequency
```
Every 30 seconds
```

### 6. SSL Certificate
```
HTTPS required (TLS 1.2 or higher)
Certificate: Valid (GoDaddy issued)
```

---

## TESTING

### Test URL (for PLC developer to verify)
```
https://karnal.lrenergy.in/scada-api/receive_data.php
```

### Test with Minimal Data
```json
{
    "plant_id": "KARNAL",
    "timestamp": "2024-02-16 14:30:00",
    "raw_biogas_flow": 1250
}
```

Expected Response: HTTP 201 with success message

---

## CONTACT

For any integration issues, contact:
- **Name:** [Your Name]
- **Email:** [Your Email]
- **Phone:** [Your Phone]

---

## CHECKLIST FOR PLC DEVELOPER

- [ ] Endpoint URL configured correctly
- [ ] API Key stored securely
- [ ] JSON format validated
- [ ] Timestamp format correct (YYYY-MM-DD HH:MM:SS)
- [ ] Transmission interval set to 30 seconds
- [ ] HTTPS/SSL enabled
- [ ] Error handling implemented
- [ ] Retry logic on failure
- [ ] Test data sent successfully

---

*Document Version: 2.0*
*Last Updated: February 2024*
