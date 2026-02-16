# LR Energy SCADA Monitoring System - PRD

## Project Overview
Web-based SCADA (Supervisory Control and Data Acquisition) monitoring system for a biogas plant at Karnal, India.

**Document Version:** 3.1  
**Last Updated:** February 16, 2026

---

## Tech Stack
- **Frontend:** React.js with Tailwind CSS, Shadcn/UI components, Recharts
- **Backend:** PHP REST API
- **Database:** MySQL
- **Hosting:** GoDaddy Shared Hosting
- **PDF Generation:** html2pdf.js

---

## User Roles

| Role | Email | Access Level |
|------|-------|--------------|
| HEAD_OFFICE | ho@lrenergy.in | Full access, manual refresh, comparison view, all features |
| MNRE | mnre@gov.in | Restricted view, auto-refresh only, no stats bar, no comparison |

---

## Core Features Implemented ✅

### Dashboard
- [x] Real-time KPI Summary with 6 cards
- [x] Auto-refresh every 30 seconds
- [x] Manual refresh button (HEAD_OFFICE only)
- [x] Connection status indicator (LIVE/STALE/OFFLINE)
- [x] Gas Composition visualization
- [x] Digester monitoring (D1 & D2)
- [x] Equipment status (PSA, Compressor, LT Panel)
- [x] Graceful handling of NULL/missing data
- [x] **MNRE Dashboard Product Gas Flow unit: Kg/hr** (Fixed Feb 16)

### Trends Page
- [x] Historical data charts (24h, 7d, 30d)
- [x] Multiple parameters: Gas Flow, Gas Composition, Digester, Equipment
- [x] **Category Filter with checkboxes** (Updated Feb 16)
- [x] **Daily Production Section** with:
  - Today's Raw Biogas Production (Nm³) - Latest Totalizer Value
  - Today's Product Gas Production (Kg) - Latest Totalizer Value
  - **Daily Production Summary Table** (using latest totalizer values per day)
- [x] **Historic Daily Production Graph REMOVED** (Feb 16)
- [x] Statistics from real database data
- [x] Auto-refresh every 60 seconds
- [x] **Parameter Statistics section (HEAD_OFFICE only)** - Removed from MNRE (Feb 16)

### Reports Page
- [x] Report Types: Production, Quality, Performance, Custom
- [x] **Compliance Report REMOVED** (Feb 16)
- [x] Date Range: Today, Week, Month, Quarter, Year, Custom
- [x] Preview Modal with real API data
- [x] **Data Quality Summary REMOVED from Preview** (Feb 16)
- [x] **Max/Avg/Min Statistics REMOVED from Preview** (Feb 16)
- [x] **Daily Breakdown shows totalizer values** (Raw Gas, Purified Gas, Product Gas)
- [x] **Graph shows all metrics from daily breakdown** (Feb 16)
- [x] PDF Download with **SVG Bar Chart included**
- [x] CSV Download
- [x] **Recent Reports** stored in localStorage (last 7 days only)
- [x] Daily Production data in reports

### Comparison View (HEAD_OFFICE only)
- [x] Today vs Yesterday comparison
- [x] Gas Production metrics
- [x] Gas Composition metrics
- [x] Equipment metrics
- [x] Handles "No Today Data" scenario gracefully

### Authentication
- [x] JWT-based login
- [x] Role-based access control
- [x] Session management

### PLC Data Integration
- [x] `receive_data.php` endpoint for PLC HTTP POST
- [x] API key authentication via URL parameter
- [x] **Partial data support** (missing fields stored as NULL)
- [x] **Data validation** with graceful error handling
- [x] Corrupted/invalid data handling (stored as NULL, no errors)

---

## Unit Specifications

| Measurement | Unit | Notes |
|-------------|------|-------|
| Raw Biogas Flow | Nm³/hr | |
| Raw Biogas Totalizer | Nm³ | Cumulative |
| Purified Gas Flow | Nm³/hr | |
| Purified Gas Totalizer | Nm³ | Cumulative |
| **Product Gas Flow** | **Kg/hr** | Changed from Nm³/hr |
| **Product Gas Totalizer** | **Kg** | Changed from Nm³ |
| CH₄ Concentration | % | |
| CO₂ Level | % | |
| O₂ Concentration | % | |
| H₂S Content | ppm | Integer |
| Temperatures | °C | |
| Pressures | mbar | |
| Tank Levels | % | |
| Water Flows | m³/hr | |
| Power | kW | |

---

## Production URLs

