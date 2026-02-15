#!/usr/bin/env python3
"""
Auto Simulator for LR Energy SCADA System
Sends 10 distinct data combinations to the receive_data.php endpoint

Usage:
    python run_simulator.py --url YOUR_API_URL --count 10 --interval 5

Arguments:
    --url       : Your GoDaddy API URL (e.g., https://yourdomain.com/scada-api/receive_data.php)
    --count     : Number of readings to send (default: 10)
    --interval  : Seconds between readings (default: 5)
"""

import requests
import json
import time
import argparse
from datetime import datetime

# API Key for authentication
API_KEY = "SCADA_LR_ENERGY_2026_SECURE_KEY"

# 10 Distinct Scenarios
SCENARIOS = [
    {
        "name": "✅ Scenario 1: Normal Operation - Optimal",
        "raw_biogas_flow": 1250, "purified_gas_flow": 1180, "product_gas_flow": 1150,
        "ch4_concentration": 96.8, "co2_level": 2.9, "o2_concentration": 0.30, "h2s_content": 3,
        "dew_point": -68,
        "d1_temp_bottom": 37.0, "d1_temp_top": 36.5, "d1_gas_pressure": 32, "d1_air_pressure": 18, "d1_slurry_height": 7.6, "d1_gas_level": 75,
        "d2_temp_bottom": 36.5, "d2_temp_top": 36.0, "d2_gas_pressure": 30, "d2_air_pressure": 17, "d2_slurry_height": 7.3, "d2_gas_level": 72,
        "buffer_tank_level": 65, "lagoon_tank_level": 60,
        "feed_fm1_flow": 42, "feed_fm2_flow": 38, "fresh_water_flow": 12, "recycle_water_flow": 26,
        "psa_status": 1, "psa_efficiency": 94.4, "lt_panel_power": 245, "compressor_status": 1
    },
    {
        "name": "📈 Scenario 2: High Gas Production",
        "raw_biogas_flow": 1380, "purified_gas_flow": 1290, "product_gas_flow": 1260,
        "ch4_concentration": 97.2, "co2_level": 2.5, "o2_concentration": 0.25, "h2s_content": 2,
        "dew_point": -70,
        "d1_temp_bottom": 38.0, "d1_temp_top": 37.5, "d1_gas_pressure": 35, "d1_air_pressure": 20, "d1_slurry_height": 8.0, "d1_gas_level": 82,
        "d2_temp_bottom": 37.5, "d2_temp_top": 37.0, "d2_gas_pressure": 33, "d2_air_pressure": 19, "d2_slurry_height": 7.8, "d2_gas_level": 80,
        "buffer_tank_level": 75, "lagoon_tank_level": 70,
        "feed_fm1_flow": 48, "feed_fm2_flow": 45, "fresh_water_flow": 15, "recycle_water_flow": 30,
        "psa_status": 1, "psa_efficiency": 96.2, "lt_panel_power": 260, "compressor_status": 1
    },
    {
        "name": "📉 Scenario 3: Low Gas Production (Morning)",
        "raw_biogas_flow": 980, "purified_gas_flow": 920, "product_gas_flow": 900,
        "ch4_concentration": 95.5, "co2_level": 3.8, "o2_concentration": 0.45, "h2s_content": 4,
        "dew_point": -65,
        "d1_temp_bottom": 35.5, "d1_temp_top": 35.0, "d1_gas_pressure": 28, "d1_air_pressure": 15, "d1_slurry_height": 7.0, "d1_gas_level": 65,
        "d2_temp_bottom": 35.0, "d2_temp_top": 34.5, "d2_gas_pressure": 26, "d2_air_pressure": 14, "d2_slurry_height": 6.8, "d2_gas_level": 62,
        "buffer_tank_level": 55, "lagoon_tank_level": 50,
        "feed_fm1_flow": 35, "feed_fm2_flow": 32, "fresh_water_flow": 10, "recycle_water_flow": 20,
        "psa_status": 1, "psa_efficiency": 92.0, "lt_panel_power": 220, "compressor_status": 1
    },
    {
        "name": "⚠️ Scenario 4: Warning - Low CH₄ Concentration",
        "raw_biogas_flow": 1200, "purified_gas_flow": 1100, "product_gas_flow": 1080,
        "ch4_concentration": 94.5, "co2_level": 4.5, "o2_concentration": 0.55, "h2s_content": 4,
        "dew_point": -64,
        "d1_temp_bottom": 36.0, "d1_temp_top": 35.5, "d1_gas_pressure": 30, "d1_air_pressure": 16, "d1_slurry_height": 7.2, "d1_gas_level": 70,
        "d2_temp_bottom": 35.5, "d2_temp_top": 35.0, "d2_gas_pressure": 28, "d2_air_pressure": 15, "d2_slurry_height": 7.0, "d2_gas_level": 68,
        "buffer_tank_level": 72, "lagoon_tank_level": 68,
        "feed_fm1_flow": 40, "feed_fm2_flow": 36, "fresh_water_flow": 11, "recycle_water_flow": 24,
        "psa_status": 1, "psa_efficiency": 91.5, "lt_panel_power": 238, "compressor_status": 1
    },
    {
        "name": "🚨 Scenario 5: Critical - High H₂S Content",
        "raw_biogas_flow": 1150, "purified_gas_flow": 1050, "product_gas_flow": 1020,
        "ch4_concentration": 96.0, "co2_level": 3.2, "o2_concentration": 0.35, "h2s_content": 85,
        "dew_point": -66,
        "d1_temp_bottom": 37.5, "d1_temp_top": 37.0, "d1_gas_pressure": 31, "d1_air_pressure": 17, "d1_slurry_height": 7.4, "d1_gas_level": 73,
        "d2_temp_bottom": 37.0, "d2_temp_top": 36.5, "d2_gas_pressure": 29, "d2_air_pressure": 16, "d2_slurry_height": 7.1, "d2_gas_level": 70,
        "buffer_tank_level": 78, "lagoon_tank_level": 74,
        "feed_fm1_flow": 44, "feed_fm2_flow": 40, "fresh_water_flow": 13, "recycle_water_flow": 28,
        "psa_status": 1, "psa_efficiency": 93.0, "lt_panel_power": 250, "compressor_status": 1
    },
    {
        "name": "⚠️ Scenario 6: Warning - High Digester Temperature",
        "raw_biogas_flow": 1300, "purified_gas_flow": 1220, "product_gas_flow": 1190,
        "ch4_concentration": 97.0, "co2_level": 2.6, "o2_concentration": 0.28, "h2s_content": 3,
        "dew_point": -69,
        "d1_temp_bottom": 44.5, "d1_temp_top": 43.5, "d1_gas_pressure": 36, "d1_air_pressure": 21, "d1_slurry_height": 7.9, "d1_gas_level": 78,
        "d2_temp_bottom": 43.0, "d2_temp_top": 42.5, "d2_gas_pressure": 34, "d2_air_pressure": 20, "d2_slurry_height": 7.7, "d2_gas_level": 76,
        "buffer_tank_level": 80, "lagoon_tank_level": 75,
        "feed_fm1_flow": 46, "feed_fm2_flow": 42, "fresh_water_flow": 14, "recycle_water_flow": 29,
        "psa_status": 1, "psa_efficiency": 95.5, "lt_panel_power": 255, "compressor_status": 1
    },
    {
        "name": "🚨 Scenario 7: Critical - High Buffer Tank Level",
        "raw_biogas_flow": 1280, "purified_gas_flow": 1200, "product_gas_flow": 1170,
        "ch4_concentration": 96.5, "co2_level": 3.0, "o2_concentration": 0.32, "h2s_content": 4,
        "dew_point": -67,
        "d1_temp_bottom": 37.2, "d1_temp_top": 36.7, "d1_gas_pressure": 33, "d1_air_pressure": 18, "d1_slurry_height": 7.7, "d1_gas_level": 76,
        "d2_temp_bottom": 36.8, "d2_temp_top": 36.3, "d2_gas_pressure": 31, "d2_air_pressure": 17, "d2_slurry_height": 7.5, "d2_gas_level": 74,
        "buffer_tank_level": 93, "lagoon_tank_level": 88,
        "feed_fm1_flow": 45, "feed_fm2_flow": 41, "fresh_water_flow": 13, "recycle_water_flow": 27,
        "psa_status": 1, "psa_efficiency": 94.0, "lt_panel_power": 248, "compressor_status": 1
    },
    {
        "name": "⚠️ Scenario 8: Warning - Low PSA Efficiency",
        "raw_biogas_flow": 1220, "purified_gas_flow": 1100, "product_gas_flow": 1050,
        "ch4_concentration": 95.8, "co2_level": 3.5, "o2_concentration": 0.40, "h2s_content": 5,
        "dew_point": -65,
        "d1_temp_bottom": 36.5, "d1_temp_top": 36.0, "d1_gas_pressure": 30, "d1_air_pressure": 17, "d1_slurry_height": 7.3, "d1_gas_level": 71,
        "d2_temp_bottom": 36.0, "d2_temp_top": 35.5, "d2_gas_pressure": 28, "d2_air_pressure": 16, "d2_slurry_height": 7.1, "d2_gas_level": 69,
        "buffer_tank_level": 70, "lagoon_tank_level": 65,
        "feed_fm1_flow": 40, "feed_fm2_flow": 37, "fresh_water_flow": 11, "recycle_water_flow": 24,
        "psa_status": 1, "psa_efficiency": 88.5, "lt_panel_power": 235, "compressor_status": 1
    },
    {
        "name": "🌙 Scenario 9: Night Operation - Reduced Load",
        "raw_biogas_flow": 1050, "purified_gas_flow": 990, "product_gas_flow": 970,
        "ch4_concentration": 96.2, "co2_level": 3.1, "o2_concentration": 0.33, "h2s_content": 3,
        "dew_point": -68,
        "d1_temp_bottom": 36.2, "d1_temp_top": 35.7, "d1_gas_pressure": 29, "d1_air_pressure": 16, "d1_slurry_height": 7.2, "d1_gas_level": 68,
        "d2_temp_bottom": 35.8, "d2_temp_top": 35.3, "d2_gas_pressure": 27, "d2_air_pressure": 15, "d2_slurry_height": 7.0, "d2_gas_level": 66,
        "buffer_tank_level": 58, "lagoon_tank_level": 54,
        "feed_fm1_flow": 36, "feed_fm2_flow": 33, "fresh_water_flow": 9, "recycle_water_flow": 21,
        "psa_status": 1, "psa_efficiency": 93.5, "lt_panel_power": 210, "compressor_status": 1
    },
    {
        "name": "🏆 Scenario 10: Peak Performance",
        "raw_biogas_flow": 1420, "purified_gas_flow": 1350, "product_gas_flow": 1320,
        "ch4_concentration": 97.5, "co2_level": 2.2, "o2_concentration": 0.20, "h2s_content": 2,
        "dew_point": -72,
        "d1_temp_bottom": 38.5, "d1_temp_top": 38.0, "d1_gas_pressure": 38, "d1_air_pressure": 22, "d1_slurry_height": 8.2, "d1_gas_level": 85,
        "d2_temp_bottom": 38.0, "d2_temp_top": 37.5, "d2_gas_pressure": 36, "d2_air_pressure": 21, "d2_slurry_height": 8.0, "d2_gas_level": 83,
        "buffer_tank_level": 68, "lagoon_tank_level": 62,
        "feed_fm1_flow": 50, "feed_fm2_flow": 47, "fresh_water_flow": 16, "recycle_water_flow": 32,
        "psa_status": 1, "psa_efficiency": 97.0, "lt_panel_power": 275, "compressor_status": 1
    }
]


