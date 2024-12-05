this branch is based on the code from the data pipelining team and the data generation team, make sure you have the data generation python module installed.

to send kafka data to prometheus run the kafka_test.py while a pipe is running and you should be able to see data in prometheus with the "kafka_message_payload" query

docker commands:
docker compose build
docker compose up -d
docker compose down

pip install confluent-kafka prometheus-client
