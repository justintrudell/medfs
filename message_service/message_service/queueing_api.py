from typing import Any, List

import boto3

# Get the service resource
sqs = boto3.resource("sqs", region_name="us-east-2")


def _create_queue_name(uuid: str) -> str:
    return f"medfs_{uuid}.fifo"


def receive_messages(uuid: str) -> List[Any]:
    queue_name = _create_queue_name(uuid)
    try:
        queue = sqs.get_queue_by_name(QueueName=queue_name)
    except sqs.meta.client.exceptions.QueueDoesNotExist:
        return []
    return queue.receive_messages()
