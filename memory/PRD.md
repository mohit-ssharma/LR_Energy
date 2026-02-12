# LR Energy SCADA Monitoring System - Product Requirements Document

## Original Problem Statement
Build a web-based SCADA (Supervisory Control and Data Acquisition) monitoring system for LR Energy Biogas Plants with role-based access control.

## Application Overview
- **Single application** with role-based access control
- **Two user roles**: HEAD_OFFICE and MNRE
- **Production-grade system** for real-time SCADA monitoring
- **Deployment Target**: GoDaddy Hosting with PHP Backend + MySQL Database

---

## What's Been Implemented

### Phase 1: Frontend UI (Completed - Jan 2026)
- ✅ Login Page with dual branding (LR Energy + Elan Energies)
- ✅ Dashboard List Page (Karnal: Active, Sonipat: Work in Progress)
- ✅ Main SCADA Dashboard with all components
- ✅ Trends Page with all parameters
- ✅ Advanced Reports Page

### Phase 2: Role-Based Access Control (Completed - Feb 3, 2026)
- ✅ Authentication system with specific credentials
- ✅ Two roles: HEAD_OFFICE and MNRE
- ✅ Role-based routing and access control
- ✅ MNRE Dashboard (restricted to 4 parameters)
- ✅ MNRE Trends Page (filtered view)

### Phase 3: UI & Data Updates (Completed - Feb 6, 2026)
- ✅ **Login Page**: "Designed by Elan Energies", credentials text removed
- ✅ **Dashboard List**: Updated plant names (LR Energy Karnal Pvt. Ltd., LR Energy Vrindavan Pvt. Ltd.)
- ✅ **Footer**: "Designed by Elan Energies" on all pages, support email removed
- ✅ **KPI Summary**: 6 parameters with actual values (Raw Biogas 1250, Purified 1180, Product 1150, CH₄ 96.8%, CO₂ 2.9%, H₂S 180 ppm)
- ✅ **Gas Composition**: Status logic implemented (CH₄ ≥96% = Accepted)
- ✅ **Dew Point**: -68 mg/m³, status rules implemented
- ✅ **Digesters**: Updated values, Balloon Air Level removed, Slurry Height UI updated
- ✅ **Tank Levels**: Buffer 82% (Warning), Lagoon 76% (Warning)
- ✅ **Water Flow**: Capacity Utilization removed
- ✅ **Trends**: CO₂ & H₂S added, split charts, click to maximize, statistics (12Hr, 24Hr Avg, Min, Max)
- ✅ **Reports**: Total Production (27,600 Nm³) added to Quick Stats
- ✅ **Equipment Status**: PSA, LT Panel, Compressor sections added

### Phase 4: Comprehensive UI Verification (Completed - Feb 8, 2026)
- ✅ Full UI verification test completed with 100% pass rate
- ✅ All test cases passed including positive, negative, and edge cases
- ✅ Login validation working correctly
- ✅ RBAC functioning properly
- ✅ All dashboard components rendering correctly
- ✅ PDF/CSV download functionality verified
- ✅ Session management working

### Phase 5: Data Quality Transparency (Completed - Feb 8, 2026)
- ✅ **KPI Cards**: Now show sample counts (e.g., "1380/1440 samples (96%)")
- ✅ **Trends Statistics**: Each parameter shows 12-Hr and 24-Hr sample counts with coverage %
- ✅ **Reports Preview**: Data Quality Summary section showing coverage, expected/received/missing records, and data gaps
- ✅ **MNRE Dashboard**: Shows only Totalizer (no sample counts per user request)
- ✅ Color-coded coverage indicators:
  - Green (✓): ≥95% coverage
  - Normal: 80-94% coverage
  - Yellow (⚠️ Partial data): 50-79% coverage
  - Orange (⚠️ Low coverage): <50% coverage

### Phase 6: Advanced UI Features (Completed - Feb 9, 2026)
- ✅ **MNRE Trends Split Charts**: Charts now split by category (Gas Flow, Gas Composition) like Head Office
- ✅ **Performance Comparison Section** (Head Office only):
  - Today vs Yesterday / This Week vs Last Week / This Month vs Last Month
  - Summary cards (Improved, Stable, Warning, Declined)
  - Comparison cards for all parameters (Gas Production, Gas Composition, Equipment & Storage)
  - Trend overlay charts comparing current vs previous period
  - Key Insights section with automatic analysis
  - Full Comparison Modal with detailed table and export options
  - Collapsible section at bottom of dashboard

### Phase 7: PHP Backend Integration (Completed - Feb 12, 2026)
- ✅ **PHP REST API Backend** (`/app/php-api/`):
  - `config.php`: Database configuration
  - `auth.php`: Authentication endpoint
  - `dashboard.php`: Current values, averages, equipment status
  - `trends.php`: Historical data for charts
  - `comparison.php`: Today vs Yesterday analysis
  - `receive_data.php`: Data ingestion from SCADA
  - `sync_status.php`: Sync status monitoring
  - `schema.sql`: Complete MySQL schema
