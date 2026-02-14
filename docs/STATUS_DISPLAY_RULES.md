# SCADA Status Display Rules
# ============================
# 
# This file contains the status rules you provided for displaying
# parameter status on the dashboard (Accepted/Normal/Warning/Critical)
#
# These rules are ALREADY IMPLEMENTED in the frontend components.
# This file is for reference only.
#
# Last Updated: February 2026
# ============================


## GAS COMPOSITION STATUS RULES

| Parameter | Condition | Status Displayed | Color |
|-----------|-----------|------------------|-------|
| **CH₄** | ≥ 96% | Accepted | Green |
| **CH₄** | < 96% | Warning | Amber |
| **CO₂** | < 5% | Normal | Green |
| **CO₂** | ≥ 5% | Warning | Amber |
| **O₂** | < 0.5% | Normal | Green |
| **O₂** | ≥ 0.5% | Warning | Amber |
| **H₂S** | < 500 ppm | Normal | Green |
| **H₂S** | ≥ 500 ppm | Warning | Amber |


## DEFAULT/EXPECTED VALUES (Normal Operation)

| Parameter | Expected Value | Unit |
|-----------|----------------|------|
| Raw Biogas Flow | 1250 | Nm³/hr |
| Purified Gas Flow | 1180 | Nm³/hr |
| Product Gas Flow | 1150 | Nm³/hr |
| CH₄ Concentration | 96.8 | % |
| CO₂ Level | 2.9 | % |
| O₂ Concentration | 0.3 | % |
| H₂S Content | 180 | ppm |
| Dew Point | -68 | mg/m³ |
| Buffer Tank Level | 82 | % |
| Lagoon Tank Level | 76 | % |
| Digester 1 Temp | 37 | °C |
| Digester 2 Temp | 36.5 | °C |
| D1 Gas Pressure | 32 | mbar |
| D2 Gas Pressure | 30 | mbar |
| D1 Air Pressure | 18 | mbar |
| D2 Air Pressure | 17 | mbar |
| D1 Slurry Height | 7.6 | m |
| D2 Slurry Height | 7.3 | m |
| D1 Gas Level | 75 | % |
| D2 Gas Level | 72 | % |
| PSA Efficiency | 94.4 | % |
| LT Panel Power | 245 | kW |


## DATA FRESHNESS STATUS

| Age of Data | Status | Color |
|-------------|--------|-------|
| ≤ 2 minutes | FRESH | Green |
| 2-5 minutes | DELAYED | Amber |
| > 5 minutes | STALE | Red |


## DATA QUALITY INDICATORS (Sample Coverage)

| Coverage % | Indicator | Color |
|------------|-----------|-------|
| ≥ 95% | ✓ (Good) | Green |
| 80-94% | (Normal) | Default |
| 50-79% | ⚠️ Partial data | Yellow |
| < 50% | ⚠️ Low coverage | Orange |


## COMPARISON STATUS (Today vs Yesterday)

| Change % | Status | Color | Icon |
|----------|--------|-------|------|
| > +2% | Improved | Green | ↑ |
| -2% to +2% | Stable | Blue | → |
| -2% to -10% | Warning | Amber | ↓ |
| < -10% | Declined | Red | ↓ |


## EQUIPMENT STATUS

| Status Value | Display | Color |
|--------------|---------|-------|
| 1 | Running | Green |
| 0 | Stopped | Red |


## TANK LEVEL STATUS (Visual Bar)

| Level % | Status | Color |
|---------|--------|-------|
| < 20% | Low | Red |
| 20-80% | Normal | Green |
| 80-95% | Warning | Amber |
| > 95% | Critical | Red |


## IMPLEMENTED IN FILES:

| File | Rules Implemented |
|------|-------------------|
| `GasComposition.js` | CH₄, CO₂, O₂, H₂S status rules |
| `KPISummary.js` | Default values, trend data |
| `TankLevels.js` | Tank level status colors |
| `EquipmentStatus.js` | Equipment running/stopped |
| `dashboard.php` | Data freshness calculation |


## NOTES:

1. All these status rules are for DISPLAY purposes on the dashboard
2. They are DIFFERENT from alert thresholds (see thresholds_config.php)
3. Status rules show current condition to the user
4. Alert thresholds trigger notifications when exceeded
