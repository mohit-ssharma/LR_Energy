# LR Energy SCADA Monitoring System - Product Requirements Document

## Original Problem Statement
Build a web-based SCADA monitoring system for a biogas plant with:
- React frontend + PHP/MySQL backend (for GoDaddy hosting)
- Two user roles: HEAD_OFFICE (full access) and MNRE (restricted view)
- Real-time dashboard with auto-refresh every 60 seconds
- Data sync from Siemens SCADA system
- Historical trends, reports, alerts

## What's Been Implemented ✅

### Backend (PHP API)
- ✅ Authentication (login/logout with JWT)
- ✅ Dashboard API with data freshness status
- ✅ Trends API for historical data
- ✅ Comparison API (today vs yesterday)
- ✅ Reports API (PDF/CSV generation)
- ✅ Data receive API (for PLC POST)
- ✅ CORS handling (cors.php)
- ✅ Alert threshold system (22 parameters)
- ✅ Auto-populate: sync_status, api_logs, alerts tables
- ✅ Simulation scripts for testing

### Frontend (React)
- ✅ Login page with role-based access
- ✅ Dashboard with all KPIs
- ✅ Gas Composition display with status rules
- ✅ Dew Point meter with thresholds
- ✅ Digester 1 & 2 monitoring (temp, pressure, levels)
- ✅ Tank levels (Buffer, Lagoon) with status
- ✅ Equipment status (PSA, Compressor)
- ✅ Water flow meters
- ✅ Trends page with parameter selection
- ✅ Comparison view with PDF/CSV download
- ✅ MNRE restricted dashboard
- ✅ Auto-refresh every 60 seconds

### Documentation Created
- ✅ `/app/docs/GODADDY_DEPLOYMENT_GUIDE.md`
- ✅ `/app/docs/PLC_DATA_INTERFACE_SPECIFICATION.json`
- ✅ `/app/docs/TEST_CASES.md`
- ✅ `/app/docs/STATUS_DISPLAY_RULES.md`
- ✅ `/app/docs/THRESHOLD_VALUES_FOR_ENGINEER.txt`
- ✅ `/app/docs/COMPLETE_FIELD_REFERENCE_GUIDE.md`

### Testing Tools
- ✅ `/app/php-api/simulate.php` - Single reading test
- ✅ `/app/php-api/auto_simulate.php` - Continuous simulation
- ✅ `/app/php-api/hash.php` - Password hash generator

## Current Status

### Working ✅
- Frontend-Backend communication (CORS fixed)
- User login (HEAD_OFFICE & MNRE)
- Dashboard displaying data
- Trends page with all parameters
- All API endpoints

### Pending for Engineer
- Threshold values confirmation (THRESHOLD_VALUES_FOR_ENGINEER.txt)

### Pending for PLC Developer
- HTTP POST integration from Siemens SCADA
- PLC_DATA_INTERFACE_SPECIFICATION.json shared

## Login Credentials
- HEAD_OFFICE: `ho@lrenergy.in` / `qwerty@1234`
- MNRE: `mnre@lrenergy.in` / `qwerty@1234`

## API Key for PLC
```
X-API-Key: SCADA_LR_ENERGY_2026_SECURE_KEY
```

## Database Tables
- `users` - User accounts ✅ Populated
- `scada_readings` - SCADA data (from PLC)
- `alerts` - Auto-generated when thresholds exceeded
- `sync_status` - Auto-updated on each PLC POST
- `api_logs` - Auto-logged API requests

## Upcoming Tasks (P1)
1. Engineer confirms threshold values
2. PLC developer completes HTTP POST integration
3. GoDaddy deployment

## Future Tasks (P2)
- Real-time Alert notification UI (bell icon)
- Alert History page
- Dark mode
- Performance optimization (daily summary tables)

## Files Structure
```
/app/
├── frontend/          # React app
├── php-api/           # PHP backend
│   ├── cors.php       # CORS handler
│   ├── config.php     # DB config
│   ├── auth.php       # Login API
│   ├── dashboard.php  # Dashboard API
│   ├── trends.php     # Trends API
│   ├── comparison.php # Comparison API
│   ├── reports.php    # Reports API
│   ├── receive_data.php # PLC data receiver
│   ├── simulate.php   # Test simulation
│   ├── auto_simulate.php # Auto simulation
│   └── thresholds_config.php # Alert thresholds
├── docs/              # Documentation
└── memory/            # PRD
```

## Last Updated
February 15, 2026
