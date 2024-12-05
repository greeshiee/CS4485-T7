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
    'uuid': lambda: fake.uuid4(),  # UUID
    'boolean': lambda: random.choice([True, False]),
    'integer': lambda: random.randint(1, 999999),  # General integer
    'iso8601': lambda: fake.iso8601(),  # ISO8601 timestamp
    'float': lambda: round(random.uniform(-180.0, 180.0), 6),  # General float
    'datetime': lambda: datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
    'nullable_datetime': lambda: fake.date_time_between(start_date='-2y', end_date='now') if random.choice([True, False]) else None,
    'status': lambda: fake.word(ext_word_list=["active", "inactive", "pending"]),
    'name': lambda: fake.name(),
    'email': lambda: fake.email(),
    'word': lambda: fake.word(),
    'address': lambda: fake.address(),
    'id': lambda: fake.uuid4(),
    'application_type': lambda: random.choice([
        "Streaming", "Gaming", "Browsing",
        "Social Media", "Video Call",
        "Email", "E-commerce"
    ]),
    'signal_strength': lambda: random.randint(-120, -40),
    'latency': lambda: random.randint(10, 1000),
    'required_bandwidth': None,  # Handled in generate_data
    'allocated_bandwidth': lambda required: random.randint(int(required * 0.5), required),
    'resource_allocation': lambda: random.randint(1, 100),  # Percentage

    'user_role': lambda: fake.word(ext_word_list=["tenant", "admin", "operator"]),

    'action_type': lambda: fake.word(ext_word_list=["DELETE", "CREATE", "UPDATE", "READ"]),

    # Object-related data
    'object_type': lambda: fake.word(ext_word_list=["radio", "gateway"]),
    'object_model': lambda: fake.word(ext_word_list=["Indoor", "Outdoor"]),
    'object_status': lambda: fake.word(ext_word_list=["MARKED_FOR_DELETE", "ACTIVE", "INACTIVE"]),
    'object_description': lambda: f"{fake.word()} description",

    'carrier_name': lambda: fake.word(ext_word_list=["T-Mobile", "AT&T", "Verizon", "Cricket", "Sprint", "Mint"]),
    'ip': lambda: fake.ipv4(),


    # Edge-related data
    'edge_type': lambda: fake.word(ext_word_list=["PRIVATE_CELLULAR", "CARRIER_GATEWAY"]),
    'edge_ipsec_mode': lambda: fake.word(ext_word_list=["CERTIFICATE", "PSK"]),

    # Certificate-related data
    'cert': lambda: "-----BEGIN CERTIFICATE-----\n" + fake.sha256() + "\n-----END CERTIFICATE-----",
    'ipsec_key': lambda: "-----BEGIN RSA PRIVATE KEY-----\n" + fake.sha256() + "\n-----END RSA PRIVATE KEY-----",

    # SAS configuration data
    'cbsd_category': lambda: fake.word(ext_word_list=["A", "B"]),
    'plmn_id': lambda: f"{random.randint(100, 999)}{random.randint(10, 99)}",
    'frequency_selection_logic': lambda: ','.join(random.sample(
        ["Power", "Bandwidth", "Frequency", "Latency"], random.randint(2, 3)
    )),

    # Runtime-related data
    'software_version': lambda: f"{random.randint(10, 20)}.{random.randint(0, 99)}.{random.randint(0, 9999)}",
    'runtime_status': lambda: fake.word(ext_word_list=["INACTIVE", "ACTIVE", "REBOOTING"]),
    'tac': lambda: random.randint(1, 999),
    'max_ue': lambda: random.randint(1, 9999),

    # Security configurations
    'aes_integrity_level': lambda: random.randint(1, 3),
    'null_ciphering_level': lambda: random.randint(0, 2),
    'security_for_ciphering': lambda: fake.word(ext_word_list=["Optional", "Mandatory"]),
    'security_for_integrity': lambda: fake.word(ext_word_list=["Optional", "Mandatory"]),
    'snow3g_integrity_level': lambda: random.randint(1, 3),

    # Manufacturing data
    'serial_number': lambda: fake.sha1()[:12].upper(),
    'board_number': lambda: f"{random.randint(100, 999)}-{random.randint(10, 99)}-{random.randint(100, 999)}",
    'assembly_number': lambda: f"{random.randint(900, 999)}-{random.randint(10, 99)}-{random.randint(400, 499)}",
    'assembly_revision': lambda: random.choice(["A0", "B0", "C1"]),
    'manufacturing_date': lambda: fake.date_between(start_date='-5y', end_date='today'),  

    # Mobility parameters
    'a1': lambda: random.randint(30, 70),
    'a2': lambda: random.randint(30, 70),
    'a5_t1': lambda: random.randint(30, 70),
    'a5_t2': lambda: random.randint(30, 70),
    'hysteresis': lambda: random.randint(1, 10),
    'time_to_trigger': lambda: random.randint(100, 1000),
  
    # Status and additional info
    'request_status': lambda: fake.word(ext_word_list=["ACCEPTED", "REJECTED", "PENDING"]),
    'eci_auto_assign': lambda: random.choice([True, False]),
    'signature': lambda: fake.sha256(),
    'subframe_assignment': lambda: random.randint(0, 10),
    'special_subframe_pattern': lambda: random.randint(0, 10),
    'status_message': lambda: fake.sentence(),
    'install_certification_time': lambda: fake.iso8601(),

    # Location-related data
    'location_name': lambda: fake.city(),
    'location_tags': lambda: [fake.word() for _ in range(random.randint(1, 3))] if random.choice([True, False]) else None,
    'location_zoom': lambda: random.randint(1, 20),
    'location_type': lambda: fake.word(ext_word_list=["PRIVATE_CLOUD", "PUBLIC_CLOUD"]),
    'is_managed': lambda: random.choice([True, False]),
    'location_latitude': lambda: round(fake.latitude(), 6),
    'location_longitude': lambda: round(fake.longitude(), 6),
    'uptime': lambda: f"{random.randint(0, 99)}d {random.randint(0, 23)}h {random.randint(0, 59)}m {random.randint(0, 59)}s",
    'health': lambda: fake.word(ext_word_list=["GOOD", "BAD", "MARGINAL"]),


    #Team 9 stuff
    'sent_bytes': lambda: int(random.uniform(0.1, 0.4) * (1073741824 / random.randint(23,25))),
    'received_bytes': lambda: int(random.uniform(0.1, 0.4) * 1073741824),
    'cpu_percent': lambda: round(random.uniform(0.6, 0.9), 2),
    'mem_used_bytes': lambda: int(536870912 * random.uniform(0.7, 0.99)),
    'mem_total': lambda: 536870912,
    'disk_percent': lambda: round(random.uniform(0.6, 0.9), 2),
    'disk_total': lambda: 536870912,
    'machine_sent_bytes': lambda: int(536870912 * random.uniform(0.1, 0.7) / 15),
    'machine_received_bytes': lambda: int(536870912 * random.uniform(0.1, 0.7)),
    'radio_connected': lambda: random.randint(50, 100),
    'devices_registered': lambda: random.randint(500, 700),
    'devices_connected': lambda: random.randint(400, 800),
    'ue_pdn_connections_success': lambda: random.randint(100, 300),
    'ue_pdn_connections_released': lambda: random.randint(100, 300),
    'link_success_rate_5g': lambda: round(random.uniform(0.8, 1), 2),
    'allocate_ip_success_5g': lambda: random.randint(100, 300),
    'release_ip_success_5g': lambda: random.randint(100, 300)
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
