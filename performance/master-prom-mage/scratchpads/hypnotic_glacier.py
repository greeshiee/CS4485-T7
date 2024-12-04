from prometheus_client import start_http_server, Gauge, CollectorRegistry, REGISTRY
import random
import time

def create_metrics():
    #Create or get existing metric
    try:
        # Try to remove existing metric if it exists
        REGISTRY.unregister(random_metric)
    except:
        pass
    
    # Create a new metric
    return Gauge('random_metric', 'A random number between 0 and 100')

def generate_random_metric(metric):
    #Generate and set a random number for the metric
    while True:
        # Generate random number between 0 and 100
        value = random.uniform(0, 100)
        # Set the gauge to the new value
        metric.set(value)
        print(f"Metric updated: random_metric = {value}")
        # Wait for 5 seconds before next update
        time.sleep(15)

if __name__ == '__main__':
    # Create or get the metric
    random_metric = create_metrics()
    print(random_metric)
    
    try:
        # Start the server on 0.0.0.0 to make it accessible from other containers
        start_http_server(8000, addr='0.0.0.0')
        print("Prometheus metrics server started at http://0.0.0.0:8000/metrics")
        print("This endpoint should be accessible from Prometheus container")
    except OSError as e:
        if "Address already in use" in str(e):
            print("Server already running on port 8000, continuing with metric updates...")
        else:
            raise e
    
    # Generate random numbers
    generate_random_metric(random_metric)