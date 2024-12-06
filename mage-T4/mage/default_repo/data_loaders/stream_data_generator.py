from mage_ai.streaming.sources.base_python import BasePythonSource
from typing import Callable
from team6_package.core import generate_data, load_schema
import time
import logging

if 'streaming_source' not in globals():
    from mage_ai.data_preparation.decorators import streaming_source

logging.basicConfig(level=logging.INFO)

@streaming_source
class CustomSource(BasePythonSource):
    def init_client(self):
        # Load the schema
        self.schema = load_schema('/home/src/schemas/schema.json')
        
        # Set parameters for data generation
        self.interval = 5.0  # Interval between batches in seconds
        self.records_per_batch = 1  # 1 IF YOU WANT A CONSTANT STREAM OF SINGLE RECORDS. FOR MORE THAN 1 USE THE STREAM_BATCH_DATA_GENERATOR INSTEAD
        self.total_batches = None  # Set to None for indefinite streaming
        self.batch_count = 0

    def batch_read(self, handler: Callable):
        """
        Batch read the messages from the source and use handler to process the messages.
        """
        try:
            while True:
                records = generate_data(self.schema, self.records_per_batch)
                if len(records) > 0:
                    handler(records)
                    logging.info(f"Generated and processed batch {self.batch_count + 1} with {len(records)} records.")
                self.batch_count += 1
                if self.total_batches is not None and self.batch_count >= self.total_batches:
                    logging.info("Reached total number of batches to send.")
                    break
                time.sleep(self.interval)
        except Exception as e:
            logging.error(f"Error during data streaming: {e}")
        finally:
            logging.info("Data streaming completed.")