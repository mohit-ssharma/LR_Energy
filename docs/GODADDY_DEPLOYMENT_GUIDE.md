# LR Energy SCADA - GoDaddy Deployment Guide

## Pre-Deployment Checklist

### ✅ Code Ready
| Item | Status | Notes |
|------|--------|-------|
| PHP Backend (8 files) | ✅ Ready | `/app/php-api/` |
| React Frontend | ✅ Ready | Needs `yarn build` |
| Database Schema | ✅ Ready | `/app/php-api/schema.sql` |
| API Security | ✅ Ready | API key, validation, duplicate protection |
| Database Indexes | ✅ Ready | UNIQUE on (plant_id, timestamp) |

---

## Step-by-Step Deployment

### Step 1: Prepare GoDaddy Hosting

1. **Login to GoDaddy cPanel**
2. **Create MySQL Database:**
   - Go to: Databases → MySQL Databases
   - Create database: `scada_db` (or your preferred name)
   - Create user with ALL PRIVILEGES
   - Note down: `database_name`, `username`, `password`

### Step 2: Run Database Schema

1. Go to: **phpMyAdmin**
2. Select your database
3. Click **SQL** tab
4. Copy-paste contents of `/app/php-api/schema.sql`
5. Click **Go**

**IMPORTANT:** After running schema, generate password hash:
```php
// Create file: generate_hash.php
<?php echo password_hash('qwerty@1234', PASSWORD_DEFAULT); ?>
```
Run it and copy the hash, then update users table:
```sql
UPDATE users SET password = '<YOUR_HASH>' WHERE email IN ('ho@lrenergy.in', 'mnre@lrenergy.in');
```

### Step 3: Upload PHP Backend

1. Go to: **File Manager** → `public_html`
2. Create folder: `api`
3. Upload ALL files from `/app/php-api/` to `public_html/api/`

**Files to upload:**
- config.php ⚠️ (UPDATE CREDENTIALS FIRST!)
- auth.php
- dashboard.php
- trends.php
- reports.php
- comparison.php
- receive_data.php
- sync_status.php
- test.php

### Step 4: Update config.php

Before uploading, edit `config.php` with your GoDaddy credentials:

```php
// PRODUCTION (GoDaddy) - UPDATE THESE!
define('DB_HOST', 'localhost');  // Usually localhost for GoDaddy
define('DB_NAME', 'your_cpanel_username_scada_db');  // Your database name
define('DB_USER', 'your_cpanel_username_dbuser');    // Your database user
define('DB_PASS', 'your_database_password');         // Your database password
```

### Step 5: Test PHP Backend

Open in browser:
```
https://karnal.lrenergy.in/api/test.php
```

Expected response:
```json
{
  "status": "success",
  "message": "API is working",
  "database": "connected"
}
```

### Step 6: Build React Frontend

On your local machine (after cloning from GitHub):

```bash
cd frontend

# Create production .env file
echo "REACT_APP_BACKEND_URL=https://karnal.lrenergy.in/api" > .env.production

# Build for production
yarn install
yarn build
```

### Step 7: Upload Frontend Build

1. The `yarn build` command creates a `/frontend/build/` folder
2. Upload ALL contents of `build/` folder to `public_html/`
   - Do NOT upload the `build` folder itself
   - Upload the files INSIDE it (index.html, static/, etc.)

**Final structure on GoDaddy:**
```
public_html/
├── index.html          (from build/)
├── static/             (from build/)
│   ├── css/
│   └── js/
├── api/                (PHP backend)
│   ├── config.php
│   ├── auth.php
│   ├── dashboard.php
│   └── ... (other PHP files)
```

### Step 8: Test Complete Application

1. Open: `https://karnal.lrenergy.in`
2. Login with:
   - **HO:** `ho@lrenergy.in` / `qwerty@1234`
   - **MNRE:** `mnre@lrenergy.in` / `qwerty@1234`

---

## Production Credentials

### Login Credentials
| Role | Email | Password |
|------|-------|----------|
| HEAD_OFFICE | ho@lrenergy.in | qwerty@1234 |
| MNRE | mnre@lrenergy.in | qwerty@1234 |

### API Key (for Sync Script)
```
sk_prod_LREnergy_283669e54e512351a5bde265e20da2149fd4b54569a7e12b1ee8226746a6a2a7
```

---

## Post-Deployment Verification

### Test Checklist
| Test | URL/Action | Expected |
|------|------------|----------|
| API Health | `/api/test.php` | JSON with "success" |
| Login HO | Login form | Dashboard selection page |
| Login MNRE | Login form | MNRE Dashboard directly |
| Dashboard Data | Open dashboard | Shows DEMO (until sync starts) |
| Trends Page | Click Trends | Charts render |
| Reports Page | Click Reports | Templates visible |

### Test API Endpoint (Postman/curl)
```bash
curl -X POST https://karnal.lrenergy.in/api/receive_data.php \
  -H "X-API-Key: sk_prod_LREnergy_283669e54e512351a5bde265e20da2149fd4b54569a7e12b1ee8226746a6a2a7" \
  -H "Content-Type: application/json" \
  -d '{"timestamp":"2026-02-14 10:30:00","plant_id":"KARNAL","raw_biogas_flow":1250.5}'
```

---

## Security Reminders

1. ⚠️ **Change API Key** in production config.php if desired
2. ⚠️ **Change user passwords** after first login
3. ⚠️ **Set file permissions:** PHP files should be 644, folders 755
4. ⚠️ **Enable SSL:** Ensure HTTPS is working
5. ⚠️ **Backup database** regularly

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Database connection failed" | Check credentials in config.php |
| "Invalid API key" | Check X-API-Key header matches config.php |
| Blank page | Check browser console for JS errors |
| CORS errors | API already has CORS headers enabled |
| 500 Error | Check PHP error logs in cPanel |

---

## Files Reference

| File | Purpose | Location |
|------|---------|----------|
| schema.sql | Database structure | Run in phpMyAdmin |
| config.php | DB credentials & API key | `/api/config.php` |
| PLC_DATA_INTERFACE_SPECIFICATION.json | For PLC developer | Share separately |

---

**Deployment Guide Version:** 1.0  
**Last Updated:** February 2026
