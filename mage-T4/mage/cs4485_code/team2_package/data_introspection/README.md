## Data Introspection Module

A Python module for inspecting and retrieving metadata from various data sources including CSV files, SQLite databases, and PostgreSQL databases. This module provides a unified interface for accessing data structure information across different sources.

## Installation

1. Ensure you have the required dependencies:
```bash
pip install pandas>=1.5.0 psycopg2-binary>=2.9.0
```
2. Install the module directly from our repository:

```bash
pip install git+https://github.com/sumohammed0/T2-Data-Platform
```

## Quick Start

### CSV Files
```python
# Create inspector for CSV files
inspector = create_introspector('csv', directory_path='/path/to/csv/files')

# Get list of all CSV files (without .csv extension)
tables = inspector.get_table_names()
print(f"Available tables: {tables}")

# Get metadata for a specific CSV file
metadata = inspector.get_table_metadata('5G_data')
print(f"Table name: {metadata.name}")
print(f"Number of rows: {metadata.row_count}")
print("Columns:")
for column in metadata.columns:
    print(f"  - {column['name']}: {column['type']}")
```

### SQLite Database
```python
# Create inspector for SQLite database
inspector = create_introspector('sqlite', db_path='/path/to/database.db')

# Get all table names
tables = inspector.get_table_names()

# Get metadata for a specific table
metadata = inspector.get_table_metadata('')
```

### PostgreSQL Database
```python
# Create inspector for PostgreSQL database
inspector = create_introspector(
    'postgres',
    dbname='your_database',
    user='your_username',
    password='your_password',
    host='localhost',
    port='5432'  # optional, defaults to 5432
)

# Get all table names
tables = inspector.get_table_names()

# Get metadata for a specific table
metadata = inspector.get_table_metadata('customers')
```

## Available Methods

### `get_table_names()`
Returns a list of all available tables/files in the data source.

**Returns:**
- `List[str]`: List of table names

### `get_table_metadata(table_name)`
Returns detailed metadata about a specific table.

**Parameters:**
- `table_name (str)`: Name of the table to inspect

**Returns:**
- `TableMetadata` object with:
  - `name`: Table name
  - `columns`: List of dictionaries with column names and types
  - `row_count`: Number of rows in the table
  - `file_path`: Path to the file (CSV/SQLite only)

### `validate_structure()`
Validates if the data source structure is valid and accessible.

**Returns:**
- `bool`: True if valid, raises ValueError if invalid

## Error Handling

The module includes comprehensive error handling:

```python
try:
    inspector = create_introspector('csv', directory_path='/path/to/files')
    metadata = inspector.get_table_metadata('nonexistent_table')
except ValueError as e:
    print(f"Error: {e}")
```

Common errors:
- Directory/file not found
- Invalid database credentials
- Table does not exist
- Invalid data source type

## Examples

### Comparing Schemas Across Sources
```python
# Create inspectors for different sources
csv_inspector = create_introspector('csv', directory_path='/path/to/csv')
pg_inspector = create_introspector('postgres', **postgres_credentials)

# Get and compare metadata
csv_metadata = csv_inspector.get_table_metadata('sales_data')
pg_metadata = pg_inspector.get_table_metadata('sales_data')

# Compare columns
csv_cols = {col['name']: col['type'] for col in csv_metadata.columns}
pg_cols = {col['name']: col['type'] for col in pg_metadata.columns}

# Check for differences
print("Columns in CSV but not in Postgres:", set(csv_cols) - set(pg_cols))
print("Columns in Postgres but not in CSV:", set(pg_cols) - set(csv_cols))
```

### Processing Multiple Tables
```python
inspector = create_introspector('postgres', **postgres_credentials)

# Get all tables and their metadata
for table in inspector.get_table_names():
    metadata = inspector.get_table_metadata(table)
    print(f"\nTable: {metadata.name}")
    print(f"Row count: {metadata.row_count}")
    print("Columns:")
    for column in metadata.columns:
        print(f"  - {column['name']}: {column['type']}")
```

## Required Parameters

### CSV Introspector
- `directory_path`: Path to directory containing CSV files

### SQLite Introspector
- `db_path`: Path to SQLite database file

### PostgreSQL Introspector
- `dbname`: Database name
- `user`: Username
- `password`: Password
- `host`: Host address
- `port`: Port number (optional, defaults to 5432)

## Troubleshooting

1. **CSV Issues**
   - Ensure all files have .csv extension
   - Verify directory path exists and is accessible
   - Check file permissions

2. **SQLite Issues**
   - Verify database file exists and is a valid SQLite database
   - Check file permissions
   - Ensure SQLite file is not locked by another process

3. **PostgreSQL Issues**
   - Verify connection credentials
   - Ensure PostgreSQL server is running
   - Check network connectivity
   - Verify user has necessary permissions