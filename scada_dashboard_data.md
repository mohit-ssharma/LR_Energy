# SCADA Dashboard - Complete Data Reference
## All Attributes with Values, Limits & Thresholds

---

## 1. HEAD OFFICE DASHBOARD

### 1.1 KPI Summary (6 Parameters)

| # | Parameter | Current Value | Unit | Avg 1 Hr | Avg 12 Hr | Totalizer (24 Hr) | Min Limit | Max Limit |
|---|-----------|---------------|------|----------|-----------|-------------------|-----------|-----------|
| 1 | Raw Biogas Flow | 1250 | Nm³/hr | 1250 | 1245 | - | 0 | 2000 |
| 2 | Purified Gas Flow | 1180 | Nm³/hr | 1180 | 1175 | - | 0 | 1800 |
| 3 | Product Gas Flow | 1150 | Nm³/hr | - | - | 27,600 Nm³ | 0 | 1500 |
| 4 | CH₄ | 96.8 | % | 96.8 | 96.5 | - | 90 | 100 |
| 5 | CO₂ | 2.9 | % | 2.9 | 3.1 | - | 0 | 10 |
| 6 | H₂S | 180 | ppm | 180 | 190 | - | 0 | 500 |

---

### 1.2 Gas Composition Section (4 Parameters)

| # | Parameter | Current Value | Unit | Status | Status Logic |
|---|-----------|---------------|------|--------|--------------|
| 1 | CH₄ | 96.8 | % | Accepted | ≥96% = Accepted, <96% = Warning |
| 2 | CO₂ | 2.9 | % | Normal | <5% = Normal, ≥5% = Warning |
| 3 | O₂ | 0.3 | % | Normal | <0.5% = Normal, ≥0.5% = Warning |
| 4 | H₂S | 180 | ppm | Normal | <200 = Normal, 200-300 = Warning, >300 = Critical |

---

### 1.3 Dew Point Meter (1 Parameter)

| Parameter | Current Value | Unit | Status | Min | Max |
|-----------|---------------|------|--------|-----|-----|
| Dew Point | -68 | mg/m³ | Within Limits | -80 | +25 |

**Status Logic:**
- < -65 mg/m³ → Within Limits
- -65 to -50 mg/m³ → Warning
- > -50 mg/m³ → Critical

---

### 1.4 Digester 1 (4 Parameters)

| # | Parameter | Current Value | Unit | Min | Max | Status |
|---|-----------|---------------|------|-----|-----|--------|
| 1 | Temperature | 37 | °C | 30 | 40 | Operational |
| 2 | Balloon Gas Pressure | 32 | - | 0 | 40 | Normal |
| 3 | Balloon Air Pressure | 18 | - | 0 | 25 | Normal |
| 4 | Slurry Height | 7.6 | m | 0 | 10 | Operational |

---

### 1.5 Digester 2 (4 Parameters)

| # | Parameter | Current Value | Unit | Min | Max | Status |
|---|-----------|---------------|------|-----|-----|--------|
| 1 | Temperature | 36.5 | °C | 30 | 40 | Operational |
| 2 | Balloon Gas Pressure | 30 | - | 0 | 40 | Normal |
| 3 | Balloon Air Pressure | 17 | - | 0 | 25 | Normal |
| 4 | Slurry Height | 7.3 | m | 0 | 10 | Operational |

---

### 1.6 Tank Level Monitoring (2 Parameters)

| # | Tank | Current Level | Volume | Capacity | Unit | Status | Status Logic |
|---|------|---------------|--------|----------|------|--------|--------------|
| 1 | Buffer Tank Slurry Level | 82 | 884 | 1078 | % / m³ | Warning | <70% = Normal, 70-90% = Warning, >90% = Critical |
| 2 | Lagoon Tank Water Level | 76 | - | - | % | Normal | <85% = Normal, ≥85% = Warning, >95% = Critical |

---

### 1.7 Water Flow Meters (4 Parameters)

| # | Parameter | Current Value | Unit | Min | Max | Status |
|---|-----------|---------------|------|-----|-----|--------|
| 1 | Feed FM-I | 42 | m³/hr | 0 | 100 | Online |
| 2 | Feed FM-II | 38 | m³/hr | 0 | 100 | Online |
| 3 | Fresh Water FM | 12 | m³/hr | 0 | 50 | Online |
| 4 | Recycle Water FM | 26 | m³/hr | 0 | 80 | Online |

**Calculated Totals:**
- Total Feed Flow = 42 + 38 = 80 m³/hr
- Total Water Flow = 42 + 38 + 12 + 26 = 118 m³/hr

---

## 2. MNRE DASHBOARD

### 2.1 Gas Flow Summary (3 Parameters)

