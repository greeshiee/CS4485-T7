import sqlite3
import os
import random
from datetime import datetime, timedelta

# Global ID counter for unique device IDs
device_id_counter = 1

def create_alerts_db(db_path):
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
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

def create_alert_specific_db(alert_db_path):
    os.makedirs(os.path.dirname(alert_db_path), exist_ok=True)
    conn = sqlite3.connect(alert_db_path)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS triggered_faults (
            device_id INTEGER,
            alert_title TEXT,
            triggered_value REAL,
            field_name TEXT,
            timestamp TEXT DEFAULT CURRENT_TIMESTAMP
        );
    ''')
    conn.commit()
    conn.close()

def generate_fake_alerts():
    alert_titles = ["High Latency", "Low Signal Strength", "High Data Usage", "Low Network Speed", "High Packet Loss", "High Jitter"]
    alerts = []
    for title in alert_titles:
        alert_message = f"Alert triggered for {title}"
        field_name = random.choice(["latency", "signal_strength", "data_usage", "network_speed", "packet_loss", "jitter"])
        lower_bound = random.uniform(1.0, 5.0)
        higher_bound = lower_bound + random.uniform(0.5, 2.0)
        alerts.append({
            "alert_title": title,
            "alert_message": alert_message,
            "field_name": field_name,
            "lower_bound": lower_bound,
            "higher_bound": higher_bound
        })
    return alerts

def create_databases_for_all(db_dir):
    global device_id_counter
    os.makedirs(db_dir, exist_ok=True)
    for i in range(1, 4):  # Creating 3 main databases (db1.db, db2.db, db3.db)
        # Create a folder for each database (e.g., db1, db2, db3)
        db_folder = os.path.join(db_dir, f"db{i}")
        os.makedirs(db_folder, exist_ok=True)

        db_name = f"db{i}.db"
        db_path = os.path.join(db_folder, db_name)

        # Create the main database
        conn = sqlite3.connect(db_path)
        c = conn.cursor()
        c.execute('''
            CREATE TABLE IF NOT EXISTS devices (
                device_id INTEGER PRIMARY KEY,
                device_type TEXT,
                name TEXT,
                latency REAL,
                ping REAL,
                signal_strength REAL,
                data_usage REAL,
                network_speed REAL,
                packet_loss REAL,
                jitter REAL
            );
        ''')

        # Insert unique devices data into the main database with specific device parameters
        for _ in range(5):  # Create 5 unique devices for each database
            device_type = random.choice(["mobile", "tablet", "laptop", "router"])
            device_name = f"{device_type}_device_{device_id_counter}"
            
            # Randomly assign values to the device attributes (latency, ping, etc.)
            latency = random.uniform(10.0, 100.0)  # Simulating latency in ms
            ping = random.uniform(1.0, 50.0)  # Simulating ping in ms
            signal_strength = random.uniform(20.0, 100.0)  # Signal strength percentage
            data_usage = random.uniform(0.0, 10.0)  # Simulating data usage in GB
            network_speed = random.uniform(1.0, 100.0)  # Network speed in Mbps
            packet_loss = random.uniform(0.0, 10.0)  # Packet loss percentage
            jitter = random.uniform(1.0, 10.0)  # Jitter in ms

            c.execute('''
                INSERT INTO devices (device_id, device_type, name, latency, ping, signal_strength, data_usage, network_speed, packet_loss, jitter)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (device_id_counter, device_type, device_name, latency, ping, signal_strength, data_usage, network_speed, packet_loss, jitter))
            device_id_counter += 1  # Increment global ID counter

        conn.commit()
        conn.close()

        # Create the alerts database for each main database
        alerts_db_path = os.path.join(db_folder, "alerts.db")
        create_alerts_db(alerts_db_path)

        alerts = generate_fake_alerts()

        conn = sqlite3.connect(alerts_db_path)
        c = conn.cursor()
        for alert in alerts:
            c.execute('''
                INSERT INTO alerts (alert_title, alert_message, field_name, lower_bound, higher_bound)
                VALUES (?, ?, ?, ?, ?)
            ''', (alert["alert_title"], alert["alert_message"], alert["field_name"], alert["lower_bound"], alert["higher_bound"]))
        conn.commit()
        conn.close()

        # Create alert-specific databases (triggered faults)
        for alert in alerts:
            alert_db_name = f"alert_{alert['alert_title'].replace(' ', '_')}.db"
            alert_db_path = os.path.join(db_folder, alert_db_name)
            create_alert_specific_db(alert_db_path)
            for _ in range(random.randint(1, 3)):  # Create 1-3 triggered faults per alert
                fault_timestamp = (datetime.now() - timedelta(days=random.randint(0, 7))).strftime("%Y-%m-%d %H:%M:%S")
                device_id = random.randint(1, device_id_counter - 1)
                triggered_value = random.uniform(0.5, 10.0)
                conn = sqlite3.connect(alert_db_path)
                c = conn.cursor()
                c.execute('''
                    INSERT INTO triggered_faults (device_id, alert_title, triggered_value, field_name, timestamp)
                    VALUES (?, ?, ?, ?, ?)
                ''', (device_id, alert["alert_title"], triggered_value, alert["field_name"], fault_timestamp))
                conn.commit()
                conn.close()

        print(f"Database {db_name} and its alerts structure created successfully!")

def main():
    db_dir = "databases"  # Main directory for all databases
    create_databases_for_all(db_dir)
    print("All databases and alerts data have been created.")

if __name__ == "__main__":
    main()
