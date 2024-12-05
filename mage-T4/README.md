# T4-data-pipeline
## Start pipeline services
Start Mage and Kafka broker from terminal: `docker compose up`

To access Mage's UI, navigate to `localhost:6789` on your web browser.

## Create pipelines
Creating a Pipeline:
1. Select "Pipelines" from the left menu bar
2. Select "+ New"
3. Select "Standard (batch)" for pipelining batch data or "Streaming" for pipelining event streaming data
4. Once the you name and create the pipeline: data loader, data transformer, and data exporter blocks can be created within the "Edit pipeline" tab
5. To test the pipeline's execution, press the green "Execute pipeline" button on the right side of the "Edit pipeline" tab

## End pipeline services
Stop Mage and Kafka broker from terminal: `docker compose down`


## To use Team 6 data generation tool
1. In the T4-data-pipeline directory open the 'mage' folder. Open the 'schemas' folder. Add as many custom schemas as you want to this folder (read T6 package readme for more details on schema format).
2. Start Mage and Kafka broker from terminal: `docker compose up`
3. Select "Pipelines" from the left menu bar
	3.1. If you want to generate a single batch of data choose batch_data_generation (no realistic time intervals)
		3.1.1. Next to the '+New trigger' button is the 'Run@once' button. Click that and wait for the status to say 'Completed'
	3.2. If you want to generate a stream of data choose stream_data_generation
		3.2.1. Click on "Edit Pipeline".
		3.2.2. You can edit the DATA LOADER to specify the generation interval and the number of batches you want streamed.
		3.2.3. Click on the 'Execute pipeline' button. Stream as many new data points as you want.
	3.3. If you want to generate a stream of batches with realistic time intervals then use the stream_of_batches_data_generator
		3.3.1. Click on "Edit Pipeline".
		3.3.2. You can edit the DATA LOADER to specify the generation interval, the number of records per batch, the time interval between each record, number of batches, and start time.
		3.3.3. Click on the 'Execute pipeline' button. Stream as many new data points as you want.
4. To access the data you generated you will need to install team 6's python package locally.
5. In your python code use the consume_messages_from_kafka function from Team 6's python package.

##To clear the kafka topic
1. run docker compose down
2. run docker compose up