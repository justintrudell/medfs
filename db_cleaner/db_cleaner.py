import requests

def lambda_handler(event, context):
    res = requests.get("https://medfs.io/healthcheck")
    return {
        "statusCode": 200,
        "body": res.text
    }

