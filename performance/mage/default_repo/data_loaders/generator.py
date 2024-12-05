from mage_ai.streaming.sources.base_python import BasePythonSource
from typing import Callable
import random
import time

if 'streaming_source' not in globals():
    from mage_ai.data_preparation.decorators import streaming_source

possible_names = ['Scarlett', 'Melody', 'Bennett', 'Drew', 'Olivia', 'Mariah', 'Jose', 'Levi', 'Nikhil', 'Quinn']
possible_grades = ['A','B','C','D','E','F']

# NOTE: edit interval_seconds to change how often (in seconds) records are generated
interval_seconds = 30

# NOTE: edit batch_size to change how many records are generated per time interval
batch_size = 3

@streaming_source
class CustomSource(BasePythonSource):
    def init_client(self):
        """
        Implement the logic of initializing the client.
        """

    def batch_read(self, handler: Callable):
        """
        Batch read the messages from the source and use handler to process the messages.
        """
        num_names = len(possible_names)
        num_grades = len(possible_grades)
        while True:
            records = []
            # Implement the logic of fetching the records

            # Generate random name/grade records
            for i in range(batch_size):
                name = possible_names[random.randrange(0,num_names)]
                grade = possible_grades[random.randrange(0,num_grades)]
                new_record = {"data": {"name": name, "grade": grade}}
                records.append(new_record)

            if len(records) > 0:
                handler(records)
            
            # Sleep in between every set of records generated and sent
            time.sleep(interval_seconds)
