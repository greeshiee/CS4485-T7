from typing import Dict, List, NamedTuple, Callable, Optional
import sqlite3
import matplotlib.pyplot as pl
from pydantic import BaseModel
import seaborn as sns
import pandas as pd
import numpy as np
import os

class Axes(NamedTuple):
    ax0: str
    ax1: str

    def to_list(self):
        return [self.ax0, self.ax1]

class PlotSize(NamedTuple):
    width: int
    height: int

class Coordinates(NamedTuple):
    x_coord: int
    y_coord: int

class Graph(BaseModel):
    table_id: int
    table_name: str
    graph_id: int
    graph_title: str
    graph_type: str
    ax: Axes
    rows: list[list]

    xy_coords: Optional[Coordinates]
    plotsize: Optional[PlotSize]

class GraphQueryParam(BaseModel):
    table_id: str
    graph_title: str
    graph_type: str
    ax0: str
    ax1: str

class GraphMapResponse(BaseModel):
    table_ids: List[int]
    table_names: List[str]
    graph_ids: List[int]
    graph_titles: List[str]
    graph_types: List[str]
    axes: List[Axes]

class GraphManager:
    def __init__(self, get_connection_callback: Callable[[], sqlite3.Connection]):
        self.get_sql_db_connection = get_connection_callback
        self.__create_tables()

    def __create_tables(self):
        with self.get_sql_db_connection() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS graphs (
                    graph_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    table_id INTEGER NOT NULL,
                    graph_title TEXT NOT NULL,
                    graph_type TEXT CHECK(graph_type IN ('Bar', 'Line', 'Pie')) NOT NULL,
                    ax0 TEXT NOT NULL,
                    ax1 TEXT NOT NULL,
                    FOREIGN KEY (table_id) REFERENCES master_tables(table_id) ON DELETE CASCADE
                )
            """)
            conn.commit()

    def get_graph_map_response(self):
        TABLE_IDS = []
        TABLE_NAMES = []
        GRAPH_IDS = []
        GRAPH_TITLES = []
        GRAPH_TYPES = []
        AXES = []
        with self.get_sql_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT 
                    mt.table_id, mt.table_name,
                    g.graph_id, g.graph_title, 
                    g.graph_type, g.ax0, g.ax1
                FROM master_tables mt
                JOIN graphs g ON mt.table_id = g.table_id
            ''')
            rows = cursor.fetchall()

            for row in rows:
                table_id, table_name, graph_id, graph_title, graph_type, ax0, ax1 = row

                TABLE_IDS.append(table_id)
                TABLE_NAMES.append(table_name)
                GRAPH_IDS.append(graph_id)
                GRAPH_TITLES.append(graph_title)
                GRAPH_TYPES.append(graph_type)
                AXES.append(Axes(ax0=ax0, ax1=ax1))

            # Create GraphMapResponse object
            response = GraphMapResponse(
                table_ids=TABLE_IDS,
                table_names=TABLE_NAMES,
                graph_ids=GRAPH_IDS,
                graph_titles=GRAPH_TITLES,
                graph_types=GRAPH_TYPES,
                axes=AXES
            )
            
            return response

    def get_graph_metadata(self, graph_id: int) -> Dict:
        with self.get_sql_db_connection() as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute('''
                SELECT 
                    mt.table_id, mt.table_name,
                    g.graph_id, g.graph_title, 
                    g.graph_type, g.ax0, g.ax1
                FROM master_tables mt
                JOIN graphs g ON mt.table_id = g.table_id
                WHERE g.graph_id = ?
            ''', (graph_id, ))
            row = cursor.fetchone()
            # table_id, table_name, graph_id, graph_title, graph_type, ax0, ax1 = row
            mp = dict(row)
        return mp

    def insert_graph_table(self, query: GraphQueryParam) -> int:
        graph_id = self.detect_graph(query)
        if graph_id is not None:
            return graph_id
        
        with self.get_sql_db_connection() as conn:
            cursor = conn.cursor()
            INSERTION_QUERY = '''
                INSERT INTO graphs (table_id, graph_title, graph_type, ax0, ax1) VALUES (?, ?, ?, ?, ?)
                RETURNING graph_id
            '''
            cursor.execute(INSERTION_QUERY, (
                query.table_id, query.graph_title, query.graph_type, query.ax0, query.ax1)
            )
            row = cursor.fetchone()
            (graph_id, ) = row if row else None
            conn.commit()
        return graph_id

    def graph_exists(self, graph_id: int) -> bool:
        with self.get_sql_db_connection() as conn:
            cursor = conn.cursor()
            DETECTION_QUERY = '''
                SELECT * FROM graphs
                WHERE graph_id = ?
            '''
            cursor.execute(DETECTION_QUERY, (graph_id, ))
            row = cursor.fetchone()
        if row:
            return True
        else: 
            return False

    def detect_graph(self, query: GraphQueryParam) -> Optional[int]:
        with self.get_sql_db_connection() as conn:
            cursor = conn.cursor()
            # Escape column names
            escaped_ax0 = f"[{query.ax0}]"
            escaped_ax1 = f"[{query.ax1}]"
            
            DETECTION_QUERY = '''
                SELECT graph_id FROM graphs
                WHERE table_id = ? AND graph_title = ? AND graph_type = ? AND ax0 = ? AND ax1 = ?
            '''
            cursor.execute(DETECTION_QUERY, (
                query.table_id, 
                query.graph_title, 
                query.graph_type, 
                escaped_ax0.strip('[]'),  # Remove brackets for comparison
                escaped_ax1.strip('[]')   # Remove brackets for comparison
            ))
            row = cursor.fetchone()
        if row:
            (graph_id,) = row
            return graph_id
        else: 
            return None