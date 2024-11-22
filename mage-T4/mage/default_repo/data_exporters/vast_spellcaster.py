from mage_ai.streaming.sinks.base_python import BasePythonSink
from typing import Dict, List
import sqlite3

if 'streaming_sink' not in globals():
    from mage_ai.data_preparation.decorators import streaming_sink


@streaming_sink
class CustomSink(BasePythonSink):
    def init_client(self):
        """
        Initialize the SQLite connection.
        """
        self.conn = sqlite3.connect('../student_grades.db')  
        self.cursor = self.conn.cursor()

        # Create the table if it doesn't exist
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS student_grade (
                name TEXT, 
                grade CHAR
            )
        """)
        self.conn.commit()


    def batch_write(self, messages: List[Dict]):
        """
        Batch write the messages to the SQLite DB.
        """
        try:
            for msg in messages:
                # Assuming msg['data'] contains the student name and grade in JSON format
                data = msg['data']
                name = data.get('name')
                grade = data.get('grade')

                if name and grade:
                    # Insert the name and grade into the student_grade table
                    self.cursor.execute(
                        "INSERT INTO student_grade (name, grade) VALUES (?, ?)",
                        (name, grade)
                    )
                    print(f'Saving "{name}" with grade "{grade}" to SQLite')
                    self.conn.commit()
        except sqlite3.Error as e:
            print(f"SQLite error: {e}")

    def __del__(self):
        """
        Close the connection to SQLite when done.
        """
        self.conn.close()

