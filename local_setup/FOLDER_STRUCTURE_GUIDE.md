# Complete Folder Structure Guide
## SCADA Monitoring System - Local Development Setup

This document explains the EXACT folder structure you need to create on your local PC with XAMPP to test the backend before deploying to GoDaddy.

---

## 📁 Overview - What Goes Where

```
YOUR LOCAL PC
│
├── C:\xampp\htdocs\                      ← XAMPP default web folder
│   └── scada-api\                        ← Create this folder
│       ├── .htaccess                     ← Security & URL handling
│       └── api\                          ← All PHP files go here
│           ├── config.php                ← Database connection settings
│           ├── test.php                  ← Test endpoint (check if API works)
│           ├── auth.php                  ← User login
│           ├── receive_data.php          ← Receives data from sync script
│           ├── dashboard.php             ← Returns latest data for dashboard
│           ├── trends.php                ← Returns historical data for charts
│           └── sync_status.php           ← Returns sync health status
│
├── C:\SCADA_Sync\                        ← Create this folder (for future use)
│   ├── sync_script.py                    ← Python script to read from SCADA
│   ├── .env                              ← Configuration (API key, SCADA IP)
│   └── sync_log.txt                      ← Log file (created automatically)
│
└── XAMPP MySQL Database
    └── scada_db                          ← Create in phpMyAdmin
        ├── scada_readings                ← Main data table (36 columns)
        ├── users                         ← Login users
        ├── api_logs                      ← API activity log
        ├── sync_status                   ← Sync health tracking
        └── alerts                        ← Alert history (future use)
```

---

## 🔧 Step-by-Step Setup Instructions

### STEP 1: Create the API Folder Structure

1. **Open Windows File Explorer**
2. **Navigate to:** `C:\xampp\htdocs\`
3. **Create folder:** `scada-api`
4. **Inside `scada-api`, create folder:** `api`

Your structure should now look like:
```
C:\xampp\htdocs\
└── scada-api\
    └── api\
```

---

### STEP 2: Copy PHP Files

Copy these files from the Emergent platform to your local folders:

| Source File (Emergent) | Destination (Your PC) |
|------------------------|----------------------|
| `/app/local_setup/api/config.php` | `C:\xampp\htdocs\scada-api\api\config.php` |
| `/app/local_setup/api/test.php` | `C:\xampp\htdocs\scada-api\api\test.php` |
| `/app/local_setup/api/auth.php` | `C:\xampp\htdocs\scada-api\api\auth.php` |
| `/app/local_setup/api/receive_data.php` | `C:\xampp\htdocs\scada-api\api\receive_data.php` |
| `/app/local_setup/api/dashboard.php` | `C:\xampp\htdocs\scada-api\api\dashboard.php` |
| `/app/local_setup/api/trends.php` | `C:\xampp\htdocs\scada-api\api\trends.php` |
| `/app/local_setup/api/sync_status.php` | `C:\xampp\htdocs\scada-api\api\sync_status.php` |

**How to copy files from Emergent:**
1. Click on each file in the Emergent platform
2. Select all content (Ctrl+A)
3. Copy (Ctrl+C)
4. Create a new file in Notepad on your PC
5. Paste (Ctrl+V)
6. Save with the correct filename

---

### STEP 3: Create .htaccess File

Create a new file: `C:\xampp\htdocs\scada-api\.htaccess`

Add this content:
```apache
# Enable CORS
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "GET, POST, OPTIONS"
Header set Access-Control-Allow-Headers "Content-Type, Authorization"

# Security
Options -Indexes
<FilesMatch "\.(htaccess|htpasswd|ini|log|sh|sql)$">
    Order Allow,Deny
    Deny from all
