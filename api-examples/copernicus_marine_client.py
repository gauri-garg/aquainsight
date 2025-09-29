#
# This is an example Python script for fetching data from the Copernicus Marine Service.
#
# IMPORTANT: This script is a standalone example and is NOT integrated into the Next.js application.
# To use this in your project, you would need to deploy it as a separate backend service (e.g., using
# Flask on Google Cloud Run) and create an API route in your Next.js app to call it.
#
# --- Prerequisites ---
# 1. Python 3.x installed.
# 2. A Copernicus Marine Service account. Register at: https://marine.copernicus.eu/
# 3. Your Copernicus credentials (username/password) stored as environment variables:
#    - COPERNICUS_MARINE_USERNAME
#    - COPERNICUS_MARINE_PASSWORD
# 4. Required Python packages installed. You can install them using the requirements.txt file:
#    pip install -r requirements.txt
#
# --- How to Run this Example Script ---
# You can run this script directly from your terminal to test it:
#
# COPERNICUS_MARINE_USERNAME="your_username" \
# COPERNICUS_MARINE_PASSWORD="your_password" \
# python api-examples/copernicus_marine_client.py
#

import copernicus_marine_client as copernicusmarine
import xarray as xr
import os
import sys
import json
from datetime import datetime, timedelta

# --- Configuration ---

# This is a Global Ocean Physics Analysis and Forecast dataset.
# It provides daily mean fields for temperature, salinity, currents, and sea level.
# You can find more datasets on the Copernicus Marine catalog.
# More info: https://data.marine.copernicus.eu/product/GLOBAL_ANALYSISFORECAST_PHY_001_024/
DATASET_ID = "cmems_mod_glo_phy-cur_anfc_0.083deg_P1D-m"

# Define available variables in this dataset. Note that not all requested
# variables might be available in a single dataset. This example uses a dataset
# that provides the most commonly requested ones.
# - 'thetao': Sea Water Potential Temperature
# - 'so': Sea Water Salinity
# - 'uo', 'vo': Eastward and Northward Sea Water Velocity (Currents)
# - 'zos': Sea Surface Height Above Geoid (Sea Level Anomaly)
AVAILABLE_VARIABLES = ["thetao", "so", "uo", "vo", "zos"]

# Mapping from user-friendly names to Copernicus variable names
VARIABLE_MAP = {
    'temperature': 'thetao',
    'salinity': 'so',
    'current_speed': ['uo', 'vo'],
    'sea_level_anomaly': 'zos',
    # Note: Density, wave height, tide, and mixing index are not in this specific dataset.
    # You would need to find and query other specific Copernicus datasets to get them.
}

def get_marine_data(date_str, lat, lon, variables_requested):
    """
    Fetches marine data from the Copernicus Marine Service for a specific date,
    location, and set of variables.

    Args:
        date_str (str): The date in 'YYYY-MM-DD' format.
        lat (float): The latitude.
        lon (float): The longitude.
        variables_requested (list): A list of user-friendly variable names.

    Returns:
        dict: A dictionary containing the fetched data.
    """
    print(f"Fetching data for Date: {date_str}, Lat: {lat}, Lon: {lon}")
    print(f"Requested variables: {variables_requested}")

    # --- Validate Credentials ---
    if not os.getenv('COPERNICUS_MARINE_USERNAME') or not os.getenv('COPERNICUS_MARINE_PASSWORD'):
        raise EnvironmentError(
            "Copernicus credentials not found. Please set the "
            "COPERNICUS_MARINE_USERNAME and COPERNICUS_MARINE_PASSWORD environment variables."
        )

    # --- Prepare Query Parameters ---
    try:
        target_date = datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        raise ValueError("Invalid date format. Please use YYYY-MM-DD.")

    # The dataset provides daily means, so we request a small time window around the target date.
    start_datetime = target_date.strftime("%Y-%m-%d 00:00:00")
    end_datetime = (target_date + timedelta(days=1)).strftime("%Y-%m-%d 00:00:00")
    
    # We query a small bounding box around the point of interest.
    min_lon, max_lon = lon - 0.1, lon + 0.1
    min_lat, max_lat = lat - 0.1, lat + 0.1
    
    # We select the surface level for all variables.
    minimum_depth = 0.51

    # Convert requested variables to Copernicus names
    copernicus_vars = []
    for var in variables_requested:
        mapped = VARIABLE_MAP.get(var)
        if mapped:
            if isinstance(mapped, list):
                copernicus_vars.extend(mapped)
            else:
                copernicus_vars.append(mapped)
    
    # Ensure no duplicates
    copernicus_vars = list(set(copernicus_vars))
    print(f"Querying Copernicus variables: {copernicus_vars}")


    # --- Query Copernicus API ---
    try:
        # This function performs the actual download and returns a netCDF file path.
        dataset = copernicusmarine.read_dataset(
            dataset_id=DATASET_ID,
            variables=copernicus_vars,
            start_datetime=start_datetime,
            end_datetime=end_datetime,
            minimum_longitude=min_lon,
            maximum_longitude=max_lon,
            minimum_latitude=min_lat,
            maximum_latitude=max_lat,
            minimum_depth=minimum_depth,
            maximum_depth=minimum_depth,
            # This forces a download even if a cached file exists.
            # For a production app, you might want to set this to False.
            force_download=True
        )
        
        # --- Process the Data ---
        # The data is returned as an xarray.Dataset object.
        # We select the data point closest to our requested lat/lon.
        point_data = dataset.sel(latitude=lat, longitude=lon, method="nearest")

        result = {
            'request': {
                'date': date_str,
                'latitude': lat,
                'longitude': lon,
                'variables': variables_requested,
            },
            'data': {}
        }
        
        # Extract the values for the requested variables
        for var_name, copernicus_name in VARIABLE_MAP.items():
            if var_name in variables_requested:
                if isinstance(copernicus_name, list):
                    # Handle composite values like current speed
                    if var_name == 'current_speed':
                        u = point_data['uo'].values.item()
                        v = point_data['vo'].values.item()
                        # Calculate magnitude: sqrt(u^2 + v^2)
                        speed = (u**2 + v**2)**0.5
                        result['data'][var_name] = f"{speed:.2f} m/s"
                elif copernicus_name in point_data:
                    value = point_data[copernicus_name].values.item()
                    unit = point_data[copernicus_name].attrs.get('units', '')
                    result['data'][var_name] = f"{value:.2f} {unit}"
        
        return result

    except Exception as e:
        print(f"An error occurred: {e}", file=sys.stderr)
        return {"error": str(e)}

    finally:
        # Clean up the downloaded netCDF file
        copernicusmarine.delete_cache()


# --- Example Usage ---
# This block will only run when the script is executed directly.
if __name__ == "__main__":
    # Example parameters
    example_date = datetime.now().strftime("%Y-%m-%d")
    example_lat = 34.05  # Los Angeles
    example_lon = -118.25
    example_vars = ['temperature', 'salinity', 'sea_level_anomaly', 'current_speed']

    print("--- Running Copernicus Marine Client Example ---")
    data = get_marine_data(example_date, example_lat, example_lon, example_vars)
    
    # Pretty-print the JSON result
    print("\n--- Result ---")
    print(json.dumps(data, indent=2))
    print("--- End of Example ---")
