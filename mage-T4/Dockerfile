# Use a Python image
FROM python:3.9-slim

# Set the working directory
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install the required Python packages
RUN pip install kafka-python

# Run the consumer script
CMD ["python", "kafka-consumer.py"]
