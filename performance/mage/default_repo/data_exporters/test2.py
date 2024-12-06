from mage_ai.streaming.sinks.base_python import BasePythonSink
from typing import Callable, Dict, List
from team6_package.core import generate_data, load_schema
import time
import logging

if 'streaming_sink' not in globals():
    from mage_ai.data_preparation.decorators import streaming_sink

kafka_config = {
    'team6_topic',
    bootstrap_servers='localhost:29092',
    auto_offset_reset=auto_offset_reset,
    enable_auto_commit=enable_auto_commit,
    value_deserializer=value_deserializer,
    consumer_timeout_ms=consumer_timeout_ms
}

@streaming_sink
class CustomSink(BasePythonSink):
    def init_client(self):
        """
        Implement the logic of initializing the client.
        """
        self.kafka_topic = 'team6_topic'
        self.bootstrap_server = 'kafka:29092'
        kafka_source = KafkaSource(config=kafka_config)


    def batch_write(self, messages: List[Dict]):
        """
        Batch write the messages to the sink.

        For each message, the message format could be one of the following ones:
        1. message is the whole data to be wirtten into the sink
        2. message contains the data and metadata with the foramt {"data": {...}, "metadata": {...}}
            The data value is the data to be written into the sink. The metadata is used to store
            extra information that can be used in the write method (e.g. timestamp, index, etc.).
        """
        for msg in messages:
            print(msg)
            pass
