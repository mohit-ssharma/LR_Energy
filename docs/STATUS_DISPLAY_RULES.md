# SCADA Status Display Rules - COMPLETE REFERENCE
# =================================================
# 
# This file contains ALL the status rules and values you provided
# for displaying parameter status on the dashboard.
#
# These rules are ALREADY IMPLEMENTED in the frontend components.
# This file is for reference only.
#
# Last Updated: February 2026
# =================================================


## 1. GAS COMPOSITION STATUS RULES

### CH₄ (Methane)
| Condition | Status | Color |
|-----------|--------|-------|
| ≥ 96% | Accepted | Green |
| < 96% | Warning | Amber |

### CO₂ (Carbon Dioxide)
| Condition | Status | Color |
|-----------|--------|-------|
| < 5% | Normal | Green |
| ≥ 5% | Warning | Amber |

### O₂ (Oxygen)
| Condition | Status | Color |
|-----------|--------|-------|
| < 0.5% | Normal | Green |
| ≥ 0.5% | Warning | Amber |

### H₂S (Hydrogen Sulfide)
| Condition | Status | Color |
|-----------|--------|-------|
| < 5 ppm | Accepted | Green |
| ≥ 5 ppm | Critical | Red |

**Max Limit: 105 ppm**

**File:** `GasComposition.js` (Lines 17-31)


---


## 2. DEW POINT STATUS RULES

| Condition | Status | Color |
|-----------|--------|-------|
| < -65 mg/m³ | Within Limits | Green |
| -65 to -50 mg/m³ | Warning | Amber |
| > -50 mg/m³ | Critical | Red |

### Dew Point Reference Lines on Chart:
- **Warning Line:** -65 mg/m³ (Amber dashed)
- **Critical Line:** -50 mg/m³ (Red dashed)

### Default Value:
- Current: **-68 mg/m³**
- Range in trend: -70 to -63 mg/m³

**File:** `DewPointMeter.js` (Lines 18-25, 147-159)


---


## 3. TANK LEVELS STATUS RULES

| Level % | Status | Color |
|---------|--------|-------|
| < 70% | Normal | Green |
| 70% - 90% | Warning | Amber |
| > 90% | Critical | Red |

### Tank Default Values:

| Tank | Capacity | Current Level | Current Volume | Status |
|------|----------|---------------|----------------|--------|
| Buffer Tank | 1078 m³ | 82% | 884 m³ | Warning |
| Lagoon Tank | 1078 m³ | 76% | 819 m³ | Warning |

**File:** `TankLevels.js` (Lines 6-38)


---


## 4. DIGESTER VALUES (Default/Expected)

### Digester 1
| Parameter | Value | Unit |
|-----------|-------|------|
| Temperature Bottom | 37 | °C |
| Temperature Top | 36.5 | °C |
| Balloon Gas Pressure | 32 | mbar |
| Balloon Air Pressure | 18 | mbar |
| Slurry Height | 7.6 | m |
| Gas Level | 75 | % |

### Digester 2
| Parameter | Value | Unit |
|-----------|-------|------|
| Temperature Bottom | 36.5 | °C |
| Temperature Top | 36 | °C |
| Balloon Gas Pressure | 30 | mbar |
| Balloon Air Pressure | 17 | mbar |
| Slurry Height | 7.3 | m |
| Gas Level | 72 | % |

### Temperature Display Range:
- Min: 25°C
- Max: 45°C

### Pressure Display Range:
- Min: 0
- Max: 50 mbar

**File:** `Digester.js` (Lines 188-212)


---


## 5. GAS FLOW VALUES (Default/Expected)

| Parameter | Value | Unit |
|-----------|-------|------|
| Raw Biogas Flow | 1250 | Nm³/hr |
| Purified Gas Flow | 1180 | Nm³/hr |
| Product Gas Flow | 1150 | Nm³/hr |
| Raw Biogas Totalizer | 150000 | Nm³ |
| Purified Gas Totalizer | 142000 | Nm³ |
| Product Gas Totalizer | 138000 | Nm³ |

**File:** `KPISummary.js`


---


## 6. GAS COMPOSITION VALUES (Default/Expected)

| Parameter | Value | Unit |
|-----------|-------|------|
| CH₄ Concentration | 96.8 | % |
| CO₂ Level | 2.9 | % |
| O₂ Concentration | 0.3 | % |
| H₂S Content | 180 | ppm |
| Dew Point | -68 | mg/m³ |

**File:** `GasComposition.js`, `KPISummary.js`


---


## 7. EQUIPMENT STATUS RULES

