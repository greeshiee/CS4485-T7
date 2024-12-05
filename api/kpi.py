import logging
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import os
from typing import List, Dict
from pydantic import BaseModel

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Configure CORS for the sub-application
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

def get_db_connection():
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        db_path = os.path.join(script_dir, 'Databases/database_sample_data.db')
        conn = sqlite3.connect(db_path, timeout=10)
        conn.execute('PRAGMA journal_mode=WAL')
        conn.row_factory = sqlite3.Row
        return conn
    except sqlite3.Error as e:
        print(f"Database connection error: {e}")
        raise HTTPException(status_code=500, detail=f"Database connection error: {str(e)}")

def ensure_table_exists(conn):
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS kpis (
        id INTEGER PRIMARY KEY AUTOINCREMENT
    )
    """)
    conn.commit()

@app.get("/")
async def root():
    return {"message": "FastAPI server is running"}

@app.get("/api/kpis")
async def read_kpis(table: str):
    try:
        # Sanitize the table name to prevent SQL injection
        if not table.isidentifier():
            raise HTTPException(status_code=400, detail="Invalid table name")

        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if the table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Table not found")

        # Use parameterized query to fetch data
        query = f"SELECT * FROM {table}"
        cursor.execute(query)
        kpis = cursor.fetchall()
        conn.close()
        return [dict(row) for row in kpis]
    except sqlite3.Error as e:
        logger.error(f"Database query error: {e}")
        raise HTTPException(status_code=500, detail="Database query error")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Unexpected error")

class ImportData(BaseModel):
    data: List[Dict]
    table_name: str

@app.post("/api/import_kpis")
async def import_kpis(import_data: ImportData):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        data = import_data.data
        table_name = import_data.table_name

        logger.info(f"Attempting to import {len(data)} rows into table '{table_name}'")

        if not data:
            raise HTTPException(status_code=400, detail="No data provided for import")

        # Dynamically create or alter the table based on the first row of data
        columns = list(data[0].keys())
        create_table_query = f"""
        CREATE TABLE IF NOT EXISTS {table_name} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            {', '.join(f'"{col}" TEXT' for col in columns)}
        )
        """
        cursor.execute(create_table_query)
        logger.info(f"Table '{table_name}' created or already exists")

        # Check for new columns and add them if necessary
        existing_columns = [row[1] for row in cursor.execute(f"PRAGMA table_info({table_name})")]
        for col in columns:
            if col not in existing_columns:
                cursor.execute(f'ALTER TABLE {table_name} ADD COLUMN "{col}" TEXT')
                logger.info(f"Added new column '{col}' to table '{table_name}'")

        # Prepare the insert query
        insert_columns = ', '.join(f'"{col}"' for col in columns)
        placeholders = ', '.join('?' for _ in columns)
        insert_query = f'INSERT INTO {table_name} ({insert_columns}) VALUES ({placeholders})'

        # Insert data
        for row in data:
            values = [row.get(col, None) for col in columns]
            try:
                cursor.execute(insert_query, values)
            except sqlite3.Error as e:
                logger.error(f"Error inserting row: {row}")
                logger.error(f"SQLite error: {e}")
                raise HTTPException(status_code=500, detail=f"Error inserting data: {str(e)}")

        conn.commit()
        return {"message": f"Successfully imported {len(data)} rows into table {table_name}"}
    except sqlite3.Error as e:
        logger.error(f"Database error: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
    finally:
        if conn:
            conn.close()

@app.get("/api/tables")
async def list_tables():
    logger.info("Received request to list tables")
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        conn.close()
        table_names = [table['name'] for table in tables]
        logger.info(f"Tables found: {table_names}")
        return table_names
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=str(e))