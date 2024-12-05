from mage_ai.streaming.sinks.base_python import BasePythonSink
from typing import Dict, List
from team6_package.core import create_kafka_producer
import logging

if 'streaming_sink' not in globals():
    from mage_ai.data_preparation.decorators import streaming_sink

logging.basicConfig(level=logging.INFO)

@streaming_sink
class CustomSink(BasePythonSink):
    def init_client(self):
        # Kafka configuration
        self.kafka_topic = 'team6_topic'  # Update with your Kafka topic
        self.bootstrap_servers = 'kafka:9092'  # Adjust if needed (e.g., 'localhost:29092' if running outside Docker)

        # Create Kafka producer using your package function
        self.producer = create_kafka_producer(self.bootstrap_servers)
        logging.info(f"Kafka producer initialized for topic '{self.kafka_topic}' at '{self.bootstrap_servers}'.")

    def batch_write(self, messages: List[Dict]):
        for msg in messages:
            # Handle message format
            if isinstance(msg, dict) and 'data' in msg:
                data = msg['data']
            else:
                data = msg  # Assume msg is the whole data

            # Send the message to Kafka
            try:
                self.producer.send(self.kafka_topic, value=data)
                logging.info(f"Sent message to Kafka: {data}")
            except Exception as e:
                logging.error(f"Error sending message to Kafka: {e}")

        # Flush the producer to ensure all messages are sent
        self.producer.flush()
        logging.info("Kafka producer flushed.")

    def __del__(self):
        """
        Clean up resources when the sink is destroyed.
        """
        if hasattr(self, 'producer'):
            self.producer.close()
            logging.info("Kafka producer closed.")