from team6_package.core import export_dataframe_to_kafka

if 'data_exporter' not in globals():
    from mage_ai.data_preparation.decorators import data_exporter

@data_exporter
def export_data_to_kafka(df, *args, **kwargs):
    #Exports data to a Kafka topic using team6_package.

    #Use the package function to export data
    export_dataframe_to_kafka(df)
