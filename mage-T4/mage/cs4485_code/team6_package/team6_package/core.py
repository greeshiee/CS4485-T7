from faker import Faker
import random
import csv
import json
import argparse
import io  # For in-memory CSV handling
import time
from datetime import datetime, timedelta
from kafka import KafkaProducer
from kafka import KafkaConsumer
import logging

logging.basicConfig(level=logging.INFO)
fake = Faker()

# Mapping field types to Faker functions
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

def generate_data(schema, num_records):
    """Generate a list of dictionaries based on the JSON schema."""
    data = []
    for _ in range(num_records):
        row = generate_single_record(schema)
        data.append(row)
    return data

def generate_single_record(schema):
    """Generate a single data record based on the JSON schema."""
    row = {}
    for column, field_type in schema.items():
        field_type_lower = field_type.lower()

        if field_type_lower == 'required_bandwidth':
            # Custom logic for required_bandwidth
            app_type = row.get('application_type', None)
            if app_type in ["Browsing", "Email"]:
                row[column] = random.randint(5, 20)
            elif app_type in ["Social Media", "E-commerce"]:
                row[column] = random.randint(20, 50)
            else:  # Streaming, Gaming, Video Call
                row[column] = random.randint(50, 200)

        elif field_type_lower == 'allocated_bandwidth':
            # Use the value of required_bandwidth to generate allocated_bandwidth
            required_bw = row.get('required_bandwidth', 50)
            row[column] = fake_functions['allocated_bandwidth'](required_bw)

        elif field_type_lower in fake_functions:
            # Use the corresponding Faker function
            row[column] = fake_functions[field_type_lower]()

        else:
            # Default to generating a word if the type is unknown
            row[column] = fake_functions['word']()

    return row