def send_reading(api_url, scenario_index, reading_number):
    """Send a single reading to the API"""
    scenario = SCENARIOS[scenario_index % 10]
    scenario_name = scenario["name"]
    
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Build payload
    payload = {
        "plant_id": "KARNAL",
        "timestamp": timestamp,
        
        # Gas Flow
        "raw_biogas_flow": scenario["raw_biogas_flow"],
        "raw_biogas_totalizer": round(150000 + (reading_number * 20.8), 2),
        "purified_gas_flow": scenario["purified_gas_flow"],
        "purified_gas_totalizer": round(142000 + (reading_number * 19.7), 2),
        "product_gas_flow": scenario["product_gas_flow"],
        "product_gas_totalizer": round(138000 + (reading_number * 19.2), 2),
        
        # Gas Composition
        "ch4_concentration": scenario["ch4_concentration"],
        "co2_level": scenario["co2_level"],
        "o2_concentration": scenario["o2_concentration"],
        "h2s_content": scenario["h2s_content"],
        "dew_point": scenario["dew_point"],
        
        # Digester 1
        "d1_temp_bottom": scenario["d1_temp_bottom"],
        "d1_temp_top": scenario["d1_temp_top"],
        "d1_gas_pressure": scenario["d1_gas_pressure"],
        "d1_air_pressure": scenario["d1_air_pressure"],
        "d1_slurry_height": scenario["d1_slurry_height"],
        "d1_gas_level": scenario["d1_gas_level"],
        
        # Digester 2
        "d2_temp_bottom": scenario["d2_temp_bottom"],
        "d2_temp_top": scenario["d2_temp_top"],
        "d2_gas_pressure": scenario["d2_gas_pressure"],
        "d2_air_pressure": scenario["d2_air_pressure"],
        "d2_slurry_height": scenario["d2_slurry_height"],
        "d2_gas_level": scenario["d2_gas_level"],
        
        # Tank Levels
        "buffer_tank_level": scenario["buffer_tank_level"],
        "lagoon_tank_level": scenario["lagoon_tank_level"],
        
        # Water Flow
        "feed_fm1_flow": scenario["feed_fm1_flow"],
        "feed_fm1_totalizer": round(5000 + (reading_number * 0.7), 2),
        "feed_fm2_flow": scenario["feed_fm2_flow"],
        "feed_fm2_totalizer": round(4500 + (reading_number * 0.63), 2),
        "fresh_water_flow": scenario["fresh_water_flow"],
        "fresh_water_totalizer": round(1500 + (reading_number * 0.2), 2),
        "recycle_water_flow": scenario["recycle_water_flow"],
        "recycle_water_totalizer": round(3000 + (reading_number * 0.43), 2),
        
        # Equipment
        "psa_status": scenario["psa_status"],
        "psa_efficiency": scenario["psa_efficiency"],
        "lt_panel_power": scenario["lt_panel_power"],
        "compressor_status": scenario["compressor_status"]
    }
    
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY
    }
    
    try:
        response = requests.post(api_url, json=payload, headers=headers, timeout=30)
        return {
            "success": response.status_code == 201,
            "status_code": response.status_code,
            "response": response.json() if response.text else {},
            "scenario": scenario_name,
            "key_values": {
                "CH4": f"{scenario['ch4_concentration']}%",
                "H2S": f"{scenario['h2s_content']} ppm",
                "Raw Flow": f"{scenario['raw_biogas_flow']} Nm³/hr",
                "Buffer Tank": f"{scenario['buffer_tank_level']}%",
                "PSA Eff": f"{scenario['psa_efficiency']}%"
            }
        }
    except requests.exceptions.RequestException as e:
        return {
            "success": False,
            "error": str(e),
            "scenario": scenario_name
        }


