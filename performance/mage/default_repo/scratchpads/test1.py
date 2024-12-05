from team6_package.core import consume_messages_from_kafka

def process_message(message):
    print(f"Processing message: {message}")

def main():
    kafka_topic = 'team6_topic'
    bootstrap_servers = 'localhost:29092'


if __name__ == '__main__':
    main()