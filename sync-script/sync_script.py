"""
SCADA Data Sync Script
Reads data from Siemens SCADA and sends to cloud API

Usage:
1. Install dependencies: pip install -r requirements.txt
2. Configure .env file with your settings
3. Run: python sync_script.py

Author: LR Energy / Elan Energies
"""

import os
import json
import time
import logging
import requests
from datetime import datetime
from dotenv import load_dotenv

# Load configuration
load_dotenv()

# ============================================
# CONFIGURATION
# ============================================

# API Settings
API_URL = os.getenv("API_URL", "https://karnal.lrenergy.in/api/receive_data.php")
API_KEY = os.getenv("API_KEY", "your_api_key_here")

# SCADA Connection
SCADA_TYPE = os.getenv("SCADA_TYPE", "OPC_UA")  # OPC_UA, SQL_SERVER, or CSV_FILE
SCADA_HOST = os.getenv("SCADA_HOST", "localhost")
SCADA_PORT = int(os.getenv("SCADA_PORT", 4840))

# Sync Settings
SYNC_INTERVAL = 60  # seconds
MAX_RETRIES = 3
RETRY_DELAY = 5

# ============================================
# TAG MAPPING (SCADA Tag → Database Field)
# ============================================

TAG_MAPPING = {
    # Gas Flow
    "RAW_BIOGAS_FLOW": "raw_biogas_flow",
    "RAW_BIOGAS_TOTALIZER": "raw_biogas_totalizer",
    "PURIFIED_GAS_FLOW": "purified_gas_flow",
    "PURIFIED_GAS_TOTALIZER": "purified_gas_totalizer",
    "PRODUCT_GAS_FLOW": "product_gas_flow",
    "PRODUCT_GAS_TOTALIZER": "product_gas_totalizer",
    
    # Gas Composition
    "CH4_CONCENTRATION": "ch4_concentration",
    "CO2_LEVEL": "co2_level",
    "O2_CONCENTRATION": "o2_concentration",
    "H2S_CONTENT": "h2s_content",
    "DEW_POINT": "dew_point",
    
    # Digester 1
    "D1_TEMP_BOTTOM": "d1_temp_bottom",
    "D1_TEMP_TOP": "d1_temp_top",
    "D1_GAS_PRESSURE": "d1_gas_pressure",
    "D1_AIR_PRESSURE": "d1_air_pressure",
    "D1_SLURRY_HEIGHT": "d1_slurry_height",
    "D1_GAS_LEVEL": "d1_gas_level",
    
    # Digester 2
    "D2_TEMP_BOTTOM": "d2_temp_bottom",
    "D2_TEMP_TOP": "d2_temp_top",
    "D2_GAS_PRESSURE": "d2_gas_pressure",
    "D2_AIR_PRESSURE": "d2_air_pressure",
    "D2_SLURRY_HEIGHT": "d2_slurry_height",
    "D2_GAS_LEVEL": "d2_gas_level",
    
    # Tank Levels
    "BUFFER_TANK_LEVEL": "buffer_tank_level",
    "LAGOON_TANK_LEVEL": "lagoon_tank_level",
    
    # Water Flow
    "FEED_FM1_FLOW": "feed_fm1_flow",
    "FEED_FM1_TOTALIZER": "feed_fm1_totalizer",
    "FEED_FM2_FLOW": "feed_fm2_flow",
    "FEED_FM2_TOTALIZER": "feed_fm2_totalizer",
    "FRESH_WATER_FLOW": "fresh_water_flow",
    "FRESH_WATER_TOTALIZER": "fresh_water_totalizer",
    "RECYCLE_WATER_FLOW": "recycle_water_flow",
    "RECYCLE_WATER_TOTALIZER": "recycle_water_totalizer",
    
    # Equipment
    "PSA_EFFICIENCY": "psa_efficiency",
    "LT_PANEL_POWER": "lt_panel_power",
    "COMPRESSOR_STATUS": "compressor_status",
}

