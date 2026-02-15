# Frontend Deployment Guide
## LR Energy SCADA - React Frontend Deployment on GoDaddy

---

## 📁 FINAL FOLDER STRUCTURE

After deployment, your server should look like this:

```
/ (karnal.lrenergy.in - Root)
│
├── 📁 scada-api/                    ← PHP Backend (Already Done ✅)
│   ├── config.php
│   ├── cors.php
│   ├── auth.php
│   ├── dashboard.php
│   ├── trends.php
│   ├── comparison.php
│   ├── reports.php
│   ├── receive_data.php
│   ├── simulate.php
│   ├── auto_simulate.php
│   └── thresholds_config.php
│
├── 📁 static/                       ← React Build Assets
│   ├── 📁 css/
│   │   ├── main.xxxxxxxx.css
│   │   └── main.xxxxxxxx.css.map
│   └── 📁 js/
│       ├── main.xxxxxxxx.js
│       ├── main.xxxxxxxx.js.map
│       └── xxx.chunk.js
│
├── index.html                       ← React App Entry Point
├── asset-manifest.json              ← Asset Manifest
├── favicon.ico                      ← Favicon
├── logo192.png                      ← PWA Logo
├── logo512.png                      ← PWA Logo
├── manifest.json                    ← PWA Manifest
└── robots.txt                       ← SEO Robots
```

---

## 📋 STEP-BY-STEP DEPLOYMENT

### STEP 1: Create `.env.production` File

Navigate to your local `frontend` folder and create/verify `.env.production`:

**File:** `frontend/.env.production`
```
REACT_APP_BACKEND_URL=https://karnal.lrenergy.in/scada-api
```

---

### STEP 2: Build React App

Open terminal/command prompt in the `frontend` folder:

**Windows (Command Prompt):**
```cmd
cd frontend
npm run build
```

**Windows (PowerShell):**
```powershell
cd frontend
npm run build
```

**Mac/Linux:**
```bash
cd frontend
npm run build
```

**Expected Output:**
```
Creating an optimized production build...
Compiled successfully.

File sizes after gzip:
  XXX kB  build/static/js/main.xxxxxxxx.js
  XX kB   build/static/css/main.xxxxxxxx.css

The build folder is ready to be deployed.
```

This creates a `build` folder inside `frontend`:
```
frontend/
└── build/
    ├── static/
    │   ├── css/
    │   └── js/
    ├── index.html
    ├── asset-manifest.json
    ├── favicon.ico
    └── ...
```

---

### STEP 3: Upload Build Files via FileZilla

1. **Connect to FTP:**
   ```
   Host: 119.18.49.27
   Username: karnal_lre_admin@karnal.lrenergy.in
   Password: @xABi]j4hOBd
   Port: 21
   ```

2. **Navigate in FileZilla:**
   - **Left side (Local):** Go to `frontend/build/`
   - **Right side (Remote):** Stay in root `/`

3. **Upload Files:**
   - Select ALL files and folders inside `build/`:
     - `static/` (folder)
     - `index.html`
     - `asset-manifest.json`
     - `favicon.ico`
     - `logo192.png`
     - `logo512.png`
     - `manifest.json`
     - `robots.txt`
   - Drag to right side (root folder)

4. **Confirm Overwrite:** Click "Overwrite" if files already exist

---

### STEP 4: Verify Deployment

Open browser and go to:
```
https://karnal.lrenergy.in
```

**Expected:** Login page should appear!

---

### STEP 5: Test Login

```
Email: ho@lrenergy.in
Password: qwerty@1234
```

---

## ⚠️ COMMON ISSUES & FIXES

### Issue 1: Blank White Page
**Cause:** Wrong `REACT_APP_BACKEND_URL` in `.env.production`
**Fix:** Verify URL is `https://karnal.lrenergy.in/scada-api` (no trailing slash)

### Issue 2: API Errors / CORS
**Cause:** Backend URL mismatch
**Fix:** Check `cors.php` allows your domain

### Issue 3: 404 on Page Refresh
**Cause:** React Router needs server config
**Fix:** Create `.htaccess` file in root:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

---

## 📋 DEPLOYMENT CHECKLIST

| Step | Task | Status |
|------|------|--------|
| 1 | Create `.env.production` with correct URL | ⬜ |
| 2 | Run `npm run build` | ⬜ |
| 3 | Connect FileZilla to server | ⬜ |
| 4 | Upload `static/` folder | ⬜ |
| 5 | Upload `index.html` | ⬜ |
| 6 | Upload other build files | ⬜ |
| 7 | Create `.htaccess` (if needed) | ⬜ |
| 8 | Test login page loads | ⬜ |
| 9 | Test login works | ⬜ |
| 10 | Test dashboard shows data | ⬜ |

---

**Document Version:** 1.0
**Last Updated:** February 2026