| # | Parameter | Current Value | Unit | Totalizer (24 Hr) | Unit |
|---|-----------|---------------|------|-------------------|------|
| 1 | Raw Biogas Flow | 1250 | Nm³/hr | 30,000 | Nm³ |
| 2 | Purified Gas Flow | 1180 | Nm³/hr | 28,320 | Nm³ |
| 3 | Product Gas Flow | 1150 | Nm³/hr | 27,600 | Nm³ |

**Note:** MNRE Dashboard does NOT show:
- Gas Composition section
- "Change" attribute on KPI cards
- Selected Parameter Statistics on Trends page

---

## 3. TRENDS PAGE PARAMETERS

### 3.1 Head Office - All Parameters Available

| Category | Parameters |
|----------|------------|
| Gas Flow | Raw Biogas Flow, Purified Gas Flow, Product Gas Flow |
| Gas Composition | CH₄, CO₂, O₂, H₂S, Dew Point |
| Digester 1 | D1 Temperature, D1 Balloon Gas Pressure, D1 Balloon Air Pressure, D1 Slurry Height |
| Digester 2 | D2 Temperature, D2 Balloon Gas Pressure, D2 Balloon Air Pressure, D2 Slurry Height |
| Tank Levels | Buffer Tank Level, Lagoon Tank Level |
| Water Flow | Feed FM-I, Feed FM-II, Fresh Water FM, Recycle Water FM |

**Statistics Shown (Head Office):**
- 12-Hour Average
- 24-Hour Average
- Min (selected range)
- Max (selected range)

### 3.2 MNRE - Limited Parameters

| Category | Parameters |
|----------|------------|
| Gas Flow | Raw Biogas Flow, Purified Gas Flow, Product Gas Flow |
| Gas Composition | CH₄, CO₂, O₂, H₂S |

**Statistics Shown (MNRE):** NONE (removed as per requirement)

---

## 4. REPORTS PAGE - Quick Stats

| # | Metric | Value |
|---|--------|-------|
| 1 | Total Production (24Hr) | 27,600 Nm³ |
| 2 | Today's Production | 12,450 Nm³ |
| 3 | Avg CH₄ Content | 96.8% |
| 4 | System Efficiency | 92.9% |
| 5 | Uptime | 99.2% |

---

## 5. DATA STORAGE LOCATION

### Current Status: FRONTEND HARDCODED

| Component File | Data Stored |
|----------------|-------------|
| `/app/frontend/src/components/KPISummary.js` | KPI values (6 params) |
| `/app/frontend/src/components/GasComposition.js` | Gas composition (4 params) |
| `/app/frontend/src/components/DewPointMeter.js` | Dew point value & limits |
| `/app/frontend/src/components/Digester.js` | Digester 1 & 2 values |
| `/app/frontend/src/components/TankLevels.js` | Tank levels & capacity |
| `/app/frontend/src/components/WaterFlowMeters.js` | Water flow values |
| `/app/frontend/src/components/MNREDashboard.js` | MNRE gas flow values |
| `/app/frontend/src/components/TrendsPage.js` | Trends dummy data |
| `/app/frontend/src/components/ReportsPage.js` | Report quick stats |

### Future: MySQL Database

When backend is implemented, all data will be stored in:
- **Table:** `scada_readings`
- **Location:** GoDaddy MySQL
- **Refresh:** Every 1 minute from SCADA

---

## 6. VALIDATION RULES SUMMARY

### Status Thresholds

| Parameter | Normal/Accepted | Warning | Critical |
|-----------|----------------|---------|----------|
| CH₄ | ≥ 96% | 90-96% | < 90% |
| CO₂ | < 5% | 5-7% | > 7% |
| O₂ | < 0.5% | 0.5-1% | > 1% |
| H₂S | < 200 ppm | 200-300 ppm | > 300 ppm |
| Dew Point | < -65 mg/m³ | -65 to -50 | > -50 |
| Buffer Tank | < 70% | 70-90% | > 90% |
| Lagoon Tank | < 85% | ≥ 85% | > 95% |
| D1/D2 Temperature | 35-40°C | Outside range | - |
| D1/D2 Gas Pressure | < 40 | ≥ 40 | - |
| D1/D2 Air Pressure | < 25 | ≥ 25 | - |

---

## 7. CONSTANTS

| Constant | Value | Used In |
|----------|-------|---------|
| Buffer Tank Capacity | 1,078 m³ | Tank Levels |
| Slurry Tank Max Height | 10 m | Digesters |
| D1/D2 Max Temperature | 40°C | Digesters |
| D1/D2 Max Gas Pressure | 40 | Digesters |
| D1/D2 Max Air Pressure | 25 | Digesters |

---

**Document Version:** 1.0  
**Last Updated:** February 2026  
**Status:** All data currently hardcoded in frontend, awaiting backend implementation
