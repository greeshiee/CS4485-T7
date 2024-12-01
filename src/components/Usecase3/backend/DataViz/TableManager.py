import sqlite3
import pandas as pd
from typing import List, Any, Callable, Optional, Dict
from pydantic import BaseModel

class TableResponse(BaseModel):
    table_id: int
    table_name: str
    column_names: List[str]
    rows: List[List]

class TableMapResponse(BaseModel):
    table_ids: List[int]
    table_names: List[str]
    table_columns: List[List[str]]

class TableManager:
    def __init__(self, get_connection_callback: Callable[[], sqlite3.Connection]):
        self.get_sql_db_connection = get_connection_callback
        self.__create_tables()

    def __create_tables(self):
        with self.get_sql_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS master_tables (
                table_id INTEGER PRIMARY KEY AUTOINCREMENT,
                db_name TEXT GENERATED ALWAYS AS ('tbl_' || table_id) VIRTUAL,
                table_name TEXT NOT NULL
            )
            ''')
            conn.commit()

    def get_table_id_mp(self) -> TableMapResponse:
        TABLE_IDS = []
        TABLE_NAMES = []
        TABLE_COLUMNS = []
        with self.get_sql_db_connection() as conn:
            SELECT_QUERY = '''SELECT table_id, table_name, db_name FROM master_tables'''
            curs = conn.cursor()
            curs.execute(SELECT_QUERY)
            for table_id, table_name, db_name in curs.fetchall():
                TABLE_IDS.append(table_id)
                TABLE_NAMES.append(table_name)

                db_cursor = conn.execute(f"PRAGMA table_info({db_name})")
                columns = [row[1] for row in db_cursor.fetchall()]
                TABLE_COLUMNS.append(columns)

        return TableMapResponse(
            table_ids=TABLE_IDS,
            table_names=TABLE_NAMES,
            table_columns=TABLE_COLUMNS
        )

    def insert_master_table(self, table_name: str) -> str:
        with self.get_sql_db_connection() as conn:
            cursor = conn.cursor()
            INSERTION_QUERY = '''
                INSERT INTO master_tables (table_name) VALUES (?)
                RETURNING db_name
            '''
            cursor.execute(INSERTION_QUERY, (table_name,))
            row = cursor.fetchone()
            (db_name, ) = row if row else None
            conn.commit()
        return db_name

    def add_table(self, table_name: str, dataframe: pd.DataFrame, tbl_response) -> Optional[TableResponse]:
        with self.get_sql_db_connection() as conn:
            cursor = conn.cursor()
            db_name = self.insert_master_table(table_name)

            column_definitions = []
            for column_name, dtype in dataframe.dtypes.items():
                escaped_column = f"[{column_name}]"
                if pd.api.types.is_integer_dtype(dtype):
                    column_type = "INTEGER"
                elif pd.api.types.is_float_dtype(dtype):
                    column_type = "REAL"
                elif pd.api.types.is_bool_dtype(dtype):
                    column_type = "BOOLEAN"
                else:
                    column_type = "TEXT"
                column_definitions.append(f"{escaped_column} {column_type}")

            columns = ", ".join(column_definitions)
            create_table_query = f"""
            CREATE TABLE IF NOT EXISTS {db_name} (
                {columns}
            )
            """
            cursor.execute(create_table_query)

            escaped_columns = [f"[{col}]" for col in dataframe.columns]
            placeholders = ", ".join(["?" for _ in dataframe.columns])
            insert_query = f"""
            INSERT INTO {db_name} ({', '.join(escaped_columns)})
            VALUES ({placeholders})
            """
            cursor.executemany(insert_query, dataframe.values.tolist())
            conn.commit()
        if tbl_response:
            return self.get_table_response(db_name)

    def get_table_info(self, *, table_id: int) -> Dict[str, str]:
        with self.get_sql_db_connection() as conn:
            SELECT_TABLE_METADATA = """SELECT * FROM master_tables WHERE table_id = ? LIMIT 1"""
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(SELECT_TABLE_METADATA, (table_id, ))
            row = cursor.fetchone()
            tbl_mp = dict(row)
        return tbl_mp

    def get_table_response_by_id(self, table_id: int, *, columns: List[str] = None) -> TableResponse:
        tbl_mp = self.get_table_info(table_id=table_id)
        return self.get_table_response(db_name=tbl_mp['db_name'], columns=columns)
        # with self.get_sql_db_connection() as conn:

        #     DB_NAME = tbl_mp['db_name']
        #     SELECT_TABLE_DATA = f"""SELECT * FROM {DB_NAME}"""
        #     df = pd.read_sql_query(SELECT_TABLE_DATA, con=conn)
        
        # return TableResponse(
        #     table_id=tbl_mp['table_id'],
        #     table_name=tbl_mp['table_name'],
        #     column_names=list(df.columns),
        #     rows=df.values.tolist()
        # )

    def get_table_response(self, db_name: str, *, columns: List[str] = None) -> TableResponse:
        with self.get_sql_db_connection() as conn:
            if columns is None:
                SELECT_TABLE_DATA = f"SELECT * FROM {db_name}"
            else:
                selected_columns = ", ".join(f"`{column}`" for column in columns)
                SELECT_TABLE_DATA = f"SELECT {selected_columns} FROM {db_name}"
            df = pd.read_sql_query(SELECT_TABLE_DATA, con=conn)

            # Fetch table metadata
            SELECT_TABLE_METADATA = """SELECT * FROM master_tables WHERE db_name = ? LIMIT 1"""
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(SELECT_TABLE_METADATA, (db_name, ))
            row = cursor.fetchone()
            tbl_mp = dict(row)

        return TableResponse(
            table_id=tbl_mp['table_id'],
            table_name=tbl_mp['table_name'],
            column_names=list(df.columns),
            rows=df.values.tolist()
        )