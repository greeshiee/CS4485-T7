import airbyte as ab
import os
from dotenv import load_dotenv

load_dotenv('.env.local') 

AWS_ACCESS_KEY = os.getenv('AWS_ACCCES_KEY') # from IAM user
AWS_SECRET_KEY = os.getenv('AWS_SECRET_ACCESS_KEY') # from IAM user

#print(ab.get_available_connectors())

# create and install source -> will run pip install airbyte-source-s3
source: ab.Source = ab.get_source("source-s3")

# set config for source
source.set_config(
    config={
        # list of stream -> use this to define which files belong in the stream, their format, and how they should be parsed and validated. 
        "streams": [  
            {
                "format": {
                    "filetype": "csv",
                },
                "name": "utd-stream",

            },
        ],
        "bucket": "senior-design-utd", # s3 bucket name
        "aws_access_key_id": AWS_ACCESS_KEY, # IAM user
        "aws_secret_access_key": AWS_SECRET_KEY, # IAM user

    }
)

source.check() # connection check


