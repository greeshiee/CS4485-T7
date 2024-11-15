from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
from typing import List, Optional

app = FastAPI()

# Allow requests from React app on port 3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow React app's origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Define the Alert data model for validation
class Alert(BaseModel):
    alert_title: str
    alert_message: str
    field_name: str
    lower_bound: float
    higher_bound: float

class Device(BaseModel):
    device_id: int
    field_name: str
    value: float
@app.get("/columns")
async def get_columns():
    conn = get_devices_db_connection()
    cursor = conn.cursor()
    
    # Query the database for column names from the devices table
    cursor.execute("PRAGMA table_info(devices);")
    columns = cursor.fetchall()
    
    # Extract column names from the result
    column_names = [column["name"] for column in columns]
    conn.close()
    
    return {"columns": column_names}

# General function to get a DB connection
def get_db_connection(db_name: str):
    conn = sqlite3.connect(db_name)
    conn.row_factory = sqlite3.Row  # For accessing columns by name
    return conn

# Helper function to connect to the devices database
def get_devices_db_connection():
    return get_db_connection("devices.db")

# Helper function to connect to the alerts database
def get_alerts_db_connection():
    return get_db_connection("alerts.db")

# Helper function to check and create the devices table if it doesn't exist
def create_devices_table():
    conn = get_devices_db_connection()
    c = conn.cursor()
    
    # Create the devices table if it does not exist
    c.execute('''
        CREATE TABLE IF NOT EXISTS devices (
            device_id INTEGER PRIMARY KEY,
            device_type TEXT,
            os TEXT,
            manufacturer TEXT,
            network_operator TEXT,
            user_id INTEGER,
            name TEXT,
            age INTEGER,
            latitude REAL,
            longitude REAL,
            data_usage REAL,
            network_speed REAL,
            connection_duration INTEGER,
            session_start_time TEXT,
            cell_id INTEGER,
            signal_strength REAL,
            latency REAL,
            jitter REAL,
            packet_loss REAL
        );
    ''')
    conn.commit()
    conn.close()

# Helper function to check and create the alerts table if it doesn't exist
def create_alerts_table():
    conn = get_alerts_db_connection()
    c = conn.cursor()
    
    # Create the alerts table if it does not exist
    c.execute('''
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            alert_title TEXT NOT NULL,
            alert_message TEXT NOT NULL,
            field_name TEXT NOT NULL,
            lower_bound REAL NOT NULL,
            higher_bound REAL NOT NULL
        );
    ''')
    conn.commit()
    conn.close()

# FastAPI startup event to ensure the tables are created
@app.on_event("startup")
async def on_startup():
    # Create tables if they don't exist
    create_devices_table()
    create_alerts_table()
    print("Database and tables initialized.")

# Endpoint to fetch all alerts from the alerts database
@app.get("/alerts")
async def get_alerts(skip: int = 0, limit: int = 3):
    if limit <= 0:
        raise HTTPException(status_code=400, detail="Limit must be greater than 0.")

    conn = get_alerts_db_connection()
    cursor = conn.cursor()

    # Query a batch of alerts from the alerts table with pagination
    cursor.execute("SELECT * FROM alerts LIMIT ? OFFSET ?", (limit, skip))
    alerts = cursor.fetchall()

    # If no alerts are found, raise 404
    if not alerts:
        conn.close()
        raise HTTPException(status_code=404, detail="No alerts found.")
    
    conn.close()
    
    return {"alerts": alerts}

# Endpoint to check for triggered alerts based on device data and alert thresholds
@app.get("/check_device_alerts")
async def check_device_alerts():
    conn = get_devices_db_connection()
    cursor = conn.cursor()

    # Fetch all device data
    cursor.execute("SELECT * FROM devices")
    devices = cursor.fetchall()

    # Fetch all alert criteria
    alerts_conn = get_alerts_db_connection()
    alerts_cursor = alerts_conn.cursor()
    alerts_cursor.execute("SELECT * FROM alerts")
    alerts = alerts_cursor.fetchall()

    triggered_alerts = []

    # Check device data against each alert
    for device in devices:
        for alert in alerts:
            field_name = alert["field_name"]
            lower_bound = alert["lower_bound"]
            higher_bound = alert["higher_bound"]
            device_value = device[field_name]  # Get the value of the field from the device record
            
            # Check if the device value is outside the alert's bounds
            if device_value < lower_bound or device_value > higher_bound:
                triggered_alerts.append({
                    "device_id": device["device_id"],
                    "alert_title": alert["alert_title"],
                    "alert_message": alert["alert_message"],
                    "triggered_value": device_value,
                    "field_name": field_name,
                })

    conn.close()
    alerts_conn.close()

    if not triggered_alerts:
        raise HTTPException(status_code=404, detail="No triggered alerts.")
    
    return {"triggered_alerts": triggered_alerts}

# Endpoint to remove an alert from the alerts database by ID
class AlertId(BaseModel):
    alert_id: int

@app.post("/remove_alert")
async def remove_alert(alert: AlertId):
    conn = get_alerts_db_connection()
    c = conn.cursor()

    try:
        # Delete the alert from the alerts table
        c.execute("DELETE FROM alerts WHERE id = ?", (alert.alert_id,))
        conn.commit()
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=400, detail=f"Error removing alert: {str(e)}")
    
    conn.close()
    return {"message": "Alert removed successfully!"}
