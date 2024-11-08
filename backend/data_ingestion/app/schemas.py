from pydantic import BaseModel
from typing import List

class DatabaseBase(BaseModel):
    name: str
    connection_string: str

class DatabaseCreate(DatabaseBase):
    pass

class Database(DatabaseBase):
    id: int

    class Config:
        orm_mode = True

class CSVUploadResponse(BaseModel):
    message: str
    database: str
    table: str
    rows: int
    columns: List[str]