from kpi_formula.advanced.kpi_calculator import KPICalculator
from pandas import DataFrame
if 'transformer' not in globals():
    from mage_ai.data_preparation.decorators import transformer
if 'test' not in globals():
    from mage_ai.data_preparation.decorators import test


@transformer
def transform(data: DataFrame, *args, **kwargs):
    """
    This function adds the return on investment (ROI) KPI as a computed column to the batch generated from investment_schema.

    NOTE: You must modify this function to use your desired KPI if the schema is changed.
    """

    computed_column = []
    for index, row in data.iterrows():
        # Calculate return on investment (ROI) for each entry
        ROI = KPICalculator.roi(revenue=int(row['revenue']), investment=int(row['initial_investment']))
        computed_column.append(ROI)

    # Add ROI as column in DataFrame
    data['roi'] = computed_column

    return data


@test
def test_output(output, *args) -> None:
    """
    Template code for testing the output of the block.
    """
    assert output is not None, 'The output is undefined'
