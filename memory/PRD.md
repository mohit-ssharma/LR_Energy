# LR Energy SCADA Monitoring System - Product Requirements Document

## Original Problem Statement
Build a web-based SCADA (Supervisory Control and Data Acquisition) monitoring system for LR Energy Biogas Plants with role-based access control.

## Application Overview
- **Single application** with role-based access control
- **Two user roles**: HEAD_OFFICE and MNRE
- **Production-grade system** for real-time SCADA monitoring

---

## What's Been Implemented

### Phase 1: Frontend UI (Completed - Jan 2026)
- ✅ Login Page with dual branding (LR Energy + ELAN EPMC)
- ✅ Dashboard List Page (Karnal: Active, Sonipat: Work in Progress)
- ✅ Main SCADA Dashboard with all components:
  - KPI Summary (6 parameters)
  - Gas Composition
  - Dew Point Meter
  - Digesters (1 & 2)
  - Tank Levels
  - Water Flow Meters
- ✅ Trends Page with all parameters
- ✅ Advanced Reports Page

### Phase 2: Role-Based Access Control (Completed - Feb 3, 2026)
- ✅ Authentication system with specific credentials
- ✅ Two roles: HEAD_OFFICE and MNRE
- ✅ Role-based routing and access control
- ✅ MNRE Dashboard (restricted to 4 parameters)
- ✅ MNRE Trends Page (filtered view)

---

## User Roles & Access

### HEAD_OFFICE
- **Username**: it@lrenergy.in
- **Password**: qwerty
- **Access**: ALL dashboards and ALL trends
- **Features**:
  - Dashboard selection (Karnal/Sonipat)
  - Full SCADA dashboard with all 35 parameters
  - Full Trends with all parameter categories
  - Reports page

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

## Technical Architecture

### Frontend Structure
```
/app/frontend/src/
├── context/
│   └── AuthContext.js          # Authentication & role management
├── components/
│   ├── LoginPage.js            # Login with real auth
│   ├── DashboardListPage.js    # Plant selection (Karnal/Sonipat)
│   ├── Header.js               # Head Office navigation
│   ├── Footer.js               # Application footer
│   ├── KPISummary.js           # KPI cards (Head Office)
│   ├── GasComposition.js       # Gas composition (Head Office)
│   ├── DewPointMeter.js        # Dew point meter
│   ├── Digester.js             # Digesters 1 & 2
│   ├── TankLevels.js           # Tank level monitoring
│   ├── WaterFlowMeters.js      # Water flow meters
│   ├── TrendsPage.js           # Full trends (Head Office)
│   ├── ReportsPage.js          # Reports page
│   ├── MNREDashboard.js        # MNRE restricted dashboard
│   ├── MNRETrendsPage.js       # MNRE filtered trends
│   └── MNREHeader.js           # MNRE navigation
└── App.js                      # Main app with role-based routing
```

### Database Schema (Planned)
- **Table**: scada_readings
- **Fields**: 35 raw parameters + timestamp
- **Refresh**: Every 1 minute

---

## Prioritized Backlog

### P0 - Critical (Next)
1. Backend Implementation - MySQL/SQL Server connection
2. Real-time data fetching from database
3. API endpoints for dashboard data

### P1 - High Priority
1. Deployment to karnal.lrenergy.in
2. Data collection from SCADA/PLC system
3. Historical data storage and retrieval

### P2 - Medium Priority
1. Sonipat Plant dashboard
2. Alert/notification system
3. User management (add/remove users)

### P3 - Future
1. Mobile responsive improvements
2. PDF report generation
3. Email notifications

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `/app/frontend/src/context/AuthContext.js` | Authentication and role management |
| `/app/frontend/src/App.js` | Main routing and role-based access |
| `/app/frontend/src/components/MNREDashboard.js` | MNRE restricted view |
| `/app/frontend/src/components/MNRETrendsPage.js` | MNRE filtered trends |
| `/app/SCADA_Database_Fields.md` | Database schema documentation |
| `/app/SCADA_Database_Fields.csv` | Field list for Excel |

---

## Document History
- **Jan 2026**: Initial frontend implementation
- **Feb 3, 2026**: Role-based access control implemented