### PSA / Compressor Status
| Value | Display | Color |
|-------|---------|-------|
| 1 | Running | Green |
| 0 | Stopped | Red |

### Equipment Default Values:
| Parameter | Value | Unit |
|-----------|-------|------|
| PSA Status | Running (1) | - |
| PSA Efficiency | 94.4 | % |
| Compressor Status | Running (1) | - |
| LT Panel Power | 245 | kW |

**File:** `EquipmentStatus.js`


---


## 8. DATA FRESHNESS STATUS

| Age of Data | Status | Color |
|-------------|--------|-------|
| ≤ 2 minutes | FRESH | Green |
| 2-5 minutes | DELAYED | Amber |
| > 5 minutes | STALE | Red |

**File:** `dashboard.php`, `KPISummary.js`


---


## 9. DATA QUALITY INDICATORS (Sample Coverage)

| Coverage % | Indicator | Color |
|------------|-----------|-------|
| ≥ 95% | ✓ (Good) | Green |
| 80-94% | (Normal) | Default |
| 50-79% | ⚠️ Partial data | Yellow |
| < 50% | ⚠️ Low coverage | Orange |


---


## 10. COMPARISON STATUS (Today vs Yesterday)

| Change % | Status | Color | Icon |
|----------|--------|-------|------|
| > +2% | Improved | Green | ↑ |
| -2% to +2% | Stable | Blue | → |
| -2% to -10% | Warning | Amber | ↓ |
| < -10% | Declined | Red | ↓ |

**File:** `ComparisonView.js`


---


## 11. WATER FLOW VALUES (Default/Expected)

| Parameter | Flow Rate | Totalizer | Unit |
|-----------|-----------|-----------|------|
| Feed FM-I | 42 | 5000 | m³/hr, m³ |
| Feed FM-II | 38 | 4500 | m³/hr, m³ |
| Fresh Water FM | 12 | 1500 | m³/hr, m³ |
| Recycle Water FM | 26 | 3000 | m³/hr, m³ |

**File:** `WaterFlowMeters.js`


---


## SUMMARY TABLE - ALL DEFAULT VALUES

| Category | Parameter | Value | Unit |
|----------|-----------|-------|------|
| **Gas Flow** | Raw Biogas Flow | 1250 | Nm³/hr |
| | Purified Gas Flow | 1180 | Nm³/hr |
| | Product Gas Flow | 1150 | Nm³/hr |
| **Gas Composition** | CH₄ | 96.8 | % |
| | CO₂ | 2.9 | % |
| | O₂ | 0.3 | % |
| | H₂S | 180 | ppm |
| | Dew Point | -68 | mg/m³ |
| **Digester 1** | Temp Bottom | 37 | °C |
| | Temp Top | 36.5 | °C |
| | Gas Pressure | 32 | mbar |
| | Air Pressure | 18 | mbar |
| | Slurry Height | 7.6 | m |
| | Gas Level | 75 | % |
| **Digester 2** | Temp Bottom | 36.5 | °C |
| | Temp Top | 36 | °C |
| | Gas Pressure | 30 | mbar |
| | Air Pressure | 17 | mbar |
| | Slurry Height | 7.3 | m |
| | Gas Level | 72 | % |
| **Tanks** | Buffer Tank | 82 | % |
| | Lagoon Tank | 76 | % |
| | Tank Capacity | 1078 | m³ |
| **Water Flow** | Feed FM-I | 42 | m³/hr |
| | Feed FM-II | 38 | m³/hr |
| | Fresh Water | 12 | m³/hr |
| | Recycle Water | 26 | m³/hr |
| **Equipment** | PSA Status | 1 (Running) | - |
| | PSA Efficiency | 94.4 | % |
| | Compressor | 1 (Running) | - |
| | LT Panel Power | 245 | kW |


---


## FILES WHERE THESE ARE IMPLEMENTED

| File | Values Implemented |
|------|-------------------|
| `GasComposition.js` | CH₄, CO₂, O₂, H₂S status rules |
| `DewPointMeter.js` | Dew point status rules (-65, -50 thresholds) |
| `TankLevels.js` | Tank status rules (70%, 90% thresholds), capacity 1078 m³ |
| `Digester.js` | All digester values (temp, pressure, height, gas level) |
| `KPISummary.js` | Gas flow values, gas composition values |
| `WaterFlowMeters.js` | Water flow values |
| `EquipmentStatus.js` | PSA, Compressor, LT Panel values |
| `dashboard.php` | Data freshness calculation |
| `ComparisonView.js` | Comparison status rules |
