import boto3
import os
from dotenv import load_dotenv

load_dotenv('.env.local') 

AWS_S3_BUCKET_NAME = 'senior-design-utd' 
AWS_REGION = 'us-east-1'
AWS_ACCESS_KEY = os.getenv('AWS_ACCCES_KEY') # from IAM user
AWS_SECRET_KEY = os.getenv('AWS_SECRET_ACCESS_KEY') # from IAM user

LOCAL_FILE = 'crime_data.csv'
NAME_FOR_S3 = 'crime_data.csv'

def main():
    print('in main method')

    s3_client = boto3.client(
        service_name='s3',
        region_name=AWS_REGION,
        aws_access_key_id=AWS_ACCESS_KEY,
        aws_secret_access_key=AWS_SECRET_KEY
    )

    response = s3_client.upload_file(LOCAL_FILE, AWS_S3_BUCKET_NAME, NAME_FOR_S3)

    print(f"upload_log_to_aws response: {'success' if response is None else response}")

if __name__ == '__main__':
    main()