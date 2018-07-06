from os import environ

APP_PORT = environ.get("RECORD_SVC_PORT")

# Database parameters
DB_USER = environ.get("RECORD_SVC_DB_USER")
DB_PASS = environ.get("RECORD_SVC_DB_PASS")
DB_URL = environ.get("RECORD_SVC_DB_URL")
DB_PORT = environ.get("RECORD_SVC_DB_PORT")
DB_NAME = environ.get("RECORD_SVC_DB_NAME")

# We'll configure this in the future
ENVIRONMENT = environ.get("ENVIRONMENT")

# Interval at which we poll the SQS queues (in seconds)
SQS_POLLING_INTERVAL_S = environ.get("SQS_POLLING_INTERVAL_S")
