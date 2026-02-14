<?php
/**
 * =====================================================
 * SCADA ALERT THRESHOLDS CONFIGURATION
 * =====================================================
 * 
 * File: thresholds_config.php
 * Purpose: Central configuration for all alert thresholds
 * 
 * INSTRUCTIONS FOR ENGINEER:
 * --------------------------
 * 1. Review each threshold value below
 * 2. Update min/max values as needed
 * 3. Set appropriate severity: 'INFO', 'WARNING', 'CRITICAL'
 * 4. Save file and copy to server
 * 
 * SEVERITY LEVELS:
 * - INFO: Informational, no action needed
 * - WARNING: Attention needed, not urgent
 * - CRITICAL: Immediate action required
 * 
 * Last Updated: [DATE]
 * Confirmed By: [ENGINEER NAME]
 * =====================================================
 */

return [
    
    // =====================================================
    // GAS COMPOSITION THRESHOLDS
    // =====================================================
    
    'ch4_concentration' => [
        'name' => 'CH₄ (Methane) Concentration',
        'unit' => '%',
        'min' => 96,          // TODO: Confirm minimum acceptable CH₄ %
        'max' => 100,         // Maximum possible
        'severity' => 'WARNING',
        'notes' => 'Below 96% affects gas quality and revenue'
    ],
    
    'co2_level' => [
        'name' => 'CO₂ (Carbon Dioxide) Level',
        'unit' => '%',
        'min' => 0,
        'max' => 5,           // TODO: Confirm maximum acceptable CO₂ %
        'severity' => 'WARNING',
        'notes' => 'High CO₂ indicates poor purification'
    ],
    
    'o2_concentration' => [
        'name' => 'O₂ (Oxygen) Concentration',
        'unit' => '%',
        'min' => 0,
        'max' => 0.5,         // TODO: Confirm - currently <0.5% = Normal
        'severity' => 'WARNING',
        'notes' => 'High O₂ is explosion risk'
    ],
    
    'o2_concentration_critical' => [
        'name' => 'O₂ (Oxygen) - CRITICAL',
        'unit' => '%',
        'min' => null,
        'max' => 2,           // TODO: Confirm critical O₂ threshold
        'severity' => 'CRITICAL',
        'notes' => 'EXPLOSION RISK - Immediate shutdown required'
    ],
    
    'h2s_content' => [
        'name' => 'H₂S (Hydrogen Sulfide) Content',
        'unit' => 'ppm',
        'min' => 0,
        'max' => 500,         // TODO: Confirm - currently shown limit is 500 ppm
        'severity' => 'WARNING',
        'notes' => 'High H₂S is toxic and corrosive'
    ],
    
    'h2s_content_critical' => [
        'name' => 'H₂S - CRITICAL',
        'unit' => 'ppm',
        'min' => null,
        'max' => 1000,        // TODO: Confirm critical H₂S threshold
        'severity' => 'CRITICAL',
        'notes' => 'SAFETY HAZARD - Evacuate area'
    ],
    
    'dew_point' => [
        'name' => 'Dew Point',
        'unit' => 'mg/m³',
        'min' => -80,         // TODO: Confirm minimum dew point
        'max' => -40,         // TODO: Confirm maximum dew point
        'severity' => 'WARNING',
        'notes' => 'Outside range indicates moisture issue'
    ],
    
    // =====================================================
    // GAS FLOW THRESHOLDS
    // =====================================================
    
    'raw_biogas_flow' => [
        'name' => 'Raw Biogas Flow',
        'unit' => 'Nm³/hr',
        'min' => 500,         // TODO: Confirm minimum flow rate
        'max' => 2000,        // TODO: Confirm maximum flow rate
        'severity' => 'WARNING',
        'notes' => 'Normal operation ~1250 Nm³/hr'
    ],
    
    'purified_gas_flow' => [
        'name' => 'Purified Gas Flow',
        'unit' => 'Nm³/hr',
        'min' => 400,         // TODO: Confirm
        'max' => 1800,        // TODO: Confirm
        'severity' => 'WARNING',
        'notes' => 'Normal operation ~1180 Nm³/hr (~94% of raw)'
    ],
    
    'product_gas_flow' => [
        'name' => 'Product Gas Flow',
        'unit' => 'Nm³/hr',
        'min' => 350,         // TODO: Confirm
        'max' => 1700,        // TODO: Confirm
        'severity' => 'WARNING',
        'notes' => 'Normal operation ~1150 Nm³/hr (~92% of raw)'
    ],
    
    // =====================================================
    // DIGESTER 1 THRESHOLDS
    // =====================================================
    
    'd1_temp_bottom' => [
        'name' => 'Digester 1 Temperature (Bottom)',
        'unit' => '°C',
        'min' => 30,          // TODO: Confirm minimum safe temperature
        'max' => 45,          // TODO: Confirm maximum safe temperature
        'severity' => 'WARNING',
        'notes' => 'Normal operation ~37°C'
    ],
    
    'd1_temp_critical' => [
        'name' => 'Digester 1 Temperature - CRITICAL',
        'unit' => '°C',
        'min' => null,
        'max' => 50,          // TODO: Confirm - bacteria death temperature
        'severity' => 'CRITICAL',
        'notes' => 'Bacteria death above this temperature'
    ],
    
    'd1_gas_pressure' => [
        'name' => 'Digester 1 Gas Pressure',
        'unit' => 'mbar',
        'min' => 10,          // TODO: Confirm - low pressure = possible leak
        'max' => 50,          // TODO: Confirm - high pressure = blockage
        'severity' => 'WARNING',
        'notes' => 'Normal operation ~32 mbar'
    ],
    
    'd1_slurry_height' => [
        'name' => 'Digester 1 Slurry Height',
        'unit' => 'm',
        'min' => 2,           // TODO: Confirm minimum height
        'max' => 8,           // TODO: Confirm maximum height
        'severity' => 'WARNING',
        'notes' => 'Normal operation ~7.6 m'
    ],
    
    'd1_gas_level' => [
        'name' => 'Digester 1 Gas Level',
        'unit' => '%',
        'min' => 30,          // TODO: Confirm
        'max' => 90,          // TODO: Confirm
        'severity' => 'WARNING',
        'notes' => 'Normal operation ~75%'
    ],
    
    // =====================================================
    // DIGESTER 2 THRESHOLDS
    // =====================================================
    
    'd2_temp_bottom' => [
        'name' => 'Digester 2 Temperature (Bottom)',
        'unit' => '°C',
        'min' => 30,          // TODO: Confirm
        'max' => 45,          // TODO: Confirm
        'severity' => 'WARNING',
        'notes' => 'Normal operation ~36.5°C'
    ],
    
    'd2_temp_critical' => [
        'name' => 'Digester 2 Temperature - CRITICAL',
        'unit' => '°C',
        'min' => null,
        'max' => 50,          // TODO: Confirm
        'severity' => 'CRITICAL',
        'notes' => 'Bacteria death above this temperature'
    ],
    
    'd2_gas_pressure' => [
        'name' => 'Digester 2 Gas Pressure',
        'unit' => 'mbar',
        'min' => 10,          // TODO: Confirm
        'max' => 50,          // TODO: Confirm
        'severity' => 'WARNING',
        'notes' => 'Normal operation ~30 mbar'
    ],
    
    'd2_slurry_height' => [
        'name' => 'Digester 2 Slurry Height',
        'unit' => 'm',
        'min' => 2,           // TODO: Confirm
        'max' => 8,           // TODO: Confirm
        'severity' => 'WARNING',
        'notes' => 'Normal operation ~7.3 m'
    ],
    
    'd2_gas_level' => [
        'name' => 'Digester 2 Gas Level',
        'unit' => '%',
        'min' => 30,          // TODO: Confirm
        'max' => 90,          // TODO: Confirm
        'severity' => 'WARNING',
        'notes' => 'Normal operation ~72%'
    ],
    
    // =====================================================
    // TANK LEVEL THRESHOLDS
    // =====================================================
    
    'buffer_tank_level' => [
        'name' => 'Buffer Tank Level',
        'unit' => '%',
        'min' => 20,          // TODO: Confirm minimum safe level
        'max' => 95,          // TODO: Confirm maximum before overflow
        'severity' => 'WARNING',
        'notes' => 'Normal operation ~82%'
    ],
    
    'lagoon_tank_level' => [
        'name' => 'Lagoon Tank Level',
        'unit' => '%',
        'min' => 20,          // TODO: Confirm
        'max' => 95,          // TODO: Confirm
        'severity' => 'WARNING',
        'notes' => 'Normal operation ~76%'
    ],
    
    // =====================================================
    // EQUIPMENT THRESHOLDS
    // =====================================================
    
    'psa_efficiency' => [
        'name' => 'PSA Efficiency',
        'unit' => '%',
        'min' => 85,          // TODO: Confirm minimum acceptable efficiency
        'max' => 100,
        'severity' => 'WARNING',
        'notes' => 'Normal operation ~94.4%'
    ],
    
    'lt_panel_power' => [
        'name' => 'LT Panel Power Consumption',
        'unit' => 'kW',
        'min' => 50,          // TODO: Confirm minimum expected power
        'max' => 400,         // TODO: Confirm maximum safe power
        'severity' => 'WARNING',
        'notes' => 'Normal operation ~245 kW'
    ],
    
];
