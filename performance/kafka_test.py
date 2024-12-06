import json
from confluent_kafka import Consumer, KafkaError
from prometheus_client import start_http_server, Gauge
import threading
import logging

# Logging configuration
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Kafka Configuration
KAFKA_BOOTSTRAP_SERVERS = 'localhost:29092'
KAFKA_GROUP_ID = 'prometheus-exporter-group'
KAFKA_TOPIC = 'team6_topic'

# Prometheus Metrics
# Create Prometheus Gauges to track Kafka message data
# You can customize these based on your specific message structure
message_count = Gauge('kafka_messages_total', 'Total number of Kafka messages processed')
message_payload = Gauge('kafka_message_payload', 'Kafka message payload', 
                        ['topic', 'key', 'attribute'])

class KafkaPrometheusExporter:
    def __init__(self, bootstrap_servers, group_id, topic):
        """
        Initialize Kafka Consumer and Prometheus Exporter
        
        :param bootstrap_servers: Kafka bootstrap servers
        :param group_id: Kafka consumer group ID
        :param topic: Kafka topic to consume
        """
        # Kafka Consumer Configuration
        self.consumer_config = {
            'bootstrap.servers': bootstrap_servers,
            'group.id': group_id,
            'auto.offset.reset': 'latest'
        }
        
        # Create Kafka Consumer
        self.consumer = Consumer(self.consumer_config)
        
        # Subscribe to the topic
        self.consumer.subscribe([topic])
        
        # Track metrics
        self.processed_messages = 0

    def consume_messages(self):
        """
        Consume messages from Kafka and update Prometheus metrics
        """
        try:
            while True:
                # Poll for messages
                msg = self.consumer.poll(1.0)
                
                if msg is None:
                    continue
                
                if msg.error():
                    if msg.error().code() == KafkaError._PARTITION_EOF:
                        logger.info('Reached end of partition')
                    else:
                        logger.error(f'Error: {msg.error()}')
                    continue
                
                # Process the message
                try:
                    # Increment total message count
                    message_count.inc()
                    self.processed_messages += 1
                    
                    # Parse message value
                    value = msg.value().decode('utf-8')
                    try:
                        parsed_value = json.loads(value)
                        
                        # Example of setting gauge with parsed data
                        # Customize this based on your actual message structure
                        if isinstance(parsed_value, dict):
                            for key, val in parsed_value.items():
                                message_payload.labels(
                                    topic=msg.topic(), 
                                    key=key, 
                                    attribute=key
                                ).set(val)
                    except json.JSONDecodeError:
                        logger.warning(f'Could not parse message: {value}')
                    
                    logger.info(f'Processed message: {value}')
                
                except Exception as e:
                    logger.error(f'Error processing message: {e}')
        
        except KeyboardInterrupt:
            logger.info('Stopping consumer')
        
        finally:
            # Close consumer
            self.consumer.close()

def start_prometheus_server(port=8000):
    """
    Start Prometheus HTTP server for metrics exposure
    
    :param port: Port to expose metrics on
    """
    logger.info(f'Starting Prometheus metrics server on port {port}')
    start_http_server(port)

def main():
    # Create Kafka Prometheus Exporter
    exporter = KafkaPrometheusExporter(
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        group_id=KAFKA_GROUP_ID,
        topic=KAFKA_TOPIC
    )
    
    # Start Prometheus metrics server in a separate thread
    prometheus_thread = threading.Thread(
        target=start_prometheus_server, 
        daemon=True
    )
    prometheus_thread.start()
    
    # Start Kafka message consumption
    exporter.consume_messages()

if __name__ == '__main__':
    main()