def main():
    parser = argparse.ArgumentParser(description="SCADA Auto Simulator - 10 Distinct Scenarios")
    parser.add_argument("--url", required=True, help="API URL (e.g., https://yourdomain.com/scada-api/receive_data.php)")
    parser.add_argument("--count", type=int, default=10, help="Number of readings to send (default: 10)")
    parser.add_argument("--interval", type=int, default=5, help="Seconds between readings (default: 5)")
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("🤖 SCADA Auto Simulator - 10 Distinct Scenarios")
    print("=" * 60)
    print(f"📡 API URL: {args.url}")
    print(f"📊 Readings: {args.count}")
    print(f"⏱️  Interval: {args.interval} seconds")
    print("=" * 60)
    print()
    print("📋 Scenarios:")
    for i, s in enumerate(SCENARIOS):
        print(f"   {i+1}. {s['name']}")
    print()
    print("=" * 60)
    print()
    
    for i in range(args.count):
        scenario_index = i % 10
        reading_number = i + 1
        
        print(f"\n📤 Sending Reading #{reading_number}...")
        result = send_reading(args.url, scenario_index, reading_number)
        
        if result["success"]:
            print(f"   ✅ Success - {result['scenario']}")
            print(f"   📊 Key Values: {result['key_values']}")
        else:
            print(f"   ❌ Failed - {result.get('error', result.get('status_code'))}")
            print(f"   📋 Scenario: {result['scenario']}")
        
        if i < args.count - 1:
            print(f"   ⏳ Waiting {args.interval} seconds...")
            time.sleep(args.interval)
    
    print("\n" + "=" * 60)
    print("✅ Simulation Complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
