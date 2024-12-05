from mage_ai.io.file import FileIO
from pandas import DataFrame
import sqlite3
import os

if 'data_exporter' not in globals():
    from mage_ai.data_preparation.decorators import data_exporter


@data_exporter
def export_data_to_file(df: DataFrame, **kwargs) -> None:
    """
    This function exports the generated and transformed data to a SQLite database

    PARAMETERS:

    db_directory: path to the directory of databases
    db_name: filename of the sqlite database
    table_name: name of the table that the batch will be stored in
    """
    db_directory = '/home/src/databases'
    db_name = 'example.db'
    table_name = 'roi_entries'

    """
    Initialize the SQLite connection.
    """
    if not os.path.exists(db_directory):
        os.makedirs(db_directory)
    conn = sqlite3.connect(f'{db_directory}/{db_name}')  
    cursor = conn.cursor()

    """
    Create SQLite table creation command
    """
    dfcols = set()
    for field, values in df.iteritems():
        dfcols.add(field)
    creation_command = f"CREATE TABLE IF NOT EXISTS {table_name} ("
    for field in dfcols:
        creation_command += f"{field} TEXT, "
    creation_command = creation_command[:len(creation_command) - 2] + ")"

    """
    Create the table if it doesn't exist
    """
    print(f"Attempting to execute: {creation_command}")
    cursor.execute(creation_command)
    conn.commit()

    """
    Create SQLite table insertion command
    """
    insertion_command = f"INSERT INTO {table_name} ("
    for field in dfcols:
        insertion_command += f"{field}, "
    insertion_command = insertion_command[:len(insertion_command) - 2] + ") VALUES ("
    for i in range(len(dfcols)):
        insertion_command += "?, "
    insertion_command = insertion_command[:len(insertion_command) - 2] + ")"

    """
    Write entries to the SQLite DB
    """
    try:
        count = 0
        for index, row in df.iterrows():
            # Retrieve entry row from DF
            entry = []
            for field in dfcols:
                entry.append(row[field])
            entry = tuple(entry)

            # Insert entry row into SQLite DB
            cursor.execute(insertion_command, entry)
            count += 1
            print(f'Entry inserted: {entry}')
        conn.commit()
        print(f'Successfully inserted {count} entries to SQLite')
    except sqlite3.Error as e:
        print(f"SQLite error: {e}")

    """
    Close the connection to the SQLite DB
    """
    conn.close()