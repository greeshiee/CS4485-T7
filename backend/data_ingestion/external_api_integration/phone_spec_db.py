import sqlite3

def init_db():
    """Create the database and phones table if they don't exist."""
    conn = sqlite3.connect("phones.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS phones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            brand TEXT,
            model TEXT
        )
    """)
    conn.commit()
    conn.close()

def insert_phone(brand, model):
    """Insert a phone brand and model into the database."""
    conn = sqlite3.connect("phones.db")
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO phones (brand, model) VALUES (?, ?)
    """, (brand, model))
    conn.commit()
    conn.close()

def get_all_phones():
    """Retrieve all phones from the database."""
    conn = sqlite3.connect("phones.db")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM phones")
    phones = cursor.fetchall()
    conn.close()
    return phones
