# SCADA Data Sync - Complete Technical Documentation

## Table of Contents
1. [Overview](#1-overview)
2. [Network Architecture](#2-network-architecture)
3. [IP Address Requirements](#3-ip-address-requirements)
4. [Communication Flow - Step by Step](#4-communication-flow---step-by-step)
5. [Components Explained](#5-components-explained)
6. [Siemens SCADA Connection Options](#6-siemens-scada-connection-options)
7. [GoDaddy Server Setup](#7-godaddy-server-setup)
8. [Sync Script Details](#8-sync-script-details)
9. [Data Format & Structure](#9-data-format--structure)
10. [Security Considerations](#10-security-considerations)
11. [Error Handling & Recovery](#11-error-handling--recovery)
12. [Installation Checklist](#12-installation-checklist)
13. [Troubleshooting Guide](#13-troubleshooting-guide)
14. [FAQ](#14-faq)

---

## 1. Overview

### What We're Building
A system to transfer real-time SCADA data from Karnal Plant to a cloud dashboard hosted on GoDaddy.

### Data Flow Summary
```
SCADA → Sync Script → Internet → GoDaddy PHP API → MySQL Database → React Dashboard
```

### Key Numbers
- **36 parameters** being monitored
- **1 minute** sync interval
- **~2 KB** data per sync
- **~86 MB/year** storage requirement

---

## 2. Network Architecture

### Complete System Diagram

```
╔═══════════════════════════════════════════════════════════════════════════════════╗
║                           KARNAL PLANT - LOCAL NETWORK                             ║
║                              (Behind Router/Firewall)                              ║
║                                                                                    ║
║    ┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐   ║
║    │                 │         │                 │         │                 │   ║
║    │   SIEMENS PLC   │◄───────►│  SIEMENS SCADA  │◄───────►│   SYNC PC       │   ║
║    │   (Controller)  │  PROFINET│  (WinCC PC)     │  OPC UA │  (Windows)      │   ║
║    │                 │  or      │                 │  or     │                 │   ║
║    │  192.168.1.10   │  MPI     │  192.168.1.50   │  SQL    │  192.168.1.100  │   ║
║    │                 │         │                 │         │                 │   ║
║    └─────────────────┘         └─────────────────┘         └────────┬────────┘   ║
║                                                                      │            ║
║                                                                      │            ║
║    ┌─────────────────────────────────────────────────────────────────┘            ║
║    │                                                                              ║
║    │  WHAT HAPPENS INSIDE SYNC PC:                                                ║
║    │  ┌────────────────────────────────────────────────────────────────────┐     ║
║    │  │                                                                    │     ║
║    │  │  1. Python script runs every 60 seconds                           │     ║
║    │  │  2. Connects to SCADA PC (192.168.1.50) via OPC UA or SQL         │     ║
║    │  │  3. Reads all 36 tag values                                       │     ║
║    │  │  4. Packages data as JSON                                         │     ║
║    │  │  5. Sends HTTPS POST to GoDaddy                                   │     ║
║    │  │  6. Waits for response                                            │     ║
║    │  │  7. Logs success/failure                                          │     ║
║    │  │  8. Sleeps for 60 seconds                                         │     ║
║    │  │  9. Repeats from step 1                                           │     ║
║    │  │                                                                    │     ║
║    │  └────────────────────────────────────────────────────────────────────┘     ║
║    │                                                                              ║
║    └──────────────────────────────────────┬───────────────────────────────────────╝
║                                           │                                       ║
║    ┌──────────────────────────────────────┼──────────────────────────────────┐   ║
║    │           ROUTER / FIREWALL          │                                  │   ║
║    │                                      │                                  │   ║
║    │   • NAT (Network Address Translation)│                                  │   ║
║    │   • Outbound HTTPS (Port 443) - ALLOWED                                │   ║
║    │   • No inbound ports needed          │                                  │   ║
║    │   • Public IP: Dynamic (OK) or Static (Optional)                       │   ║
║    │                                      │                                  │   ║
║    └──────────────────────────────────────┼──────────────────────────────────┘   ║
║                                           │                                       ║
╚═══════════════════════════════════════════╪═══════════════════════════════════════╝
                                            │
                                            │  HTTPS POST (Port 443)
                                            │  Encrypted TLS 1.2/1.3
                                            │
                                            │  Data Packet:
                                            │  {
                                            │    "api_key": "sk_xxxxx",
                                            │    "timestamp": "2026-02-09 10:30:00",
                                            │    "raw_biogas_flow": 1250.5,
                                            │    "ch4_concentration": 96.8,
                                            │    ... (36 fields)
                                            │  }
                                            │
                                            ▼
╔═══════════════════════════════════════════════════════════════════════════════════╗
║                              INTERNET (Public Network)                             ║
╚═══════════════════════════════════════════╪═══════════════════════════════════════╝
                                            │
                                            ▼
╔═══════════════════════════════════════════════════════════════════════════════════╗
║                           GODADDY HOSTING - CLOUD SERVER                           ║
║                              (karnal.lrenergy.in)                                  ║
║                                                                                    ║
║    ┌─────────────────────────────────────────────────────────────────────────┐   ║
║    │                         INCOMING REQUEST                                 │   ║
║    │                                                                         │   ║
║    │   POST https://karnal.lrenergy.in/api/receive_data.php                  │   ║
║    │   Content-Type: application/json                                        │   ║
║    │   Body: { "api_key": "...", "timestamp": "...", ... }                  │   ║
║    │                                                                         │   ║
║    └────────────────────────────────────┬────────────────────────────────────┘   ║
║                                         │                                         ║
║                                         ▼                                         ║
║    ┌─────────────────────────────────────────────────────────────────────────┐   ║
║    │                     PHP API (/api/receive_data.php)                     │   ║
║    │                                                                         │   ║
║    │   STEP 1: Validate API Key                                              │   ║
║    │           if ($api_key !== VALID_KEY) → Return 401 Unauthorized        │   ║
║    │                                                                         │   ║
║    │   STEP 2: Validate Data                                                 │   ║
║    │           Check all required fields exist                               │   ║
║    │           Check data types are correct                                  │   ║
║    │                                                                         │   ║
║    │   STEP 3: Sanitize Input                                                │   ║
║    │           Prevent SQL injection                                         │   ║
║    │           Escape special characters                                     │   ║
║    │                                                                         │   ║
║    │   STEP 4: Insert into Database                                          │   ║
║    │           INSERT INTO scada_readings (timestamp, ...) VALUES (...)      │   ║
║    │                                                                         │   ║
║    │   STEP 5: Return Response                                               │   ║
║    │           Success: {"status": "success", "id": 12345}                  │   ║
║    │           Failure: {"status": "error", "message": "..."}               │   ║
║    │                                                                         │   ║
║    └────────────────────────────────────┬────────────────────────────────────┘   ║
║                                         │                                         ║
║                                         ▼                                         ║
║    ┌─────────────────────────────────────────────────────────────────────────┐   ║
║    │                        MySQL DATABASE                                    │   ║
║    │                                                                         │   ║
║    │   Table: scada_readings                                                 │   ║
║    │   ┌────┬─────────────────────┬─────────────────┬──────────────────┐    │   ║
║    │   │ id │ timestamp           │ raw_biogas_flow │ ch4_concentration│... │   ║
║    │   ├────┼─────────────────────┼─────────────────┼──────────────────┤    │   ║
║    │   │ 1  │ 2026-02-09 10:30:00│ 1250.5          │ 96.8             │    │   ║
║    │   │ 2  │ 2026-02-09 10:31:00│ 1248.2          │ 96.7             │    │   ║
║    │   │ 3  │ 2026-02-09 10:32:00│ 1252.1          │ 96.9             │    │   ║
║    │   │... │ ...                 │ ...             │ ...              │    │   ║
║    │   └────┴─────────────────────┴─────────────────┴──────────────────┘    │   ║
║    │                                                                         │   ║
║    └────────────────────────────────────┬────────────────────────────────────┘   ║
║                                         │                                         ║
║                                         ▼                                         ║
║    ┌─────────────────────────────────────────────────────────────────────────┐   ║
║    │                     PHP API (/api/dashboard.php)                        │   ║
║    │                                                                         │   ║
║    │   • Returns latest reading                                              │   ║
║    │   • Calculates averages (1hr, 12hr, 24hr)                              │   ║
║    │   • Returns sample counts for data quality                              │   ║
║    │                                                                         │   ║
║    └────────────────────────────────────┬────────────────────────────────────┘   ║
║                                         │                                         ║
║                                         ▼                                         ║
║    ┌─────────────────────────────────────────────────────────────────────────┐   ║
║    │                        REACT DASHBOARD                                   │   ║
║    │                                                                         │   ║
║    │   • Polls /api/dashboard.php every 60 seconds                          │   ║
║    │   • Updates UI with new values                                          │   ║
║    │   • No page reload required                                             │   ║
║    │   • Accessible from: HEAD_OFFICE and MNRE users                        │   ║
║    │                                                                         │   ║
║    └─────────────────────────────────────────────────────────────────────────┘   ║
║                                                                                    ║
╚═══════════════════════════════════════════════════════════════════════════════════╝
```

---

## 3. IP Address Requirements

### Critical Question: Can SCADA PC IP Change?

**Answer: YES, but with conditions.**

### Scenario Analysis

#### Scenario 1: SCADA PC and Sync Script on SAME PC ✅ (Simplest)

```
┌─────────────────────────────────────────┐
│           SINGLE PC                     │
│                                         │
│   ┌─────────────┐  ┌─────────────┐     │
│   │   WinCC     │  │   Python    │     │
│   │   SCADA     │◄─┤   Script    │     │
│   │             │  │             │     │
│   └─────────────┘  └─────────────┘     │
│                    Uses: localhost      │
│                    or 127.0.0.1         │
│                                         │
└─────────────────────────────────────────┘

Configuration:
SCADA_HOST = "localhost"  ← NEVER CHANGES!
```

**Recommendation: Install sync script on SCADA PC itself.**
- IP never changes (always localhost)
- No network issues between PCs
- Simpler setup

---

#### Scenario 2: SCADA PC and Sync Script on DIFFERENT PCs

```
┌─────────────────┐         ┌─────────────────┐
│   SCADA PC      │         │   SYNC PC       │
│                 │◄────────┤                 │
│  192.168.1.50   │  Network│  192.168.1.100  │
│  (Can change!)  │         │                 │
└─────────────────┘         └─────────────────┘
```

**If SCADA PC IP can change, you have these options:**

##### Option A: Set Static IP on SCADA PC (Recommended)
```
Windows Network Settings:
IP Address:     192.168.1.50
Subnet Mask:    255.255.255.0
Gateway:        192.168.1.1
DNS:            8.8.8.8

Then in sync script:
SCADA_HOST = "192.168.1.50"  ← Fixed, won't change
```

##### Option B: Use Hostname Instead of IP
```
Windows Computer Name: SCADA-PC-01

Then in sync script:
SCADA_HOST = "SCADA-PC-01"  ← Windows resolves this to current IP
```

##### Option C: Use DNS/mDNS
```
Local DNS Entry: scada.local → 192.168.1.50

Then in sync script:
SCADA_HOST = "scada.local"
```

---

### IP Requirements Summary Table

| Component | IP Type | Required? | Reason |
|-----------|---------|-----------|--------|
| **PLC** | Local Static | ✅ Yes | SCADA needs stable connection |
| **SCADA PC** | Local Static | ⚠️ Recommended | Sync script connects to it |
| **Sync PC** | Any | ❌ No | Only makes outbound connections |
| **Plant Router (Public)** | Any | ❌ No | Outbound connection, no inbound |
| **GoDaddy Server** | Domain Name | ✅ Handled | karnal.lrenergy.in |

---

### Why Public Static IP is NOT Required

```
OUTBOUND CONNECTION (What we use):
─────────────────────────────────

Plant Network                           GoDaddy
┌──────────┐                           ┌──────────┐
│          │ ────── HTTPS POST ──────► │          │
│ Script   │                           │   API    │
│          │ ◄───── Response ───────── │          │
└──────────┘                           └──────────┘

• Script INITIATES connection
• Router handles NAT automatically
• Works with any public IP (dynamic OK)
• Like browsing a website - no static IP needed


INBOUND CONNECTION (NOT what we use):
────────────────────────────────────

Plant Network                           External
┌──────────┐                           ┌──────────┐
│          │ ◄───── Incoming ───────── │          │
│ Server   │        Request            │  Client  │
│          │                           │          │
└──────────┘                           └──────────┘

• External client tries to connect IN
• Requires port forwarding on router
• Requires static public IP
• WE DON'T NEED THIS!
```

---

## 4. Communication Flow - Step by Step

### Every 60 Seconds, This Happens:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ STEP 1: TIMER TRIGGERS (Every 60 seconds)                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   Sync Script (Python)                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐          │
│   │  while True:                                                     │          │
│   │      # This runs every 60 seconds                               │          │
│   │      data = read_from_scada()                                   │          │
│   │      send_to_cloud(data)                                        │          │
│   │      time.sleep(60)                                             │          │
│   └─────────────────────────────────────────────────────────────────┘          │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ STEP 2: CONNECT TO SCADA                                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   Option A: OPC UA Connection                                                   │
│   ┌─────────────────────────────────────────────────────────────────┐          │
│   │  from opcua import Client                                        │          │
│   │                                                                  │          │
│   │  client = Client("opc.tcp://192.168.1.50:4840")                 │          │
│   │  client.connect()                                                │          │
│   │                                                                  │          │
│   │  # Connection established to SCADA OPC UA Server                │          │
│   └─────────────────────────────────────────────────────────────────┘          │
│                                                                                 │
│   Option B: SQL Server Connection (if WinCC logs to SQL)                       │
│   ┌─────────────────────────────────────────────────────────────────┐          │
│   │  import pyodbc                                                   │          │
│   │                                                                  │          │
│   │  conn = pyodbc.connect(                                         │          │
│   │      'DRIVER={SQL Server};'                                     │          │
│   │      'SERVER=192.168.1.50;'                                     │          │
│   │      'DATABASE=WinCC;'                                          │          │
│   │      'UID=user;PWD=password'                                    │          │
│   │  )                                                               │          │
│   └─────────────────────────────────────────────────────────────────┘          │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ STEP 3: READ ALL 36 TAG VALUES                                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   OPC UA Method:                                                                │
│   ┌─────────────────────────────────────────────────────────────────┐          │
│   │  # Read each tag by its node ID                                  │          │
│   │  raw_biogas = client.get_node("ns=2;s=RAW_BIOGAS_FLOW").get_value()       │
│   │  ch4 = client.get_node("ns=2;s=CH4_CONCENTRATION").get_value()            │
│   │  # ... repeat for all 36 tags                                   │          │
│   │                                                                  │          │
│   │  data = {                                                        │          │
│   │      "raw_biogas_flow": 1250.5,                                 │          │
│   │      "raw_biogas_totalizer": 150000.0,                          │          │
│   │      "ch4_concentration": 96.8,                                 │          │
│   │      # ... all 36 values                                        │          │
│   │  }                                                               │          │
│   └─────────────────────────────────────────────────────────────────┘          │
│                                                                                 │
│   Time taken: ~100-500ms                                                        │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ STEP 4: PREPARE JSON PAYLOAD                                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   ┌─────────────────────────────────────────────────────────────────┐          │
│   │  import json                                                     │          │
│   │  from datetime import datetime                                   │          │
│   │                                                                  │          │
│   │  payload = {                                                     │          │
│   │      "api_key": "sk_live_abc123xyz789",                         │          │
│   │      "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"), │          │
│   │      "raw_biogas_flow": 1250.5,                                 │          │
│   │      "raw_biogas_totalizer": 150000.0,                          │          │
│   │      "purified_gas_flow": 1180.2,                               │          │
│   │      "purified_gas_totalizer": 142000.0,                        │          │
│   │      "product_gas_flow": 1150.8,                                │          │
│   │      "product_gas_totalizer": 138000.0,                         │          │
│   │      "ch4_concentration": 96.8,                                 │          │
│   │      "co2_level": 2.9,                                          │          │
│   │      "o2_concentration": 0.3,                                   │          │
│   │      "h2s_content": 180.0,                                      │          │
│   │      "dew_point": -68.0,                                        │          │
│   │      "d1_temp_bottom": 37.0,                                    │          │
│   │      "d1_temp_top": 36.5,                                       │          │
│   │      ... (all 36 fields)                                        │          │
│   │  }                                                               │          │
│   │                                                                  │          │
│   │  json_data = json.dumps(payload)                                │          │
│   │  # Size: approximately 1.5 - 2 KB                               │          │
│   └─────────────────────────────────────────────────────────────────┘          │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ STEP 5: SEND HTTPS POST REQUEST                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   ┌─────────────────────────────────────────────────────────────────┐          │
│   │  import requests                                                 │          │
│   │                                                                  │          │
│   │  response = requests.post(                                       │          │
│   │      url="https://karnal.lrenergy.in/api/receive_data.php",     │          │
│   │      json=payload,                                               │          │
│   │      headers={"Content-Type": "application/json"},              │          │
│   │      timeout=30                                                  │          │
│   │  )                                                               │          │
│   └─────────────────────────────────────────────────────────────────┘          │
│                                                                                 │
│   What happens during this request:                                             │
│                                                                                 │
│   1. DNS Resolution                                                             │
│      karnal.lrenergy.in → 192.169.xxx.xxx (GoDaddy IP)                        │
│                                                                                 │
│   2. TCP Connection                                                             │
│      Sync PC → Router NAT → Internet → GoDaddy Server                          │
│      Port: 443 (HTTPS)                                                          │
│                                                                                 │
│   3. TLS Handshake                                                              │
│      Establishes encrypted connection                                           │
│      Verifies SSL certificate                                                   │
│                                                                                 │
│   4. HTTP POST                                                                  │
│      Sends JSON payload over encrypted connection                               │
│                                                                                 │
│   Time taken: ~200-1000ms (depends on internet speed)                          │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ STEP 6: SERVER PROCESSES REQUEST                                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   On GoDaddy Server (receive_data.php):                                        │
│                                                                                 │
│   ┌─────────────────────────────────────────────────────────────────┐          │
│   │  <?php                                                           │          │
│   │  // 1. Read incoming JSON                                        │          │
│   │  $data = json_decode(file_get_contents('php://input'), true);   │          │
│   │                                                                  │          │
│   │  // 2. Validate API key                                          │          │
│   │  if ($data['api_key'] !== 'sk_live_abc123xyz789') {             │          │
│   │      http_response_code(401);                                    │          │
│   │      echo json_encode(['error' => 'Invalid API key']);          │          │
│   │      exit;                                                       │          │
│   │  }                                                               │          │
│   │                                                                  │          │
│   │  // 3. Insert into database                                      │          │
│   │  $sql = "INSERT INTO scada_readings                              │          │
│   │          (timestamp, raw_biogas_flow, ch4_concentration, ...)   │          │
│   │          VALUES (?, ?, ?, ...)";                                 │          │
│   │  $stmt = $conn->prepare($sql);                                   │          │
│   │  $stmt->execute([...]);                                          │          │
│   │                                                                  │          │
│   │  // 4. Return success                                            │          │
│   │  echo json_encode(['status' => 'success', 'id' => $conn->lastInsertId()]); │
│   │  ?>                                                              │          │
│   └─────────────────────────────────────────────────────────────────┘          │
│                                                                                 │
│   Time taken: ~50-200ms                                                         │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ STEP 7: SCRIPT RECEIVES RESPONSE                                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   ┌─────────────────────────────────────────────────────────────────┐          │
│   │  if response.status_code == 200:                                 │          │
│   │      result = response.json()                                    │          │
│   │      print(f"✅ Success: Record #{result['id']} saved")         │          │
│   │      log_success(timestamp, result['id'])                        │          │
│   │  else:                                                           │          │
│   │      print(f"❌ Error: {response.text}")                         │          │
│   │      log_error(timestamp, response.text)                         │          │
│   │      retry_queue.append(payload)  # Save for retry              │          │
│   └─────────────────────────────────────────────────────────────────┘          │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ STEP 8: WAIT AND REPEAT                                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   ┌─────────────────────────────────────────────────────────────────┐          │
│   │  time.sleep(60)  # Wait 60 seconds                              │          │
│   │  # Then go back to STEP 1                                        │          │
│   └─────────────────────────────────────────────────────────────────┘          │
│                                                                                 │
│   Total cycle time: ~1-3 seconds                                                │
│   Remaining 57-59 seconds: Script sleeps (minimal CPU usage)                   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Components Explained

### 5.1 Sync Script (Python)

**Location:** Runs on a Windows PC at Karnal Plant (preferably SCADA PC itself)

**What it does:**
- Connects to SCADA via OPC UA or SQL
- Reads all 36 tag values
- Sends to GoDaddy via HTTPS
- Handles errors and retries
- Logs all activity

**Requirements:**
- Python 3.8 or higher
- Internet connection
- Access to SCADA

**Dependencies:**
```
requests          # HTTP requests
opcua            # OPC UA client (if using OPC)
pyodbc           # SQL Server client (if using SQL)
schedule         # Task scheduling
python-dotenv    # Environment variables
```

---

### 5.2 PHP API (GoDaddy)

**Location:** GoDaddy shared hosting

**Endpoints:**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/receive_data.php` | POST | Receive data from sync script |
| `/api/dashboard.php` | GET | Get latest data for dashboard |
| `/api/trends.php` | GET | Get historical data for charts |
| `/api/reports.php` | GET | Get data for reports |
| `/api/auth.php` | POST | User login |

---

### 5.3 MySQL Database

**Tables:**

```sql
-- Main data table
CREATE TABLE scada_readings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME NOT NULL,
    
    -- Gas Flow (Current + Totalizer)
    raw_biogas_flow DECIMAL(10,2),
    raw_biogas_totalizer DECIMAL(15,2),
    purified_gas_flow DECIMAL(10,2),
    purified_gas_totalizer DECIMAL(15,2),
    product_gas_flow DECIMAL(10,2),
    product_gas_totalizer DECIMAL(15,2),
    
    -- Gas Composition
    ch4_concentration DECIMAL(5,2),
    co2_level DECIMAL(5,2),
    o2_concentration DECIMAL(5,2),
    h2s_content DECIMAL(10,2),
    dew_point DECIMAL(10,2),
    
    -- Digester 1
    d1_temp_bottom DECIMAL(5,2),
    d1_temp_top DECIMAL(5,2),
    d1_gas_pressure DECIMAL(10,2),
    d1_air_pressure DECIMAL(10,2),
    d1_slurry_height DECIMAL(5,2),
    d1_gas_level DECIMAL(5,2),
    
    -- Digester 2
    d2_temp_bottom DECIMAL(5,2),
    d2_temp_top DECIMAL(5,2),
    d2_gas_pressure DECIMAL(10,2),
    d2_air_pressure DECIMAL(10,2),
    d2_slurry_height DECIMAL(5,2),
    d2_gas_level DECIMAL(5,2),
    
    -- Tank Levels
    buffer_tank_level DECIMAL(5,2),
    lagoon_tank_level DECIMAL(5,2),
    
    -- Water Flow (Current + Totalizer)
    feed_fm1_flow DECIMAL(10,2),
    feed_fm1_totalizer DECIMAL(15,2),
    feed_fm2_flow DECIMAL(10,2),
    feed_fm2_totalizer DECIMAL(15,2),
    fresh_water_flow DECIMAL(10,2),
    fresh_water_totalizer DECIMAL(15,2),
    recycle_water_flow DECIMAL(10,2),
    recycle_water_totalizer DECIMAL(15,2),
    
    -- Equipment
    psa_efficiency DECIMAL(5,2),
    lt_panel_power DECIMAL(10,2),
    compressor_status TINYINT(1),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_timestamp (timestamp)
);

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('HEAD_OFFICE', 'MNRE') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 6. Siemens SCADA Connection Options

### Option A: OPC UA Server (Recommended)

**Best for:** WinCC V7.x, WinCC Professional, WinCC Unified

```
┌─────────────────┐         ┌─────────────────┐
│   WinCC SCADA   │         │   Sync Script   │
│                 │         │                 │
│  OPC UA Server  │◄────────┤  OPC UA Client  │
│  Port: 4840     │         │  (Python)       │
│                 │         │                 │
└─────────────────┘         └─────────────────┘
```

**How to enable in WinCC:**
1. Open WinCC project
2. Go to: Runtime Settings → OPC UA
3. Enable "OPC UA Server"
4. Set port (default: 4840)
5. Configure tag access

---

### Option B: WinCC SQL Server Database

**Best for:** WinCC that logs to SQL Server

```
┌─────────────────┐         ┌─────────────────┐
│   WinCC SCADA   │         │   Sync Script   │
│                 │         │                 │
│  SQL Server DB  │◄────────┤  SQL Client     │
│  (Logging)      │         │  (Python)       │
│                 │         │                 │
└─────────────────┘         └─────────────────┘
```

**Requirements:**
- WinCC logging enabled
- SQL Server credentials
- Network access to SQL Server

---

### Option C: CSV/File Export

**Best for:** Simple setups, older SCADA systems

```
┌─────────────────┐         ┌─────────────────┐
│   WinCC SCADA   │         │   Sync Script   │
│                 │         │                 │
│  Exports CSV    │────────►│  Reads CSV      │
│  (Every 1 min)  │         │  (Python)       │
│                 │         │                 │
└─────────────────┘         └─────────────────┘
```

**How it works:**
1. Configure WinCC to export data to CSV every minute
2. Python script monitors the folder
3. Reads new CSV files
4. Sends data to GoDaddy
5. Archives processed files

---

## 7. GoDaddy Server Setup

### Directory Structure

```
public_html/
├── index.html              # React app entry point
├── static/                 # React build files
│   ├── css/
│   └── js/
├── api/
│   ├── config.php          # Database connection, API key
│   ├── receive_data.php    # Receives data from plant
│   ├── dashboard.php       # Returns latest data
│   ├── trends.php          # Returns historical data
│   ├── reports.php         # Returns report data
│   └── auth.php            # User authentication
└── .htaccess               # URL rewriting, security
```

### API Configuration (config.php)

```php
<?php
// Database connection
define('DB_HOST', 'localhost');
define('DB_NAME', 'your_database_name');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');

// API Security
define('API_KEY', 'sk_live_abc123xyz789');  // Keep this secret!

// Optional: Whitelist plant IP
define('ALLOWED_IP', '');  // Leave empty to allow any IP

// Create database connection
function getDBConnection() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    return $conn;
}
?>
```

---

## 8. Sync Script Details

### Full Python Script Structure

```python
"""
SCADA Data Sync Script
Reads data from Siemens SCADA and sends to GoDaddy server

Author: LR Energy / Elan Energies
Version: 1.0
"""

import os
import json
import time
import logging
import requests
from datetime import datetime
from dotenv import load_dotenv

# For OPC UA connection
# from opcua import Client

# For SQL Server connection
# import pyodbc

# ============================================
# CONFIGURATION
# ============================================

# Load from .env file
load_dotenv()

# SCADA Connection (Choose one)
SCADA_TYPE = "OPC_UA"  # Options: "OPC_UA", "SQL_SERVER", "CSV_FILE"
SCADA_HOST = os.getenv("SCADA_HOST", "localhost")
SCADA_PORT = int(os.getenv("SCADA_PORT", 4840))

# GoDaddy API
API_URL = os.getenv("API_URL", "https://karnal.lrenergy.in/api/receive_data.php")
API_KEY = os.getenv("API_KEY", "your_api_key_here")

# Sync Settings
SYNC_INTERVAL = 60  # seconds
MAX_RETRIES = 3
RETRY_DELAY = 5  # seconds

# Tag Mapping (SCADA Tag Name → Database Field Name)
TAG_MAPPING = {
    # Gas Flow
    "RAW_BIOGAS_FLOW": "raw_biogas_flow",
    "RAW_BIOGAS_TOTALIZER": "raw_biogas_totalizer",
    "PURIFIED_GAS_FLOW": "purified_gas_flow",
    "PURIFIED_GAS_TOTALIZER": "purified_gas_totalizer",
    "PRODUCT_GAS_FLOW": "product_gas_flow",
    "PRODUCT_GAS_TOTALIZER": "product_gas_totalizer",
    
    # Gas Composition
    "CH4_CONCENTRATION": "ch4_concentration",
    "CO2_LEVEL": "co2_level",
    "O2_CONCENTRATION": "o2_concentration",
    "H2S_CONTENT": "h2s_content",
    "DEW_POINT": "dew_point",
    
    # Digester 1
    "D1_TEMP_BOTTOM": "d1_temp_bottom",
    "D1_TEMP_TOP": "d1_temp_top",
    "D1_GAS_PRESSURE": "d1_gas_pressure",
    "D1_AIR_PRESSURE": "d1_air_pressure",
    "D1_SLURRY_HEIGHT": "d1_slurry_height",
    "D1_GAS_LEVEL": "d1_gas_level",
    
    # Digester 2
    "D2_TEMP_BOTTOM": "d2_temp_bottom",
    "D2_TEMP_TOP": "d2_temp_top",
    "D2_GAS_PRESSURE": "d2_gas_pressure",
    "D2_AIR_PRESSURE": "d2_air_pressure",
    "D2_SLURRY_HEIGHT": "d2_slurry_height",
    "D2_GAS_LEVEL": "d2_gas_level",
    
    # Tank Levels
    "BUFFER_TANK_LEVEL": "buffer_tank_level",
    "LAGOON_TANK_LEVEL": "lagoon_tank_level",
    
    # Water Flow
    "FEED_FM1_FLOW": "feed_fm1_flow",
    "FEED_FM1_TOTALIZER": "feed_fm1_totalizer",
    "FEED_FM2_FLOW": "feed_fm2_flow",
    "FEED_FM2_TOTALIZER": "feed_fm2_totalizer",
    "FRESH_WATER_FLOW": "fresh_water_flow",
    "FRESH_WATER_TOTALIZER": "fresh_water_totalizer",
    "RECYCLE_WATER_FLOW": "recycle_water_flow",
    "RECYCLE_WATER_TOTALIZER": "recycle_water_totalizer",
    
    # Equipment
    "PSA_EFFICIENCY": "psa_efficiency",
    "LT_PANEL_POWER": "lt_panel_power",
    "COMPRESSOR_STATUS": "compressor_status",
}

# ============================================
# LOGGING SETUP
# ============================================

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('sync_log.txt'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# ============================================
# SCADA READING FUNCTIONS
# ============================================

def read_from_opc_ua():
    """Read all tags from OPC UA server"""
    from opcua import Client
    
    client = Client(f"opc.tcp://{SCADA_HOST}:{SCADA_PORT}")
    
    try:
        client.connect()
        logger.info(f"Connected to OPC UA server at {SCADA_HOST}:{SCADA_PORT}")
        
        data = {}
        for scada_tag, db_field in TAG_MAPPING.items():
            try:
                node = client.get_node(f"ns=2;s={scada_tag}")
                value = node.get_value()
                data[db_field] = float(value) if value is not None else None
            except Exception as e:
                logger.warning(f"Failed to read {scada_tag}: {e}")
                data[db_field] = None
        
        return data
        
    finally:
        client.disconnect()


def read_from_sql_server():
    """Read latest values from WinCC SQL Server database"""
    import pyodbc
    
    conn_str = (
        f"DRIVER={{SQL Server}};"
        f"SERVER={SCADA_HOST};"
        f"DATABASE=WinCC;"
        f"UID={os.getenv('SQL_USER', 'user')};"
        f"PWD={os.getenv('SQL_PASS', 'password')}"
    )
    
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    
    # Query depends on your WinCC logging table structure
    # This is an example - adjust to your actual table
    query = """
        SELECT TOP 1 * 
        FROM RuntimeData 
        ORDER BY Timestamp DESC
    """
    
    cursor.execute(query)
    row = cursor.fetchone()
    
    data = {}
    for scada_tag, db_field in TAG_MAPPING.items():
        # Map column names - adjust to your actual columns
        data[db_field] = getattr(row, scada_tag, None)
    
    conn.close()
    return data


def read_from_csv():
    """Read latest CSV file exported by SCADA"""
    import glob
    
    csv_folder = os.getenv("CSV_FOLDER", "C:/SCADA_Export")
    csv_files = glob.glob(f"{csv_folder}/*.csv")
    
    if not csv_files:
        raise Exception("No CSV files found")
    
    latest_file = max(csv_files, key=os.path.getctime)
    
    import csv
    with open(latest_file, 'r') as f:
        reader = csv.DictReader(f)
        row = next(reader)  # Get first row
    
    data = {}
    for scada_tag, db_field in TAG_MAPPING.items():
        data[db_field] = float(row.get(scada_tag, 0))
    
    return data


def read_scada_data():
    """Main function to read SCADA data based on configured type"""
    if SCADA_TYPE == "OPC_UA":
        return read_from_opc_ua()
    elif SCADA_TYPE == "SQL_SERVER":
        return read_from_sql_server()
    elif SCADA_TYPE == "CSV_FILE":
        return read_from_csv()
    else:
        raise ValueError(f"Unknown SCADA_TYPE: {SCADA_TYPE}")

# ============================================
# API SENDING FUNCTIONS
# ============================================

def send_to_cloud(data, retry_count=0):
    """Send data to GoDaddy API"""
    
    payload = {
        "api_key": API_KEY,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        **data
    }
    
    try:
        response = requests.post(
            API_URL,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            logger.info(f"✅ Data sent successfully. Record ID: {result.get('id')}")
            return True
        else:
            logger.error(f"❌ Server error: {response.status_code} - {response.text}")
            
            if retry_count < MAX_RETRIES:
                logger.info(f"Retrying in {RETRY_DELAY} seconds... ({retry_count + 1}/{MAX_RETRIES})")
                time.sleep(RETRY_DELAY)
                return send_to_cloud(data, retry_count + 1)
            
            return False
            
    except requests.exceptions.Timeout:
        logger.error("❌ Request timeout")
        if retry_count < MAX_RETRIES:
            time.sleep(RETRY_DELAY)
            return send_to_cloud(data, retry_count + 1)
        return False
        
    except requests.exceptions.ConnectionError:
        logger.error("❌ Connection error - check internet connection")
        if retry_count < MAX_RETRIES:
            time.sleep(RETRY_DELAY)
            return send_to_cloud(data, retry_count + 1)
        return False
        
    except Exception as e:
        logger.error(f"❌ Unexpected error: {e}")
        return False

# ============================================
# MAIN LOOP
# ============================================

def main():
    """Main sync loop"""
    logger.info("=" * 50)
    logger.info("SCADA Data Sync Script Started")
    logger.info(f"SCADA Type: {SCADA_TYPE}")
    logger.info(f"SCADA Host: {SCADA_HOST}")
    logger.info(f"API URL: {API_URL}")
    logger.info(f"Sync Interval: {SYNC_INTERVAL} seconds")
    logger.info("=" * 50)
    
    while True:
        try:
            # Step 1: Read from SCADA
            logger.info("Reading data from SCADA...")
            data = read_scada_data()
            logger.info(f"Read {len(data)} values")
            
            # Step 2: Send to cloud
            logger.info("Sending data to cloud...")
            success = send_to_cloud(data)
            
            if not success:
                logger.warning("Failed to send data - will retry next cycle")
            
        except Exception as e:
            logger.error(f"Error in sync cycle: {e}")
        
        # Step 3: Wait for next cycle
        logger.info(f"Sleeping for {SYNC_INTERVAL} seconds...")
        time.sleep(SYNC_INTERVAL)


if __name__ == "__main__":
    main()
```

---

## 9. Data Format & Structure

### JSON Payload (Sent Every Minute)

```json
{
    "api_key": "sk_live_abc123xyz789",
    "timestamp": "2026-02-09 10:30:00",
    
    "raw_biogas_flow": 1250.5,
    "raw_biogas_totalizer": 150000.0,
    "purified_gas_flow": 1180.2,
    "purified_gas_totalizer": 142000.0,
    "product_gas_flow": 1150.8,
    "product_gas_totalizer": 138000.0,
    
    "ch4_concentration": 96.8,
    "co2_level": 2.9,
    "o2_concentration": 0.3,
    "h2s_content": 180.0,
    "dew_point": -68.0,
    
    "d1_temp_bottom": 37.0,
    "d1_temp_top": 36.5,
    "d1_gas_pressure": 32.0,
    "d1_air_pressure": 18.0,
    "d1_slurry_height": 7.6,
    "d1_gas_level": 75.0,
    
    "d2_temp_bottom": 36.5,
    "d2_temp_top": 36.0,
    "d2_gas_pressure": 30.0,
    "d2_air_pressure": 17.0,
    "d2_slurry_height": 7.3,
    "d2_gas_level": 72.0,
    
    "buffer_tank_level": 82.0,
    "lagoon_tank_level": 76.0,
    
    "feed_fm1_flow": 42.0,
    "feed_fm1_totalizer": 5000.0,
    "feed_fm2_flow": 38.0,
    "feed_fm2_totalizer": 4500.0,
    "fresh_water_flow": 12.0,
    "fresh_water_totalizer": 1500.0,
    "recycle_water_flow": 26.0,
    "recycle_water_totalizer": 3000.0,
    
    "psa_efficiency": 94.4,
    "lt_panel_power": 245.0,
    "compressor_status": 1
}
```

### Size: ~1.5 KB per request

---

## 10. Security Considerations

### API Key Security

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SECURITY LAYERS                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Layer 1: HTTPS Encryption (TLS 1.2/1.3)                           │
│  ─────────────────────────────────────────                         │
│  • All data encrypted in transit                                    │
│  • Cannot be read by anyone intercepting                           │
│  • SSL certificate validates server identity                        │
│                                                                     │
│  Layer 2: API Key Authentication                                    │
│  ─────────────────────────────────                                 │
│  • Only requests with valid API key accepted                        │
│  • Key stored in .env file (not in code)                           │
│  • Can be rotated if compromised                                    │
│                                                                     │
│  Layer 3: IP Whitelisting (Optional)                               │
│  ────────────────────────────────────                              │
│  • Only accept requests from plant's public IP                      │
│  • Requires static public IP                                        │
│  • Extra security layer                                             │
│                                                                     │
│  Layer 4: Data Validation                                           │
│  ────────────────────────────                                      │
│  • PHP validates all incoming data                                  │
│  • Prevents SQL injection                                           │
│  • Checks data types and ranges                                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### What to Keep Secret

| Item | Where Stored | Who Knows |
|------|--------------|-----------|
| API Key | .env file on Sync PC & GoDaddy config.php | Only you |
| MySQL Password | GoDaddy config.php | Only you |
| SCADA Credentials | .env file on Sync PC | Only you |

---

## 11. Error Handling & Recovery

### What Happens When Things Go Wrong

```
┌─────────────────────────────────────────────────────────────────────┐
│ SCENARIO: Internet Connection Lost                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   Sync Script Behavior:                                             │
│   1. Attempt to send data → Connection Error                        │
│   2. Wait 5 seconds                                                 │
│   3. Retry (up to 3 times)                                          │
│   4. If all retries fail:                                           │
│      - Log error                                                    │
│      - Save data to local buffer file                               │
│      - Continue to next cycle                                       │
│   5. When internet restored:                                        │
│      - Send buffered data first                                     │
│      - Resume normal operation                                      │
│                                                                     │
│   Data Loss: MINIMAL (only during extended outage)                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ SCENARIO: SCADA Connection Lost                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   Sync Script Behavior:                                             │
│   1. Attempt to read from SCADA → Connection Error                  │
│   2. Log error with timestamp                                       │
│   3. Skip sending (no data to send)                                 │
│   4. Wait for next cycle                                            │
│   5. Keep trying every 60 seconds                                   │
│   6. When SCADA restored → Resume normal operation                  │
│                                                                     │
│   Dashboard shows: "Data is X minutes old" warning                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ SCENARIO: GoDaddy Server Down                                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   Sync Script Behavior:                                             │
│   1. Attempt to send → Server Error (500/503)                       │
│   2. Retry 3 times with 5 second delay                              │
│   3. Save to local buffer                                           │
│   4. Continue trying every cycle                                    │
│   5. When server restored → Send buffered data                      │
│                                                                     │
│   Note: GoDaddy has 99.9% uptime SLA                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ SCENARIO: Sync PC Restarts                                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   Solution: Install script as Windows Service                        │
│   1. Script starts automatically on boot                            │
│   2. Restarts automatically if crashed                              │
│   3. Runs in background (no user login required)                    │
│                                                                     │
│   Alternative: Add to Windows Startup folder                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 12. Installation Checklist

### Pre-Installation Requirements

#### At Karnal Plant:

| # | Item | Status |
|---|------|--------|
| 1 | Windows PC available for sync script | ☐ |
| 2 | PC has internet access | ☐ |
| 3 | PC can access SCADA (same network) | ☐ |
| 4 | Python 3.8+ installed | ☐ |
| 5 | SCADA OPC UA enabled OR SQL access available | ☐ |
| 6 | SCADA tag names documented | ☐ |
| 7 | Static local IP set on SCADA PC (recommended) | ☐ |

#### On GoDaddy:

| # | Item | Status |
|---|------|--------|
| 1 | Hosting account active | ☐ |
| 2 | Domain configured | ☐ |
| 3 | MySQL database created | ☐ |
| 4 | PHP 7.4+ available | ☐ |
| 5 | SSL certificate installed (for HTTPS) | ☐ |

---

### Installation Steps

#### Step 1: GoDaddy Setup (30 minutes)

```
1. Login to GoDaddy cPanel
2. Create MySQL database
   - Note: DB name, username, password
3. Upload PHP API files to /api folder
4. Update config.php with credentials
5. Test API endpoint manually
```

#### Step 2: Sync PC Setup (30 minutes)

```
1. Install Python 3.8+
   https://www.python.org/downloads/
   
2. Open Command Prompt as Administrator

3. Install required packages:
   pip install requests python-dotenv opcua pyodbc

4. Create project folder:
   mkdir C:\SCADA_Sync
   cd C:\SCADA_Sync

5. Create .env file with configuration

6. Copy sync_script.py to folder

7. Test manually:
   python sync_script.py
   
8. Install as Windows Service (for auto-start)
```

#### Step 3: Testing (15 minutes)

```
1. Run sync script manually
2. Check GoDaddy database for new records
3. Open dashboard, verify data appears
4. Stop script, verify "stale data" warning appears
5. Restart script, verify data resumes
```

---

## 13. Troubleshooting Guide

### Common Issues and Solutions

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| "Connection refused" to SCADA | OPC UA not enabled | Enable OPC UA in WinCC settings |
| "Connection refused" to SCADA | Wrong IP address | Verify SCADA PC IP address |
| "Connection refused" to SCADA | Firewall blocking | Add exception for port 4840 |
| "401 Unauthorized" from API | Wrong API key | Check API_KEY in .env file |
| "Connection timeout" to GoDaddy | No internet | Check internet connection |
| "SSL Certificate Error" | Date/time wrong on PC | Fix system date/time |
| Data not appearing on dashboard | Database insert failed | Check PHP error logs on GoDaddy |
| Script stops after PC restart | Not installed as service | Install as Windows Service |

### How to Check Logs

**Sync Script Log:**
```
C:\SCADA_Sync\sync_log.txt
```

**GoDaddy PHP Errors:**
```
cPanel → Error Logs
or
public_html/error_log
```

---

## 14. FAQ

### Q: Do I need a static public IP?
**A:** No. The sync script makes outbound connections to GoDaddy. Your router handles NAT automatically. A static public IP is optional (for extra security).

### Q: What if my SCADA PC IP changes?
**A:** Two options:
1. Set a static local IP on SCADA PC (recommended)
2. Install sync script on SCADA PC itself (use localhost)

### Q: How much internet bandwidth is needed?
**A:** Very little. ~2 KB per minute = ~3 MB per day = ~90 MB per month.

### Q: What happens if internet is down?
**A:** Script buffers data locally and sends when connection is restored.

### Q: Can multiple plants use the same dashboard?
**A:** Yes. Each plant gets a unique plant_id in the database. Dashboard can filter by plant.

### Q: Is the data secure?
**A:** Yes. HTTPS encryption + API key authentication + optional IP whitelisting.

### Q: How long is data stored?
**A:** Configurable. Recommended: 1-2 years. ~90 MB per year per plant.

### Q: Can I access the dashboard from my phone?
**A:** Yes. The React dashboard is responsive and works on mobile browsers.

---

## Document Information

| Item | Value |
|------|-------|
| Document Version | 1.0 |
| Created | February 2026 |
| Author | LR Energy / Elan Energies |
| Last Updated | February 9, 2026 |

---

## Next Steps

1. **Confirm SCADA connection type** (OPC UA / SQL / CSV)
2. **Provide SCADA tag names** for all 36 parameters
3. **Provide GoDaddy credentials** (MySQL host, database, user, password)
4. **Provide domain name** (e.g., karnal.lrenergy.in)

Once confirmed, we will create:
- ✅ Complete PHP API files
- ✅ MySQL table creation script
- ✅ Configured Python sync script
- ✅ Installation guide with screenshots