</FilesMatch>
```

---

### STEP 4: Set Up MySQL Database

1. **Start XAMPP** (Apache + MySQL)
2. **Open phpMyAdmin:** http://localhost/phpmyadmin
3. **Create Database:**
   - Click "New" in left sidebar
   - Database name: `scada_db`
   - Collation: `utf8mb4_unicode_ci`
   - Click "Create"

4. **Create Tables:**
   - Click on `scada_db` in left sidebar
   - Click "SQL" tab at top
   - Copy ALL content from `/app/local_setup/schema_local.sql`
   - Paste into SQL box
   - Click "Go"

5. **Verify Tables Created:**
   - You should see 5 tables: `scada_readings`, `users`, `api_logs`, `sync_status`, `alerts`
   - Click on `users` - should see 2 users (HEAD_OFFICE and MNRE)
   - Click on `scada_readings` - should see 5 sample data rows

---

## 📂 Final Folder Structure After Setup

```
C:\xampp\htdocs\scada-api\
│
├── .htaccess                    [CREATED IN STEP 3]
│
└── api\
    ├── config.php               ← Database connection + API key
    │   └── Contains:
    │       • DB_HOST: localhost
    │       • DB_NAME: scada_db
    │       • DB_USER: root
    │       • DB_PASS: (empty for XAMPP)
    │       • API_KEY: sk_test_local_development_key_123
    │
    ├── test.php                 ← Test if API is working
    │   └── URL: http://localhost/scada-api/api/test.php
    │   └── Returns: {"status":"success","database":"connected"}
    │
    ├── auth.php                 ← User login
    │   └── Method: POST
    │   └── Body: {"email":"it@lrenergy.in","password":"qwerty"}
    │   └── Returns: {"status":"success","user":{...},"token":"..."}
    │
    ├── receive_data.php         ← Receive data from sync script
    │   └── Method: POST
    │   └── Body: {"api_key":"sk_test_...","timestamp":"...","raw_biogas_flow":1250.5,...}
    │   └── Returns: {"status":"success","id":123}
    │
    ├── dashboard.php            ← Get latest data for dashboard
    │   └── Method: GET
    │   └── URL: http://localhost/scada-api/api/dashboard.php
    │   └── Returns: {"status":"success","latest":{...},"averages":{...}}
    │
    ├── trends.php               ← Get historical data for charts
    │   └── Method: GET
    │   └── URL: http://localhost/scada-api/api/trends.php?hours=24
    │   └── Returns: {"status":"success","data":[...]}
    │
    └── sync_status.php          ← Check sync health
        └── Method: GET
        └── URL: http://localhost/scada-api/api/sync_status.php
        └── Returns: {"status":"success","last_sync":"...","is_healthy":true}
```

---

## 🧪 Testing URLs (After Setup Complete)

| Test | URL | Expected Result |
|------|-----|-----------------|
| 1. Test API Connection | http://localhost/scada-api/api/test.php | `{"status":"success","database":"connected"}` |
| 2. Test Dashboard Data | http://localhost/scada-api/api/dashboard.php | JSON with latest readings |
| 3. Test Trends Data | http://localhost/scada-api/api/trends.php?hours=24 | JSON with historical data |
| 4. Test Sync Status | http://localhost/scada-api/api/sync_status.php | JSON with sync health |

For POST requests (auth, receive_data), use Postman.

---

## 📋 Files List with Descriptions

### PHP API Files

| File | Purpose | Method | Authentication |
|------|---------|--------|----------------|
| `config.php` | Database connection, helper functions | N/A (included by other files) | N/A |
| `test.php` | Health check - verify API is working | GET | None |
| `auth.php` | User login authentication | POST | Email + Password |
| `receive_data.php` | Receive SCADA data from sync script | POST | API Key |
| `dashboard.php` | Return latest data + averages | GET | Optional Token |
| `trends.php` | Return historical data for charts | GET | Optional Token |
| `sync_status.php` | Return sync health information | GET | Optional Token |

### Database Tables

| Table | Purpose | Columns |
|-------|---------|---------|
| `scada_readings` | Store all SCADA data | 36+ columns (one per tag + metadata) |
| `users` | Store user accounts | id, email, password, role, name |
| `api_logs` | Log all API requests | endpoint, method, ip, response_code |
| `sync_status` | Track sync script health | plant_id, last_sync_time, status |
| `alerts` | Store alert history | parameter, value, severity, status |

---

## 🔑 Important Values to Remember

| Item | Value | Notes |
|------|-------|-------|
| **Local API Base URL** | `http://localhost/scada-api/api/` | For testing with Postman |
| **Test API Key** | `sk_test_local_development_key_123` | Use in receive_data.php requests |
| **HEAD_OFFICE Login** | `it@lrenergy.in` / `qwerty` | Full access |
| **MNRE Login** | `it1@lrenergy.in` / `qwerty` | Restricted access |
| **Database Name** | `scada_db` | Created in phpMyAdmin |
| **Database User** | `root` | XAMPP default |
| **Database Password** | (empty) | XAMPP default has no password |

---

## ❓ Troubleshooting

### "Object not found" or 404 Error
- Check if folder name is exactly `scada-api` (case sensitive)
- Check if files are in `api` subfolder
- Verify Apache is running in XAMPP

### "Access denied" Database Error
- Check if MySQL is running in XAMPP
- Verify database name is `scada_db`
- Check config.php has correct credentials

### "Class PDO not found" Error
- Enable PDO extension in php.ini
- Restart Apache after changes

### Test.php shows "database: failed"
- Check if database `scada_db` exists
- Check if MySQL is running
- Verify password is empty (XAMPP default)

---

## 🎯 Next Step After Local Testing Works

Once all tests pass locally:
1. Get GoDaddy MySQL credentials
2. Update `config.php` with GoDaddy credentials
3. Upload files to GoDaddy
4. Test on live server
5. Deploy React frontend
6. Set up sync script at plant

---

*Document created for LR Energy / Elan Energies SCADA Project*
