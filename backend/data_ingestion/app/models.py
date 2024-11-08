from sqlalchemy import Column, Integer, String
from .database import Base

class Database(Base):
    __tablename__ = "databases"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    connection_string = Column(String)