# ============================================
# LOGGING SETUP
# ============================================

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('sync_log.txt'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# ============================================
# SCADA READING FUNCTIONS
# ============================================

def read_from_opc_ua():
    """Read all tags from OPC UA server"""
    # Uncomment when ready to use:
    # from opcua import Client
    # client = Client(f"opc.tcp://{SCADA_HOST}:{SCADA_PORT}")
    
    # PLACEHOLDER - Replace with actual OPC UA implementation
    logger.warning("OPC UA not configured - using test data")
    return generate_test_data()


def read_from_sql_server():
    """Read latest values from WinCC SQL Server"""
    # Uncomment when ready to use:
    # import pyodbc
    
    # PLACEHOLDER - Replace with actual SQL implementation
    logger.warning("SQL Server not configured - using test data")
    return generate_test_data()


def generate_test_data():
    """Generate test data for development"""
    import random
    return {
        "raw_biogas_flow": round(1250 + random.uniform(-10, 10), 2),
        "raw_biogas_totalizer": round(150000 + random.uniform(0, 100), 2),
        "purified_gas_flow": round(1180 + random.uniform(-10, 10), 2),
        "purified_gas_totalizer": round(142000 + random.uniform(0, 100), 2),
        "product_gas_flow": round(1150 + random.uniform(-10, 10), 2),
        "product_gas_totalizer": round(138000 + random.uniform(0, 100), 2),
        "ch4_concentration": round(96.8 + random.uniform(-0.5, 0.5), 2),
        "co2_level": round(2.9 + random.uniform(-0.2, 0.2), 2),
        "o2_concentration": round(0.3 + random.uniform(-0.05, 0.05), 2),
        "h2s_content": round(180 + random.uniform(-5, 5), 2),
        "dew_point": round(-68 + random.uniform(-1, 1), 2),
        "d1_temp_bottom": round(37 + random.uniform(-0.5, 0.5), 2),
        "d1_temp_top": round(36.5 + random.uniform(-0.5, 0.5), 2),
        "d1_gas_pressure": round(32 + random.uniform(-1, 1), 2),
        "d1_air_pressure": round(18 + random.uniform(-0.5, 0.5), 2),
        "d1_slurry_height": round(7.6 + random.uniform(-0.1, 0.1), 2),
        "d1_gas_level": round(75 + random.uniform(-2, 2), 2),
        "d2_temp_bottom": round(36.5 + random.uniform(-0.5, 0.5), 2),
        "d2_temp_top": round(36 + random.uniform(-0.5, 0.5), 2),
        "d2_gas_pressure": round(30 + random.uniform(-1, 1), 2),
        "d2_air_pressure": round(17 + random.uniform(-0.5, 0.5), 2),
        "d2_slurry_height": round(7.3 + random.uniform(-0.1, 0.1), 2),
        "d2_gas_level": round(72 + random.uniform(-2, 2), 2),
        "buffer_tank_level": round(82 + random.uniform(-2, 2), 2),
        "lagoon_tank_level": round(76 + random.uniform(-2, 2), 2),
        "feed_fm1_flow": round(42 + random.uniform(-2, 2), 2),
        "feed_fm1_totalizer": round(5000 + random.uniform(0, 10), 2),
        "feed_fm2_flow": round(38 + random.uniform(-2, 2), 2),
        "feed_fm2_totalizer": round(4500 + random.uniform(0, 10), 2),
        "fresh_water_flow": round(12 + random.uniform(-1, 1), 2),
        "fresh_water_totalizer": round(1500 + random.uniform(0, 5), 2),
        "recycle_water_flow": round(26 + random.uniform(-2, 2), 2),
        "recycle_water_totalizer": round(3000 + random.uniform(0, 10), 2),
        "psa_efficiency": round(94.4 + random.uniform(-0.5, 0.5), 2),
        "lt_panel_power": round(245 + random.uniform(-5, 5), 2),
        "compressor_status": 1,
    }


def read_scada_data():
    """Read data based on configured SCADA type"""
    if SCADA_TYPE == "OPC_UA":
        return read_from_opc_ua()
    elif SCADA_TYPE == "SQL_SERVER":
        return read_from_sql_server()
    else:
        return generate_test_data()

# ============================================
# API FUNCTIONS
# ============================================

def send_to_cloud(data, retry_count=0):
    """Send data to cloud API"""
    payload = {
        "api_key": API_KEY,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        **data
    }
    
    try:
        response = requests.post(
            API_URL,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            logger.info(f"✅ Data sent successfully. Record ID: {result.get('id')}")
            return True
        else:
            logger.error(f"❌ Server error: {response.status_code} - {response.text}")
            
            if retry_count < MAX_RETRIES:
                logger.info(f"Retrying in {RETRY_DELAY}s... ({retry_count + 1}/{MAX_RETRIES})")
                time.sleep(RETRY_DELAY)
                return send_to_cloud(data, retry_count + 1)
            return False
            
    except requests.exceptions.Timeout:
        logger.error("❌ Request timeout")
        if retry_count < MAX_RETRIES:
            time.sleep(RETRY_DELAY)
            return send_to_cloud(data, retry_count + 1)
        return False
        
    except requests.exceptions.ConnectionError:
        logger.error("❌ Connection error - check internet")
        if retry_count < MAX_RETRIES:
            time.sleep(RETRY_DELAY)
            return send_to_cloud(data, retry_count + 1)
        return False
        
    except Exception as e:
        logger.error(f"❌ Unexpected error: {e}")
        return False

# ============================================
# MAIN LOOP
# ============================================

def main():
    """Main sync loop"""
    logger.info("=" * 50)
    logger.info("SCADA Data Sync Script Started")
    logger.info(f"API URL: {API_URL}")
    logger.info(f"SCADA Type: {SCADA_TYPE}")
    logger.info(f"Sync Interval: {SYNC_INTERVAL}s")
    logger.info("=" * 50)
    
    while True:
        try:
            logger.info("Reading data from SCADA...")
            data = read_scada_data()
            
            logger.info("Sending data to cloud...")
            send_to_cloud(data)
            
        except Exception as e:
            logger.error(f"Error in sync cycle: {e}")
        
        logger.info(f"Sleeping for {SYNC_INTERVAL}s...")
        time.sleep(SYNC_INTERVAL)


if __name__ == "__main__":
    main()
