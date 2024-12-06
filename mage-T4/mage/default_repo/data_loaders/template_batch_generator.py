import io
import pandas as pd
import requests
from team6_package import generate_data, save_to_csv, load_schema
if 'data_loader' not in globals():
    from mage_ai.data_preparation.decorators import data_loader
if 'test' not in globals():
    from mage_ai.data_preparation.decorators import test

@data_loader
def load_data_from_api(*args, **kwargs):
    """
    PARAMETERS

    schema_file: location of desired schema file
    batch_size: number of desired entries in one batch
    """
    schema_file = '/home/src/schemas/investment_schema.json'
    batch_size = 5

    # Load schema from schema templates folder
    schema = load_schema(schema_file)

    # Generate batch of data according to schema
    data = generate_data(schema, num_records=batch_size)

    # Save data as StringIO object
    csv = save_to_csv(data)

    return pd.read_csv(csv, sep=',')

@test
def test_output(output, *args) -> None:
    """
    Template code for testing the output of the block.
    """
    assert output is not None, 'The output is undefined'