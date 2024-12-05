from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import sqlite3
import os

app = FastAPI()

selected_database = ""

# Allowing cross-origin requests
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model for adding a new alert
class Alert(BaseModel):
    alert_title: str
    alert_message: str
    field_name: str
    lower_bound: float
    higher_bound: float

def get_db_path(database: str, file_name: str):
    """
    Helper function to get the full path of the database file.
    """
    return f'../databases/{database}/{file_name}'

@app.get("/list_databases")
def list_databases():
    """
    Returns the list of available databases (subdirectories) in the 'databases' directory.
    """
    database_dir = '../databases'
    
    try:
        if not os.path.exists(database_dir):
            raise HTTPException(status_code=500, detail="Databases directory not found")

        # List all subdirectories (representing databases) in the 'databases' directory
        databases = [
            f for f in os.listdir(database_dir)
            if os.path.isdir(os.path.join(database_dir, f))  # Ensure it's a directory
        ]
        return {"databases": databases}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/columns_from_db")
def get_columns(database: str):
    """
    Returns the list of column names from a specific table in the selected database, excluding the first 3 columns.
    """
    database_path = get_db_path(database, f"{database}.db")
    
    if not os.path.exists(database_path):
        raise HTTPException(status_code=404, detail="Database not found")

    try:
        conn = sqlite3.connect(database_path)
        cursor = conn.cursor()

        # Query to get the columns from the 'alerts' table
        cursor.execute("PRAGMA table_info(alerts);")
        columns = cursor.fetchall()

        if not columns:
            raise HTTPException(status_code=404, detail="Table 'alerts' not found in the database")

        # Extracting just the column names, excluding the first 3 columns
        column_names = [column[1] for column in columns[3:]]  # Skip first 3 columns

        conn.close()
        return {"columns": column_names}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching columns: {str(e)}")

@app.get("/alerts")
def get_alerts(database: str):
    """
    Returns a list of alerts for a specific database.
    """
    database_path = get_db_path(database, "alerts.db")
    
    if not os.path.exists(database_path):
        raise HTTPException(status_code=404, detail="Alerts database not found")

    try:
        conn = sqlite3.connect(database_path)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM alerts")
        alerts = cursor.fetchall()
        conn.close()

        alert_list = [
            {
                "id": alert[0],  # Assuming the first column is the alert ID
                "alert_title": alert[1],
                "alert_message": alert[2],
                "field_name": alert[3],
                "lower_bound": alert[4],
                "higher_bound": alert[5],
            }
            for alert in alerts
        ]

        return {"alerts": alert_list}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching alerts: {str(e)}")

@app.post("/add_alert")
def add_alert(alert: Alert, database: str):
    """
    Add an alert to the database.
    """
    database_path = get_db_path(database, "alerts.db")
    
    if not os.path.exists(database_path):
        raise HTTPException(status_code=404, detail="Alerts database not found")

    try:
        conn = sqlite3.connect(database_path)
        cursor = conn.cursor()

        cursor.execute(
            "INSERT INTO alerts (alert_title, alert_message, field_name, lower_bound, higher_bound) VALUES (?, ?, ?, ?, ?)",
            (alert.alert_title, alert.alert_message, alert.field_name, alert.lower_bound, alert.higher_bound),
        )
        conn.commit()
        conn.close()

        return {"message": "Alert added successfully"}

    except sqlite3.IntegrityError as e:
        raise HTTPException(status_code=422, detail=f"Integrity error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding alert: {str(e)}")


@app.post("/remove_alert")
def remove_alert(alert: dict, database: str):
    """
    Remove an alert from the database.
    """
    alert_id = alert.get("alert_id")
    database_path = get_db_path(database, "alerts.db")
    
    if not os.path.exists(database_path):
        raise HTTPException(status_code=404, detail="Alerts database not found")

    try:
        conn = sqlite3.connect(database_path)
        cursor = conn.cursor()

        cursor.execute("DELETE FROM alerts WHERE id = ?", (alert_id,))
        conn.commit()
        conn.close()

        return {"message": "Alert removed successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error removing alert: {str(e)}")

