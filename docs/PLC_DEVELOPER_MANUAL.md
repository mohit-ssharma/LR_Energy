# PLC Developer Integration Manual
## Siemens S7-1500 LHTTP → LR Energy SCADA Cloud System

---

# TABLE OF CONTENTS

1. [Overview](#1-overview)
2. [System Architecture](#2-system-architecture)
3. [API Specification](#3-api-specification)
4. [Data Fields Reference](#4-data-fields-reference)
5. [TIA Portal Configuration](#5-tia-portal-configuration)
6. [HTTPS/TLS Setup](#6-httpstls-setup)
7. [PLC Program Logic](#7-plc-program-logic)
8. [Testing & Verification](#8-testing--verification)
9. [Error Handling](#9-error-handling)
10. [Troubleshooting](#10-troubleshooting)
11. [Contact & Support](#11-contact--support)

---

# 1. OVERVIEW

## 1.1 Purpose
This document provides complete technical specifications for integrating the Siemens S7-1500 PLC with the LR Energy SCADA cloud monitoring system using the LHTTP library.

## 1.2 System Summary
| Component | Details |
|-----------|---------|
| PLC Model | Siemens S7-1500 |
| Communication Library | LHTTP (Library for HTTP Communication) |
| Protocol | HTTPS (recommended) or HTTP |
| Method | POST |
| Data Format | JSON |
| Frequency | Every 60 seconds |
| Server | https://karnal.lrenergy.in |

## 1.3 Data Flow
```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  Siemens PLC    │  HTTPS  │   Cloud Server  │  Query  │   Dashboard     │
│  S7-1500        │  POST   │   (PHP/MySQL)   │         │   (React)       │
│                 │ ──────► │                 │ ◄────── │                 │
│  LHTTP_Post     │  JSON   │  receive_data   │  JSON   │  Auto-refresh   │
│  Every 60s      │  :443   │  .php           │         │  Every 30s      │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

---

# 2. SYSTEM ARCHITECTURE

## 2.1 Network Requirements
| Requirement | Specification |
|-------------|---------------|
| Internet Access | PLC must have internet connectivity |
| Outbound Port | 443 (HTTPS) or 80 (HTTP) |
| DNS Resolution | Must resolve karnal.lrenergy.in |
| Firewall | Allow outbound HTTPS to server |

## 2.2 Server Details
| Setting | Value |
|---------|-------|
| Domain | karnal.lrenergy.in |
| IP Address | (Resolved via DNS) |
| HTTPS Port | 443 |
| HTTP Port | 80 |
| API Path | /scada-api/receive_data.php |

---

# 3. API SPECIFICATION

## 3.1 Endpoint URL

**HTTPS (Recommended):**
```
https://karnal.lrenergy.in/scada-api/receive_data.php?api_key=SCADA_LR_ENERGY_2026_SECURE_KEY
```

**HTTP (Fallback):**
```
http://karnal.lrenergy.in/scada-api/receive_data.php?api_key=SCADA_LR_ENERGY_2026_SECURE_KEY
```

## 3.2 Authentication

⚠️ **IMPORTANT:** The Siemens LHTTP library does NOT support custom HTTP headers. Therefore, the API key must be passed in the URL query parameter.

| Method | Value |
|--------|-------|
| Parameter Name | `api_key` |
| API Key | `SCADA_LR_ENERGY_2026_SECURE_KEY` |
| Location | URL Query Parameter |

## 3.3 Request Details

| Property | Value |
|----------|-------|
| Method | POST |
| Content-Type | application/json |
| Character Encoding | UTF-8 |
| Timeout | 30 seconds |

## 3.4 Response Codes

| HTTP Code | Status | Meaning | Action |
|-----------|--------|---------|--------|
| 201 | Success | Data saved successfully | Continue normal operation |
| 200 | Duplicate | Data already exists for timestamp | OK - Skip (no retry needed) |
| 400 | Bad Request | Invalid JSON or missing fields | Check data format |
| 401 | Unauthorized | Invalid API key | Verify API key |
| 500 | Server Error | Internal server error | Retry after 60 seconds |

## 3.5 Success Response Example
```json
{
  "status": "success",
  "message": "Data received and stored",
  "record_id": 12345,
  "timestamp": "2026-02-16 10:30:00",
  "plant_id": "KARNAL",
  "fields_received": 37,
  "total_fields": 37,
  "execution_time_ms": 15
}
```

## 3.6 Error Response Example
```json
{
  "status": "error",
  "message": "Invalid API key"
}
```

---

# 4. DATA FIELDS REFERENCE

## 4.1 Complete Field List (37 Fields)

### Metadata Fields
| # | Field Name | Data Type | Unit | Required | Description |
|---|------------|-----------|------|----------|-------------|
| 1 | timestamp | STRING | - | ✅ YES | Format: "YYYY-MM-DD HH:MM:SS" (IST) |
| 2 | plant_id | STRING | - | ✅ YES | Fixed value: "KARNAL" |

### Gas Flow Fields
| # | Field Name | Data Type | Unit | Range | Description |
|---|------------|-----------|------|-------|-------------|
| 3 | raw_biogas_flow | DECIMAL | Nm³/hr | 0-2000 | Raw biogas flow rate |
| 4 | raw_biogas_totalizer | DECIMAL | Nm³ | Cumulative | Raw biogas totalizer (never resets) |
| 5 | purified_gas_flow | DECIMAL | Nm³/hr | 0-2000 | Purified gas flow rate |
| 6 | purified_gas_totalizer | DECIMAL | Nm³ | Cumulative | Purified gas totalizer |
| 7 | product_gas_flow | DECIMAL | Nm³/hr | 0-2000 | Product gas flow rate |
| 8 | product_gas_totalizer | DECIMAL | Nm³ | Cumulative | Product gas totalizer |

### Gas Composition Fields
| # | Field Name | Data Type | Unit | Range | Description |
|---|------------|-----------|------|-------|-------------|
| 9 | ch4_concentration | DECIMAL | % | 90-100 | Methane concentration |
| 10 | co2_level | DECIMAL | % | 0-10 | Carbon dioxide level |
| 11 | o2_concentration | DECIMAL | % | 0-1 | Oxygen concentration |
| 12 | h2s_content | INTEGER | ppm | 0-500 | Hydrogen sulfide (WHOLE NUMBER) |
| 13 | dew_point | DECIMAL | °C | -80 to 0 | Dew point temperature |

### Digester 1 Fields
| # | Field Name | Data Type | Unit | Range | Description |
|---|------------|-----------|------|-------|-------------|
| 14 | d1_temp_bottom | DECIMAL | °C | 30-50 | Digester 1 bottom temperature |
| 15 | d1_temp_top | DECIMAL | °C | 30-50 | Digester 1 top temperature |
| 16 | d1_gas_pressure | DECIMAL | mbar | 0-100 | Digester 1 gas pressure |
| 17 | d1_air_pressure | DECIMAL | mbar | 0-50 | Digester 1 air pressure |
| 18 | d1_slurry_height | DECIMAL | m | 0-15 | Digester 1 slurry height |
| 19 | d1_gas_level | DECIMAL | % | 0-100 | Digester 1 gas level |

### Digester 2 Fields
| # | Field Name | Data Type | Unit | Range | Description |
|---|------------|-----------|------|-------|-------------|
| 20 | d2_temp_bottom | DECIMAL | °C | 30-50 | Digester 2 bottom temperature |
| 21 | d2_temp_top | DECIMAL | °C | 30-50 | Digester 2 top temperature |
| 22 | d2_gas_pressure | DECIMAL | mbar | 0-100 | Digester 2 gas pressure |
| 23 | d2_air_pressure | DECIMAL | mbar | 0-50 | Digester 2 air pressure |
| 24 | d2_slurry_height | DECIMAL | m | 0-15 | Digester 2 slurry height |
| 25 | d2_gas_level | DECIMAL | % | 0-100 | Digester 2 gas level |

### Tank Level Fields
| # | Field Name | Data Type | Unit | Range | Description |
|---|------------|-----------|------|-------|-------------|
| 26 | buffer_tank_level | DECIMAL | % | 0-100 | Buffer tank level |
| 27 | lagoon_tank_level | DECIMAL | % | 0-100 | Lagoon tank level |

### Water Flow Fields
| # | Field Name | Data Type | Unit | Range | Description |
|---|------------|-----------|------|-------|-------------|
| 28 | feed_fm1_flow | DECIMAL | m³/hr | 0-100 | Feed flow meter 1 |
| 29 | feed_fm1_totalizer | DECIMAL | m³ | Cumulative | Feed totalizer 1 |
| 30 | feed_fm2_flow | DECIMAL | m³/hr | 0-100 | Feed flow meter 2 |
| 31 | feed_fm2_totalizer | DECIMAL | m³ | Cumulative | Feed totalizer 2 |
| 32 | fresh_water_flow | DECIMAL | m³/hr | 0-50 | Fresh water flow |
| 33 | fresh_water_totalizer | DECIMAL | m³ | Cumulative | Fresh water totalizer |
| 34 | recycle_water_flow | DECIMAL | m³/hr | 0-100 | Recycle water flow |
| 35 | recycle_water_totalizer | DECIMAL | m³ | Cumulative | Recycle water totalizer |

### Equipment Status Fields
| # | Field Name | Data Type | Unit | Values | Description |
|---|------------|-----------|------|--------|-------------|
| 36 | psa_status | INTEGER | - | 0 or 1 | PSA status (0=Stopped, 1=Running) |
| 37 | psa_efficiency | DECIMAL | % | 0-100 | PSA efficiency |
| 38 | lt_panel_power | DECIMAL | kW | 0-500 | LT panel power consumption |
| 39 | compressor_status | INTEGER | - | 0 or 1 | Compressor (0=Stopped, 1=Running) |

## 4.2 JSON Payload Template

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

## 4.3 PLC Tag Mapping Template

**PLC developer must fill in actual tag addresses:**

| JSON Field | PLC Data Type | PLC Tag Address | Example |
|------------|---------------|-----------------|---------|
| raw_biogas_flow | REAL | ______________ | DB10.DBD0 |
| raw_biogas_totalizer | REAL | ______________ | DB10.DBD4 |
| purified_gas_flow | REAL | ______________ | DB10.DBD8 |
| purified_gas_totalizer | REAL | ______________ | DB10.DBD12 |
| product_gas_flow | REAL | ______________ | DB10.DBD16 |
| product_gas_totalizer | REAL | ______________ | DB10.DBD20 |
| ch4_concentration | REAL | ______________ | DB10.DBD24 |
| co2_level | REAL | ______________ | DB10.DBD28 |
| o2_concentration | REAL | ______________ | DB10.DBD32 |
| h2s_content | INT | ______________ | DB10.DBW36 |
| dew_point | REAL | ______________ | DB10.DBD38 |
| d1_temp_bottom | REAL | ______________ | DB10.DBD42 |
| d1_temp_top | REAL | ______________ | DB10.DBD46 |
| d1_gas_pressure | REAL | ______________ | DB10.DBD50 |
| d1_air_pressure | REAL | ______________ | DB10.DBD54 |
| d1_slurry_height | REAL | ______________ | DB10.DBD58 |
| d1_gas_level | REAL | ______________ | DB10.DBD62 |
| d2_temp_bottom | REAL | ______________ | DB10.DBD66 |
| d2_temp_top | REAL | ______________ | DB10.DBD70 |
| d2_gas_pressure | REAL | ______________ | DB10.DBD74 |
| d2_air_pressure | REAL | ______________ | DB10.DBD78 |
| d2_slurry_height | REAL | ______________ | DB10.DBD82 |
| d2_gas_level | REAL | ______________ | DB10.DBD86 |
| buffer_tank_level | REAL | ______________ | DB10.DBD90 |
| lagoon_tank_level | REAL | ______________ | DB10.DBD94 |
| feed_fm1_flow | REAL | ______________ | DB10.DBD98 |
| feed_fm1_totalizer | REAL | ______________ | DB10.DBD102 |
| feed_fm2_flow | REAL | ______________ | DB10.DBD106 |
| feed_fm2_totalizer | REAL | ______________ | DB10.DBD110 |
| fresh_water_flow | REAL | ______________ | DB10.DBD114 |
| fresh_water_totalizer | REAL | ______________ | DB10.DBD118 |
| recycle_water_flow | REAL | ______________ | DB10.DBD122 |
| recycle_water_totalizer | REAL | ______________ | DB10.DBD126 |
| psa_status | BOOL | ______________ | DB10.DBX130.0 |
| psa_efficiency | REAL | ______________ | DB10.DBD132 |
| lt_panel_power | REAL | ______________ | DB10.DBD136 |
| compressor_status | BOOL | ______________ | DB10.DBX140.0 |

---

# 5. TIA PORTAL CONFIGURATION

## 5.1 Required Components

1. **LHTTP Library** installed in TIA Portal
2. **Ethernet interface** configured with internet access
3. **SSL/TLS Certificate** (for HTTPS)

## 5.2 LHTTP_Post Function Block Parameters

### Input Parameters
| Parameter | Data Type | Description |
|-----------|-----------|-------------|
| execute | BOOL | Rising edge triggers request |
| hwID | HW_ANY | Hardware ID of Ethernet interface |
| connID | CONN_OUC | Connection ID (unique, e.g., 1) |
| url | STRING | Full URL with API key |
| data | STRING | JSON payload |
| tls | LHTTP_typeTLS | TLS configuration (for HTTPS) |

### Output Parameters
| Parameter | Data Type | Description |
|-----------|-----------|-------------|
| done | BOOL | Request completed |
| busy | BOOL | Request in progress |
| error | BOOL | Error occurred |
| statusID | USINT | Error source identifier |
| status | WORD | Status/error code |
| responseCode | UINT | HTTP response code |
| length | UDINT | Response data length |
| responseData | ARRAY[*] OF CHAR | Server response |

## 5.3 Configuration Example

```
// Data Block: DB_HTTP_Config
DB_HTTP_Config : LHTTP_Post
├── execute := Send_Trigger
├── hwID := "Local~PROFINET_interface_1"
├── connID := 1
├── url := "https://karnal.lrenergy.in/scada-api/receive_data.php?api_key=SCADA_LR_ENERGY_2026_SECURE_KEY"
├── data := JSON_Payload
├── tls := DB_TLS_Config
├── done => Request_Done
├── busy => Request_Busy
├── error => Request_Error
├── statusID => Error_Source
├── status => Status_Code
├── responseCode => HTTP_Response_Code
├── length => Response_Length
└── responseData => Response_Buffer
```

---

# 6. HTTPS/TLS SETUP

## 6.1 Certificate Requirements

For HTTPS communication, the PLC must trust the server's SSL certificate.

**Required:** Root CA Certificate
- **Certificate Type:** X.509
- **Format:** .cer, .crt, or .pem
- **Source:** GoDaddy Root CA or Let's Encrypt ISRG Root X1

## 6.2 Obtaining the Certificate

**Option 1: From Browser**
1. Open https://karnal.lrenergy.in in Chrome/Firefox
2. Click padlock icon → Certificate → Certification Path
3. Select Root certificate (top of chain)
4. Click "View Certificate" → "Details" → "Copy to File"
5. Export as Base-64 encoded X.509 (.cer)

**Option 2: Download Common Root CAs**
- GoDaddy Root Certificate Authority - G2
- Let's Encrypt ISRG Root X1
- Available from: https://ssl-tools.net/certificates

## 6.3 Import Certificate to TIA Portal

1. Open TIA Portal project
2. Navigate to: **Project → PLC → Certificate Manager**
3. Click **"Import"**
4. Select the Root CA certificate file
5. Name it: `LREnergy_Root_CA`
6. Click **OK** and **Compile**

## 6.4 TLS Configuration Data Block

```
// Data Block: DB_TLS_Config
DB_TLS_Config : LHTTP_typeTLS
├── certServer := "LREnergy_Root_CA"  // Certificate name from Manager
├── certClient := ""                   // Empty (no client cert needed)
├── keyClient := ""                    // Empty (no client key needed)
└── verify := TRUE                     // Verify server certificate
```

## 6.5 HTTP Fallback (No Certificate)

If HTTPS setup is problematic, use HTTP temporarily:

```
url := "http://karnal.lrenergy.in/scada-api/receive_data.php?api_key=SCADA_LR_ENERGY_2026_SECURE_KEY"
tls := (leave unconnected or empty)
```

⚠️ **Warning:** HTTP is unencrypted. Use HTTPS for production.

---

# 7. PLC PROGRAM LOGIC

## 7.1 Overview

The PLC program must:
1. Read sensor values from PLC tags
2. Build JSON string
3. Trigger HTTP POST every 60 seconds
4. Handle response and errors

## 7.2 Timer Setup (60-Second Interval)

```
// Network 1: 60-Second Timer
TON_Instance(IN := NOT TON_Instance.Q,
             PT := T#60S,
             Q => Timer_60s_Pulse);

// Rising edge detection
R_TRIG_Instance(CLK := Timer_60s_Pulse,
                Q => Send_Trigger);
```

## 7.3 JSON String Builder (Pseudo-code)

```
// Network 2: Build JSON Payload
IF Send_Trigger THEN
    
    // Get current timestamp
    timestamp := CONCAT(DATE_TO_STRING(CurrentDate), ' ', TOD_TO_STRING(CurrentTime));
    
    // Build JSON string
    JSON_Payload := '{"timestamp":"';
    JSON_Payload := CONCAT(JSON_Payload, timestamp);
    JSON_Payload := CONCAT(JSON_Payload, '","plant_id":"KARNAL"');
    JSON_Payload := CONCAT(JSON_Payload, ',"raw_biogas_flow":');
    JSON_Payload := CONCAT(JSON_Payload, REAL_TO_STRING(raw_biogas_flow));
    JSON_Payload := CONCAT(JSON_Payload, ',"raw_biogas_totalizer":');
    JSON_Payload := CONCAT(JSON_Payload, REAL_TO_STRING(raw_biogas_totalizer));
    // ... continue for all 37 fields ...
    JSON_Payload := CONCAT(JSON_Payload, ',"compressor_status":');
    JSON_Payload := CONCAT(JSON_Payload, INT_TO_STRING(compressor_status));
    JSON_Payload := CONCAT(JSON_Payload, '}');
    
END_IF;
```

## 7.4 HTTP POST Execution

```
// Network 3: Execute HTTP POST
LHTTP_Post_Instance(
    execute := Send_Trigger,
    hwID := "Local~PROFINET_interface_1",
    connID := 1,
    url := API_URL,
    data := JSON_Payload,
    tls := DB_TLS_Config,
    done => Request_Done,
    busy => Request_Busy,
    error => Request_Error,
    statusID => Error_Source,
    status => Status_Code,
    responseCode => HTTP_Response_Code,
    length => Response_Length,
    responseData => Response_Buffer
);
```

## 7.5 Response Handler

```
// Network 4: Handle Response
IF Request_Done THEN
    IF HTTP_Response_Code = 201 THEN
        // Success - Data saved
        Success_Counter := Success_Counter + 1;
        Last_Success_Time := CurrentTime;
        
    ELSIF HTTP_Response_Code = 200 THEN
        // Duplicate - OK, already saved
        Duplicate_Counter := Duplicate_Counter + 1;
        
    ELSIF HTTP_Response_Code = 400 THEN
        // Bad Request - Check JSON format
        Error_Counter := Error_Counter + 1;
        Last_Error_Code := 400;
        
    ELSIF HTTP_Response_Code = 401 THEN
        // Unauthorized - Check API key
        Error_Counter := Error_Counter + 1;
        Last_Error_Code := 401;
        
    ELSE
        // Other error
        Error_Counter := Error_Counter + 1;
        Last_Error_Code := HTTP_Response_Code;
    END_IF;
END_IF;

// Network 5: Handle Connection Errors
IF Request_Error THEN
    Connection_Error := TRUE;
    Error_Counter := Error_Counter + 1;
    Last_Error_Status := Status_Code;
    
    // Retry logic - wait 60 seconds
    Retry_Pending := TRUE;
END_IF;
```

---

# 8. TESTING & VERIFICATION

## 8.1 Pre-Integration Checklist

| # | Item | Status |
|---|------|--------|
| 1 | PLC has internet connectivity | ⬜ |
| 2 | LHTTP library installed | ⬜ |
| 3 | SSL certificate imported (for HTTPS) | ⬜ |
| 4 | API URL configured correctly | ⬜ |
| 5 | API key matches server | ⬜ |
| 6 | All 37 PLC tags mapped | ⬜ |
| 7 | JSON builder tested | ⬜ |
| 8 | Timer configured for 60s | ⬜ |

## 8.2 Test Procedure

### Step 1: Connectivity Test
- Ping karnal.lrenergy.in from PLC network
- Verify port 443 (HTTPS) or 80 (HTTP) is open

### Step 2: Single Request Test
- Manually trigger one POST request
- Check HTTP response code = 201

### Step 3: Verify Data in Dashboard
- Login to https://karnal.lrenergy.in
- Credentials: ho@lrenergy.in / qwerty@1234
- Check dashboard shows the sent data

### Step 4: Continuous Test
- Enable 60-second timer
- Monitor for 10 minutes
- Verify all 10 readings received

## 8.3 Dashboard Verification Points

| Check | Expected Value |
|-------|----------------|
| Total Records | Incrementing every 60s |
| Last Update | Within last 60 seconds |
| Data Status | "FRESH" or "LIVE" |
| All fields populated | No null/empty values |

---

# 9. ERROR HANDLING

## 9.1 LHTTP Status Codes

| Status Code | Meaning | Solution |
|-------------|---------|----------|
| 0x0000 | Success | No action needed |
| 80A1 | TLS handshake failed | Check certificate |
| 80A3 | Certificate verification failed | Re-import Root CA |
| 80C4 | Connection refused | Check server/firewall |
| 80C8 | DNS resolution failed | Check network config |
| 80C9 | Connection timeout | Increase timeout/retry |

## 9.2 Recommended Retry Logic

```
// If error occurs:
// 1. Wait 60 seconds
// 2. Retry request
// 3. If 3 consecutive failures, set alarm
// 4. Continue trying every 60 seconds

IF Consecutive_Errors >= 3 THEN
    Communication_Alarm := TRUE;
END_IF;
```

## 9.3 Logging Recommendations

Store in PLC data block for diagnostics:
- Last 10 HTTP response codes
- Last 10 error status codes
- Success/Error counters
- Last successful timestamp

---

# 10. TROUBLESHOOTING

## 10.1 Common Issues

### Issue: HTTP 401 Unauthorized
**Cause:** API key mismatch
**Solution:** Verify API key in URL exactly matches:
```
SCADA_LR_ENERGY_2026_SECURE_KEY
```

### Issue: HTTP 400 Bad Request
**Cause:** Invalid JSON format
**Solution:**
- Check JSON syntax (matching braces, quotes)
- Verify all required fields present
- Check decimal format (use . not ,)

### Issue: Connection Timeout
**Cause:** Network/firewall issue
**Solution:**
- Verify internet connectivity
- Check firewall allows outbound HTTPS
- Try HTTP instead of HTTPS

### Issue: TLS Handshake Failed
**Cause:** Certificate issue
**Solution:**
- Re-import Root CA certificate
- Verify certificate not expired
- Try HTTP to confirm connectivity

### Issue: Data Not Appearing in Dashboard
**Cause:** Timestamp format or timezone
**Solution:**
- Use format: "YYYY-MM-DD HH:MM:SS"
- Use IST timezone (Asia/Kolkata)
- Don't use future timestamps

---

# 11. CONTACT & SUPPORT

## 11.1 Server Information

| Item | Value |
|------|-------|
| Server URL | https://karnal.lrenergy.in |
| API Endpoint | /scada-api/receive_data.php |
| API Key | SCADA_LR_ENERGY_2026_SECURE_KEY |
| Dashboard Login | ho@lrenergy.in / qwerty@1234 |

## 11.2 Technical Contact

| Role | Contact |
|------|---------|
| IT Support | LR Energy IT Department |
| Plant Location | Karnal, Haryana |

## 11.3 Required Deliverables from PLC Developer

Please provide after integration:

1. ✅ Completed PLC Tag Mapping Table (Section 4.3)
2. ✅ Screenshot of TIA Portal LHTTP configuration
3. ✅ Confirmation of successful test POST
4. ✅ Screenshot of dashboard showing received data

---

# APPENDIX A: QUICK REFERENCE CARD

```
┌────────────────────────────────────────────────────────────────┐
│                    QUICK REFERENCE                              │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  API URL:                                                       │
│  https://karnal.lrenergy.in/scada-api/receive_data.php         │
│                                                                 │
│  API KEY:                                                       │
│  SCADA_LR_ENERGY_2026_SECURE_KEY                               │
│                                                                 │
│  METHOD: POST                                                   │
│  FORMAT: JSON                                                   │
│  FREQUENCY: Every 60 seconds                                    │
│                                                                 │
│  SUCCESS CODE: 201                                              │
│  DUPLICATE CODE: 200                                            │
│                                                                 │
│  TIMESTAMP FORMAT: "YYYY-MM-DD HH:MM:SS"                       │
│  TIMEZONE: IST (Asia/Kolkata)                                  │
│                                                                 │
│  FIELDS: 37 total                                               │
│  H2S: INTEGER (whole number)                                    │
│  STATUS: 0=Stopped, 1=Running                                   │
│                                                                 │
│  DASHBOARD: https://karnal.lrenergy.in                         │
│  LOGIN: ho@lrenergy.in / qwerty@1234                           │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

# APPENDIX B: SAMPLE CURL COMMAND (For Testing)

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
  }'
```

---

**Document Version:** 2.0
**Last Updated:** February 2026
**Classification:** Technical - PLC Integration
**Author:** LR Energy IT Department
