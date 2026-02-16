# SCADA Monitoring System - Changelog

## [3.0.0] - February 16, 2026

### Added
- **Daily Production Table** in Trends Page
  - Shows Date, Raw Biogas Production (Nm³), Product Gas Production (Kg), Records
  - Available for both HEAD_OFFICE and MNRE users
  
- **SVG Bar Chart in PDF Reports**
  - PDF downloads now include a visual bar chart
  - Shows Daily Raw Biogas Flow trend
  
- **Flow Meter Only Simulator** (`/scada-api/flow_simulator.php`)
  - Tests partial data scenarios
  - Sends only flow meter values, all other fields NULL
  - Manual and auto modes available
  
- **Scenario 11 in auto_simulate.php**
  - "Flow Meter Only (Partial Data)" scenario
  - Tests dashboard behavior with partial data
  
- **Partial Data Support in receive_data.php**
  - API now accepts partial data submissions
  - Missing fields stored as NULL (no errors)
  - Handles empty strings, whitespace, invalid numbers gracefully
  
- **Recent Reports Storage**
  - Reports stored in localStorage
  - Filtered to show only last 7 days
  - Empty state with helpful message

### Changed
- **Product Gas Units**
  - Flow: Nm³/hr → **Kg/hr**
  - Totalizer: Nm³ → **Kg**
  - Updated in Dashboard, Trends, Reports
  
- **Reports API (reports.php)**
  - Added missing fields to daily_data:
    - `avg_purified_gas_flow`, `avg_product_gas_flow`
    - `avg_co2`, `avg_o2`, `avg_dew_point`
    - `avg_d1_temp`, `avg_d1_pressure`, `avg_d1_slurry`, `avg_d1_gas_level`
    - `avg_d2_temp`, `avg_d2_pressure`, `avg_d2_slurry`, `avg_d2_gas_level`
    - `avg_buffer_tank`, `avg_lagoon_tank`
    - `avg_lt_power`, `recycle_water`
    - `min_ch4`, `max_ch4`, `min_h2s`, `max_h2s`

### Fixed
- Report Preview showing wrong data (0.00 for Purified/Product Gas)
- Removed dummy data from Recent Reports section

### Documentation
- Updated PLC_DEVELOPER_QUICK_GUIDE.md (v3.0)
  - Added partial data support section
  - Updated Product Gas units
  - Added flow meter only example
- Updated PRD.md (v3.0)
  - Complete feature list
  - Unit specifications
  - Data handling documentation

---

## [2.0.0] - February 15, 2026

### Added
- Frontend deployment to GoDaddy
- Production database setup
- Float precision fix for API responses
- H₂S data type correction (DECIMAL → INT)
- CORS configuration

### Fixed
- Database connection issues
- API key handling in receive_data.php (URL parameter support)
- Security: Removed hardcoded password bypass

---

## [1.0.0] - February 2026

### Initial Release
- Dashboard with KPI Summary
- Trends Page with historical charts
- Reports Page with PDF/CSV export
- Comparison View (Today vs Yesterday)
- User Authentication (JWT)
- Role-based access (HEAD_OFFICE, MNRE)
- PLC data receiver endpoint
- Auto-refresh (30 seconds)
