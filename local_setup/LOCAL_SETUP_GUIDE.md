# Local Development Setup Guide (XAMPP)

## Prerequisites
- XAMPP installed (with Apache + MySQL)
- Postman installed
- Text editor (VS Code recommended)

---

## Step 1: Start XAMPP Services

1. Open **XAMPP Control Panel**
2. Start **Apache** (click Start)
3. Start **MySQL** (click Start)
4. Both should show green "Running" status

---

## Step 2: Create Database in phpMyAdmin

### 2.1 Open phpMyAdmin
1. Open browser: `http://localhost/phpmyadmin`

### 2.2 Create Database
1. Click **"New"** in left sidebar
2. Database name: `scada_db`
3. Collation: `utf8mb4_unicode_ci`
4. Click **"Create"**

### 2.3 Create Tables
1. Click on `scada_db` in left sidebar
2. Click **"SQL"** tab at top
3. Copy-paste the SQL from `schema_local.sql` file
4. Click **"Go"**

---

## Step 3: Verify Database Setup

Run these queries in phpMyAdmin SQL tab:

```sql
-- Check tables exist
SHOW TABLES;

-- Should show:
-- scada_readings
-- users
-- api_logs
-- sync_status
-- alerts

-- Check sample data
SELECT * FROM scada_readings;

-- Check users
SELECT id, email, role FROM users;
```

---

## Step 4: Setup PHP API Files

### 4.1 Create Project Folder
```
C:\xampp\htdocs\scada-api\
├── api\
│   ├── config.php
│   ├── receive_data.php
│   ├── dashboard.php
│   ├── trends.php
│   ├── auth.php
│   └── test.php
└── .htaccess
```

### 4.2 Copy API Files
Copy all PHP files from this project's `/api` folder to:
`C:\xampp\htdocs\scada-api\api\`

---

## Step 5: Test API with Browser

### 5.1 Test Basic Connection
Open: `http://localhost/scada-api/api/test.php`

Should show:
```json
{
    "status": "success",
    "message": "API is working",
    "database": "connected",
    "timestamp": "2026-02-09 12:00:00"
}
```

---

## Step 6: Test API with Postman

### 6.1 Import Postman Collection
1. Open Postman
2. Click **Import**
3. Import the `SCADA_API.postman_collection.json` file

### 6.2 Test Endpoints

| Endpoint | Method | URL |
|----------|--------|-----|
| Test Connection | GET | `http://localhost/scada-api/api/test.php` |
| Receive Data | POST | `http://localhost/scada-api/api/receive_data.php` |
| Get Dashboard | GET | `http://localhost/scada-api/api/dashboard.php` |
| Get Trends | GET | `http://localhost/scada-api/api/trends.php?hours=24` |
| Login | POST | `http://localhost/scada-api/api/auth.php` |

---

## Step 7: Test Data Flow

### 7.1 Send Test Data (Simulating Sync Script)

In Postman, POST to `http://localhost/scada-api/api/receive_data.php`:

```json
{
    "api_key": "sk_test_local_development_key_123",
    "timestamp": "2026-02-09 12:00:00",
    "raw_biogas_flow": 1250.5,
    "raw_biogas_totalizer": 150000,
    "purified_gas_flow": 1180.2,
    "purified_gas_totalizer": 142000,
    "product_gas_flow": 1150.8,
    "product_gas_totalizer": 138000,
    "ch4_concentration": 96.8,
    "co2_level": 2.9,
    "o2_concentration": 0.3,
    "h2s_content": 180,
    "dew_point": -68,
    "d1_temp_bottom": 37,
    "d1_temp_top": 36.5,
    "d1_gas_pressure": 32,
    "d1_air_pressure": 18,
    "d1_slurry_height": 7.6,
    "d1_gas_level": 75,
    "d2_temp_bottom": 36.5,
    "d2_temp_top": 36,
    "d2_gas_pressure": 30,
    "d2_air_pressure": 17,
    "d2_slurry_height": 7.3,
    "d2_gas_level": 72,
    "buffer_tank_level": 82,
    "lagoon_tank_level": 76,
    "feed_fm1_flow": 42,
    "feed_fm1_totalizer": 5000,
    "feed_fm2_flow": 38,
    "feed_fm2_totalizer": 4500,
    "fresh_water_flow": 12,
    "fresh_water_totalizer": 1500,
    "recycle_water_flow": 26,
    "recycle_water_totalizer": 3000,
    "psa_efficiency": 94.4,
    "lt_panel_power": 245,
    "compressor_status": 1
}
```

### 7.2 Verify Data Saved

1. Check Postman response: `{"status": "success", "id": 2}`
2. Check phpMyAdmin: `SELECT * FROM scada_readings ORDER BY id DESC LIMIT 1`

### 7.3 Test Dashboard API

GET `http://localhost/scada-api/api/dashboard.php`

Should return latest data with calculations.

---

## Troubleshooting

### Apache won't start
- Check if port 80 is in use (Skype, IIS)
- Change Apache port in XAMPP config

### MySQL won't start
- Check if port 3306 is in use
- Another MySQL instance running?

### "Access denied" error
- Check database credentials in config.php
- Default XAMPP: user=root, password=(empty)

### 404 Not Found
- Check file path is correct
- Check Apache is running
- Check .htaccess configuration

---

## Next Steps

After local testing passes:
1. Update config.php with GoDaddy credentials
2. Upload PHP files to GoDaddy
3. Test on live server
4. Deploy sync script at plant
