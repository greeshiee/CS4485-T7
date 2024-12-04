import os
from datetime import datetime
from typing import Dict, Any, List

# FastAPI and Web Dependencies
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Database Dependencies
from sqlalchemy import create_engine, MetaData, Table, Column, String, Integer, Float, inspect
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.exc import SQLAlchemyError

import pandas as pd
import io

# External Services
import boto3
import requests

from dotenv import load_dotenv
import uvicorn

# Load environment variables
load_dotenv('.env.local') 
load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
# AWS Configuration
AWS_S3_BUCKET_NAME = 'senior-design-utd' 
AWS_REGION = 'us-east-1'
AWS_ACCESS_KEY = os.getenv('AWS_ACCCES_KEY') # from IAM user
AWS_SECRET_KEY = os.getenv('AWS_SECRET_ACCESS_KEY') # from IAM user

# DB setup
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# db session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# AWS S3 client
s3_client = boto3.client(
    service_name='s3',
    region_name=AWS_REGION,
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY
)

# Schemas
class Database(Base):
    __tablename__ = "databases"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    connection_string = Column(String)

class DatabaseBase(BaseModel):
    name: str
    connection_string: str

class DatabaseCreate(DatabaseBase):
    pass

class DatabaseResponse(DatabaseBase):
    id: int

    class Config:
        orm_mode = True

class CSVUploadResponse(BaseModel):
    message: str
    database: str
    table: str
    rows: int
    columns: List[str]

# API Integration Models
class APIRequest(BaseModel):
    endpoint: str
    method: str
    headers: Dict[str, str] = {}
    params: Dict[str, str] = {}

class APIIntegrationService:
    def execute_request(self, config: APIRequest) -> Dict[str, Any]:
        try:
            # Make the HTTP request
            response = requests.request(
                method=config.method,
                url=config.endpoint,
                headers=config.headers,
                params=config.params,
                timeout=30
            )
            
            # Try to parse response as JSON
            try:
                response_data = response.json()
            except ValueError:
                response_data = response.text
            
            return {
                "status": "success",
                "statusCode": response.status_code,
                "data": response_data,
                "timestamp": datetime.now().isoformat()
            }
                
        except requests.exceptions.RequestException as e:
            # Handle request-related errors
            error_message = str(e)
            if "SSLError" in error_message:
                error_message = "SSL Error - Could not verify the API endpoint's security certificate"
            elif "ConnectionError" in error_message:
                error_message = "Connection Error - Could not reach the API endpoint"
            elif "Timeout" in error_message:
                error_message = "Timeout Error - The API request took too long to respond"
            
            return {
                "status": "error",
                "message": error_message,
                "timestamp": datetime.now().isoformat()
            }


app = FastAPI()

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Initialize API service
api_integration_service = APIIntegrationService()

# Create database tables
Base.metadata.create_all(bind=engine)

# Existing endpoints
@app.get("/databases", response_model=list[DatabaseResponse])
def list_databases(db: Session = Depends(get_db)):
    return db.query(Database).all()

@app.post("/databases", response_model=DatabaseResponse)
def create_database(database: DatabaseCreate, db: Session = Depends(get_db)):
    db_database = Database(**database.dict())
    db.add(db_database)
    db.commit()
    db.refresh(db_database)
    return db_database

@app.get("/tables/{database_id}")
def list_tables(database_id: int, db: Session = Depends(get_db)):
    database = db.query(Database).filter(Database.id == database_id).first()
    if not database:
        raise HTTPException(status_code=404, detail="Database not found")
    
    engine = create_engine(database.connection_string)
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    return tables

@app.get("/table-data/{database_id}/{table_name}")
def get_table_data(database_id: int, table_name: str, db: Session = Depends(get_db)):
    database = db.query(Database).filter(Database.id == database_id).first()
    if not database:
        raise HTTPException(status_code=404, detail="Database not found")
    
    engine = create_engine(database.connection_string)
    try:
        df = pd.read_sql_table(table_name, engine)
        return df.to_dict(orient="records")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload-csv")
async def upload_csv(
    file: UploadFile = File(...),
    database_name: str = Form(...),
    table_name: str = Form(...),
    db: Session = Depends(get_db)
):
    try:
        contents = await file.read()

        file.file.seek(0) # reset file pointer to start of file
        
        if file: 
            upload_response = s3_client.upload_fileobj(file.file, AWS_S3_BUCKET_NAME, file.filename)

        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        # Check if the database exists, if not create it
        database = db.query(Database).filter(Database.name == database_name).first()
        if not database:
            new_db_path = f"{database_name}.sqlite"
            new_db_url = f"sqlite:///{new_db_path}"
            database = Database(name=database_name, connection_string=new_db_url)
            db.add(database)
            db.commit()
            db.refresh(database)
        
        # Create a new engine for the selected database
        target_engine = create_engine(database.connection_string)
        
        # Create the table if it doesn't exist
        metadata = MetaData()
        columns = [Column(name, String) for name in df.columns]
        table = Table(table_name, metadata, *columns)
        metadata.create_all(target_engine)
        
        # Insert data into the table
        df.to_sql(table_name, target_engine, if_exists='replace', index=False)
        
        return {
            "message": "CSV uploaded and processed successfully",
            "database": database_name,
            "uploads3response": upload_response,
            "table": table_name,
            "rows": len(df),
            "columns": list(df.columns)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# New API Integration endpoint
@app.post("/test-api")
async def test_api(request: APIRequest):
    result = api_integration_service.execute_request(request)
    
    if result["status"] == "error":
        raise HTTPException(
            status_code=400,
            detail=result["message"]
        )
    
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)