- **Website:** https://karnal.lrenergy.in
- **API Base:** https://karnal.lrenergy.in/scada-api/
- **PLC Endpoint:** `POST /receive_data.php?api_key=SCADA_LR_ENERGY_2026_SECURE_KEY`

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /auth.php | POST | User login |
| /dashboard.php | GET | Main dashboard data |
| /trends.php | GET | Historical trends |
| /reports.php | GET | Report generation with full daily data |
| /comparison.php | GET | Today vs Yesterday comparison |
| /daily_production.php | GET | Daily production based on totalizers |
| /receive_data.php | POST | PLC data ingestion (supports partial data) |
| /auto_simulate.php | GET | Test data simulator (11 scenarios) |
| /flow_simulator.php | GET | Flow meter only simulator (partial data test) |

---

## Database Schema

### scada_readings
All SCADA sensor data (37 fields). All fields except `timestamp` and `plant_id` can be NULL.

### users
User authentication with bcrypt password hashing.

---

## Simulators

### auto_simulate.php (11 Scenarios)
1. ✅ Normal Operation
2. 📈 High Gas Production
3. 📉 Low Gas Production
4. ⚠️ Low CH₄
5. 🚨 High H₂S
6. ⚠️ High Temperature
7. 🚨 High Tank Level
8. ⚠️ Low PSA Efficiency
9. 🌙 Night Operation
10. 🏆 Peak Performance
11. **📊 Flow Meter Only (Partial Data)**

### flow_simulator.php
Dedicated simulator for testing partial data scenarios where only flow meters send data.

---

## Data Handling

### NULL/Missing Data Behavior
- Backend stores NULL for missing/invalid fields
- Frontend displays "0" or "--" for NULL values
- Calculations skip NULL values gracefully
- No errors thrown for partial data

### Supported Input Formats
- NULL: Stored as NULL
- Empty string "": Converted to NULL
- Whitespace "  ": Converted to NULL
- Invalid numeric: Converted to NULL
- Valid numeric: Stored as float

---

## Deployment Status

- [x] Backend deployed to GoDaddy (/scada-api/)
- [x] Frontend deployed to GoDaddy (root /)
- [x] Database configured and running
- [x] CORS configured
- [x] .htaccess for React Router

---

## Pending Tasks

### P1 - High Priority
- [ ] PLC Integration (waiting for PLC developer)
- [ ] Alert thresholds confirmation from engineer
- [ ] Production testing with real PLC data

### P2 - Medium Priority
- [ ] Performance optimization (daily_summary table)
- [ ] Alert History Page
- [ ] Dark Mode theme

### P3 - Low Priority
- [ ] Email notifications for alerts
- [ ] Export to Excel with multiple sheets

---

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| HEAD_OFFICE | ho@lrenergy.in | qwerty@1234 |
| MNRE | mnre@gov.in | mnre@1234 |

---

## Key Documents

| Document | Path | Purpose |
|----------|------|---------|
| PLC Developer Guide | /app/docs/PLC_DEVELOPER_QUICK_GUIDE.md | Complete API spec for PLC integration |
| PLC Integration Guide | /app/docs/PLC_INTEGRATION_GUIDE.md | Detailed technical integration guide |
| Frontend Deployment | /app/docs/FRONTEND_DEPLOYMENT_GUIDE.md | GoDaddy deployment steps |
| Production Simulation | /app/docs/PRODUCTION_SIMULATION_GUIDE.md | Testing in production |

---

## Recent Changes (February 2026)

### v3.0 Updates
1. **Product Gas Units**: Changed from Nm³/hr to Kg/hr, Nm³ to Kg
2. **Daily Production Table**: Added to Trends page showing date-wise production
3. **PDF Charts**: Added SVG bar chart to PDF report downloads
4. **Recent Reports**: Now stored in localStorage, shows only last 7 days
5. **Partial Data Support**: API handles missing/NULL fields gracefully
6. **Flow Simulator**: New simulator for testing partial data scenarios
7. **11th Scenario**: Added "Flow Meter Only" to auto_simulate.php
8. **Reports API**: Enhanced with all missing fields for Quality, Performance, Compliance reports

---

## Architecture Notes

### Frontend Data Flow
```
API Response → JSON Parse → null check (|| 0) → Display
```

### Totalizer Calculation
```
Daily Production = MAX(totalizer) - MIN(totalizer) for that day
```

### Report Data Structure
```
reports.php returns:
- summary: Aggregated stats
- daily_data: Array with all fields per day
  - Flow rates (avg)
  - Gas composition (avg, min, max)
  - Digester data (avg)
  - Tank levels (avg)
  - Equipment hours
  - Water totals
```

---

**Document Version:** 3.0  
**Last Updated:** February 2026
