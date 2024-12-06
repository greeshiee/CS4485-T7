from kafka import KafkaProducer

producer = KafkaProducer(bootstrap_servers='localhost:9092')

while(True) :
    print("Enter a student's name and their letter grade")
    name = input("Name: ")
    grade = input("Letter Grade: ")
    json_msg = f"{{\"name\": \"{name}\", \"grade\": \"{grade}\"}}"

    producer.send('student-grades', json_msg.encode('utf-8'))
    producer.flush()
    print(f"Sent {json_msg} to Kafka broker at localhost:9092")

    response = input("Type stop to exit or hit enter to continue: ")
    if response == "stop":
        break

producer.close()