- ✅ **Frontend API Integration** (`/app/frontend/src/services/api.js`):
  - Central API service module
  - All components integrated with backend endpoints
- ✅ **Consistent Connection Handling** (All components):
  - `KPISummary.js`: DEMO/OFFLINE/LIVE badges, warning banners, retry buttons
  - `EquipmentStatus.js`: Connection status indicators
  - `ComparisonView.js`: Connection handling with period selection
  - `TrendsPage.js`: Connection handling with full chart functionality
  - `MNREDashboard.js`: Full backend integration with connection handling
- ✅ **Robust Error Handling**:
  - Shows last known data when connection is lost (not mock)
  - DEMO mode for initial load without API
  - OFFLINE mode when API connection lost during session
  - Auto-refresh every 60 seconds

---

## User Roles & Access

### HEAD_OFFICE
- **Username**: it@lrenergy.in
- **Password**: qwerty
- **Access**: ALL dashboards and ALL trends
- **Features**:
  - Dashboard selection (Karnal/Vrindavan)
  - Full SCADA dashboard with all 22 parameters
  - Full Trends with all parameter categories
  - Reports page with PDF/CSV downloads

### MNRE
- **Username**: it1@lrenergy.in
- **Password**: qwerty
- **Access**: ONLY MNRE dashboard and related trends
- **Visible Parameters**:
  1. Raw Bio Gas Flow
  2. Purified Gas Flow
  3. Product Gas Flow
  4. Gas Composition (CH₄, CO₂, O₂, H₂S)
- **Restrictions**:
  - No access to Head Office dashboards
  - No Reports page
  - No Digester, Tank Levels, or Water Flow data

---

## Technical Architecture (Production)

### Deployment Architecture
```
┌─────────────────────────────────────┐      ┌─────────────────────────────────┐
│         KARNAL PLANT (Local)        │      │      GoDaddy HOSTING            │
│                                     │      │                                 │
│  ┌─────────────┐    ┌────────────┐  │      │  ┌─────────┐    ┌───────────┐  │
│  │ SCADA/PLC   │───►│ SQL Server │  │      │  │  MySQL  │◄───│  PHP API  │  │
│  │             │    │ (1 min)    │  │      │  │         │    │           │  │
│  └─────────────┘    └─────┬──────┘  │      │  └────▲────┘    └─────┬─────┘  │
│                           │         │      │       │               │        │
│                    ┌──────▼──────┐  │      │       │               ▼        │
│                    │ Data Sync   │──╬──────╬───────┘         ┌──────────┐   │
│                    │ Script      │  │ HTTPS│                 │ React UI │   │
│                    └─────────────┘  │      │                 └──────────┘   │
│                                     │      │                                 │
└─────────────────────────────────────┘      └─────────────────────────────────┘
        Your Network                              karnal.lrenergy.in
```

### Frontend Structure
```
/app/frontend/src/
├── context/
│   └── AuthContext.js          # Authentication & role management
├── utils/
│   └── pdfUtils.js             # PDF/CSV generation utilities
├── components/
│   ├── LoginPage.js            # Login (Designed by Elan Energies)
│   ├── DashboardListPage.js    # Plant selection
│   ├── Header.js               # Head Office navigation
│   ├── Footer.js               # Consistent footer
│   ├── KPISummary.js           # 6 KPI cards
│   ├── GasComposition.js       # Gas composition with status
│   ├── DewPointMeter.js        # Dew point meter
│   ├── Digester.js             # Digesters 1 & 2
│   ├── TankLevels.js           # Tank level monitoring
│   ├── WaterFlowMeters.js      # Water flow meters
│   ├── EquipmentStatus.js      # PSA, LT Panel, Compressor
│   ├── TrendsPage.js           # Full trends with stats
│   ├── ReportsPage.js          # Reports with downloads
│   ├── PreviewModal.js         # Report preview
│   ├── MNREDashboard.js        # MNRE restricted dashboard
│   ├── MNRETrendsPage.js       # MNRE filtered trends
│   └── MNREHeader.js           # MNRE navigation
└── App.js                      # Main app with role-based routing
```

### Backend Structure (PHP - To Be Built)
```
/public_html/
├── index.html                  # React build
├── /static                     # JS, CSS, images
└── /api
    ├── config.php              # DB connection, constants
    ├── auth.php                # Login/logout
    ├── dashboard.php           # Latest data + calculations
    ├── trends.php              # Historical data + stats
    ├── reports.php             # Report generation
    └── receive_data.php        # Data ingestion from SCADA
```

---

## Database Schema

### Main Table: scada_readings (22 fields)
See `/app/updated_field_structure.md` for complete schema.

**Key Fields:**
- Gas Flow: raw_biogas_flow, purified_gas_flow, product_gas_flow
- Gas Composition: ch4_concentration, co2_level, o2_concentration, h2s_content, dew_point
- Digesters: d1_temperature, d1_balloon_gas_pressure, d1_balloon_air_pressure, d1_slurry_height (same for D2)
- Tanks: buffer_tank_level, lagoon_tank_level
- Water Flow: feed_fm1, feed_fm2, fresh_water_fm, recycle_water_fm

