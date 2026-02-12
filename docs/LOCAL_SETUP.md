# Local Development Setup Guide

## For XAMPP (Windows)

### Step 1: Create Folder Structure
```
C:\xampp\htdocs\scada-api\
├── config.php
├── test.php
├── auth.php
├── receive_data.php
├── dashboard.php
├── trends.php
├── sync_status.php
└── schema.sql
```

### Step 2: Copy Files
Copy all files from `/app/php-api/` to `C:\xampp\htdocs\scada-api\`

### Step 3: Create Database
1. Open phpMyAdmin: http://localhost/phpmyadmin
2. Create new database: `scada_db`
3. Select `scada_db` → SQL tab
4. Copy contents of `schema.sql` and execute

### Step 4: Test API
Open: http://localhost/scada-api/test.php

Expected response:
```json
{
    "status": "success",
    "database": "connected"
}
```

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| HEAD_OFFICE | it@lrenergy.in | qwerty |
| MNRE | it1@lrenergy.in | qwerty |

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /test.php | GET | Health check |
| /auth.php | POST | User login |
| /receive_data.php | POST | Receive SCADA data |
| /dashboard.php | GET | Get latest data |
| /trends.php | GET | Get historical data |
| /sync_status.php | GET | Get sync status |
