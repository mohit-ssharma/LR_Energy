# LR Energy SCADA Monitoring System - PRD

## Project Overview
Web-based SCADA (Supervisory Control and Data Acquisition) monitoring system for a biogas plant at Karnal, India.

## Tech Stack
- **Frontend:** React.js with Tailwind CSS, Shadcn/UI components
- **Backend:** PHP REST API
- **Database:** MySQL
- **Hosting:** GoDaddy Shared Hosting

## User Roles
| Role | Email | Access Level |
|------|-------|--------------|
| HEAD_OFFICE | ho@lrenergy.in | Full access, manual refresh, all features |
| MNRE | mnre@gov.in | Restricted view, auto-refresh only, no stats bar |

## Core Features Implemented ✅
- [x] User Authentication (JWT-based)
- [x] Real-time Dashboard with KPI Summary
- [x] Auto-refresh every 30 seconds
- [x] Gas Composition visualization
- [x] Digester monitoring (D1 & D2)
- [x] Equipment status (PSA, Compressor, LT Panel)
- [x] Trends page with historical data
- [x] Reports page with PDF/CSV export
- [x] Comparison view (Today vs Yesterday)
- [x] Role-based access control
- [x] PLC data receiver endpoint

## Production URLs
- **Website:** https://karnal.lrenergy.in
- **API Base:** https://karnal.lrenergy.in/scada-api/
- **PLC Endpoint:** https://karnal.lrenergy.in/scada-api/receive_data.php?api_key=LR_SCADA_2024_SECURE_KEY

## API Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| /auth.php | POST | User login |
| /dashboard.php | GET | Main dashboard data |
| /trends.php | GET | Historical trends |
| /reports.php | GET | Report generation |
| /comparison.php | GET | Data comparison |
| /receive_data.php | POST | PLC data ingestion |
| /auto_simulate.php | GET | Test data simulator |

## Database Schema
- **users:** User authentication
- **scada_readings:** All SCADA sensor data (37 fields)

## Deployment Status
- [x] Backend deployed to GoDaddy (/scada-api/)
- [x] Frontend deployed to GoDaddy (root /)
- [x] Database configured and running
- [x] CORS configured
- [x] .htaccess for React Router

## Pending Tasks
- [ ] PLC Integration (waiting for PLC developer)
- [ ] Alert thresholds confirmation from engineer
- [ ] Performance optimization (daily_summary table)
- [ ] Alert History Page
- [ ] Dark Mode theme

## Test Credentials
- **HEAD_OFFICE:** ho@lrenergy.in / qwerty@1234
- **MNRE:** mnre@gov.in / mnre@1234

## Key Documents
- /app/docs/PLC_INTEGRATION_GUIDE.md
- /app/docs/PLC_DATA_INTERFACE_SPECIFICATION.json
- /app/docs/FRONTEND_DEPLOYMENT_GUIDE.md
- /app/docs/PRODUCTION_SIMULATION_GUIDE.md

## Last Updated
February 16, 2026
