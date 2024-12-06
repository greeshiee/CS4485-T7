Installation:
Extract the zip file to your desired directory
Navigate to the directory containing setup.py
Install the dependencies using: 'pip install -r requirements.txt'
Install the package using the following command: 'pip install .'

_________________________________________________________________________________________________________________

Command Line Usage:
team6_package <schema.json file_path> <output.csv desired_path> --num-records <number_of_records>
EXAMPLE: team6_package schema.json data.csv --num-records 200

--num-records is optional and the default value is 100.

_________________________________________________________________________________________________________________

Using the Package in Python Code
Example:

	from team8_package import get_notifications, remove_notification

	notifications = get_notifications()
    
    # prints a dictionary containing all currently stored notifications.
    print(notifications)


_________________________________________________________________________________________________________________

Alert model:
class Alert(BaseModel):
    alert_title: str
    alert_message: str
    field_name: str
    lower_bound: float
    higher_bound: float