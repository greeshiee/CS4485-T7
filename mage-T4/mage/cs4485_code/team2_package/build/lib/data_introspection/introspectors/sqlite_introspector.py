import sqlite3
from typing import List, Dict
from .base import DataIntrospector, TableMetadata

class SQLiteIntrospector(DataIntrospector):
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.validate_structure()
        
    def get_table_names(self) -> List[str]:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            return [row[0] for row in cursor.fetchall()]
    
    def get_table_metadata(self, table_name: str) -> TableMetadata:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?;", (table_name,))
            if not cursor.fetchone():
                raise ValueError(f"Table does not exist: {table_name}")
            
            cursor.execute(f"PRAGMA table_info({table_name});")
            columns = [
                {"name": row[1], "type": row[2]}
                for row in cursor.fetchall()
            ]
            
            cursor.execute(f"SELECT COUNT(*) FROM {table_name};")
            row_count = cursor.fetchone()[0]
            
            return TableMetadata(
                name=table_name,
                columns=columns,
                row_count=row_count,
                file_path=self.db_path
            )
    
    def validate_structure(self) -> bool:
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
                return True
        except sqlite3.Error as e:
            raise ValueError(f"Invalid SQLite database: {str(e)}")