from mage_ai.io.file import FileIO
from pandas import DataFrame
import sqlite3

if 'data_exporter' not in globals():
    from mage_ai.data_preparation.decorators import data_exporter


@data_exporter
def export_data_to_file(df: DataFrame, **kwargs) -> None:
    """
    Template for exporting data to filesystem.

    Docs: https://docs.mage.ai/design/data-loading#fileio
    """

    """
    Initialize the SQLite connection.
    """
    conn = sqlite3.connect('databases/example.db')  
    cursor = conn.cursor()
    tablename = "roi_entries"

    """
    Create SQLite table creation command
    """
    dfcols = set()
    for field, values in df.iteritems():
        dfcols.add(field)
    creation_command = f"CREATE TABLE IF NOT EXISTS {tablename} ("
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
    insertion_command = f"INSERT INTO {tablename} ("
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