### Storage Requirements
| Duration | Storage |
|----------|---------|
| 1 Year | ~176 MB |
| 2 Years | ~352 MB |
| **Recommended** | **500 MB** |

---

## Prioritized Backlog

### P0 - Critical (Completed)
1. ✅ **PHP Backend Development**
   - Database connection to MySQL
   - API endpoints (dashboard, trends, reports, auth, comparison)
   - Data calculations (averages, totalizers, PSA running hours, efficiency)
2. ✅ **Frontend-Backend Integration**
   - All components connected to PHP API
   - Consistent connection handling across all pages
3. ✅ **Auto-refresh Implementation**
   - Frontend polling every 60 seconds
   - Connection status monitoring

### P1 - High Priority (Next)
1. ☐ **Python Sync Script** - BLOCKED waiting for Siemens SCADA details
   - WinCC version and data access method (OPC UA, direct SQL, etc.)
   - Complete list of 37 tag addresses from PLC
2. ☐ **GoDaddy Deployment Guide**
   - Upload PHP API files
   - Build and upload React production build
   - MySQL database setup
3. ☐ Testing with real SCADA data

### P2 - Medium Priority
1. ☐ Sonipat Plant dashboard activation
2. ☐ Real-time Alert System (bell icon, alert panel, banner)
3. ☐ Alert History Page/Log
4. ☐ Performance optimization (daily_summary tables)

### P3 - Future
1. ☐ Print-Friendly Dashboard feature
2. ☐ Dark Mode
3. ☐ Data Loss Recovery Strategy
4. ☐ Mobile responsive improvements
5. ☐ Email notifications for critical alerts

---

## BLOCKERS FOR BACKEND

**Required credentials before proceeding:**
1. **GoDaddy MySQL Database:**
   - Host
   - Database name
   - Username
   - Password

2. **On-premise SCADA SQL Server (for sync script):**
   - IP Address
   - Database name
   - Table name
   - Column mappings

---

## Testing Status

### Comprehensive UI Verification (Feb 8, 2026)
| Category | Status | Tests |
|----------|--------|-------|
| Login Page | ✅ PASS | Empty validation, Invalid credentials, Valid login |
| Dashboard List | ✅ PASS | 3 cards, Plant names, Navigation |
| Head Office Dashboard | ✅ PASS | KPIs, Gas Composition, Digesters, Tanks, Equipment |
| MNRE Dashboard | ✅ PASS | 3 KPIs only, No gas composition, Totalizer (24 Hr) |
| Trends Page | ✅ PASS | All categories, Statistics, Downloads |
| MNRE Trends | ✅ PASS | 2 categories, No statistics |
| Reports Page | ✅ PASS | Templates, Date ranges, PDF/CSV downloads |
| RBAC | ✅ PASS | Role restrictions working |
| Navigation | ✅ PASS | All navigation working |
| Session | ✅ PASS | Persistence working |

### Connection Handling Verification (Feb 12, 2026)
| Component | Status | Tests |
|-----------|--------|-------|
| KPISummary Connection | ✅ PASS | DEMO/OFFLINE badges, warning banners, retry buttons |
| EquipmentStatus Connection | ✅ PASS | DEMO badge, warning banner, refresh button |
| ComparisonView Connection | ✅ PASS | DEMO badge, warning banner, period selector |
| TrendsPage Connection | ✅ PASS | DEMO/OFFLINE/LIVE badges, retry button, charts render |
| MNREDashboard Integration | ✅ PASS | Full API integration, 3 KPIs only, connection handling |
| Retry/Refresh Functions | ✅ PASS | All buttons trigger data fetch |
| Dashboard Navigation | ✅ PASS | Both user roles navigate correctly |

**Test Reports:** 
- `/app/test_reports/iteration_1.json` (UI Verification)
- `/app/test_reports/iteration_2.json` (Connection Handling)

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `/app/frontend/src/context/AuthContext.js` | Authentication and role management |
| `/app/frontend/src/App.js` | Main routing and role-based access |
| `/app/frontend/src/components/*.js` | All UI components |
| `/app/updated_field_structure.md` | **Complete field structure with values, limits, calculations** |
| `/app/scada_dashboard_data.md` | All dashboard data reference |
| `/app/scada_production_considerations.md` | Production edge cases |
| `/app/memory/PRD.md` | This document |
| `/app/test_reports/iteration_1.json` | UI verification test results |

---

## Document History
- **Jan 2026**: Initial frontend implementation
- **Feb 3, 2026**: Role-based access control implemented
- **Feb 6, 2026**: UI updates (branding, values, limits), Field structure document created
- **Feb 8, 2026**: Comprehensive UI verification completed - 100% pass rate
- **Feb 12, 2026**: PHP Backend integration completed, consistent connection handling implemented across all components