@app.get("/raw_data")
def get_raw_data(database: str, table: str):
    """
    Returns the raw data from a specific table in the selected database.
    """
    database_path = get_db_path(database, f"{database}.db")
    
    if not os.path.exists(database_path):
        raise HTTPException(status_code=404, detail="Database not found")

    try:
        conn = sqlite3.connect(database_path)
        cursor = conn.cursor()

        # Fetch data from the specified table
        cursor.execute(f"SELECT * FROM {table}")  # Using parameterized query for table name is not possible directly
        raw_data = cursor.fetchall()
        conn.close()

        return {"raw_data": raw_data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching raw data: {str(e)}")
@app.get("/columns_from_devices_table")
def get_columns_from_devices(database: str):
    """
    Returns the list of column names from the 'devices' table in the selected database.
    """
    database_path = get_db_path(database, f"{database}.db")
    
    if not os.path.exists(database_path):
        raise HTTPException(status_code=404, detail="Database not found")

    try:
        conn = sqlite3.connect(database_path)
        cursor = conn.cursor()

        # Query to get the columns from the 'devices' table
        cursor.execute("PRAGMA table_info(devices);")
        columns = cursor.fetchall()

        if not columns:
            raise HTTPException(status_code=404, detail="Table 'devices' not found in the database")

        # Extracting just the column names
        
        filtered_columns = [
                column[1] for column in columns  # column[1] is the column name
                if column[2].upper() == "REAL" and column[5] == 0  # column[2] is the type, column[5] is PK flag
            ]

        conn.close()
        return {"columns": filtered_columns}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching columns: {str(e)}")
    
class DetectFaultsRequest(BaseModel):
    database: str

@app.post("/detect_faults")
def detect_faults(request: DetectFaultsRequest):
    """
    Detects faults based on current alerts and adds them to faults.db if found.
    """
    database = request.database
    alerts_database_path = get_db_path(database, "alerts.db")
    main_database_path = get_db_path(database, f"{database}.db")
    faults_database_path = get_db_path(database, "faults.db")

    global selected_database
    selected_database = database

    # Ensure all required databases exist
    for path in [alerts_database_path, main_database_path]:
        if not os.path.exists(path):
            raise HTTPException(status_code=404, detail=f"Database not found: {path}")

    try:
        # Read alerts from alerts.db
        conn_alerts = sqlite3.connect(alerts_database_path)
        cursor_alerts = conn_alerts.cursor()
        cursor_alerts.execute("SELECT * FROM alerts")
        alerts = cursor_alerts.fetchall()
        conn_alerts.close()

        if not alerts:
            return {"message": "No alerts found to process"}

        # Connect to the main database to scan for faults
        conn_main = sqlite3.connect(main_database_path)
        cursor_main = conn_main.cursor()

        print(faults_database_path)

        # Ensure faults.db exists and has the required table
        if not os.path.exists(faults_database_path):
            conn_faults = sqlite3.connect(faults_database_path)
            cursor_faults = conn_faults.cursor()
            cursor_faults.execute("""
                CREATE TABLE IF NOT EXISTS faults (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    alert_id INTEGER,
                    alert_title TEXT,
                    alert_message TEXT,
                    field_name TEXT,
                    fault_value REAL,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn_faults.commit()
            conn_faults.close()

        conn_faults = sqlite3.connect(faults_database_path)
        cursor_faults = conn_faults.cursor()

        # Loop through alerts and check for faults
        for alert in alerts:
            alert_id, alert_title, alert_message, field_name, lower_bound, higher_bound = alert

            # Check if the field exists in the main database
            try:
                cursor_main.execute(f"SELECT {field_name} FROM devices")
                values = cursor_main.fetchall()
            except sqlite3.OperationalError:
                continue  # Skip alerts with invalid fields

            # Detect faults
            for (value,) in values:
                if value < lower_bound or value > higher_bound:
                    # Insert the fault into faults.db
                    cursor_faults.execute("""
                        INSERT INTO faults (alert_id, alert_title, alert_message, field_name, fault_value)
                        VALUES (?, ?, ?, ?, ?)
                    """, (alert_id, alert_title, alert_message, field_name, value))

        conn_faults.commit()
        conn_main.close()
        conn_faults.close()

        return {"message": "Fault detection completed successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during fault detection: {str(e)}")

class RemoveNotificationRequest(BaseModel):
    id: int  # ID of the notification to remove

@app.post("/remove_notification")
def remove_notification(request: RemoveNotificationRequest):
    """
    Removes a notification (fault) from the faults.db database.
    """
    global selected_database

    faults_database_path = get_db_path(selected_database, "faults.db")

    # Ensure faults.db exists
    if not os.path.exists(faults_database_path):
        raise HTTPException(status_code=404, detail="Faults database not found")

    try:
        conn = sqlite3.connect(faults_database_path)
        cursor = conn.cursor()

        # Remove the notification by ID
        cursor.execute("DELETE FROM faults WHERE id = ?", (request.id,))
        conn.commit()

        # Check if the deletion was successful
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Notification not found")

        conn.close()
        return {"message": f"Notification with ID {request.id} removed successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error removing notification: {str(e)}")

@app.get("/get_notifications")
def get_notifications():
    """
    Returns a list of notifications (faults) from the faults.db database.
    """
    global selected_database
    print(f"Selected Database: {selected_database}")
    if not selected_database:
        raise HTTPException(status_code=400, detail="No database selected")

    faults_database_path = get_db_path(selected_database, "faults.db")

    print(faults_database_path)

    # Ensure faults.db exists
    if not os.path.exists(faults_database_path):
        raise HTTPException(status_code=404, detail="Faults database not found")

    try:
        conn = sqlite3.connect(faults_database_path)
        cursor = conn.cursor()

        # Fetch all notifications from the faults table
        cursor.execute("SELECT * FROM faults")
        faults = cursor.fetchall()
        conn.close()

        # Map the faults to a list of dictionaries
        notifications = [
            {
                "id": fault[0],
                "alert_id": fault[1],
                "alert_title": fault[2],
                "alert_message": fault[3],
                "field_name": fault[4],
                "fault_value": fault[5],
                "timestamp": fault[6],
            }
            for fault in faults
        ]

        return {"notifications": notifications}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching notifications: {str(e)}")
