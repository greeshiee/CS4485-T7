from mage_ai.streaming.sources.base_python import BasePythonSource
from typing import Callable
from team6_package.core import generate_batch_with_time_intervals, load_schema
import logging
from datetime import datetime, timedelta
import time

if 'streaming_source' not in globals():
    from mage_ai.data_preparation.decorators import streaming_source

logging.basicConfig(level=logging.INFO)

@streaming_source
class CustomSource(BasePythonSource):
    def init_client(self):
        # Load the schema
        self.schema = load_schema('/home/src/schemas/schema.json')
        
        # Set parameters for data generation
        self.interval_between_batches = 15  # Time between batches in seconds
        self.records_per_batch = 1  # Number of records per batch
        self.record_interval_seconds = 5  # Interval between records in a batch in seconds
        self.total_batches = None  # Set to None for indefinite streaming
        self.batch_count = 0
        self.start_time = None  # Set to specific datetime if needed. If None, uses current time in UTC.
        self.current_time = self.start_time  # Initialize current_time here

    def batch_read(self, handler: Callable):
        """
        Batch read the messages from the source and use handler to process the messages.
        """
        logging.info("Starting batch_read in CustomSource.")
        try:
            while True:
                # Generate the batch with time intervals
                records = generate_batch_with_time_intervals(
                    self.schema,
                    self.records_per_batch,
                    start_time=self.current_time,
                    interval_seconds=self.record_interval_seconds
                )

                if records:
                    handler(records)
                    self.batch_count += 1
                    logging.info(f"Generated and processed batch {self.batch_count} with {len(records)} records.")

                    # Update self.current_time for the next batch
                    datetime_field = next(
                        (key for key in records[-1] if self.schema[key].lower() == 'datetime'), None
                    )
                    if datetime_field:
                        last_record_time_str = records[-1][datetime_field]
                        self.current_time = datetime.strptime(
                            last_record_time_str, '%Y-%m-%d %H:%M:%S'
                        ) + timedelta(seconds=self.record_interval_seconds)
                    else:
                        self.current_time = datetime.now()
                else:
                    logging.warning("No records generated in this batch.")
                    self.current_time = datetime.now()

                if self.total_batches is not None and self.batch_count >= self.total_batches:
                    logging.info("Reached total number of batches to send.")
                    break

                time.sleep(self.interval_between_batches)

        except Exception as e:
            logging.error(f"Error during data streaming: {e}", exc_info=True)
        finally:
            logging.info("Data streaming completed.")