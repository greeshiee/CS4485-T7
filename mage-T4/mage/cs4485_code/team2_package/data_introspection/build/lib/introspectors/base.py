from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Dict, List, Optional

@dataclass
class TableMetadata:
    """Stores metadata about a table."""
    name: str
    columns: List[Dict[str, str]]  # List of column names and their data types
    row_count: int
    file_path: Optional[str] = None
    
class DataIntrospector(ABC):
    """Abstract base class for data introspection."""
    
    @abstractmethod
    def get_table_names(self) -> List[str]:
        """Return list of all table names."""
        pass
    
    @abstractmethod
    def get_table_metadata(self, table_name: str) -> TableMetadata:
        """Return metadata for specified table."""
        pass
    
    @abstractmethod
    def validate_structure(self) -> bool:
        """Validate if the data source follows required structure."""
        pass