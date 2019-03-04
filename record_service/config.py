from os import environ

APP_PORT = environ.get("RECORD_SVC_PORT")

# Database parameters
DB_USER = environ.get("RECORD_SVC_DB_USER")
DB_PASS = environ.get("RECORD_SVC_DB_PASS")
DB_URL = environ.get("RECORD_SVC_DB_URL")
DB_PORT = environ.get("RECORD_SVC_DB_PORT")
DB_NAME = environ.get("RECORD_SVC_DB_NAME")

# ACL service parameters
ACL_URL = environ.get("ACL_SVC_URL")
ACL_PORT = environ.get("ACL_SVC_PORT")

# We'll configure this in the future
ENVIRONMENT = environ.get("ENVIRONMENT")

# Interval at which we poll the SQS queues (in seconds)
SQS_POLLING_INTERVAL_S = environ.get("SQS_POLLING_INTERVAL_S")

# Host/port that we'll reach out to IPFS through
IPFS_HOST = environ.get("IPFS_HOST")
IPFS_PORT = environ.get("IPFS_PORT")

# Mailfun
MAILGUN_API_KEY = environ.get("MAILGUN_API_KEY")
