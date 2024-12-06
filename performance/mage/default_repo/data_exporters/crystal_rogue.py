if 'data_exporter' not in globals():
    from mage_ai.data_preparation.decorators import data_exporter

from prometheus_client import start_http_server, Gauge, CollectorRegistry, REGISTRY
import random
import time
import pandas as pd
from typing import List

#make sure this reflects prometheus scrape interval
scrape_interval = 15
port = 8000
ip_address = '0.0.0.0'

def create_gauges_from_strings(string_list):
    """
        takes a list of names and unregisters them from the collectorregistry to prevent duplicate error
        returns list of gauges with the string_list as the names and an empty string as the description
    """
    # Unregister existing metrics if they exist
    for name in string_list:
        try:
            REGISTRY.unregister(REGISTRY._names_to_collectors[name])
        except KeyError:
            pass
    
    # Create and return new gauges
    return [Gauge(name, "") for name in string_list]

def update_gauges(df, gauge_list):
    """
        takes dataframe and List of gauges as arguments then sets each value to each gauge
        sleep() should be set to Prometheus scrape interval
    """
    for index, row in df.iterrows():
        for gauge in gauge_list:
            gauge_name = gauge._name
            gauge.set(row[gauge_name])
        print(index)
        time.sleep(scrape_interval)

@data_exporter
def export_data(data, *args, **kwargs):
    """
        Exports data to some source.

        Args:
            data: The output from the upstream parent block
            args: The output from any additional upstream blocks (if applicable)

        Output (optional):
            Optionally return any object and it'll be logged and
            displayed when inspecting the block run.
    """
    
    #print(data)

    df = pd.DataFrame(data)

    #print(df)

    """
    for i in df.columns:
        print(i)
    """

    gauges = create_gauges_from_strings(df)
    #print(gauges[1])

    try:
        server, t = start_http_server(port, addr=ip_address)
        print(server)
        print(t)
        update_gauges(df, gauges)
    except KeyboardInterrupt:
        server.shutdown()
        t.join()
        print("KeyboardInterrupt: ending server")

    server.shutdown()
    t.join()
    print("end of program: ending server")