def save_to_csv(data, output_file=None):
    """
    Save data to a CSV file. 
    If `output_file` is None, return the CSV content as a StringIO object.
    """
    if not data:
        raise ValueError("No data to save.")

    fieldnames = data[0].keys()
    csv_buffer = io.StringIO()  # Create an in-memory string buffer

    writer = csv.DictWriter(csv_buffer, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(data)

    if output_file:
        with open(output_file, 'w', newline='') as file:
            file.write(csv_buffer.getvalue())
        print(f"Data saved to {output_file}")
    else:
        csv_buffer.seek(0)  # Reset buffer position to the beginning
        return csv_buffer  # Return the in-memory CSV object

def load_schema(schema_path):
    """Load the JSON schema from a file."""
    with open(schema_path, 'r') as file:
        return json.load(file)

def create_kafka_producer(bootstrap_servers):
    """Create and return a Kafka producer."""
    producer = KafkaProducer(
        bootstrap_servers=bootstrap_servers,
        value_serializer=lambda v: json.dumps(v).encode('utf-8')
    )
    return producer

def run_batch_mode(schema):
    parser = argparse.ArgumentParser(description="Batch mode arguments")
    parser.add_argument('output', type=str, help='The output CSV file name')
    parser.add_argument('-n', '--num-records', type=int, default=100, help='Number of records to generate')
    batch_args, _ = parser.parse_known_args()

    data = generate_data(schema, batch_args.num_records)
    save_to_csv(data, batch_args.output)
    print(f"Data successfully saved to {batch_args.output}")

def run_streaming_mode(schema):
    parser = argparse.ArgumentParser(description="Streaming mode arguments")
    parser.add_argument('topic', type=str, help='Kafka topic to send data to')
    parser.add_argument('-b', '--bootstrap-servers', type=str, default='localhost:9092', help='Kafka bootstrap servers')
    parser.add_argument('-i', '--interval', type=float, default=1.0, help='Time interval between data points in seconds')
    parser.add_argument('-d', '--duration', type=float, default=60.0, help='Total duration to send data in seconds')
    stream_args, _ = parser.parse_known_args()

    producer = create_kafka_producer(stream_args.bootstrap_servers)
    end_time = time.time() + stream_args.duration

    print(f"Starting data stream to Kafka topic '{stream_args.topic}'...")

    try:
        while time.time() < end_time:
            data = generate_single_record(schema)
            producer.send(stream_args.topic, value=data)
            print(f"Sent data: {data}")
            time.sleep(stream_args.interval)

        producer.flush()
        print("Data streaming completed.")

    except KeyboardInterrupt:
        print("Data streaming interrupted by user.")
    finally:
        producer.close()

def send_dataframe_to_kafka(df, producer):
    """Send data from a DataFrame to a Kafka topic."""
    for _, row in df.iterrows():
        data = row.to_dict()
        try:
            producer.send("team6_topic", value=data)
            print(f"Sent data to Kafka: {data}")
        except Exception as e:
            print(f"Error sending data to Kafka: {e}")
    producer.flush()

def export_dataframe_to_kafka(df):
    """Create a Kafka producer and send data from a DataFrame to a Kafka topic."""
    producer = create_kafka_producer("kafka:9092")
    send_dataframe_to_kafka(df, producer)
    producer.close()

def consume_messages_from_kafka(
    auto_offset_reset='earliest',
    enable_auto_commit=True,
    value_deserializer=lambda v: json.loads(v.decode('utf-8')),
    on_message=None,
    consumer_timeout_ms=1000
):
    """
    Consumes messages from a Kafka topic and processes them using a callback function.

    Parameters:
    - auto_offset_reset (str): Where to start reading messages if no offset is committed.
    - enable_auto_commit (bool): Whether to auto-commit offsets.
    - value_deserializer (callable): Function to deserialize message values.
    - on_message (callable): Function to process each message. It should accept one argument (the message value).
    - consumer_timeout_ms (int): Stop iteration if no message is received for this number of milliseconds.

    Returns:
    - messages (list): A list of messages consumed from the topic if no callback is provided.
    """
    logging.info(f"Connecting to Kafka broker at localhost:29092...")

    consumer = KafkaConsumer(
        'team6_topic',
        bootstrap_servers='localhost:29092',
        auto_offset_reset=auto_offset_reset,
        enable_auto_commit=enable_auto_commit,
        value_deserializer=value_deserializer,
        consumer_timeout_ms=consumer_timeout_ms
    )

    logging.info(f"Connected to Kafka topic team6_topic. Listening for messages...")

    messages = []
    try:
        for message in consumer:
            data = message.value
            if on_message:
                on_message(data)
            else:
                messages.append(data)
            logging.info(f"Received message: {data}")
    except Exception as e:
        logging.error(f"Error consuming messages: {e}")
    finally:
        consumer.close()
        logging.info("Kafka consumer closed.")
    return messages

def generate_batch_with_time_intervals(schema, num_records, start_time=None, interval_seconds=1):
    """
    Generates a batch of data records where each record's datetime field simulates time passing.

    Parameters:
    - schema (dict): The JSON schema defining the data fields and types.
    - num_records (int): Number of records to generate.
    - start_time (datetime): The starting datetime for the first record. If None, uses current time.
    - interval_seconds (int or float): Number of seconds between each record's datetime.

    Returns:
    - data (list): List of generated records with adjusted datetime fields.
    """
    data = []
    if start_time is None:
        start_time = datetime.now()
    else:
        # Ensure start_time is a datetime object
        if isinstance(start_time, str):
            start_time = datetime.strptime(start_time, '%Y-%m-%d %H:%M:%S')

    for i in range(num_records):
        record = generate_single_record(schema)
        # Adjust the datetime field
        adjusted_time = start_time + timedelta(seconds=interval_seconds * i)
        # Format the datetime as per your requirements
        formatted_time = adjusted_time.strftime('%Y-%m-%d %H:%M:%S')

        # Find the datetime field in the record and update it
        for key, value in record.items():
            if schema[key].lower() == 'datetime':
                record[key] = formatted_time
        data.append(record)
    return data


def main():
    parser = argparse.ArgumentParser(description="Generate fake data from a JSON schema.")
    parser.add_argument('schema', type=str, help='Path to the JSON schema file')
    parser.add_argument('-m', '--mode', type=str, choices=['batch', 'stream'], default='batch', help='Mode of operation: batch or stream')
    args, unknown = parser.parse_known_args()

    try:
        schema = load_schema(args.schema)

        if args.mode == 'batch':
            run_batch_mode(schema)
        elif args.mode == 'stream':
            run_streaming_mode(schema)
        else:
            print(f"Unknown mode: {args.mode}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()