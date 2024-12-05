Installation:
Extract the zip file to your desired directory
Navigate to the directory containing setup.py
Install the dependencies using: 'pip install -r requirements.txt'
Install the package using the following command: 'pip install .'

_________________________________________________________________________________________________________________

Command Line Usage:
team6_package <schema.json file_path> <output.csv desired_path> --num-records <number_of_records>
EXAMPLE: team6_package schema.json data.csv --num-records 200

--num-records is optional and the default value is 100.

_________________________________________________________________________________________________________________

Using the Package in Python Code
Example:

	from team6_package import generate_data, save_to_csv, load_schema

	# Load schema from a JSON file
	schema = load_schema('schema.json')

	# Generate data based on the schema
	data = generate_data(schema, num_records=10)

	# Get the CSV content as an in-memory StringIO object
	csv_file = save_to_csv(data)
	
	# Use the CSV content within the same code
	print(csv_file.read())  # Print the CSV content

save_to_csv does not need a file path. The default is none and if there is no given file path then the function returns a csv file-like object.

_________________________________________________________________________________________________________________

JSON Schema Example:
{
  "name": "name",
  "email": "email",
  "address": "address",
  "application_type": "application_type",
  "signal_strength": "signal_strength",
  "required_bandwidth": "required_bandwidth",
  "allocated_bandwidth": "allocated_bandwidth",
  "ip": "ip"
}
"<desired_name>": "<function_name>"

_________________________________________________________________________________________________________________

Example for using consume_messages_from_kafka function:

		from team6_package.core import consume_messages_from_kafka

		def process_message(message):
    		# Custom processing of the message
    		print(f"Processing message: {message}")

		def main():
   		kafka_topic = 'team6_topic'
    		bootstrap_servers = 'localhost:29092'  # Adjust if needed

    		# Consume messages using the package function
    		consume_messages_from_kafka(
        		on_message=process_message,
        		consumer_timeout_ms=10000  # Wait for 10 seconds if no messages are received
    		)

		if __name__ == "__main__":
    		    main()
 
_________________________________________________________________________________________________________________

Currently Supported functions:
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

    # Team 9 stuff
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