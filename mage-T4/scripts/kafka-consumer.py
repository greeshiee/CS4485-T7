from kafka import KafkaConsumer
import sqlite3
import json

# Connect to SQLite (or create the database file if it doesn't exist)
conn = sqlite3.connect('/student_grades.db')
cursor = conn.cursor()

# Create a table for storing the student grades if it doesn't already exist
cursor.execute('''
    CREATE TABLE IF NOT EXISTS grades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        grade TEXT
    )
''')
conn.commit()

# Consume messages from Kafka
consumer = KafkaConsumer('student-grades', bootstrap_servers='localhost:9092', auto_offset_reset='earliest')

print("Consuming and saving items to SQLite database from Kafka topic \"student-grades\". Hit Ctrl+C to stop...")

for message in consumer:
    # Decode and parse the JSON message
    data = json.loads(message.value.decode('utf-8'))
    name = data['name']
    grade = data['grade']
    
    # Insert the data into the SQLite database
    cursor.execute('''
        INSERT INTO grades (name, grade) 
        VALUES (?, ?)
    ''', (name, grade))
    conn.commit()

    print(f"Saved \"{name}\" with grade \"{grade}\" to SQLite")

# Close SQLite connection when done
cursor.close()
conn.close()
