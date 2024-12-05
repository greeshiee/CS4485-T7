#from team6_package.core import consume_messages_from_kafka
import pandas as pd
from kafka import KafkaConsumer
import logging
import json
from prometheus_client import start_http_server, Gauge, CollectorRegistry, REGISTRY
import random
import time


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
        #print(index)
        #time.sleep(15)



def consume_messages_from_kafka(
    auto_offset_reset='latest',
    enable_auto_commit=True,
    value_deserializer=lambda v: json.loads(v.decode('utf-8')),
    on_message=None,
    consumer_timeout_ms=1000
):
    """
    Consumes messages from a Kafka topic and processes them using a callback function.

    Parameters:
    - auto_offset_reset (str): Where to start reading messages if no offset is committed.
    - enable_auto_commit (bool): Whether to auto-commit offsets.
    - value_deserializer (callable): Function to deserialize message values.
    - on_message (callable): Function to process each message. It should accept one argument (the message value).
    - consumer_timeout_ms (int): Stop iteration if no message is received for this number of milliseconds.

    Returns:
    - messages (list): A list of messages consumed from the topic if no callback is provided.
    """
    logging.info(f"Connecting to Kafka broker at localhost:29092...")

    consumer = KafkaConsumer(
        'team6_topic',
        bootstrap_servers='localhost:29092',
        auto_offset_reset=auto_offset_reset,
        enable_auto_commit=enable_auto_commit,
        value_deserializer=value_deserializer,
        consumer_timeout_ms=consumer_timeout_ms
    )

    logging.info(f"Connected to Kafka topic team6_topic. Listening for messages...")

    global counter
    counter = 0

    messages = []
    try:
        for message in consumer:
            data = message.value
            print(data)
            df = pd.DataFrame(data, index=[0])
            gauges = create_gauges_from_strings(df)
            
            #counter = counter + 1
            #print(counter)
            server, t = start_http_server(8000, addr='0.0.0.0')
            print(server)
            print(t)
            update_gauges(df, gauges)
            server.shutdown()
            t.join()

            if on_message:
                on_message(data)
            else:
                messages.append(data)
            logging.info(f"Received message: {data}")
    except Exception as e:
        logging.error(f"Error consuming messages: {e}")
    finally:
        consumer.close()
        logging.info("Kafka consumer closed.")
    return messages

def process_message(message):
    #df = pd.DataFrame(message)
    #print(df[1])
    print(f"YARHARR HARR: {message}")

def main():
    kafka_topic = 'team6_topic'
    bootstrap_servers = 'localhost:29092'



    consume_messages_from_kafka(
        on_message=process_message,
        consumer_timeout_ms=30000
    )

    print("lol")

if __name__ == '__main__':
    main()
    