import json
from typing import Any
from uuid import uuid4

import boto3
from flask import current_app


class SqsMessage:
    def __init__(self, body: Any) -> None:
        self.id = str(uuid4())
        self.body = body

    def serialize(self) -> str:
        return json.dumps({"id": self.id, "body": self.body})


# Get the service resource
sqs = boto3.resource("sqs", region_name="us-east-2")


def _create_queue_name(uuid: str) -> str:
    return f"medfs_{uuid}.fifo"


def send_message(uuid: str, message: str):
    """Send 'message' to unique SQS queue identified by 'uuid'."""
    queue_name = _create_queue_name(uuid)
    try:
        queue = sqs.get_queue_by_name(QueueName=queue_name)
    except sqs.meta.client.exceptions.QueueDoesNotExist:
        # Assume queue did not yet exist - create new queue
        queue = sqs.create_queue(
            QueueName=queue_name,
            Attributes={
                "MessageRetentionPeriod": "1209600",  # 14 days - the max value
                "FifoQueue": "true",
                "ContentBasedDeduplication": "true",
            },
        )
    result = queue.send_message(
        MessageBody=SqsMessage(message).serialize(), MessageGroupId="0"
    )
    current_app.logger.debug(f"Message sent - message ID: {result['MessageId']}")
