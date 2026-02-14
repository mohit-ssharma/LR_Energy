<?php
/**
 * =====================================================
 * SCADA ALERT THRESHOLDS CONFIGURATION
 * =====================================================
 * 
 * File: thresholds_config.php
 * 
 * After engineer confirms values in THRESHOLD_VALUES_FOR_ENGINEER.txt,
 * update the min/max values below.
 * 
 * Last Updated: [DATE]
 * Confirmed By: [ENGINEER NAME]
 * =====================================================
 */

return [
    
    // =====================================================
    // GAS COMPOSITION
    // =====================================================
    
    'ch4_concentration' => [
        'name' => 'CH₄ (Methane) Concentration',
        'unit' => '%',
        'min' => 96,
        'max' => 100,
        'severity' => 'WARNING',
    ],
    
    'co2_level' => [
        'name' => 'CO₂ (Carbon Dioxide) Level',
        'unit' => '%',
        'min' => 0,
        'max' => 5,
        'severity' => 'WARNING',
    ],
    
    'o2_concentration' => [
        'name' => 'O₂ (Oxygen) Concentration',
        'unit' => '%',
        'min' => 0,
        'max' => 0.5,
        'severity' => 'WARNING',
    ],
    
    'o2_concentration_critical' => [
        'name' => 'O₂ (Oxygen) - CRITICAL',
        'unit' => '%',
        'min' => null,
        'max' => 2,
        'severity' => 'CRITICAL',
    ],
    
    'h2s_content' => [
        'name' => 'H₂S (Hydrogen Sulfide) Content',
        'unit' => 'ppm',
        'min' => 0,
        'max' => 500,
        'severity' => 'WARNING',
    ],
    
    'h2s_content_critical' => [
        'name' => 'H₂S - CRITICAL',
        'unit' => 'ppm',
        'min' => null,
        'max' => 1000,
        'severity' => 'CRITICAL',
    ],
    
    'dew_point' => [
        'name' => 'Dew Point',
        'unit' => 'mg/m³',
        'min' => -80,
        'max' => -40,
        'severity' => 'WARNING',
    ],
    
    // =====================================================
    // GAS FLOW
    // =====================================================
    
    'raw_biogas_flow' => [
        'name' => 'Raw Biogas Flow',
        'unit' => 'Nm³/hr',
        'min' => 500,
        'max' => 2000,
        'severity' => 'WARNING',
    ],
    
    'purified_gas_flow' => [
        'name' => 'Purified Gas Flow',
        'unit' => 'Nm³/hr',
        'min' => 400,
        'max' => 1800,
        'severity' => 'WARNING',
    ],
    
    'product_gas_flow' => [
        'name' => 'Product Gas Flow',
        'unit' => 'Nm³/hr',
        'min' => 350,
        'max' => 1700,
        'severity' => 'WARNING',
    ],
    
    // =====================================================
    // DIGESTER 1
    // =====================================================
    
    'd1_temp_bottom' => [
        'name' => 'Digester 1 Bottom Temperature',
        'unit' => '°C',
        'min' => 30,
        'max' => 45,
        'severity' => 'WARNING',
    ],
    
    'd1_temp_top' => [
        'name' => 'Digester 1 Top Temperature',
        'unit' => '°C',
        'min' => 30,
        'max' => 45,
        'severity' => 'WARNING',
    ],
    
    'd1_temp_critical' => [
        'name' => 'Digester 1 Temperature - CRITICAL',
        'unit' => '°C',
        'min' => null,
        'max' => 50,
        'severity' => 'CRITICAL',
    ],
    
    'd1_gas_pressure' => [
        'name' => 'Digester 1 Balloon Gas Pressure',
        'unit' => 'mbar',
        'min' => 10,
        'max' => 50,
        'severity' => 'WARNING',
    ],
    
    'd1_air_pressure' => [
        'name' => 'Digester 1 Balloon Air Pressure',
        'unit' => 'mbar',
        'min' => 5,
        'max' => 30,
        'severity' => 'WARNING',
    ],
    
    'd1_slurry_height' => [
        'name' => 'Digester 1 Slurry Height',
        'unit' => 'm',
        'min' => 2,
        'max' => 8,
        'severity' => 'WARNING',
    ],
    
    'd1_gas_level' => [
        'name' => 'Digester 1 Gas Level',
        'unit' => '%',
        'min' => 30,
        'max' => 90,
        'severity' => 'WARNING',
    ],
    
    // =====================================================
    // DIGESTER 2
    // =====================================================
    
    'd2_temp_bottom' => [
        'name' => 'Digester 2 Bottom Temperature',
        'unit' => '°C',
        'min' => 30,
        'max' => 45,
        'severity' => 'WARNING',
    ],
    
    'd2_temp_top' => [
        'name' => 'Digester 2 Top Temperature',
        'unit' => '°C',
        'min' => 30,
        'max' => 45,
        'severity' => 'WARNING',
    ],
    
    'd2_temp_critical' => [
        'name' => 'Digester 2 Temperature - CRITICAL',
        'unit' => '°C',
        'min' => null,
        'max' => 50,
        'severity' => 'CRITICAL',
    ],
    
    'd2_gas_pressure' => [
        'name' => 'Digester 2 Balloon Gas Pressure',
        'unit' => 'mbar',
        'min' => 10,
        'max' => 50,
        'severity' => 'WARNING',
    ],
    
    'd2_air_pressure' => [
        'name' => 'Digester 2 Balloon Air Pressure',
        'unit' => 'mbar',
        'min' => 5,
        'max' => 30,
        'severity' => 'WARNING',
    ],
    
    'd2_slurry_height' => [
        'name' => 'Digester 2 Slurry Height',
        'unit' => 'm',
        'min' => 2,
        'max' => 8,
        'severity' => 'WARNING',
    ],
    
    'd2_gas_level' => [
        'name' => 'Digester 2 Gas Level',
        'unit' => '%',
        'min' => 30,
        'max' => 90,
        'severity' => 'WARNING',
    ],
    
    // =====================================================
    // TANK LEVELS
    // =====================================================
    
    'buffer_tank_level' => [
        'name' => 'Buffer Tank Level',
        'unit' => '%',
        'min' => 20,
        'max' => 95,
        'severity' => 'WARNING',
    ],
    
    'lagoon_tank_level' => [
        'name' => 'Lagoon Tank Level',
        'unit' => '%',
        'min' => 20,
        'max' => 95,
        'severity' => 'WARNING',
    ],
    
    // =====================================================
    // WATER FLOW
    // =====================================================
    
    'feed_fm1_flow' => [
        'name' => 'Feed FM-I Flow',
        'unit' => 'm³/hr',
        'min' => 10,
        'max' => 80,
        'severity' => 'WARNING',
    ],
    
    'feed_fm2_flow' => [
        'name' => 'Feed FM-II Flow',
        'unit' => 'm³/hr',
        'min' => 10,
        'max' => 80,
        'severity' => 'WARNING',
    ],
    
    'fresh_water_flow' => [
        'name' => 'Fresh Water Flow',
        'unit' => 'm³/hr',
        'min' => 0,
        'max' => 30,
        'severity' => 'WARNING',
    ],
    
    'recycle_water_flow' => [
        'name' => 'Recycle Water Flow',
        'unit' => 'm³/hr',
        'min' => 5,
        'max' => 50,
        'severity' => 'WARNING',
    ],
    
    // =====================================================
    // EQUIPMENT
    // =====================================================
    
    'psa_efficiency' => [
        'name' => 'PSA Efficiency',
        'unit' => '%',
        'min' => 85,
        'max' => 100,
        'severity' => 'WARNING',
    ],
    
    'lt_panel_power' => [
        'name' => 'LT Panel Power',
        'unit' => 'kW',
        'min' => 50,
        'max' => 400,
        'severity' => 'WARNING',
    ],
    
];
