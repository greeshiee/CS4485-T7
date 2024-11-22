from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import csv
import random
import json
from faker import Faker
import time
import os
from threading import Thread

fake = Faker()

app = FastAPI()

#CORS (Cross origin resource sharing) middleware to allow requests from the react app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  #react app origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

fake_functions = {
    'int': lambda: random.randint(1000, 9999),
    'datetime': lambda: fake.date_time_between(start_date='-2y', end_date='now'),
    'nullable_datetime': lambda: fake.date_time_between(start_date='-2y', end_date='now') if random.choice([True, False]) else None,
    'version': lambda: random.randint(1, 100),
    'status': lambda: fake.word(ext_word_list=["active", "inactive", "pending"]),
    'name': lambda: fake.name(),
    'email': lambda: fake.email(),
    'word': lambda: fake.word(),
    'address': lambda: fake.address(),
    'phone': lambda: fake.phone_number()
}

#Function used to generate data based on the JSON schema
def generate_data(schema, num_records):
    data = []
    for _ in range(num_records):
        row = generate_record(schema)
        data.append(row)
    return data

def generate_record(schema):
    row = {}
    for column, field_type in schema.items():
        if isinstance(field_type, str):
            if field_type in fake_functions:
                row[column] = fake_functions[field_type]()
            else:
                raise ValueError(f"Unknown field type '{field_type}' in schema for column '{column}'")
        elif isinstance(field_type, dict):
            row[column] = generate_record(field_type)  # Recursive call for nested dictionary
        elif isinstance(field_type, list):
            row[column] = [generate_record(field_type[0]) for _ in range(random.randint(1, 3))]
        else:
            raise ValueError(f"Unsupported field type for column '{column}': {field_type}")
    return row

def save_to_csv(data, output_file):
    if data:
        fieldnames = data[0].keys()
        with open(output_file, 'w', newline='') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(data)
    else:
        raise ValueError("No data to save.")

def continuous_generation(schema, num_records, interval, output_file):
    while True:
        data = generate_data(schema, num_records)
        save_to_csv(data, output_file)
        time.sleep(interval)

@app.post("/generate-csv")
async def generate_csv(file: UploadFile = File(...), num_records: int = Form(...), interval: float = Form(...), mode: str = Form(...),custom_filename: str = Form(default="output")):
    schema_data = await file.read()
    try:
        schema = json.loads(schema_data)
    except json.JSONDecodeError:
        return {"error": "Invalid JSON file."}

    #Check thatdirectory exists
    os.makedirs('generated_files', exist_ok=True)

    #Naming convention for the generated CSV file
    original_filename = file.filename.split('.')[0]  # Get the base name without extension
    output_file = f"generated_files/{custom_filename}.csv"
    interval_seconds = interval * 60  #minutes to seconds

    if mode == "stream":
        # Start continuous generation in a background thread
        thread = Thread(target=continuous_generation, args=(schema, num_records, interval_seconds, output_file))
        thread.start()
        return {
            "message": "CSV generation started in streaming mode!",
            "output_file": output_file.split('/')[-1]  # Only send the filename
        }
    elif mode == "batch":
        data = generate_data(schema, num_records)  # Generate data immediately
        save_to_csv(data, output_file)
        return {
            "message": "CSV generated successfully!",
            "output_file": output_file.split('/')[-1]  # Only send the filename
        }
    else:
        return {"error": "Invalid mode. Use 'batch' or 'stream'."}


@app.get("/download_csv/")
async def download_csv(filename: str):
    file_path = f"generated_files/{filename}" 
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type='text/csv', filename=filename)
    return {"error": "File not found."}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


#Command to to run 'uvicorn app.main:app --reload'
