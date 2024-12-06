import os
import pandas as pd
from typing import List, Dict
from .base import DataIntrospector, TableMetadata

class CSVIntrospector(DataIntrospector):
    """Introspector for CSV files in a directory."""
    
    def __init__(self, directory_path: str):
        self.directory_path = directory_path
        if not os.path.exists(directory_path):
            raise ValueError(f"Directory does not exist: {directory_path}")
        
    def get_table_names(self) -> List[str]:
        csv_files = []
        for file in os.listdir(self.directory_path):
            if file.endswith('.csv'):
                csv_files.append(os.path.splitext(file)[0])
        return csv_files
    
    def get_table_metadata(self, table_name: str) -> TableMetadata:
        file_path = os.path.join(self.directory_path, f"{table_name}.csv")
        if not os.path.exists(file_path):
            raise ValueError(f"CSV file does not exist: {file_path}")
            
        df = pd.read_csv(file_path)
        
        columns = [
            {"name": col, "type": str(df[col].dtype)}
            for col in df.columns
        ]
        
        return TableMetadata(
            name=table_name,
            columns=columns,
            row_count=len(df),
            file_path=file_path
        )
    
    def validate_structure(self) -> bool:
        if not os.path.isdir(self.directory_path):
            return False
            
        files = [f for f in os.listdir(self.directory_path) 
                if os.path.isfile(os.path.join(self.directory_path, f))]
                
        return all(
            file.endswith('.csv')
            for file in files
        )