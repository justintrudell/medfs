from os import environ

APP_PORT = environ.get("MESSAGE_SVC_PORT")

RECORD_SVC_HOST = environ.get("RECORD_SVC_HOST")
RECORD_SVC_PORT = environ.get("RECORD_SVC_PORT")

# Interval at which we poll the SQS queues (in seconds)
SQS_POLLING_INTERVAL_S = environ.get("SQS_POLLING_INTERVAL_S")
