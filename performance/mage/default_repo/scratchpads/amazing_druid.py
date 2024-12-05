import random
from datetime import datetime, timedelta
import pandas as pd

start_timestamp = datetime.now()
numRows = 30

#timestamp = []
uplink_sent_bytes = []
uplink_received_bytes = []
uplink_sent_packets = []
uplink_received_packets = []
uplink_sent_packets_dropped = []
uplink_received_packets_dropped = []

for i in range(numRows):
    '''
    timestamp                   (datetime, starting datetime + (i * 5min))
    sent_bytes                  (integer, received_bytes / 23-25)
    received_bytes              (integer, 0.1-0.4 gb)
    sent_packets                (integer, sent_bytes/1000)
    received_packets            (integer, received_bytes/1000)
    sent_packets_dropped        (integer, sent_packets * 0-1%)
    received_packets_dropped    (integer, received_packets * 0-1%)
    '''
    #timestamp.append(start_timestamp + timedelta(minutes=i*5))
    uplink_sent_bytes.append(int(random.uniform(0.1, 0.4) * (1073741824 / random.randint(23,25))))
    uplink_received_bytes.append(int(random.uniform(0.1, 0.4) * 1073741824))
    uplink_sent_packets.append(int(uplink_sent_bytes[i] / 1000))
    uplink_received_packets.append(int(uplink_received_bytes[i] / 1000))
    uplink_sent_packets_dropped.append(int(random.uniform(0, 0.01) * uplink_sent_packets[i]))
    uplink_received_packets_dropped.append(int(random.uniform(0, 0.01) * uplink_received_packets[i]))

df = pd.DataFrame(zip(uplink_sent_bytes, uplink_received_bytes, uplink_sent_packets, uplink_received_packets, uplink_sent_packets_dropped, uplink_received_packets_dropped),
                  columns=["uplink_sent_bytes", "uplink_received_bytes", "uplink_sent_packets", "uplink_received_packets", "uplink_sent_packets_dropped", "uplink_received_packets_dropped"])
df.to_csv("uplink_metrics.csv", index=False)